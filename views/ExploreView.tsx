
import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { CATEGORIES } from '../constants';
import { Business } from '../types';
import { api } from '../services/api';
import { Page } from '../App';
import SectionHeader from '../components/SectionHeader';

interface ExploreViewProps {
  onNavigate: (page: Page, id?: string) => void;
  onSelectBusiness: (id: string) => void;
  initialSearch?: string;
  initialFilter?: string;
}

const ExploreView: React.FC<ExploreViewProps> = ({ onNavigate, onSelectBusiness, initialSearch = '', initialFilter = 'All' }) => {
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const data = await api.getBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const filtered = businesses.filter(b => {
    const matchesFilter = filter === 'All' || b.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(".explore-card", 
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.05, duration: 0.8, ease: "power4.out" }
      );
    }
  }, [filter, searchQuery, loading]);

  if (loading) {
    return (
      <div className="pt-40 pb-32 px-8 min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[11px]">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-8 min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Explore the pulse." subtitle="Directory Search" alignment="left" />
        <div className="flex flex-col lg:flex-row gap-8 mb-16 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setFilter('All')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${filter === 'All' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>All Spots</button>
            {['restaurant', 'cafe', 'services', 'fitness', 'shopping'].map(category => (
              <button key={category} onClick={() => setFilter(category)} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all capitalize ${filter === category ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {category === 'cafe' ? 'Cafes' : category === 'restaurant' ? 'Restaurants' : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-96">
            <input type="text" placeholder="Search places..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-6 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all shadow-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((business) => (
            <div key={business.id} onClick={() => onSelectBusiness(business.id)} className="explore-card cursor-pointer group bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl dark:hover:shadow-slate-900/20 hover:-translate-y-2 transition-all duration-500">
              <div className="h-64 relative overflow-hidden">
                <img src={business.image} alt={business.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
                     }} />
                <div className="absolute top-6 left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-widest">{business.category}</div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{business.name}</h3>
                  <span className="text-amber-500 dark:text-amber-400 font-bold text-sm">★ {business.rating}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{business.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  {business.address}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreView;
