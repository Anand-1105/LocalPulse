import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Page } from '../App';

interface ContactSuccessViewProps {
  onNavigate: (page: Page) => void;
}

const ContactSuccessView: React.FC<ContactSuccessViewProps> = ({ onNavigate }) => {
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
    <div className="min-h-screen px-8 flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div ref={containerRef} className="max-w-2xl mx-auto text-center">
        {/* Success Checkmark */}
        <div className="mb-12">
          <div 
            ref={checkmarkRef}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
            style={{ backgroundColor: '#10b981' }}
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 className="success-item text-5xl font-[800] mb-6 tracking-tight" style={{ color: '#ffffff' }}>
            Message Sent!
          </h1>
          
          <p className="success-item text-xl font-medium mb-12 leading-relaxed" style={{ color: '#e5e7eb' }}>
            Thank you for reaching out! We've received your message and will get back to you within 24 hours.
          </p>
        </div>

        {/* Success Details */}
        <div className="success-item rounded-[40px] p-10 shadow-sm border mb-12" style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#ffffff' }}>Message Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: '#9ca3af' }}>Status:</span>
                  <span className="font-bold" style={{ color: '#10b981' }}>Delivered</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: '#9ca3af' }}>Priority:</span>
                  <span className="font-bold" style={{ color: '#ffffff' }}>Normal</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: '#9ca3af' }}>Reference ID:</span>
                  <span className="font-mono" style={{ color: '#e5e7eb' }}>MSG-{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: '#9ca3af' }}>Expected Response:</span>
                  <span className="font-bold" style={{ color: '#ffffff' }}>
                    Within 24 hours
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#ffffff' }}>What Happens Next?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#4f46e5' }}>
                    <span className="font-bold text-xs" style={{ color: '#ffffff' }}>1</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#e5e7eb' }}>Our team reviews your message</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#4f46e5' }}>
                    <span className="font-bold text-xs" style={{ color: '#ffffff' }}>2</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#e5e7eb' }}>We'll email you a response</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#4f46e5' }}>
                    <span className="font-bold text-xs" style={{ color: '#ffffff' }}>3</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#e5e7eb' }}>Follow-up if needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="success-item rounded-[40px] p-10 border mb-12" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', borderColor: '#4f46e5' }}>
          <h3 className="text-2xl font-bold mb-8" style={{ color: '#ffffff' }}>💬 Other Ways to Reach Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold" style={{ color: '#ffffff' }}>Email Support</h4>
                <p className="text-sm font-medium" style={{ color: '#e5e7eb' }}>hello@localpulse.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3b82f6' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold" style={{ color: '#ffffff' }}>Live Chat</h4>
                <p className="text-sm font-medium" style={{ color: '#e5e7eb' }}>Available 9 AM - 6 PM IST</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8b5cf6' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold" style={{ color: '#ffffff' }}>Visit Us</h4>
                <p className="text-sm font-medium" style={{ color: '#e5e7eb' }}>LPU Campus, Block 34</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold" style={{ color: '#ffffff' }}>Help Center</h4>
                <p className="text-sm font-medium" style={{ color: '#e5e7eb' }}>FAQs & Guides</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-item flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => onNavigate('home')}
            className="px-12 py-5 rounded-2xl font-bold transition-all duration-300 active:scale-95"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
          >
            Back to Home
          </button>
          <button 
            onClick={() => onNavigate('about')}
            className="border-2 px-12 py-5 rounded-2xl font-bold transition-all duration-300 active:scale-95"
            style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: '#374151' }}
          >
            Learn More About Us
          </button>
        </div>

        {/* Support Info */}
        <div className="success-item mt-12 p-6 rounded-2xl" style={{ backgroundColor: '#1f2937' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>
            Urgent matter? Contact us directly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:hello@localpulse.com" className="font-bold transition-colors" style={{ color: '#4f46e5' }}>
              📧 hello@localpulse.com
            </a>
            <span className="hidden sm:block" style={{ color: '#6b7280' }}>•</span>
            <span className="font-bold" style={{ color: '#4f46e5' }}>
              📞 Available Mon-Fri, 9 AM - 6 PM IST
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSuccessView;