import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LogOut, Calendar, Layers, Globe, Lock, User as UserIcon } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { entries } = useApp();

  if (!user) return null;

  const myEntries = entries.filter(e => e.userId === user.id);
  const publicCount = myEntries.filter(e => e.visibility === 'public').length;
  const privateCount = myEntries.filter(e => e.visibility === 'private').length;

  const joinedDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-4xl font-serif font-bold text-slate-900 mb-8">My Profile</h2>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-slate-900/10">
            {getInitials(user.name)}
          </div>
          <div className="text-center md:text-left flex-1 space-y-2">
            <h3 className="text-3xl font-bold text-slate-900">{user.name}</h3>
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium">
              <Calendar size={18} />
              <span>Joined {joinedDate}</span>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                Student
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors w-full md:w-auto justify-center"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Layers size={100} />
           </div>
           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
             <Layers size={24} />
           </div>
           <p className="text-4xl font-bold text-slate-900 mb-1">{myEntries.length}</p>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Entries</p>
        </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Globe size={100} />
           </div>
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
             <Globe size={24} />
           </div>
           <p className="text-4xl font-bold text-slate-900 mb-1">{publicCount}</p>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Public Posts</p>
        </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Lock size={100} />
           </div>
           <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
             <Lock size={24} />
           </div>
           <p className="text-4xl font-bold text-slate-900 mb-1">{privateCount}</p>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Private Notes</p>
        </div>
      </div>
    </div>
  );
};