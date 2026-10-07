import React, { useState, useEffect } from 'react';
import type { 
  WorkerProfile, 
  User as AppUser, 
  Booking, 
  ServiceCategory, 
  AppNotification 
} from './types';
import { ApiService } from './api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { MyBookingsView } from './components/MyBookingsView';
import { WorkerDashboard } from './components/WorkerDashboard';
import { ProfileView } from './components/ProfileView';
import { BookingModal } from './components/BookingModal';
import { DirectCallModal } from './components/DirectCallModal';
import { RegisterWorkerModal } from './components/RegisterWorkerModal';
import { EmergencyModal } from './components/EmergencyModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthModal } from './components/AuthModal';
import { LoginGatewayView } from './components/LoginGatewayView';
import { ProfileSetupView } from './components/ProfileSetupView';
import { OnboardingCarousel } from './components/OnboardingCarousel';
import { Footer } from './components/Footer';
import { ProviderSetupPage } from './components/ProviderSetupPage';
import { LanguageCode, getSavedLanguage } from './utils/i18n';
import { CountryOption, getSavedCountry } from './utils/countries';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authFlowState, setAuthFlowState] = useState<'loading' | 'onboarding' | 'gateway' | 'profile_setup' | 'authenticated'>('loading');
  const [partialUserData, setPartialUserData] = useState<Partial<AppUser>>({});
  const [selectedSignupRole, setSelectedSignupRole] = useState<'customer' | 'worker'>('customer');
  const [lang, setLang] = useState<LanguageCode>(getSavedLanguage());
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(getSavedCountry());

  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'worker_dashboard' | 'profile' | 'provider_setup'>('home');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pincodeFilter, setPincodeFilter] = useState('134102');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isRegisterWorkerOpen, setIsRegisterWorkerOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [bookingWorker, setBookingWorker] = useState<WorkerProfile | null>(null);
  const [isDirectCallOpen, setIsDirectCallOpen] = useState(false);
  const [directCallWorker, setDirectCallWorker] = useState<WorkerProfile | null>(null);

  // Load User & Global Data on Boot
  useEffect(() => {
    loadInitialData();

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/provider-setup') {
        setActiveTab('provider_setup');
      } else if (path === '/provider-dashboard') {
        setActiveTab('worker_dashboard');
      } else if (path === '/bookings') {
        setActiveTab('bookings');
      } else if (path === '/profile') {
        setActiveTab('profile');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Reload bookings and notifications when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser);
    }
  }, [currentUser]);

  // Reload workers when category or pincode changes
  useEffect(() => {
    loadWorkers();
  }, [selectedCategory, pincodeFilter]);

  const loadInitialData = async () => {
    const path = window.location.pathname;

    try {
      const user = await ApiService.getCurrentUser();

      // Check direct URL navigation
      if (path === '/provider-setup') {
        if (user) {
          setCurrentUser(user);
          if (user.pincode) setPincodeFilter(user.pincode);
        }
        setAuthFlowState('authenticated');
        setActiveTab('provider_setup');
        await loadWorkers();
        return;
      }

      if (path === '/provider-dashboard') {
        if (user) {
          setCurrentUser(user);
          if (user.pincode) setPincodeFilter(user.pincode);
          await loadUserData(user);
        }
        setAuthFlowState('authenticated');
        setActiveTab('worker_dashboard');
        await loadWorkers();
        return;
      }

      if (user && user.isProfileComplete && user.name && user.phone) {
        setCurrentUser(user);
        if (user.pincode) {
          setPincodeFilter(user.pincode);
        }
        setAuthFlowState('authenticated');
        await loadUserData(user);

        // Strict Role-Based Routing:
        // Service Providers land directly on /provider-dashboard
        // Customers land on /dashboard
        if (user.role === 'worker') {
          setActiveTab('worker_dashboard');
          try {
            window.history.replaceState({}, '', '/provider-dashboard');
          } catch (e) {}
        } else {
          setActiveTab('home');
          try {
            window.history.replaceState({}, '', '/dashboard');
          } catch (e) {}
        }
      } else {
        // First-time or unauthenticated: Start with interactive Onboarding Carousel
        setAuthFlowState('onboarding');
      }
    } catch (e) {
      console.warn('Error reading current user:', e);
      setAuthFlowState('onboarding');
    }
    await loadWorkers();
  };

  const loadWorkers = async () => {
    try {
      const data = await ApiService.getWorkers(selectedCategory, pincodeFilter);
      // STRICT ZERO DUMMY PROFILES GUARDRAIL: Only sets real data
      setWorkers(data);
    } catch (e) {
      console.error('Error loading workers:', e);
      setWorkers([]);
    }
  };

  const loadUserData = async (user: AppUser) => {
    try {
      // Load user's bookings
      const userBookings = await ApiService.getBookingsForUser(user.id, user.role);
      setBookings(userBookings);

      // If user is a worker, find their worker profile
      if (user.role === 'worker') {
        const allWorkers = await ApiService.getAllWorkersForAdmin();
        const profile = allWorkers.find(w => w.userId === user.id || w.phone === user.phone);
        setWorkerProfile(profile || null);
      }

      // Load user's notifications
      const notifs = await ApiService.getNotificationsForUser(user.id);
      setNotifications(notifs);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  };

  const handleRefreshAll = async () => {
    await loadWorkers();
    if (currentUser) {
      await loadUserData(currentUser);
    }
  };

  // Interactive Notification Deep Linking
  const handleNotificationClick = async (notif: AppNotification) => {
    await ApiService.markNotificationRead(notif.id);
    setIsNotifsOpen(false);

    // Update notifications list state
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));

    // Redirect to target booking or view
    if (notif.targetBookingId) {
      setSelectedBookingId(notif.targetBookingId);
      if (currentUser?.role === 'worker' && notif.targetView === 'worker_dashboard') {
        setActiveTab('worker_dashboard');
      } else {
        setActiveTab('bookings');
      }

      // Scroll to booking card smoothly
      setTimeout(() => {
        const el = document.getElementById(`booking-${notif.targetBookingId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else if (notif.targetView) {
      if (notif.targetView === 'payment' || notif.targetView === 'bookings') {
        setActiveTab('bookings');
      } else if (notif.targetView === 'worker_dashboard') {
        setActiveTab('worker_dashboard');
      } else {
        setActiveTab('home');
      }
    }
  };

  const handleMarkAllNotifsRead = async () => {
    if (!currentUser) return;
    await ApiService.markAllNotificationsRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleBookingCreated = (newBooking: Booking) => {
    setBookingWorker(null);
    setBookings(prev => [newBooking, ...prev]);
    setActiveTab('bookings');
    setSelectedBookingId(newBooking.id);
  };

  const handleWorkerRegistered = (newWorker: WorkerProfile) => {
    setWorkerProfile(newWorker);
    setWorkers(prev => [newWorker, ...prev.filter(w => w.id !== newWorker.id)]);
    navigateTo('/provider-dashboard');
  };

  const handleProviderSetupSuccess = (newWorker: WorkerProfile, user: AppUser) => {
    setCurrentUser(user);
    setWorkerProfile(newWorker);
    setWorkers(prev => [newWorker, ...prev.filter(w => w.id !== newWorker.id)]);
    navigateTo('/provider-dashboard');
  };

  // Navigation router helper supporting pushState and dedicated routes
  const navigateTo = (view: string) => {
    let targetPath = '/dashboard';

    if (view === '/provider-setup' || view === 'provider_setup') {
      targetPath = '/provider-setup';
      setActiveTab('provider_setup');
    } else if (view === '/provider-dashboard' || view === 'worker_dashboard') {
      targetPath = '/provider-dashboard';
      setActiveTab('worker_dashboard');
    } else if (view === '/bookings' || view === 'bookings') {
      targetPath = '/bookings';
      setActiveTab('bookings');
    } else if (view === '/profile' || view === 'profile') {
      targetPath = '/profile';
      setActiveTab('profile');
    } else {
      targetPath = '/dashboard';
      setActiveTab('home');
    }

    try {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    } catch (e) {
      // safe fallback in sandboxed iframe
    }
  };

  const handleRoleSwitch = async (newRole: AppUser['role']) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    await ApiService.setCurrentUser(updated);
    setCurrentUser(updated);
    if (newRole === 'worker') {
      navigateTo('/provider-dashboard');
    } else {
      navigateTo('/dashboard');
    }
  };

  const handleLogout = async () => {
    await ApiService.setCurrentUser(null);
    setCurrentUser(null);
    setWorkerProfile(null);
    setBookings([]);
    setNotifications([]);
    navigateTo('/dashboard');
    setAuthFlowState('onboarding');
  };

  const handleLoginSuccess = async (user: AppUser) => {
    setCurrentUser(user);
    if (user.pincode) {
      setPincodeFilter(user.pincode);
    }
    setAuthFlowState('authenticated');
    await loadUserData(user);

    if (user.role === 'worker') {
      navigateTo('/provider-dashboard');
    } else {
      navigateTo('/dashboard');
    }
  };

  const handleStartProfileSetup = (initialData: Partial<AppUser>) => {
    setPartialUserData(initialData);
    setAuthFlowState('profile_setup');
  };

  const handleProfileSetupComplete = async (user: AppUser) => {
    // 1. Initialize user profile data
    setCurrentUser(user);
    if (user.pincode) {
      setPincodeFilter(user.pincode);
    }
    
    // 2. Set flow state to authenticated
    setAuthFlowState('authenticated');

    // 3. Explicit post-success navigation command
    if (user.role === 'worker') {
      navigateTo('/provider-dashboard');
    } else {
      navigateTo('/dashboard');
    }

    // 4. Load remaining user data in background
    await loadUserData(user);
  };

  // 1. Loading Splash Screen while checking session
  if (authFlowState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono">
          Initializing Zupix Secure Gateway...
        </p>
      </div>
    );
  }

  // 2. New User Onboarding Flow (3-4 Slide Carousel with 'Get Started' & Role Route)
  if (authFlowState === 'onboarding') {
    return (
      <OnboardingCarousel
        onSelectLogin={() => setAuthFlowState('gateway')}
        onSelectSignUp={(role) => {
          const chosenRole = role || 'customer';
          setSelectedSignupRole(chosenRole);
          setPartialUserData({ role: chosenRole });
          if (chosenRole === 'worker') {
            setAuthFlowState('authenticated');
            navigateTo('/provider-setup');
          } else {
            setAuthFlowState('gateway');
          }
        }}
        lang={lang}
        onLanguageChange={setLang}
      />
    );
  }

  // 3. Mandatory Login/Sign-up Gateway (Phone Auth SMS OTP / Google Auth)
  if (authFlowState === 'gateway') {
    return (
      <LoginGatewayView
        onLoginSuccess={handleLoginSuccess}
        onStartProfileSetup={handleStartProfileSetup}
        initialRole={selectedSignupRole}
        onBackToIntro={() => setAuthFlowState('onboarding')}
      />
    );
  }

  // 4. Profile Setup Screen for New Users
  if (authFlowState === 'profile_setup') {
    return (
      <ProfileSetupView
        initialData={partialUserData}
        onComplete={handleProfileSetupComplete}
        onCancel={() => setAuthFlowState('gateway')}
      />
    );
  }

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 sm:pb-8 selection:bg-blue-600 selection:text-white">
      
      {/* App Header with Live Animated Icon & hidden admin trigger */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenRegisterWorker={() => navigateTo('/provider-setup')}
        unreadNotifsCount={unreadNotifsCount}
        currentPincode={pincodeFilter}
        onPincodeChange={setPincodeFilter}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'register_worker') {
            navigateTo('/provider-setup');
          } else {
            setActiveTab(tab as any);
          }
        }}
        lang={lang}
        onLanguageChange={setLang}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            workers={workers}
            onBookWorker={(w) => {
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                setBookingWorker(w);
              }
            }}
            onDirectCall={(w) => {
              setDirectCallWorker(w);
              setIsDirectCallOpen(true);
            }}
            onOpenRegisterWorker={() => navigateTo('/provider-setup')}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            pincodeFilter={pincodeFilter}
            onPincodeFilterChange={setPincodeFilter}
            lang={lang}
          />
        )}

        {activeTab === 'provider_setup' && (
          <ProviderSetupPage
            currentUser={currentUser}
            initialPincode={pincodeFilter || '134102'}
            onSetupSuccess={handleProviderSetupSuccess}
            onCancel={() => navigateTo(currentUser?.role === 'worker' ? '/provider-dashboard' : '/dashboard')}
          />
        )}

        {activeTab === 'bookings' && (
          <MyBookingsView
            bookings={bookings}
            currentUser={currentUser}
            onRefresh={handleRefreshAll}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateToHome={() => setActiveTab('home')}
            selectedBookingId={selectedBookingId}
          />
        )}

        {activeTab === 'worker_dashboard' && (
          <WorkerDashboard
            workerProfile={workerProfile}
            bookings={bookings}
            currentUser={currentUser}
            onRefresh={handleRefreshAll}
            onOpenRegister={() => navigateTo('/provider-setup')}
            onNavigateToSetup={() => navigateTo('/provider-setup')}
            onNavigateToSearch={() => navigateTo('/dashboard')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            workerProfile={workerProfile}
            onLogout={handleLogout}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onSwitchRole={handleRoleSwitch}
            onOpenRegisterWorker={() => navigateTo('/provider-setup')}
            onNavigateToBookings={() => setActiveTab('bookings')}
            lang={lang}
            onLanguageChange={setLang}
            onCountryChange={(c) => setSelectedCountry(c)}
          />
        )}
      </main>

      {/* Global Comprehensive Footer */}
      <Footer 
        lang={lang} 
        onCountryChange={(c) => setSelectedCountry(c)} 
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'register_worker') {
            navigateTo('/provider-setup');
          } else {
            setActiveTab(tab as any);
          }
        }}
        currentUser={currentUser}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Modals & Drawers */}
      
      {/* 1. Customer Booking Modal with 100% Free & Zero Commission */}
      <BookingModal
        isOpen={Boolean(bookingWorker)}
        worker={bookingWorker}
        currentUser={currentUser}
        onClose={() => setBookingWorker(null)}
        onBookingSuccess={handleBookingCreated}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 2. Direct Call Modal with Location Guidance & Safety Disclaimer */}
      <DirectCallModal
        isOpen={isDirectCallOpen}
        worker={directCallWorker}
        currentUser={currentUser}
        onClose={() => {
          setIsDirectCallOpen(false);
          setDirectCallWorker(null);
        }}
        lang={lang}
      />

      {/* 3. Pro Partner Registration Modal */}
      <RegisterWorkerModal
        isOpen={isRegisterWorkerOpen}
        onClose={() => setIsRegisterWorkerOpen(false)}
        currentUser={currentUser}
        onRegisterSuccess={handleWorkerRegistered}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 4. 24x7 SOS Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        currentUser={currentUser}
        lang={lang}
      />

      {/* 5. Interactive Notifications Center */}
      <NotificationDrawer
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllNotifsRead}
      />

      {/* 6. Master Admin Panel with functioning Block and Delete Listeners */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={handleRefreshAll}
      />

      {/* 7. User Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={async (user) => {
          setCurrentUser(user);
          await loadUserData(user);
        }}
      />

    </div>
  );
};

export default App;
