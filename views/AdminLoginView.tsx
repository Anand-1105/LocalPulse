import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Page } from '../App';

interface AdminLoginViewProps {
  onNavigate: (page: Page) => void;
  onAdminLogin: () => void;
}

const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onNavigate, onAdminLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    // Simple demo credentials - in real app, use proper authentication
    setTimeout(() => {
      console.log('Checking credentials:', credentials.username, credentials.password);
      if (credentials.username === 'admin@locatr.com' && credentials.password === 'locatr2024') {
        console.log('Credentials match, calling onAdminLogin');
        setIsLoading(false);
        onAdminLogin();
      } else {
        console.log('Credentials do not match');
        setError('Invalid credentials. Try admin@locatr.com / locatr2024');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex items-center justify-center px-8">
      <div ref={formRef} className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-[800] text-slate-900 mb-4 tracking-tight">
            Admin Access
          </h1>
          <p className="text-slate-500 font-medium">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Email Address
              </label>
              <input
                type="email"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200 focus:outline-none focus:ring-4 transition-all duration-300 font-medium"
                placeholder="Enter admin email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200 focus:outline-none focus:ring-4 transition-all duration-300 font-medium"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold transition-all duration-300 hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Admin'
              )}
            </button>
          </form>

          <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
            <h4 className="font-bold text-slate-900 mb-3">Demo Credentials</h4>
            <div className="text-sm font-mono bg-white p-3 rounded-lg border mb-4">
              <div>Email: <span className="text-indigo-600">admin@locatr.com</span></div>
              <div>Password: <span className="text-indigo-600">locatr2024</span></div>
            </div>
            <button 
              onClick={() => {
                setCredentials({ username: 'admin@locatr.com', password: 'locatr2024' });
              }}
              className="w-full bg-indigo-100 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-200 transition-all mb-2"
            >
              Auto-fill Credentials
            </button>
            <button 
              onClick={() => {
                console.log('Direct login test');
                onAdminLogin();
              }}
              className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-bold hover:bg-green-200 transition-all"
            >
              Direct Login Test
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => onNavigate('home')}
            className="text-slate-400 font-medium hover:text-slate-600 transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginView;