import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, BarChart2, Book, PlusCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all relative group ${
      isActive 
        ? 'text-indigo-600' 
        : 'text-slate-400 hover:text-slate-600'
    }`;

  const tooltipClass = "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-50";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-50 pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
         <NavLink to="/" className={getLinkClass}>
            <BookOpen size={22} strokeWidth={2} />
            <span className={tooltipClass}>Feed</span>
         </NavLink>

         <NavLink to="/my-dictionary" className={getLinkClass}>
            <Book size={22} strokeWidth={2} />
            <span className={tooltipClass}>My Dictionary</span>
         </NavLink>
         
         <NavLink to="/add" className="group relative flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/20 -mt-6 border-4 border-slate-50 hover:scale-105 transition-transform">
            <PlusCircle size={24} />
            <span className={tooltipClass}>Add Entry</span>
         </NavLink>

         <NavLink to="/stats" className={getLinkClass}>
            <BarChart2 size={22} strokeWidth={2} />
            <span className={tooltipClass}>Stats</span>
         </NavLink>
         
         <NavLink to="/profile" className={getLinkClass}>
            <User size={22} strokeWidth={2} />
            <span className={tooltipClass}>Profile</span>
         </NavLink>
      </nav>
      {/* Safe area spacing for iPhone home bar handled by pb-safe if using viewport-fit=cover, but simple padding here works */}
      <div className="h-1 bg-transparent"></div> 
    </div>
  );
};