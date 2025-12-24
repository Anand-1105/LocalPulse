
import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AboutView: React.FC = () => {
  useEffect(() => {
    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target') || '0');
      gsap.fromTo(stat, 
        { innerText: 0 }, 
        { 
          innerText: target, 
          duration: 2, 
          snap: { innerText: 1 },
          scrollTrigger: {
            trigger: stat,
            start: "top 90%",
          }
        }
      );
    });

    // Force visibility of text elements
    gsap.set(".about-reveal", { opacity: 1, y: 0 });
  }, []);

  return (
    <div className="pt-40 pb-32 px-8 overflow-hidden" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-20 text-center">
          <span className="font-bold tracking-[0.15em] uppercase text-[11px] mb-4 block" style={{ color: '#9ca3af' }}>
            Our Narrative
          </span>
          <h2 className="text-3xl md:text-5xl font-[800] leading-tight" style={{ color: '#ffffff' }}>
            More than just a list.
          </h2>
        </div>
        
        <div className="about-section mb-32">
          <p className="text-3xl md:text-5xl font-medium leading-[1.3] tracking-tight mb-16" style={{ color: '#ffffff', opacity: 1 }}>
            We believe that cities thrive when <span style={{ color: '#818cf8' }}>local character</span> is celebrated. LocalPulse was born from a simple desire: to make the unique accessible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <p className="text-lg leading-relaxed font-medium" style={{ color: '#e5e7eb', opacity: 1 }}>
              In a world of global chains and algorithmic sameness, the places that define our neighborhood's soul are often the hardest to find. We curate the pulse of the city, focusing on quality, character, and community impact.
            </p>
            <p className="text-lg leading-relaxed font-medium" style={{ color: '#e5e7eb', opacity: 1 }}>
              Every business on our platform is hand-vetted. We don't just look at reviews; we look at the story, the craft, and the contribution to the local ecosystem.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-24" style={{ borderTop: '1px solid #374151', borderBottom: '1px solid #374151' }}>
          {[
            { label: 'Local Gems', value: 450, suffix: '+' },
            { label: 'Active Users', value: 12, suffix: 'k' },
            { label: 'Neighborhoods', value: 24, suffix: '' },
            { label: 'Rating Avg', value: 4.8, suffix: '' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-6xl font-[800] mb-2" style={{ color: '#ffffff' }}>
                <span className="stat-number" data-target={stat.value}>0</span>{stat.suffix}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-40 text-center">
          <div className="inline-block p-1 rounded-[40px] mb-12" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}>
            <img src="https://images.unsplash.com/photo-1517457373958-b7bdd458ad20?auto=format&fit=crop&q=80&w=1200" className="rounded-[36px] w-full max-w-4xl shadow-2xl" alt="LocalPulse community" />
          </div>
          <h3 className="text-4xl font-bold mb-8 tracking-tight" style={{ color: '#ffffff' }}>Join the movement.</h3>
          <button className="px-12 py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            Submit a listing
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
