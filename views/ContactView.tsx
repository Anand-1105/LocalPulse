import React, { useState } from 'react';
import { Page } from '../App';

interface ContactViewProps {
  onNavigate: (page: Page) => void;
}

const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Navigate to success page instead of showing alert
    onNavigate('contact-success');
  };

  return (
    <div className="pt-40 pb-32 px-8 overflow-hidden" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-20 text-center">
          <span className="font-bold tracking-[0.15em] uppercase text-[11px] mb-4 block" style={{ color: '#9ca3af' }}>
            Get in Touch
          </span>
          <h1 className="text-3xl md:text-5xl font-[800] leading-tight" style={{ color: '#ffffff' }}>
            Contact Us
          </h1>
          <p className="text-xl mt-6 max-w-2xl mx-auto" style={{ color: '#e5e7eb' }}>
            Have a question, suggestion, or want to list your business? We'd love to hear from you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-8" style={{ color: '#ffffff' }}>Get in Touch</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4f46e5' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Email</h3>
                  <p style={{ color: '#e5e7eb' }}>hello@localpulse.com</p>
                  <p style={{ color: '#e5e7eb' }}>support@localpulse.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4f46e5' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Address</h3>
                  <p style={{ color: '#e5e7eb' }}>LocalPulse Headquarters</p>
                  <p style={{ color: '#e5e7eb' }}>LPU Campus, Block 34</p>
                  <p style={{ color: '#e5e7eb' }}>Phagwara, Punjab 144411</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4f46e5' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Response Time</h3>
                  <p style={{ color: '#e5e7eb' }}>We typically respond within 24 hours</p>
                  <p style={{ color: '#e5e7eb' }}>Monday - Friday, 9 AM - 6 PM IST</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#ffffff' }}>Follow Us</h3>
              <div className="flex gap-4">
                {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: '#1f2937' }}
                  >
                    <span className="text-sm font-bold" style={{ color: '#ffffff' }}>
                      {social[0]}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-8" style={{ color: '#ffffff' }}>Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151', 
                    color: '#ffffff'
                  }}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151', 
                    color: '#ffffff'
                  }}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151', 
                    color: '#ffffff'
                  }}
                >
                  <option value="">Select a subject</option>
                  <option value="business-listing">Business Listing</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none resize-none"
                  style={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151', 
                    color: '#ffffff'
                  }}
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactView;