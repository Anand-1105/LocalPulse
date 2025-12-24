import React from 'react';
import { Page } from '../App';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white dark:bg-black border-t border-slate-100 dark:border-gray-800 pt-32 pb-16 px-8 animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div onClick={() => onNavigate('home')} className="flex items-center gap-3 mb-10 group cursor-pointer">
              <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold transition-transform group-hover:scale-110">LP</div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">LocalPulse</span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 max-w-xs leading-relaxed font-medium text-[15px]">
              Empowering communities by spotlighting the local gems that make every city unique.
            </p>
          </div>
          
          <div>
            <h4 className="text-[12px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-gray-500 mb-10">Platform</h4>
            <ul className="space-y-5">
              <li><button onClick={() => onNavigate('explore')} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold text-[14px] transition-colors">Search</button></li>
              <li><button onClick={() => onNavigate('about')} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold text-[14px] transition-colors">Our Mission</button></li>
              <li><button className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold text-[14px] transition-colors">Pricing</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-gray-500 mb-10">Company</h4>
            <ul className="space-y-5">
              <li><button onClick={() => onNavigate('about')} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold text-[14px] transition-colors">About</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold text-[14px] transition-colors">Privacy</button></li>
              <li><button onClick={() => onNavigate('contact')} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold text-[14px] transition-colors">Contact</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-gray-500 mb-10">Newsletter</h4>
            <div className="relative mt-2">
              <input 
                type="email" 
                placeholder="hello@pulse.com" 
                className="w-full bg-[#fbfbfd] dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-2xl py-5 px-6 text-slate-900 dark:text-white font-bold outline-none focus:border-slate-300 dark:focus:border-gray-600 transition-colors text-sm placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
              <button className="mt-4 w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-100 text-white dark:text-black py-4 rounded-2xl font-bold transition-all text-sm shadow-xl active:scale-95">
                Join Community
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-50 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8">
            <p className="text-slate-400 dark:text-gray-500 text-[13px] font-bold">
              © {new Date().getFullYear()} LocalPulse Directory. Built for the community.
            </p>
            <button 
              onClick={() => onNavigate('admin')}
              className="text-slate-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-[11px] font-bold uppercase tracking-widest"
            >
              Admin Portal
            </button>
          </div>
          <div className="flex gap-10">
            {['𝕏', 'Instagram', 'Dribbble'].map(social => (
              <a key={social} href="#" className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors text-[13px] font-extrabold">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
