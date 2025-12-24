import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import SectionHeader from '../components/SectionHeader';
import { CATEGORIES } from '../constants';
import { Page } from '../App';

declare const L: any;

interface AddBusinessViewProps {
  onNavigate: (page: Page) => void;
}

const AddBusinessView: React.FC<AddBusinessViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    hours: '',
    rating: '5',
    latitude: '',
    longitude: ''
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation - Staggered items
    const ctx = gsap.context(() => {
      gsap.fromTo(".add-reveal", 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 1.2, ease: "power4.out", delay: 0.2 }
      );
    });

    // Initialize map with a clean minimalist style, with a check for global Leaflet (L)
    const initMap = () => {
      if (typeof L === 'undefined') {
        setTimeout(initMap, 200);
        return;
      }

      if (mapContainerRef.current && !mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true,
          dragging: true,
          touchZoom: true
        }).setView([31.2540, 75.7030], 15); // Block 34 LPU coordinates
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
        mapRef.current = map;
      }
    };

    initMap();

    return () => {
      ctx.revert();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      const newImagesPromises = filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const newBase64Images = await Promise.all(newImagesPromises);
      setImages(prev => [...prev, ...newBase64Images]);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Safe check for map instance in async callback
        if (!mapRef.current) return;
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, latitude: latitude.toString(), longitude: longitude.toString() }));
        setIsLocating(false);
        
        if (mapRef.current && typeof L !== 'undefined') {
          mapRef.current.flyTo([latitude, longitude], 15, { duration: 2, ease: 'power3.inOut' });
          if (markerRef.current) markerRef.current.remove();
          
          const marker = L.marker([latitude, longitude]).addTo(mapRef.current);
          markerRef.current = marker;
          
          const markerIcon = marker.getElement();
          if (markerIcon) {
            gsap.from(markerIcon, { y: -50, opacity: 0, duration: 0.6, ease: "bounce.out" });
          }
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert("Unable to fetch location. Please enter coordinates manually.");
      },
      { timeout: 10000 }
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.address.trim()) newErrors.address = "Business address is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const submission = { 
        ...formData, 
        images, 
        id: `sub_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'pending' as const,
        submittedBy: 'user@example.com' // In real app, get from auth
      };
      
      console.log("Structured Submission Object:", submission);
      
      // Save to user submissions (existing functionality)
      const existingUser = JSON.parse(localStorage.getItem('user_submissions') || '[]');
      localStorage.setItem('user_submissions', JSON.stringify([...existingUser, submission]));
      
      // Save to admin submissions (new functionality)
      const existingAdmin = JSON.parse(localStorage.getItem('business_submissions') || '[]');
      localStorage.setItem('business_submissions', JSON.stringify([...existingAdmin, submission]));
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        const card = document.getElementById("success-card");
        if (card) {
          gsap.fromTo(card, 
            { scale: 0.9, opacity: 0, y: 20 }, 
            { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: "power4.out" }
          );
        }
      }, 50);
    }, 2500);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-40 pb-32 px-8 min-h-screen bg-[#fafafb] dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="add-reveal mb-12">
          <SectionHeader 
            title="Register Your Spot" 
            subtitle="Partnership Portal" 
            alignment="left"
          />
        </div>

        <div ref={formContainerRef} className="add-reveal bg-white dark:bg-gray-900 rounded-[48px] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-1 bg-indigo-600 dark:bg-indigo-400 transition-all duration-1000" style={{ width: isSubmitting ? '100%' : '0%' }} />
          
          <form onSubmit={handleSubmit} className="p-10 md:p-20 space-y-16">
            
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h1m4 0h1m-5-5h1m4 0h1"></path></svg>
                </div>
                <h3 className="text-[12px] uppercase tracking-[0.2em] font-extrabold text-slate-400 dark:text-gray-500">Business Identity</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3 group">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-gray-300 ml-1">Official Name*</label>
                  <input 
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-50 dark:bg-gray-800 border ${errors.businessName ? 'border-red-300' : 'border-slate-100 dark:border-gray-700'} rounded-[24px] py-5 px-8 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all input-focus-ring`}
                    placeholder="The Golden Griddle"
                  />
                  {errors.businessName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.businessName}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-gray-300 ml-1">Category*</label>
                  <div className="relative">
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 dark:bg-gray-800 border ${errors.category ? 'border-red-300' : 'border-slate-100 dark:border-gray-700'} rounded-[24px] py-5 px-8 text-[15px] font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all appearance-none input-focus-ring`}
                    >
                      <option value="">Choose Industry</option>
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  {errors.category && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.category}</p>}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-slate-700 dark:text-gray-300 ml-1">Elevator Pitch</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-[28px] py-6 px-8 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all input-focus-ring"
                  placeholder="Describe your unique value in 2-3 sentences..."
                />
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-[12px] uppercase tracking-[0.2em] font-extrabold text-slate-400 dark:text-gray-500">Operations & Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-gray-300 ml-1">Phone Number</label>
                  <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-[24px] py-5 px-8 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all input-focus-ring"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-gray-300 ml-1">Website</label>
                  <input 
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-[24px] py-5 px-8 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all input-focus-ring"
                    placeholder="www.yourbrand.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-gray-300 ml-1">Operating Hours</label>
                  <input 
                    name="hours"
                    value={formData.hours}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-[24px] py-5 px-8 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all input-focus-ring"
                    placeholder="Mon-Fri 9am-6pm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-gray-300 ml-1">Initial Rating (Demo)</label>
                  <select 
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-[24px] py-5 px-8 text-[15px] font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all appearance-none input-focus-ring"
                  >
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                </div>
                <h3 className="text-[12px] uppercase tracking-[0.2em] font-extrabold text-slate-400 dark:text-gray-500">Physical Location</h3>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <input 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-50 dark:bg-gray-800 border ${errors.address ? 'border-red-300' : 'border-slate-100 dark:border-gray-700'} rounded-[24px] py-5 px-8 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all pr-40 input-focus-ring`}
                    placeholder="Street, Suite, City, Zip"
                  />
                  <button 
                    type="button"
                    onClick={requestLocation}
                    disabled={isLocating}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-extrabold uppercase tracking-widest rounded-[18px] hover:bg-slate-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-gray-900"
                  >
                    {isLocating ? 'Scanning...' : 'Detect Me'}
                  </button>
                </div>
                {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.address}</p>}
                
                <div className="h-[300px] rounded-[32px] overflow-hidden border border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 relative group">
                  <div ref={mapContainerRef} className="w-full h-full z-0" />
                  <div className="absolute top-6 left-6 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-gray-800 text-[10px] font-extrabold text-slate-400 dark:text-gray-500 uppercase tracking-widest shadow-xl">
                    Live Map Anchor
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-[12px] uppercase tracking-[0.2em] font-extrabold text-slate-400 dark:text-gray-500">Photo Gallery</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {images.map((src, i) => (
                  <div key={i} className="aspect-square rounded-[24px] overflow-hidden border-2 border-slate-100 dark:border-gray-800 relative group animate-in fade-in zoom-in-95 duration-500">
                    <img src={src} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-red-600/90 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      <span className="text-[9px] font-bold uppercase tracking-widest mt-2">Delete</span>
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-[24px] border-3 border-dashed border-slate-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-all text-slate-300 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 group">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Attach File</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-50 dark:border-gray-800">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-7 rounded-[28px] font-extrabold text-[16px] transition-all shadow-2xl shadow-slate-300 dark:shadow-gray-900 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-4 btn-glow hover:bg-slate-800 dark:hover:bg-gray-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Listing for Approval
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-700" 
            onClick={() => onNavigate('home')} 
          />
          <div 
            id="success-card" 
            className="relative bg-white dark:bg-gray-900 rounded-[56px] p-16 md:p-24 max-w-xl w-full text-center shadow-2xl opacity-0 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600 dark:bg-indigo-400" />
            <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-sm relative">
              <svg className="w-16 h-16 success-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-[900] text-slate-900 dark:text-white mb-6 tracking-tight leading-none">In Review.</h2>
            <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed mb-12 px-4">
              Your business narrative has been sent to our city curation board. Expect a pulse check within 48 hours.
            </p>
            <button 
              onClick={() => onNavigate('home')}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-6 rounded-[24px] font-bold hover:bg-slate-800 dark:hover:bg-gray-100 transition-all active:scale-95 text-[15px] shadow-xl"
            >
              Return to Discovery
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBusinessView;