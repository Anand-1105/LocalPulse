
import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { gsap } from 'gsap';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import ExploreView from './views/ExploreView';
import AboutView from './views/AboutView';
import BusinessView from './views/BusinessView';
import PricingView from './views/PricingView';
import AddBusinessView from './views/AddBusinessView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import PaymentView from './views/PaymentView';
import PaymentSuccessView from './views/PaymentSuccessView';
import AdminDashboardView from './views/AdminDashboardView';
import AdminLoginView from './views/AdminLoginView';
import PrivacyView from './views/PrivacyView';
import ContactView from './views/ContactView';
import ContactSuccessView from './views/ContactSuccessView';
import BusinessDashboardView from './views/BusinessDashboardView';
import Footer from './components/Footer';
import AIChatBot from './components/AIChatBot';
import BusinessModal from './components/BusinessModal';
import { Business } from './types';
import { api } from './services/api';

export type Page = 'home' | 'explore' | 'about' | 'business' | 'pricing' | 'add-business' | 'signin' | 'signup' | 'payment' | 'payment-success' | 'admin' | 'admin-login' | 'privacy' | 'contact' | 'contact-success' | 'business-dashboard';

const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({ isDark: false, toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [modalBusiness, setModalBusiness] = useState<Business | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const adminState = localStorage.getItem('admin_logged_in') === 'true';
    console.log('Initial admin state:', adminState);
    return adminState;
  });
  const [isBusinessOwnerLoggedIn, setIsBusinessOwnerLoggedIn] = useState(() => {
    const businessState = localStorage.getItem('business_owner_logged_in') === 'true';
    console.log('Initial business owner state:', businessState);
    return businessState;
  });
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    console.log('Admin state changed:', isAdminLoggedIn);
  }, [isAdminLoggedIn]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    // Set Block 34 LPU as fixed location (always use this location)
    const block34LpuCoords = { lat: 31.2540, lng: 75.7030 }; // Block 34, LPU Campus
    setUserCoords(block34LpuCoords);
    
    // Don't use actual geolocation - always use Block 34 LPU as the reference point
    console.log("Using Block 34 LPU as reference location:", block34LpuCoords);

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'explore', 'about', 'pricing', 'add-business', 'signin', 'signup', 'payment', 'payment-success', 'admin', 'admin-login', 'privacy', 'contact', 'contact-success', 'business-dashboard'].includes(hash)) {
        setCurrentPage(hash as Page);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(mainRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [currentPage]);

  const openBusinessDetail = useCallback(async (id: string) => {
    console.log('openBusinessDetail called with id:', id, 'type:', typeof id);
    const biz = await api.getBusinessById(id);
    console.log('Business fetched:', biz);
    if (biz) {
      setModalBusiness(biz);
      console.log('Modal business set to:', biz.name);
    } else {
      console.error('Business not found for ID:', id);
      // Optionally show an error message to the user
    }
  }, []);

  const openBusinessDirect = useCallback((business: Business) => {
    console.log('openBusinessDirect called with business:', business);
    setModalBusiness(business);
  }, []);

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
  };

  const handleAdminLogin = () => {
    console.log('handleAdminLogin called');
    setIsAdminLoggedIn(true);
    localStorage.setItem('admin_logged_in', 'true');
    console.log('Admin login state updated, navigating to admin page');
    // Force immediate navigation
    window.location.hash = '#admin';
    setCurrentPage('admin');
  };

  const handleBusinessOwnerLogout = () => {
    setIsBusinessOwnerLoggedIn(false);
    localStorage.removeItem('business_owner_logged_in');
  };

  const handleBusinessOwnerLogin = () => {
    console.log('handleBusinessOwnerLogin called');
    setIsBusinessOwnerLoggedIn(true);
    localStorage.setItem('business_owner_logged_in', 'true');
    console.log('Business owner login state updated, navigating to business dashboard');
    // Force immediate navigation
    window.location.hash = '#business-dashboard';
    setCurrentPage('business-dashboard');
  };

  const navigate = (page: Page, businessId?: string, planData?: any) => {
    // Check if trying to access admin without login
    if (page === 'admin' && !isAdminLoggedIn) {
      setCurrentPage('admin-login');
      return;
    }
    
    // Check if trying to access business dashboard without login
    if (page === 'business-dashboard' && !isBusinessOwnerLoggedIn) {
      setCurrentPage('signin');
      return;
    }
    
    setCurrentPage(page);
    if (businessId) setSelectedBusinessId(businessId);
    if (planData) setSelectedPlan(planData);
    window.scrollTo(0, 0);
  };

  const toggleTheme = () => setIsDark(!isDark);

  const renderPage = () => {
    console.log('renderPage called with currentPage:', currentPage, 'isAdminLoggedIn:', isAdminLoggedIn);
    switch (currentPage) {
      case 'home':
        return <HomeView onNavigate={navigate} onSelectBusiness={openBusinessDetail} onSelectBusinessDirect={openBusinessDirect} userCoords={userCoords} />;
      case 'explore':
        return <ExploreView onNavigate={navigate} onSelectBusiness={openBusinessDetail} />;
      case 'about':
        return <AboutView />;
      case 'privacy':
        return <PrivacyView />;
      case 'contact':
        return <ContactView onNavigate={navigate} />;
      case 'contact-success':
        return <ContactSuccessView onNavigate={navigate} />;
      case 'pricing':
        return <PricingView onNavigate={navigate} />;
      case 'add-business':
        return <AddBusinessView onNavigate={navigate} />;
      case 'signin':
        return <SignInView onNavigate={navigate} onAdminLogin={handleAdminLogin} onBusinessOwnerLogin={handleBusinessOwnerLogin} />;
      case 'signup':
        return <SignUpView onNavigate={navigate} />;
      case 'payment':
        return <PaymentView onNavigate={navigate} selectedPlan={selectedPlan} />;
      case 'payment-success':
        return <PaymentSuccessView onNavigate={navigate} />;
      case 'admin':
        console.log('Admin case reached, isAdminLoggedIn:', isAdminLoggedIn);
        return isAdminLoggedIn ? <AdminDashboardView onNavigate={navigate} onLogout={handleAdminLogout} /> : <AdminLoginView onNavigate={navigate} onAdminLogin={handleAdminLogin} />;
      case 'admin-login':
        return <AdminLoginView onNavigate={navigate} onAdminLogin={handleAdminLogin} />;
      case 'business-dashboard':
        console.log('Business dashboard case reached, isBusinessOwnerLoggedIn:', isBusinessOwnerLoggedIn);
        return isBusinessOwnerLoggedIn ? <BusinessDashboardView onNavigate={navigate} onLogout={handleBusinessOwnerLogout} /> : <SignInView onNavigate={navigate} onAdminLogin={handleAdminLogin} onBusinessOwnerLogin={handleBusinessOwnerLogin} />;
      case 'business':
        return <BusinessView businessId={selectedBusinessId} onNavigate={navigate} />;
      default:
        return <HomeView onNavigate={navigate} onSelectBusiness={openBusinessDetail} onSelectBusinessDirect={openBusinessDirect} userCoords={userCoords} />;
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className="min-h-screen bg-white dark:bg-black selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-700 dark:selection:text-indigo-300 transition-colors">
        {!['signin', 'signup', 'payment', 'payment-success', 'admin', 'admin-login', 'contact-success', 'business-dashboard'].includes(currentPage) && (
          <Navbar currentPage={currentPage} onNavigate={navigate} />
        )}
        <div className="relative z-10">
          <main ref={mainRef}>
            {renderPage()}
          </main>
          {!['signin', 'signup', 'payment', 'payment-success', 'admin', 'admin-login', 'contact-success', 'business-dashboard'].includes(currentPage) && (
            <Footer onNavigate={navigate} />
          )}
        </div>
        <AIChatBot />
        {modalBusiness && (
          <BusinessModal 
            business={modalBusiness} 
            onClose={() => setModalBusiness(null)} 
            userCoords={userCoords}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
