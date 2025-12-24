import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Business } from '../types';

interface ContactVenueModalProps {
  business: Business;
  onClose: () => void;
}

const ContactVenueModal: React.FC<ContactVenueModalProps> = ({ business, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Entrance Animation
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(modalRef.current, 
        { scale: 0.9, opacity: 0, y: 40 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "power4.out" }, 
        "-=0.2"
      );
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(modalRef.current, { scale: 0.95, opacity: 0, y: 20, duration: 0.4, ease: "power3.in" })
      .to(overlayRef.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Auto close after success
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();
  const todayHours = business.contact?.hours?.[currentDay] || 'Hours not available';

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <div 
          ref={overlayRef}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        />
        
        <div 
          ref={modalRef}
          className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Message Sent!</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your inquiry has been sent to {business.name}. They'll get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div 
        ref={overlayRef}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer" 
      />
      
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden opacity-0"
      >
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Contact {business.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Get in touch with this venue directly
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-all active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
            {business.contact?.phone && (
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{business.contact.phone}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
              </div>
            )}
            
            {business.contact?.email && (
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{business.contact.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
              </div>
            )}
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{todayHours}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Today ({currentDay})</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Inquiry Type
                </label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                >
                  <option value="general">General Inquiry</option>
                  <option value="reservation">Reservation</option>
                  <option value="event">Event Planning</option>
                  <option value="complaint">Complaint</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none"
                placeholder="Tell them what you'd like to know or discuss..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactVenueModal;