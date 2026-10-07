export type ServiceCategory = 
  | 'Doctor / General Physician'
  | 'Plumbing'
  | 'Electrical'
  | 'AC & Refrigeration'
  | 'Salon & Makeup'
  | 'Carpentry'
  | 'Cleaning & Pest Control'
  | 'Home Painting'
  | 'Appliance Repair'
  | 'Mechanic / Vehicle Repair';

export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  pincode?: string;
  address?: string;
  avatar?: string;
  deviceId?: string;
  createdAt: string;
  isBlocked?: boolean;
  isProfileComplete?: boolean;
}

export interface BannedIdentifier {
  id: string;
  type: 'phone' | 'device' | 'both';
  identifier: string; // Phone number or Device ID
  reason: string;
  bannedAt: string;
  bannedBy: string; // 'admin' | 'security_engine'
  isPermanent: boolean;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  category: ServiceCategory;
  experienceYears: number;
  hourlyRate: number;
  fixedPrice?: number;
  pincode: string;
  address: string;
  bio: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  registeredAt: string;
  isAvailable: boolean;
  isEmergencyReady: boolean;
  isApproved?: boolean;
  isBlocked?: boolean;
  warningMessage?: string;
  avatar: string;
  specialization?: string;
  clinicExperience?: string;
  serviceAreaRange?: 'local' | 'citywide';
}

export type BookingStatus = 
  | 'pending_worker'       // Customer booked + paid ₹20 token. Waiting for worker to accept & pay ₹50 commission
  | 'confirmed'            // Worker paid ₹50 commission, job confirmed & locked
  | 'in_progress'          // Worker arrived / ongoing
  | 'completed'            // Job finished
  | 'cancelled';           // Cancelled by user or worker

export interface Booking {
  id: string;
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
  
  // Mandatory Fees & Payment details
  customerTokenFee: number;       // ₹20 mandatory token
  customerTokenPaid: boolean;
  customerUtr?: string;
  
  workerCommissionFee: number;   // ₹50 mandatory commission
  workerCommissionPaid: boolean;
  workerUtr?: string;
  
  status: BookingStatus;
  isEmergency?: boolean;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Rating given by customer
  rating?: number;
  reviewText?: string;
}

export interface EmergencyRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceNeeded: string;
  category: ServiceCategory;
  pincode: string;
  address: string;
  notes?: string;
  status: 'active' | 'assigned' | 'resolved' | 'cancelled';
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;       // User ID or Worker ID or 'ALL' or 'ADMIN'
  title: string;
  message: string;
  type: 'booking_new' | 'worker_accepted' | 'payment_reminder' | 'warning' | 'emergency' | 'system';
  targetBookingId?: string;
  targetView?: 'bookings' | 'worker_dashboard' | 'payment' | 'home';
  isRead: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalWorkers: number;
  activeWorkers: number;
  blockedWorkers: number;
  totalBookings: number;
  tokenRevenue: number;     // ₹20 per booking
  commissionRevenue: number;// ₹50 per accepted booking
  bannedIdentifiersCount?: number;
}
