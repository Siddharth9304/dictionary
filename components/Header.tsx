
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, PlusCircle, BarChart2, Book, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path 
    ? 'text-primary bg-primary/5 shadow-sm ring-1 ring-primary/10' 
    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50';

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-primary/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
                <BookOpen size={24} strokeWidth={2} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900 font-serif leading-none tracking-tight">Vocab App</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">Communication Hub</p>
              </div>
            </Link>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-3">
            <Link 
              to="/" 
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${isActive('/')}`}
            >
              Feed
            </Link>
            
            <Link 
              to="/my-dictionary" 
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hidden sm:inline-flex items-center gap-2 ${isActive('/my-dictionary')}`}
            >
              <Book size={18} strokeWidth={2} /> My Dictionary
            </Link>

            <Link 
              to="/dictionary" 
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hidden sm:inline-flex items-center gap-2 ${isActive('/dictionary')}`}
            >
              <Search size={18} strokeWidth={2} /> Dictionary
            </Link>

            <Link 
              to="/stats" 
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hidden sm:inline-flex items-center gap-2 ${isActive('/stats')}`}
            >
              <BarChart2 size={18} strokeWidth={2} /> Stats
            </Link>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-3 mr-2">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-700 leading-none">{user.name}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Student</span>
              </div>
            </div>

            <Link 
              to="/add" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ml-1`}
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Add Entry</span>
              <span className="sm:hidden">Add</span>
            </Link>

             <button 
                onClick={logout}
                className="ml-1 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
