import React, { useState, useEffect } from 'react';
import { Page, useTheme } from '../App';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; value: Page }[] = [
    { label: 'Home', value: 'home' },
    { label: 'Explore', value: 'explore' },
    { label: 'About', value: 'about' },
    { label: 'Pricing', value: 'pricing' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] glass-nav ${isScrolled ? 'py-4 scrolled' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900 font-bold transition-all duration-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:scale-105">
            LP
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            LocalPulse
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button 
              key={item.value} 
              onClick={() => onNavigate(item.value)}
              className={`relative text-[15px] font-semibold transition-colors group py-1 ${
                currentPage === item.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 h-px bg-slate-900 dark:bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                currentPage === item.value ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-50'
              }`}></span>
            </button>
          ))}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button 
            onClick={() => onNavigate('add-business')}
            className={`px-6 py-3 rounded-2xl text-[14px] font-bold transition-all duration-500 active:scale-95 ${currentPage === 'add-business' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Add Business
          </button>
          <button 
            onClick={() => onNavigate('signin')}
            className={`px-8 py-3 rounded-2xl text-[14px] font-bold transition-all duration-500 active:scale-95 ${isScrolled ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-slate-800' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-600'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate('admin')}
            className="px-6 py-3 rounded-2xl text-[14px] font-bold transition-all duration-500 active:scale-95 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Admin
          </button>
        </div>

        <button className="md:hidden text-slate-900 dark:text-white p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;