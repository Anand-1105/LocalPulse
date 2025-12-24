
import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { BUSINESSES } from '../constants';
import { Page } from '../App';

interface BusinessViewProps {
  businessId: string | null;
  onNavigate: (page: Page, id?: string) => void;
}

const BusinessView: React.FC<BusinessViewProps> = ({ businessId, onNavigate }) => {
  const business = BUSINESSES.find(b => b.id === businessId);

  useEffect(() => {
    if (!business) return;
    gsap.from(".biz-reveal", {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out"
    });
  }, [businessId]);

  if (!business) {
    return (
      <div className="h-screen flex items-center justify-center">
        <button onClick={() => onNavigate('home')} className="text-indigo-600 font-bold">Back to safety</button>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-white">
      {/* Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={business.image} className="w-full h-full object-cover biz-reveal" alt={business.name} 
             onError={(e) => {
               const target = e.target as HTMLImageElement;
               target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
             }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-16 left-8 right-8 max-w-7xl mx-auto flex justify-between items-end text-white">
          <div className="biz-reveal">
            <span className="bg-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 inline-block">
              {business.category}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-2">{business.name}</h1>
            <p className="text-lg text-white/80 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              {business.address}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 biz-reveal">
             <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center">
               <div className="text-3xl font-bold">★ {business.rating}</div>
               <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-1">{business.reviews} reviews</div>
             </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          <div className="biz-reveal">
            <h2 className="text-[11px] uppercase tracking-widest font-extrabold text-slate-400 mb-6">About the venue</h2>
            <p className="text-2xl text-slate-700 leading-relaxed font-medium italic">
              "{business.description}"
            </p>
          </div>
          
          <div className="biz-reveal">
            <h2 className="text-[11px] uppercase tracking-widest font-extrabold text-slate-400 mb-8">What locals say</h2>
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">Verified User</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">October 2023</div>
                      </div>
                    </div>
                    <div className="text-amber-500 font-bold text-sm">★★★★★</div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Absolutely phenomenal experience. The attention to detail and atmosphere is unmatched in the neighborhood. Highly recommend for anyone looking for authentic quality.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="biz-reveal bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl sticky top-32">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Status</span>
              <span className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Open Now
              </span>
            </div>
            
            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="opacity-40">Mon — Fri</span>
                <span>08:00 AM — 09:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="opacity-40">Sat — Sun</span>
                <span>10:00 AM — 11:00 PM</span>
              </div>
            </div>

            <button className="w-full bg-white text-slate-900 py-5 rounded-2xl font-bold hover:scale-[1.02] transition-transform active:scale-95 mb-4">
              Book a Table
            </button>
            <button className="w-full bg-white/10 border border-white/20 text-white py-5 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95">
              Call Direct
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessView;
