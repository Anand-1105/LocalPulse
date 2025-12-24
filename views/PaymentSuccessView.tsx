import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Page } from '../App';

interface PaymentSuccessViewProps {
  onNavigate: (page: Page) => void;
}

const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && checkmarkRef.current) {
      const tl = gsap.timeline();
      
      // Animate container
      tl.fromTo(containerRef.current, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
      );
      
      // Animate checkmark with bounce
      tl.fromTo(checkmarkRef.current, 
        { scale: 0, rotation: -180 }, 
        { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" }, 
        '-=0.5'
      );
      
      // Animate other elements
      tl.fromTo(".success-item", 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }, 
        '-=0.3'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafb] flex items-center justify-center px-8">
      <div ref={containerRef} className="max-w-2xl mx-auto text-center">
        {/* Success Checkmark */}
        <div className="mb-12">
          <div 
            ref={checkmarkRef}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-200"
          >
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 className="success-item text-5xl font-[800] text-slate-900 mb-6 tracking-tight">
            Payment Successful!
          </h1>
          
          <p className="success-item text-xl text-slate-600 font-medium mb-12 leading-relaxed">
            Welcome to Locatr Professional! Your account has been upgraded and you're ready to grow your business.
          </p>
        </div>

        {/* Success Details */}
        <div className="success-item bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Order Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Plan:</span>
                  <span className="font-bold text-slate-900">Professional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Amount:</span>
                  <span className="font-bold text-slate-900">₹4,071/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Transaction ID:</span>
                  <span className="font-mono text-slate-700">TXN-{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Next Billing:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-indigo-600 font-bold text-xs">1</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">Check your email for receipt</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-indigo-600 font-bold text-xs">2</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">Access your dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-indigo-600 font-bold text-xs">3</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">Start growing your business</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Features Unlocked */}
        <div className="success-item bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[40px] p-10 border border-indigo-100 mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">🎉 Features Unlocked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900">Featured Placement</h4>
                <p className="text-sm text-slate-600 font-medium">Top search results</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900">Analytics Dashboard</h4>
                <p className="text-sm text-slate-600 font-medium">Track your performance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900">Rich Media Gallery</h4>
                <p className="text-sm text-slate-600 font-medium">Showcase your business</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900">Verified Badge</h4>
                <p className="text-sm text-slate-600 font-medium">Build customer trust</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-item flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => onNavigate('home')}
            className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold transition-all duration-300 hover:bg-slate-800 active:scale-95"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => onNavigate('add-business')}
            className="bg-white text-slate-900 border-2 border-slate-200 px-12 py-5 rounded-2xl font-bold transition-all duration-300 hover:border-slate-400 active:scale-95"
          >
            Add Your Business
          </button>
        </div>

        {/* Support Info */}
        <div className="success-item mt-12 p-6 bg-slate-50 rounded-2xl">
          <p className="text-sm text-slate-500 font-medium mb-2">
            Need help getting started?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:support@locatr.com" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              📧 support@locatr.com
            </a>
            <span className="hidden sm:block text-slate-300">•</span>
            <a href="tel:+911234567890" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              📞 +91 12345 67890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessView;