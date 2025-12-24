
import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  alignment?: 'center' | 'left';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, alignment = 'center' }) => {
  return (
    <div className={`mb-20 ${alignment === 'center' ? 'text-center' : 'text-left'}`}>
      <span className="text-slate-400 dark:text-slate-500 font-bold tracking-[0.15em] uppercase text-[11px] mb-4 block">
        {subtitle}
      </span>
      <h2 className="text-3xl md:text-5xl font-[800] text-slate-900 dark:text-white leading-tight">
        {title}
      </h2>
    </div>
  );
};

export default SectionHeader;
