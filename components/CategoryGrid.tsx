import React, { useEffect } from 'react';
import { CATEGORIES } from '../constants';
import SectionHeader from './SectionHeader';

const CategoryGrid: React.FC = () => {
  return (
    <section className="py-32 bg-white dark:bg-black px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title="Browse Collections" 
          subtitle="Curated Discovery" 
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {CATEGORIES.map((category, index) => (
            <div 
              key={category.id}
              className="group cursor-pointer bg-[#fbfbfd] dark:bg-gray-900 border border-slate-100 dark:border-gray-800 p-10 rounded-[32px] text-center transition-all shadow-sm flex flex-col items-center hover:shadow-xl hover:-translate-y-3 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform shadow-sm group-hover:scale-110`}>
                {category.icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-[16px] tracking-tight">{category.name}</h3>
              <p className="text-slate-400 dark:text-gray-500 text-[11px] font-semibold mt-2 uppercase tracking-widest">120+ Spots</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
