import React, { useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { RemindersPanel } from './RemindersPanel';
import logoImg from '../assets/logo.png';

import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Wifi, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  darkMode, 
  toggleDarkMode 
}) => {
  const { user, logout, demoMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'telegram', label: 'Telegram', icon: Wifi },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    const active = menuItems.find(item => item.id === activeTab);
    return active ? active.label : 'Xivora Invoice Studio';
  };

  return (
    <div className={`h-screen overflow-hidden flex ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 
        transform lg:transform-none lg:static transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-hidden overscroll-contain
      `}>
        
        {/* Sidebar Header Brand */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-md">
              <img src={logoImg} alt="Xivora Logo" className="h-11 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-sans leading-none">
                Xivora
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1.5">
                Invoice Studio
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overscroll-contain">

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150
                  ${isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-950 dark:hover:text-white'}
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile & logout footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-sans">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">Admin</p>
              <p className="text-xs truncate text-slate-400 font-sans">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 hover:text-white bg-red-50 dark:bg-red-950/20 hover:bg-red-500 dark:hover:bg-red-600 border border-red-100 dark:border-red-950/50 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Area (keep sidebar fixed, only main scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden border border-slate-200 dark:border-slate-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Toggle Light/Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Reminders (in-app) */}
            {user && (
              <>
                <div className="hidden lg:block">
                  <RemindersPanel />
                </div>
                <div className="lg:hidden">
                  <RemindersPanel />
                </div>
              </>
            )}


            {/* Connection mode status badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-sans">
              <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
              <span>{demoMode ? 'Demo Mode' : 'Connected to Supabase'}</span>
            </div>
          </div>

        </header>

        {/* Warnings for local database state */}
        {demoMode && (
          <div className="no-print bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-800/30 px-6 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-medium font-sans">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Running in local preview mode. Changes are saved in your local browser storage. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to connect to a live Supabase database.</span>
            </div>
          </div>
        )}

        {/* Content Body Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
