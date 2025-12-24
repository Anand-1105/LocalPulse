import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Business } from '../types';
import SectionHeader from './SectionHeader';
import { api } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedBusinessesProps {
  onSelectBusiness: (id: string) => void;
  userCoords: { lat: number; lng: number } | null;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const FeaturedBusinesses: React.FC<FeaturedBusinessesProps> = ({ onSelectBusiness, userCoords }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getTopRated(userCoords || undefined);
        setBusinesses(data);
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userCoords]);

  useEffect(() => {
    if (businesses.length === 0 || !gridRef.current) return;
    
    const cards = gridRef.current.querySelectorAll('.business-card');
    
    gsap.fromTo(cards, 
      { y: 60, opacity: 0, scale: 0.95 }, 
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%"
        }
      }
    );
  }, [businesses]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = e.currentTarget.querySelector('img');
    gsap.to(e.currentTarget, {
      y: -8,
      boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.15)",
      duration: 0.4,
      ease: "power2.out"
    });
    if (img) gsap.to(img, { scale: 1.08, duration: 0.6 });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = e.currentTarget.querySelector('img');
    gsap.to(e.currentTarget, {
      y: 0,
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      duration: 0.5,
      ease: "power3.out"
    });
    if (img) gsap.to(img, { scale: 1, duration: 0.5 });
  };

  if (loading) return (
    <div className="py-32 bg-[#fafafb] dark:bg-black text-center">
      <div className="w-12 h-12 border-4 border-slate-200 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[11px]">Loading curated spots...</p>
    </div>
  );

  return (
    <section className="py-32 bg-[#fafafb] dark:bg-black px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title="Top Rated Near You" 
          subtitle="Real-time Discovery" 
          alignment="left" 
        />
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {businesses.map((business) => {
            const dist = userCoords ? calculateDistance(userCoords.lat, userCoords.lng, business.location.lat, business.location.lng) : null;
            return (
              <div 
                key={business.id}
                onClick={() => onSelectBusiness(business.id)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="business-card opacity-0 bg-white dark:bg-gray-900 rounded-[40px] overflow-hidden shadow-sm dark:shadow-gray-900/20 transition-all border border-slate-100 dark:border-gray-800 cursor-pointer"
              >
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={business.image} 
                    alt={business.name}
                    className="w-full h-full object-cover transition-transform duration-1000"
                    onError={(e) => {
                      // Fallback to a default image if the original fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute top-6 left-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest shadow-sm">
                    {business.category}
                  </div>
                  {dist && (
                    <div className="absolute bottom-6 right-6 bg-slate-900/80 dark:bg-black/90 backdrop-blur-md px-4 py-2 rounded-full text-[11px] font-bold text-white uppercase tracking-widest">
                      {dist} km
                    </div>
                  )}
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {business.name}
                    </h3>
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800">
                      <span className="text-amber-500 dark:text-amber-400 text-[10px]">★</span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 text-xs">{business.rating}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 text-[15px] font-medium leading-relaxed">
                    {business.description}
                  </p>
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      <span className="text-[12px] font-bold truncate max-w-[200px]">{business.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBusinesses;