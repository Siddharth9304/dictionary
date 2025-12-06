import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowRight, UserPlus, LogIn, AlertCircle, Lock, User, UserCircle, Hash } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('register');
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classCode, setClassCode] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- 1. Client-Side Validation ---

    // Username Validation
    // Note: Spaces check removed here because we prevent them in the input onChange
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    // Registration Specific Validation
    if (mode === 'register') {
      if (fullName.trim().length < 3) {
        setError('Full Name must be at least 3 characters long.');
        return;
      }

      if (password.length < 6) {
        setError('Password is too weak. It must be at least 6 characters long.');
        return;
      }
      
      if (!classCode.trim()) {
        setError('Please enter your Class Code to register.');
        return;
      }
    }

    // --- 2. Submission & API Handling ---
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      let success = false;

      if (mode === 'login') {
        success = await login(username, password);
        if (!success) {
          throw new Error('Invalid credentials. Please check your username and password.');
        }
      } else {
        success = await register(username, fullName, password, classCode);
        if (!success) {
          throw new Error('Registration failed. This username might already be taken.');
        }
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      const errorMessage = err.message || 'An unexpected error occurred. Please try again later.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setPassword('');
    if (newMode === 'login') {
      setFullName('');
      setClassCode('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white">
      
      <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl shadow-indigo-500/10 w-full max-w-md border border-white relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-4 rounded-2xl mb-6 shadow-lg shadow-primary/30 transform -rotate-3">
            <BookOpen size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight text-center">Dictionary App</h1>
          <p className="text-slate-500 mt-2 text-center text-sm">
            {mode === 'login' ? 'Welcome back, student!' : 'Join the class community'}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-slate-100/80 p-1.5 rounded-xl flex mb-8 relative z-10">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'login' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'register' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {mode === 'register' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(''); }}
                    placeholder="e.g. Alex Smith"
                    className="w-full px-5 py-3.5 pl-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400 text-base"
                  />
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="classCode" className="block text-sm font-bold text-slate-700 ml-1">
                  Class Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="classCode"
                    required
                    value={classCode}
                    onChange={(e) => { setClassCode(e.target.value); setError(''); }}
                    placeholder="e.g. CLASS-101"
                    className="w-full px-5 py-3.5 pl-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400 text-base uppercase"
                  />
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>
          )}

          {/* Username Input - UPDATED */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-bold text-slate-700 ml-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                required
                autoCapitalize="none" // Prevents mobile from capitalizing first letter
                value={username}
                onChange={(e) => { 
                  // Force lowercase and remove any spaces immediately
                  const sanitizedValue = e.target.value.toLowerCase().replace(/\s/g, '');
                  setUsername(sanitizedValue); 
                  setError(''); 
                }}
                placeholder={mode === 'login' ? "Enter username" : "lowercase, no spaces (min 3)"}
                className={`w-full px-5 py-3.5 pl-11 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:outline-none transition-all placeholder:text-slate-400 text-base ${
                  error && (error.includes('Username') || error.includes('taken'))
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                    : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                }`}
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                required={mode === 'register'} 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder={mode === 'login' ? "Enter password" : "Min 6 chars"}
                className={`w-full px-5 py-3.5 pl-11 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:outline-none transition-all placeholder:text-slate-400 text-base ${
                  error && (error.includes('Password') || error.includes('credentials'))
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                    : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                }`}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 text-xs font-medium ml-1 animate-in slide-in-from-top-1 bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || isSubmitting}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 mt-6"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Continue to Feed' : 'Create Account'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm font-medium opacity-60">
        Develop a good vocabulary
      </p>
    </div>
  );
};