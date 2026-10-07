import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from './lib/firebase';
import type { 
  WorkerProfile, 
  User, 
  Booking, 
  EmergencyRequest, 
  AppNotification, 
  AdminStats,
  ServiceCategory,
  BannedIdentifier
} from './types';
import { getOrCreateDeviceId } from './utils/device';

const STORAGE_KEYS = {
  USERS: 'zupix_users_v2',
  WORKERS: 'zupix_workers_v2',
  BOOKINGS: 'zupix_bookings_v2',
  EMERGENCY: 'zupix_emergency_v2',
  NOTIFICATIONS: 'zupix_notifications_v2',
  CURRENT_USER: 'zupix_current_user_v2',
  BANNED_IDENTIFIERS: 'zupix_banned_identifiers_v2'
};

// Helper for local storage access
function getLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving to localStorage for key ${key}:`, e);
  }
}

// Utility to run Firestore queries with fast, robust offline fallback
async function safeFirestoreOperation<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  timeoutMs = 3500
): Promise<T> {
  try {
    let timer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs);
    });
    const result = await Promise.race([operation(), timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    // Graceful offline fallback to local cache/storage
    return fallback();
  }
}

export class ApiService {
  // ==========================================
  // BANNED & SUSPENDED IDENTIFIERS ENGINE
  // ==========================================

  /**
   * Retrieves all banned/suspended mobile numbers and device IDs
   */
  static async getBannedIdentifiers(): Promise<BannedIdentifier[]> {
    return safeFirestoreOperation(
      async () => {
        const snap = await getDocs(collection(db, 'banned_identifiers'));
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data() as BannedIdentifier);
          setLocal(STORAGE_KEYS.BANNED_IDENTIFIERS, list);
          return list;
        }
        return getLocal<BannedIdentifier[]>(STORAGE_KEYS.BANNED_IDENTIFIERS, []);
      },
      () => getLocal<BannedIdentifier[]>(STORAGE_KEYS.BANNED_IDENTIFIERS, []),
      1500
    );
  }

  /**
   * Checks if a phone number or device ID is permanently banned/suspended
   */
  static async checkIsBanned(
    phone?: string, 
    deviceId?: string
  ): Promise<{ isBanned: boolean; ban?: BannedIdentifier }> {
    const cleanPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : '';
    const activeDeviceId = deviceId || getOrCreateDeviceId();

    const bannedList = await this.getBannedIdentifiers();

    const found = bannedList.find(b => {
      if (!b.identifier) return false;
      const cleanBanId = b.identifier.trim().replace(/\D/g, '').slice(-10);

      // Check phone match
      if (cleanPhone && (b.type === 'phone' || b.type === 'both')) {
        if (cleanBanId === cleanPhone || b.identifier.includes(cleanPhone)) {
          return true;
        }
      }

      // Check device ID match
      if (activeDeviceId && (b.type === 'device' || b.type === 'both')) {
        if (b.identifier === activeDeviceId || activeDeviceId.includes(b.identifier)) {
          return true;
        }
      }

      return false;
    });

    if (found) {
      return { isBanned: true, ban: found };
    }

    return { isBanned: false };
  }

  /**
   * Permanently ban a phone number or device identifier
   */
  static async banIdentifier(
    identifier: string,
    type: 'phone' | 'device' | 'both',
    reason: string,
    bannedBy: string = 'Master Admin'
  ): Promise<boolean> {
    const cleanId = type === 'phone' ? identifier.trim().replace(/\D/g, '').slice(-10) : identifier.trim();
    const banRecord: BannedIdentifier = {
      id: `BAN-${type.toUpperCase()}-${cleanId}`,
      type,
      identifier: cleanId,
      reason: reason.trim() || 'Violating platform safety and verification guidelines',
      bannedAt: new Date().toISOString(),
      bannedBy,
      isPermanent: true
    };

    // 1. Save locally
    const list = getLocal<BannedIdentifier[]>(STORAGE_KEYS.BANNED_IDENTIFIERS, []);
    const filtered = list.filter(b => b.id !== banRecord.id && b.identifier !== cleanId);
    filtered.unshift(banRecord);
    setLocal(STORAGE_KEYS.BANNED_IDENTIFIERS, filtered);

    // 2. Block any matching worker or user accounts
    if (type === 'phone' || type === 'both') {
      const users = getLocal<User[]>(STORAGE_KEYS.USERS, []);
      users.forEach(u => {
        if (u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanId) {
          u.isBlocked = true;
        }
      });
      setLocal(STORAGE_KEYS.USERS, users);

      const workers = getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
      workers.forEach(w => {
        if (w.phone && w.phone.replace(/\D/g, '').slice(-10) === cleanId) {
          w.isBlocked = true;
        }
      });
      setLocal(STORAGE_KEYS.WORKERS, workers);
    }

    // 3. Persist to Firestore
    try {
      await setDoc(doc(db, 'banned_identifiers', banRecord.id), banRecord, { merge: true });
    } catch (e) {
      console.warn('Firestore ban sync error:', e);
    }

    return true;
  }

  /**
   * Lift a suspension / remove from banned list
   */
  static async unbanIdentifier(banId: string): Promise<boolean> {
    const list = getLocal<BannedIdentifier[]>(STORAGE_KEYS.BANNED_IDENTIFIERS, []);
    const updated = list.filter(b => b.id !== banId);
    setLocal(STORAGE_KEYS.BANNED_IDENTIFIERS, updated);

    try {
      await deleteDoc(doc(db, 'banned_identifiers', banId));
    } catch (e) {
      console.warn('Firestore unban sync error:', e);
    }

    return true;
  }

  /**
   * Strict validation rule: 
   * 1. Check if Phone or Device is Banned
   * 2. Ensure only 1 active account is allowed per phone number & device
   */
  static async validateAccountRestriction(
    phone: string,
    deviceId?: string,
    currentUserId?: string
  ): Promise<{
    allowed: boolean;
    isBanned: boolean;
    banReason?: string;
    existingAccount?: User;
    message?: string;
  }> {
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    const activeDeviceId = deviceId || getOrCreateDeviceId();

    // Step 1: Check Banned List Check
    const banCheck = await this.checkIsBanned(cleanPhone, activeDeviceId);
    if (banCheck.isBanned && banCheck.ban) {
      return {
        allowed: false,
        isBanned: true,
        banReason: banCheck.ban.reason,
        message: `PERMANENT ACCESS DENIAL: This ${banCheck.ban.type === 'device' ? 'Device' : 'Mobile Number'} has been permanently suspended for safety violations. Reason: "${banCheck.ban.reason}" (Ref: ${banCheck.ban.id}).`
      };
    }

    // Step 2: Check Existing Account by Phone (Strict 1-Account-Per-Phone Rule)
    const existingUser = await this.getUserByPhone(cleanPhone);
    if (existingUser) {
      if (existingUser.isBlocked) {
        return {
          allowed: false,
          isBanned: true,
          banReason: 'Account suspended by administration',
          message: 'This account has been suspended by system administration.'
        };
      }

      if (currentUserId && existingUser.id !== currentUserId) {
        return {
          allowed: false,
          isBanned: false,
          existingAccount: existingUser,
          message: `This mobile number is already linked to account (${existingUser.name}). Only 1 account is permitted per phone number.`
        };
      }
    }

    return { allowed: true, isBanned: false, existingAccount: existingUser || undefined };
  }

  // ==========================================
  // USERS MANAGEMENT & STORAGE HANDSHAKE
  // ==========================================
  static async getCurrentUser(): Promise<User | null> {
    return getLocal<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static async setCurrentUser(user: User | null): Promise<boolean> {
    try {
      if (!user) {
        setLocal(STORAGE_KEYS.CURRENT_USER, null);
        return true;
      }

      // Stamp unique deviceId
      if (!user.deviceId) {
        user.deviceId = getOrCreateDeviceId();
      }

      // Strict Banned check before setting
      const banCheck = await this.checkIsBanned(user.phone, user.deviceId);
      if (banCheck.isBanned && banCheck.ban) {
        throw new Error(`PERMANENT ACCESS DENIAL: Suspended ID / Device. Reason: ${banCheck.ban.reason}`);
      }

      // 1. Guaranteed Local Storage Persistence Handshake
      setLocal(STORAGE_KEYS.CURRENT_USER, user);
      
      const users = getLocal<User[]>(STORAGE_KEYS.USERS, []);
      const index = users.findIndex(u => u.id === user.id || (u.phone && user.phone && u.phone.replace(/\D/g, '').slice(-10) === user.phone.replace(/\D/g, '').slice(-10)));
      if (index >= 0) {
        users[index] = { ...users[index], ...user };
      } else {
        users.push(user);
      }
      setLocal(STORAGE_KEYS.USERS, users);

      // 2. Safe Bounded Firestore Sync (Non-blocking background handshake)
      safeFirestoreOperation(
        async () => {
          await setDoc(doc(db, 'users', user.id), user, { merge: true });
          return true;
        },
        () => true,
        1500
      ).catch(e => console.warn('Firestore background user sync error:', e));

      return true;
    } catch (err: any) {
      console.error('Storage Handshake Error in setCurrentUser:', err);
      if (err.message && err.message.includes('PERMANENT ACCESS DENIAL')) {
        throw err;
      }
      throw new Error('Error: Could not create account, please try again');
    }
  }

  static async getAllUsers(): Promise<User[]> {
    return safeFirestoreOperation(
      async () => {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data() as User);
          setLocal(STORAGE_KEYS.USERS, list);
          return list;
        }
        return getLocal<User[]>(STORAGE_KEYS.USERS, []);
      },
      () => getLocal<User[]>(STORAGE_KEYS.USERS, []),
      1500
    );
  }

  static async getUserByPhone(phone: string): Promise<User | null> {
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    const users = await this.getAllUsers();
    return users.find(u => u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone) || null;
  }

  static async getUserById(id: string): Promise<User | null> {
    return safeFirestoreOperation(
      async () => {
        const snap = await getDoc(doc(db, 'users', id));
        if (snap.exists()) {
          return snap.data() as User;
        }
        const users = getLocal<User[]>(STORAGE_KEYS.USERS, []);
        return users.find(u => u.id === id) || null;
      },
      () => {
        const users = getLocal<User[]>(STORAGE_KEYS.USERS, []);
        return users.find(u => u.id === id) || null;
      },
      1500
    );
  }

  // ==========================================
  // WORKER PROFILES (STRICT ZERO DUMMY PROFILES)
  // ==========================================
  
  /**
   * Retrieves all verified service providers.
   * STRICT GUARDRAIL: If no profiles exist in Firestore or local storage,
   * returns an empty array [] without generating or injecting ANY mock/dummy profiles.
   */
  static async getWorkers(categoryFilter?: ServiceCategory | 'All', pincodeFilter?: string): Promise<WorkerProfile[]> {
    const allWorkers = await safeFirestoreOperation(
      async () => {
        const snap = await getDocs(collection(db, 'workers'));
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data() as WorkerProfile);
          // STRICT GUARDRAIL: Do not inject dummy profiles if list is empty
          setLocal(STORAGE_KEYS.WORKERS, list);
          return list;
        }
        // If Firestore is empty, check local storage
        const localList = getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
        return localList;
      },
      () => {
        // Fallback: Read only real registered workers from local storage
        const localList = getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
        return localList;
      }
    );

    // Filter out blocked workers from public consumer listing
    let filtered = allWorkers.filter(w => !w.isBlocked);

    if (categoryFilter && categoryFilter !== 'All') {
      filtered = filtered.filter(w => w.category === categoryFilter);
    }

    if (pincodeFilter && pincodeFilter.trim().length >= 3) {
      filtered = filtered.filter(w => w.pincode.startsWith(pincodeFilter.trim()));
    }

    return filtered;
  }

  /**
   * Retrieves all worker profiles including blocked for Admin Panel
   */
  static async getAllWorkersForAdmin(): Promise<WorkerProfile[]> {
    return safeFirestoreOperation(
      async () => {
        const snap = await getDocs(collection(db, 'workers'));
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data() as WorkerProfile);
          setLocal(STORAGE_KEYS.WORKERS, list);
          return list;
        }
        return getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
      },
      () => getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, [])
    );
  }

  static async getWorkerById(workerId: string): Promise<WorkerProfile | null> {
    const workers = await this.getAllWorkersForAdmin();
    return workers.find(w => w.id === workerId) || null;
  }

  static async registerWorker(workerData: Omit<WorkerProfile, 'id' | 'rating' | 'reviewCount' | 'completedJobs' | 'registeredAt'>): Promise<WorkerProfile> {
    const newWorker: WorkerProfile = {
      ...workerData,
      id: `WRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      rating: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      registeredAt: new Date().toISOString(),
      isAvailable: true,
      isBlocked: false,
      warningMessage: ''
    };

    // Update local storage immediately
    const workers = getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
    workers.unshift(newWorker);
    setLocal(STORAGE_KEYS.WORKERS, workers);

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'workers', newWorker.id), newWorker, { merge: true });
    } catch (e) {
      console.warn('Error saving worker to Firestore:', e);
    }

    // Create system notification for registration
    await this.createNotification({
      recipientId: newWorker.userId,
      title: 'Welcome to Zupix Pro Partner!',
      message: `Your professional profile for ${newWorker.category} has been registered and is now live for customers in pincode ${newWorker.pincode}.`,
      type: 'system',
      targetView: 'worker_dashboard'
    });

    return newWorker;
  }

  static async updateWorkerProfile(worker: WorkerProfile): Promise<void> {
    const workers = getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
    const index = workers.findIndex(w => w.id === worker.id);
    if (index >= 0) {
      workers[index] = worker;
      setLocal(STORAGE_KEYS.WORKERS, workers);
    }

    try {
      await setDoc(doc(db, 'workers', worker.id), worker, { merge: true });
    } catch (e) {
      console.warn('Update worker error:', e);
    }
  }

  // ==========================================
  // ADMIN PANEL ACTIONS (INSTANT FIXES)
  // ==========================================

  /**
   * Instantly lock/disable target user or worker profile to isBlocked = true/false
   */
  static async toggleBlockWorker(workerId: string, shouldBlock: boolean): Promise<boolean> {
    const workers = getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
    const index = workers.findIndex(w => w.id === workerId);
    if (index >= 0) {
      workers[index].isBlocked = shouldBlock;
      if (shouldBlock) {
        workers[index].warningMessage = 'Your account has been blocked by administrator for policy violation.';
      }
      setLocal(STORAGE_KEYS.WORKERS, workers);

      // Create notification to worker
      await this.createNotification({
        recipientId: workers[index].userId,
        title: shouldBlock ? 'Account Blocked Alert' : 'Account Re-Activated',
        message: shouldBlock 
          ? 'Your Zupix Service Provider profile has been locked/blocked by Admin. Please contact support.'
          : 'Your Zupix Service Provider account has been unblocked by the Admin team.',
        type: 'warning',
        targetView: 'worker_dashboard'
      });
    }

    // Sync Firestore
    try {
      await updateDoc(doc(db, 'workers', workerId), {
        isBlocked: shouldBlock,
        warningMessage: shouldBlock ? 'Your account has been blocked by administrator.' : ''
      });
    } catch (e) {
      console.warn('Firestore block error:', e);
    }

    return true;
  }

  /**
   * Completely remove target user or worker object from active profiles and database
   */
  static async deleteWorkerProfile(workerId: string): Promise<boolean> {
    const workers = getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
    const target = workers.find(w => w.id === workerId);
    const updated = workers.filter(w => w.id !== workerId);
    setLocal(STORAGE_KEYS.WORKERS, updated);

    if (target) {
      await this.createNotification({
        recipientId: target.userId,
        title: 'Account Profile Removed',
        message: 'Your service provider listing has been permanently deleted from the Zupix platform.',
        type: 'system'
      });
    }

    // Sync Firestore deletion
    try {
      await deleteDoc(doc(db, 'workers', workerId));
    } catch (e) {
      console.warn('Firestore delete error:', e);
    }

    return true;
  }

  /**
   * Send official warning to worker
   */
  static async sendWorkerWarning(workerId: string, warningText: string): Promise<boolean> {
    const workers = getLocal<WorkerProfile[]>(STORAGE_KEYS.WORKERS, []);
    const index = workers.findIndex(w => w.id === workerId);
    if (index >= 0) {
      workers[index].warningMessage = warningText;
      setLocal(STORAGE_KEYS.WORKERS, workers);

      await this.createNotification({
        recipientId: workers[index].userId,
        title: '⚠️ Strict Admin Warning',
        message: warningText,
        type: 'warning',
        targetView: 'worker_dashboard'
      });
    }

    try {
      await updateDoc(doc(db, 'workers', workerId), {
        warningMessage: warningText
      });
    } catch (e) {
      console.warn('Firestore send warning error:', e);
    }

    return true;
  }

  // ==========================================
  // BOOKINGS & MANDATORY FEES ENGINE
  // ==========================================

  /**
   * Create a new booking request.
   * Customer pays mandatory token fee of ₹20 to initiate.
   */
  static async createBooking(bookingData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerPincode: string;
    workerId: string;
    workerName: string;
    workerPhone: string;
    category: ServiceCategory;
    serviceItem?: string;
    issueDescription: string;
    scheduledDate: string;
    scheduledTime: string;
    estimatedCost: number;
    customerUtr: string;
    isEmergency?: boolean;
  }): Promise<Booking> {
    const newBooking: Booking = {
      ...bookingData,
      id: `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerTokenFee: 20,
      customerTokenPaid: true,
      workerCommissionFee: 50,
      workerCommissionPaid: false,
      status: 'pending_worker', // Awaiting worker to pay ₹50 commission to confirm
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally
    const bookings = getLocal<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    bookings.unshift(newBooking);
    setLocal(STORAGE_KEYS.BOOKINGS, bookings);

    // Sync Firestore
    try {
      await setDoc(doc(db, 'bookings', newBooking.id), newBooking, { merge: true });
    } catch (e) {
      console.warn('Firestore booking create error:', e);
    }

    // 1. Notify Worker to accept & pay ₹50 commission
    await this.createNotification({
      recipientId: newBooking.workerId,
      title: '🚨 New Booking Received! Action Required',
      message: `New booking request from ${newBooking.customerName} for ${newBooking.category}. Pay ₹50 mandatory platform fee to lock and confirm this job.`,
      type: 'booking_new',
      targetBookingId: newBooking.id,
      targetView: 'worker_dashboard'
    });

    // 2. Notify Customer of token receipt
    await this.createNotification({
      recipientId: newBooking.customerId,
      title: 'Booking Placed (₹20 Token Received)',
      message: `Your booking for ${newBooking.category} with ${newBooking.workerName} is placed. We have alerted the specialist to confirm.`,
      type: 'system',
      targetBookingId: newBooking.id,
      targetView: 'bookings'
    });

    return newBooking;
  }

  /**
   * Service Provider accepts booking & pays mandatory ₹50 commission fee
   */
  static async workerAcceptBooking(bookingId: string, workerUtr: string): Promise<Booking | null> {
    const bookings = getLocal<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) return null;

    bookings[index].workerCommissionPaid = true;
    bookings[index].workerUtr = workerUtr;
    bookings[index].status = 'confirmed';
    bookings[index].updatedAt = new Date().toISOString();

    setLocal(STORAGE_KEYS.BOOKINGS, bookings);

    // Sync Firestore
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        workerCommissionPaid: true,
        workerUtr: workerUtr,
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore accept booking error:', e);
    }

    // Notify Customer that pro confirmed
    await this.createNotification({
      recipientId: bookings[index].customerId,
      title: '✅ Booking Confirmed & Locked!',
      message: `${bookings[index].workerName} has accepted your ${bookings[index].category} request. They will arrive as scheduled on ${bookings[index].scheduledDate}.`,
      type: 'worker_accepted',
      targetBookingId: bookingId,
      targetView: 'bookings'
    });

    return bookings[index];
  }

  /**
   * Update booking status (e.g. In Progress, Completed, Cancelled)
   */
  static async updateBookingStatus(
    bookingId: string, 
    status: Booking['status'],
    rating?: number,
    reviewText?: string
  ): Promise<Booking | null> {
    const bookings = getLocal<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) return null;

    bookings[index].status = status;
    bookings[index].updatedAt = new Date().toISOString();
    if (status === 'completed') {
      bookings[index].completedAt = new Date().toISOString();
      if (rating) {
        bookings[index].rating = rating;
        bookings[index].reviewText = reviewText;

        // Update worker rating and completed jobs count
        const worker = await this.getWorkerById(bookings[index].workerId);
        if (worker) {
          const totalReviews = (worker.reviewCount || 0) + 1;
          const currentTotal = (worker.rating || 5.0) * (worker.reviewCount || 1);
          const newAvg = Math.round(((currentTotal + rating) / (totalReviews + 1)) * 10) / 10;
          worker.rating = Math.min(5.0, Math.max(1.0, newAvg));
          worker.reviewCount = totalReviews;
          worker.completedJobs = (worker.completedJobs || 0) + 1;
          await this.updateWorkerProfile(worker);
        }
      }
    }

    setLocal(STORAGE_KEYS.BOOKINGS, bookings);

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'completed' && { completedAt: new Date().toISOString() }),
        ...(rating && { rating, reviewText })
      });
    } catch (e) {
      console.warn('Firestore update booking status error:', e);
    }

    // Notifications
    const b = bookings[index];
    if (status === 'completed') {
      await this.createNotification({
        recipientId: b.customerId,
        title: 'Service Completed 🎉',
        message: `Your service with ${b.workerName} has been marked completed. Thank you for using Zupix!`,
        type: 'system',
        targetBookingId: bookingId,
        targetView: 'bookings'
      });
    }

    return bookings[index];
  }

  /**
   * Get all bookings for a user (Customer or Worker)
   */
  static async getBookingsForUser(userId: string, role: 'customer' | 'worker' | 'admin'): Promise<Booking[]> {
    return safeFirestoreOperation(
      async () => {
        const snap = await getDocs(collection(db, 'bookings'));
        if (!snap.empty) {
          const all = snap.docs.map(d => d.data() as Booking);
          setLocal(STORAGE_KEYS.BOOKINGS, all);
          if (role === 'admin') return all;
          if (role === 'worker') {
            return all.filter(b => b.workerId === userId || b.workerPhone === userId);
          }
          return all.filter(b => b.customerId === userId || b.customerPhone === userId);
        }
        const localAll = getLocal<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
        if (role === 'admin') return localAll;
        if (role === 'worker') return localAll.filter(b => b.workerId === userId || b.workerPhone === userId);
        return localAll.filter(b => b.customerId === userId || b.customerPhone === userId);
      },
      () => {
        const localAll = getLocal<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
        if (role === 'admin') return localAll;
        if (role === 'worker') return localAll.filter(b => b.workerId === userId || b.workerPhone === userId);
        return localAll.filter(b => b.customerId === userId || b.customerPhone === userId);
      }
    );
  }

  // ==========================================
  // NOTIFICATIONS ENGINE WITH DEEP REDIRECTS
  // ==========================================

  static async getNotificationsForUser(userId: string): Promise<AppNotification[]> {
    return safeFirestoreOperation(
      async () => {
        const snap = await getDocs(collection(db, 'notifications'));
        if (!snap.empty) {
          const all = snap.docs.map(d => d.data() as AppNotification);
          setLocal(STORAGE_KEYS.NOTIFICATIONS, all);
          return all.filter(n => n.recipientId === userId || n.recipientId === 'ALL');
        }
        const local = getLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
        return local.filter(n => n.recipientId === userId || n.recipientId === 'ALL');
      },
      () => {
        const local = getLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
        return local.filter(n => n.recipientId === userId || n.recipientId === 'ALL');
      }
    );
  }

  static async createNotification(notifData: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): Promise<AppNotification> {
    const notif: AppNotification = {
      ...notifData,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const notifs = getLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift(notif);
    setLocal(STORAGE_KEYS.NOTIFICATIONS, notifs);

    try {
      await setDoc(doc(db, 'notifications', notif.id), notif, { merge: true });
    } catch (e) {
      console.warn('Firestore create notification error:', e);
    }

    return notif;
  }

  static async markNotificationRead(notifId: string): Promise<void> {
    const notifs = getLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const index = notifs.findIndex(n => n.id === notifId);
    if (index >= 0) {
      notifs[index].isRead = true;
      setLocal(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }

    try {
      await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
    } catch (e) {
      console.warn('Firestore mark read error:', e);
    }
  }

  static async markAllNotificationsRead(userId: string): Promise<void> {
    const notifs = getLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.forEach(n => {
      if (n.recipientId === userId || n.recipientId === 'ALL') {
        n.isRead = true;
      }
    });
    setLocal(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // ==========================================
  // EMERGENCY SOS ENGINE
  // ==========================================

  static async createEmergencyRequest(data: Omit<EmergencyRequest, 'id' | 'status' | 'createdAt'>): Promise<EmergencyRequest> {
    const req: EmergencyRequest = {
      ...data,
      id: `EMG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const list = getLocal<EmergencyRequest[]>(STORAGE_KEYS.EMERGENCY, []);
    list.unshift(req);
    setLocal(STORAGE_KEYS.EMERGENCY, list);

    try {
      await setDoc(doc(db, 'emergencyRequests', req.id), req, { merge: true });
    } catch (e) {
      console.warn('Firestore emergency create error:', e);
    }

    return req;
  }

  static async getEmergencyRequests(): Promise<EmergencyRequest[]> {
    return safeFirestoreOperation(
      async () => {
        const snap = await getDocs(collection(db, 'emergencyRequests'));
        if (!snap.empty) {
          const all = snap.docs.map(d => d.data() as EmergencyRequest);
          setLocal(STORAGE_KEYS.EMERGENCY, all);
          return all;
        }
        return getLocal<EmergencyRequest[]>(STORAGE_KEYS.EMERGENCY, []);
      },
      () => getLocal<EmergencyRequest[]>(STORAGE_KEYS.EMERGENCY, [])
    );
  }

  // ==========================================
  // ADMIN METRICS
  // ==========================================
  static async getAdminStats(): Promise<AdminStats> {
    const users = await this.getAllUsers();
    const workers = await this.getAllWorkersForAdmin();
    const bookings = await this.getBookingsForUser('ADMIN', 'admin');

    const totalTokenRevenue = bookings.filter(b => b.customerTokenPaid).length * 20;
    const totalCommissionRevenue = bookings.filter(b => b.workerCommissionPaid).length * 50;

    const banned = await this.getBannedIdentifiers();

    return {
      totalUsers: users.length,
      totalWorkers: workers.length,
      activeWorkers: workers.filter(w => !w.isBlocked).length,
      blockedWorkers: workers.filter(w => w.isBlocked).length,
      totalBookings: bookings.length,
      tokenRevenue: totalTokenRevenue,
      commissionRevenue: totalCommissionRevenue,
      bannedIdentifiersCount: banned.length
    };
  }
}
