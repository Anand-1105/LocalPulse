import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Page } from '../App';

interface SignUpViewProps {
  onNavigate: (page: Page) => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessOwner: false,
    agreeToTerms: false
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Sign up attempt:', formData);
      // For now, just navigate to home
      onNavigate('home');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex items-center justify-center px-8 py-20">
      <div ref={formRef} className="w-full max-w-lg">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-[800] text-slate-900 mb-4 tracking-tight">
            Join Locatr
          </h1>
          <p className="text-slate-500 font-medium">
            Create your account and start discovering local businesses
          </p>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-medium ${
                    errors.firstName 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                  } focus:outline-none focus:ring-4`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs font-medium mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-medium ${
                    errors.lastName 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                  } focus:outline-none focus:ring-4`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs font-medium mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                placeholder="john@example.com"
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
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm font-medium mt-2">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-6 py-4 rounded-2xl border transition-all duration-300 font-medium ${
                  errors.confirmPassword 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-200'
                } focus:outline-none focus:ring-4`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm font-medium mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  name="businessOwner"
                  checked={formData.businessOwner}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <span className="text-sm font-medium text-slate-600">
                  I'm a business owner looking to list my business
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <span className="text-sm font-medium text-slate-600">
                  I agree to the{' '}
                  <button type="button" className="text-indigo-600 hover:text-indigo-700 font-bold">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-indigo-600 hover:text-indigo-700 font-bold">
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm font-medium">{errors.agreeToTerms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold transition-all duration-300 hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <button 
                onClick={() => onNavigate('signin' as Page)}
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
              >
                Sign in
              </button>
            </p>
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

export default SignUpView;