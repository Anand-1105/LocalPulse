import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Business } from '../types';
import ContactVenueModal from './ContactVenueModal';

declare const L: any;

interface BusinessModalProps {
  business: Business;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
}

const Haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const BusinessModal: React.FC<BusinessModalProps> = ({ business, onClose, userCoords }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapRef = useRef<any>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [distance, setDistance] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    // Initial Entrance Animation
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(modalRef.current, 
        { scale: 0.9, opacity: 0, y: 40 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "power4.out" }, 
        "-=0.2"
      )
      .fromTo(".modal-gallery-img", { opacity: 0, x: 20 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.8 }, "-=0.3");

    // CRITICAL: Map Initialization with runtime check for L to prevent ReferenceError
    const initModalMap = () => {
      if (typeof window !== 'undefined' && (window as any).L && mapContainerRef.current && !modalMapRef.current) {
        const Leaflet = (window as any).L;
        const modalMap = Leaflet.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false
        }).setView([business.location.lat, business.location.lng], 15);

        modalMapRef.current = modalMap;
        Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(modalMap);

        const markerHtml = `
          <div class="marker-inner w-8 h-8 bg-indigo-600 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center text-white scale-0" id="modal-marker">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        `;

        const icon = Leaflet.divIcon({
          className: 'modal-custom-marker',
          html: markerHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        Leaflet.marker([business.location.lat, business.location.lng], { icon }).addTo(modalMap);

        setTimeout(() => {
          const marker = document.getElementById("modal-marker");
          if (marker) gsap.to(marker, { scale: 1.2, duration: 0.6, ease: "back.out(2)" });
        }, 800);
      } else if (!(window as any).L) {
         setTimeout(initModalMap, 200);
      }
    };

    initModalMap();

    // Distance Calculation
    if (userCoords) {
      setDistance(Haversine(userCoords.lat, userCoords.lng, business.location.lat, business.location.lng));
    }

    return () => {
      if (modalMapRef.current) {
        modalMapRef.current.remove();
        modalMapRef.current = null;
      }
    };
  }, [business, userCoords]);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(modalRef.current, { scale: 0.95, opacity: 0, y: 20, duration: 0.4, ease: "power3.in" })
      .to(overlayRef.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  };

  const getDirections = () => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${business.location.lat},${business.location.lng}`;
    if (userCoords) {
      url += `&origin=${userCoords.lat},${userCoords.lng}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
      <div 
        ref={overlayRef}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer" 
      />
      
      <div 
        ref={modalRef}
        className="relative w-full max-w-5xl bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] opacity-0"
      >
        <div className="md:w-1/2 relative bg-slate-100 h-64 md:h-auto shrink-0">
          <img 
            src={business.images[activeImage]} 
            className="w-full h-full object-cover transition-opacity duration-500"
            alt={business.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
            }}
          />
          <div className="absolute bottom-8 left-8 right-8 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {business.images.map((img, i) => (
              <div 
                key={i}
                onClick={() => setActiveImage(i)}
                className={`modal-gallery-img w-20 h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${activeImage === i ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover"
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
                     }} />
              </div>
            ))}
          </div>
          <button 
            onClick={handleClose}
            className="md:hidden absolute top-6 right-6 bg-white/40 backdrop-blur-lg text-white p-2.5 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-grow p-10 md:p-14 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800">
          <div className="flex justify-between items-start mb-10">
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold uppercase tracking-widest mb-4 block">
                {business.category}
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-4">
                {business.name}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-xl text-amber-700 dark:text-amber-300 font-bold text-sm">
                  ★ {business.rating}
                </div>
                <span className="text-slate-400 dark:text-slate-500 font-medium text-sm">{business.reviews} verified reviews</span>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="hidden md:flex p-3 bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-all active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-12">
            {business.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
            <div className="space-y-8">
              <div>
                <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 mb-3">Address</h4>
                <div className="flex items-start gap-3 text-slate-900 dark:text-white font-bold">
                  <svg className="w-5 h-5 mt-0.5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  {business.address}
                </div>
              </div>
              {distance && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 mb-3">Distance</h4>
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    {distance} <span className="text-slate-300 dark:text-slate-600">KM</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest ml-2 px-3 py-1 bg-slate-50 dark:bg-slate-700 rounded-full">Away</span>
                  </div>
                </div>
              )}
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-inner border border-slate-100 group min-h-[160px]">
              <div ref={mapContainerRef} className="h-40 md:h-full w-full" />
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={getDirections}
                  className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl text-slate-900 hover:scale-110 transition-transform active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button 
              onClick={getDirections}
              className="flex-grow bg-slate-900 text-white py-6 rounded-3xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              Get Directions
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </button>
            <button className="flex-grow bg-white border-2 border-slate-100 text-slate-900 py-6 rounded-3xl font-bold hover:border-slate-300 transition-all active:scale-95">
              Contact Venue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModal;