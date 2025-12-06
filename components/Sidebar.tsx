
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BookOpen, BarChart2, Book, PlusCircle, LogOut, User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      isActive 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-2 rounded-lg shadow-md">
                <BookOpen size={24} />
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-900 font-serif leading-none">BOCC 46</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">CommHub</p>
            </div>
        </div>

        <nav className="space-y-2">
            <NavLink to="/" className={getLinkClass}>
                <BookOpen size={20} />
                <span>Feed</span>
            </NavLink>
            <NavLink to="/my-dictionary" className={getLinkClass}>
                <Book size={20} />
                <span>My Dictionary</span>
            </NavLink>
            <NavLink to="/dictionary" className={getLinkClass}>
                <Search size={20} />
                <span>Dictionary</span>
            </NavLink>
            <NavLink to="/stats" className={getLinkClass}>
                <BarChart2 size={20} />
                <span>Statistics</span>
            </NavLink>
            <NavLink to="/profile" className={getLinkClass}>
                <User size={20} />
                <span>Profile</span>
            </NavLink>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
         <NavLink to="/add" className="flex items-center justify-center gap-2 w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-3 rounded-xl font-bold transition-colors mb-6">
            <PlusCircle size={20} />
            Add Entry
         </NavLink>

         <Link to="/profile" className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm group-hover:border-indigo-100 transition-colors">
                {getInitials(user.name)}
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
                <span className="text-xs text-slate-400 truncate">
                  {user.username ? `@${user.username}` : 'Student'}
                </span>
            </div>
         </Link>
      </div>
    </aside>
  );
};
