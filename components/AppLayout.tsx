import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="md:pl-64 min-h-screen pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
};