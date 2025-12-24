import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import SectionHeader from '../components/SectionHeader';
import { Page } from '../App';

interface PricingViewProps {
  onNavigate: (page: Page, planData?: any) => void;
}

const PricingView: React.FC<PricingViewProps> = ({ onNavigate }) => {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.pricing-card');
    if (!cards) return;

    // Set initial state and animate in
    gsap.set(cards, { y: 50, opacity: 0 });
    gsap.to(cards, {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 1.2,
      ease: "power4.out"
    });

    // Cleanup function to reset opacity when component unmounts
    return () => {
      gsap.set(cards, { opacity: 1, y: 0 });
    };
  }, []);

  const tiers = [
    {
      name: 'Essential',
      price: '$0',
      description: 'Get your business on the map and start connecting.',
      features: ['Basic Profile', 'Business Listing', 'Category Search', 'Direct Contact Button'],
      highlight: false
    },
    {
      name: 'Professional',
      price: '$49',
      description: 'The standard for growth-focused local businesses.',
      features: ['Everything in Essential', 'Featured Placement', 'Analytics Dashboard', 'Rich Media Gallery', 'Verified Badge'],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: '$149',
      description: 'Advanced tools for multi-location groups.',
      features: ['Everything in Professional', 'Priority Support', 'API Access', 'Custom AI Descriptions', 'Campaign Manager'],
      highlight: false
    }
  ];

  return (
    <div className="pt-40 pb-32 px-8 bg-[#fafafb] dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title="Scale your local presence." 
          subtitle="Partnership Plans" 
        />
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`pricing-card p-10 rounded-[40px] flex flex-col border transition-all duration-500 hover:-translate-y-4 ${
                tier.highlight 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-2xl shadow-indigo-100 dark:shadow-gray-900' 
                  : 'bg-white dark:bg-gray-900 text-slate-900 dark:text-white border-slate-100 dark:border-gray-800 shadow-sm'
              }`}
            >
              <div className="mb-10">
                <h3 className="text-[11px] uppercase tracking-widest font-extrabold mb-6 opacity-60">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-[800]">{tier.price}</span>
                  <span className="text-sm font-bold opacity-60">/mo</span>
                </div>
                <p className={`text-[15px] font-medium leading-relaxed ${tier.highlight ? 'text-slate-300 dark:text-gray-600' : 'text-slate-500 dark:text-gray-400'}`}>
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-6 flex-grow mb-12">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-sm font-bold">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${tier.highlight ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onNavigate('payment' as Page, tier)}
                className={`w-full py-5 rounded-2xl font-bold transition-all active:scale-95 ${
                  tier.highlight 
                    ? 'bg-white dark:bg-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-gray-900' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100'
                }`}
              >
                Choose {tier.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <p className="text-slate-400 dark:text-gray-500 text-sm font-bold">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingView;