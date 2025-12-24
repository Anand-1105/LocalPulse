import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Page } from '../App';

interface SignInViewProps {
  onNavigate: (page: Page) => void;
  onAdminLogin?: () => void;
  onBusinessOwnerLogin?: () => void;
}

const SignInView: React.FC<SignInViewProps> = ({ onNavigate, onAdminLogin, onBusinessOwnerLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Check if admin credentials are being used in regular sign in
    if (formData.email === 'admin@locatr.com' && formData.password === 'locatr2024') {
      // Handle admin login directly
      setTimeout(() => {
        if (onAdminLogin) {
          onAdminLogin();
        } else {
          alert('Admin credentials detected! Redirecting to Admin Portal...');
          onNavigate('admin');
        }
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    // Check if business owner credentials (student business)
    if (formData.email === 'student@business.com' && formData.password === 'student123') {
      setTimeout(() => {
        if (onBusinessOwnerLogin) {
          onBusinessOwnerLogin();
        } else {
          alert('Business owner credentials detected! Redirecting to Business Dashboard...');
          onNavigate('business-dashboard');
        }
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    // Simulate regular user API call
    setTimeout(() => {
      console.log('Sign in attempt:', formData);
      // For now, just navigate to home
      onNavigate('home');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex items-center justify-center px-8 py-20">
      <div ref={formRef} className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-[800] text-slate-900 mb-4 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 font-medium">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-6 py-4 rounded-2xl border transition-all duration-300 font-medium ${
                  errors.email 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                } focus:outline-none focus:ring-4`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm font-medium mt-2">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-6 py-4 rounded-2xl border transition-all duration-300 font-medium ${
                  errors.password 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                } focus:outline-none focus:ring-4`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm font-medium mt-2">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2 text-sm font-medium text-slate-600">Remember me</span>
              </label>
              <button 
                type="button"
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

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
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
            {/* Business Owner Login */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-900 mb-2">Business Owner?</h3>
              <p className="text-xs text-indigo-700 mb-3">
                Login with your business credentials to manage your listing
              </p>
              <div className="text-xs text-indigo-600 font-mono bg-white p-2 rounded-lg">
                <div>Email: student@business.com</div>
                <div>Password: student123</div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-slate-500 font-medium mb-4">
                Don't have an account?{' '}
                <button 
                  onClick={() => onNavigate('signup' as Page)}
                  className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                >
                  Sign up
                </button>
              </p>
              <p className="text-slate-400 text-sm font-medium">
                Admin access?{' '}
                <button 
                  onClick={() => onNavigate('admin' as Page)}
                  className="text-slate-600 font-bold hover:text-slate-900 transition-colors"
                >
                  Admin Portal
                </button>
              </p>
            </div>
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

export default SignInView;