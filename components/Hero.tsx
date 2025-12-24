import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Page } from '../App';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(bgRef.current, 
      { scale: 1.2, opacity: 0 }, 
      { scale: 1.05, opacity: 1, duration: 2.5, ease: "power4.out" }
    )
    .fromTo(headlineRef.current, 
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 
      '-=2'
    )
    .fromTo(subRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
      '-=0.8'
    )
    .fromTo(ctaRef.current, 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
      '-=0.6'
    );

    gsap.to(bgRef.current, {
      y: 20,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  return (
    <section className="relative h-[95vh] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-black">
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-cover bg-center opacity-0 scale-[1.2] dark:opacity-80"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2000')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/20 dark:from-black/60 dark:via-black/40 dark:to-black/30 z-10" />
      
      <div className="relative z-20 text-center px-8 max-w-5xl mt-[-5vh]">
        <h1 
          ref={headlineRef}
          className="text-6xl md:text-[100px] font-[800] text-white leading-[0.92] tracking-[-0.04em] mb-12 opacity-0 drop-shadow-2xl"
          style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)' }}
        >
          Curating the <br/> <span className="text-indigo-400 italic font-bold drop-shadow-2xl">city's best.</span>
        </h1>
        <p 
          ref={subRef}
          className="text-xl md:text-2xl text-white mb-14 max-w-2xl mx-auto leading-[1.5] font-medium opacity-0 drop-shadow-lg"
          style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.7), 0 1px 4px rgba(0, 0, 0, 0.5)' }}
        >
          Explore premium restaurants, refined fitness centers, and neighborhood essentials curated by locals.
        </p>
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 justify-center items-center opacity-0">
          <button 
            onClick={() => onNavigate('explore')}
            className="bg-white text-slate-900 px-12 py-6 rounded-2xl text-[17px] font-bold hover:bg-gray-100 transition-all shadow-2xl active:scale-95"
          >
            Discover places
          </button>
          <button 
            onClick={() => onNavigate('signup')}
            className="bg-white/20 backdrop-blur-xl text-white border-2 border-white/30 px-12 py-6 rounded-2xl text-[17px] font-bold hover:bg-white/30 hover:border-white/50 transition-all shadow-lg"
          >
            Get started
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-40">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-gray-500">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-slate-400 dark:from-gray-500 to-transparent"></div>
      </div>
    </section>
  );
};

export default Hero;
