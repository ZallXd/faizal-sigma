import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, LogIn, LogOut, ShieldAlert, Monitor, Home, Key, User, Activity, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: UserType | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  isRealtimeConnected: boolean;
}

export default function Navbar({
  currentPath,
  onNavigate,
  user,
  onLogout,
  onOpenLogin,
  isRealtimeConnected
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleMobileLogin = () => {
    onOpenLogin();
    setIsMobileMenuOpen(false);
  };

  const handleMobileLogout = () => {
    onLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#030303]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer relative z-50" onClick={() => onNavigate('/')}>
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-indigo-300 shadow-md">
            <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-300/80" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full ${isRealtimeConnected ? 'bg-indigo-400 opacity-75 animate-ping' : 'bg-amber-400 opacity-75'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 ${isRealtimeConnected ? 'bg-indigo-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white sm:text-lg">
              Academic IoT <span className="text-indigo-300 font-display hidden sm:inline">Platform</span>
            </h1>
          </div>
        </div>

        {/* Desktop Navigation Actions */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => onNavigate('/')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
              currentPath === '/'
                ? 'bg-white/[0.04] text-white border-b border-indigo-400/80'
                : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
            }`}
          >
            <Home className="h-4 w-4 text-indigo-300" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => onNavigate('/showcase')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
              currentPath.startsWith('/showcase')
                ? 'bg-white/[0.04] text-white border-b border-indigo-400/80'
                : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4 text-indigo-300" />
            <span>Showcase Publik</span>
          </button>

          {user && (
            <button
              onClick={() => onNavigate('/dashboard')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                currentPath.startsWith('/dashboard')
                  ? 'bg-white/[0.04] text-white border-b border-indigo-400/80'
                  : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
              }`}
            >
              <Monitor className="h-4 w-4 text-indigo-300" />
              <span>Dasbor IoT {user.role === 'SUPER_ADMIN' ? 'All' : 'Saya'}</span>
            </button>
          )}

          {user && user.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => onNavigate('/admin')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                currentPath.startsWith('/admin')
                  ? 'bg-white/[0.04] text-white border-b border-purple-400/80'
                  : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-purple-400" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Desktop Auth status & actions */}
        <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end">
                  <span className="font-mono text-xs font-semibold text-indigo-300">
                    {user.role === 'SUPER_ADMIN' ? '⚙️ Super Admin' : user.groupSlug.toUpperCase()}
                  </span>
                </div>
                <p className="max-w-[150px] truncate leading-none text-xs text-slate-300 font-medium">
                  {user.groupName}
                </p>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-white/[0.08] bg-white/[0.01] hover:bg-red-950/20 hover:border-red-500/40 hover:text-red-400 text-slate-400 transition-all cursor-pointer"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 sm:space-x-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-indigo-200 shadow-sm backdrop-blur-md hover:border-indigo-400/40 transition-all duration-300 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden leading-none sm:inline">Login Portal</span>
              <span className="sm:hidden leading-none">Login</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="md:hidden flex items-center relative z-50">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Glassmorphism) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-0 w-full bg-[#030303]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col py-4 px-4 space-y-3">
              <button
                onClick={() => handleMobileNav('/')}
                className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all ${
                  currentPath === '/' ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:bg-white/[0.04]'
                }`}
              >
                <Home className="h-5 w-5 text-indigo-400" />
                <span className="font-medium text-sm">Beranda</span>
              </button>

              <button
                onClick={() => handleMobileNav('/showcase')}
                className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all ${
                  currentPath.startsWith('/showcase') ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:bg-white/[0.04]'
                }`}
              >
                <Activity className="h-5 w-5 text-indigo-400" />
                <span className="font-medium text-sm">Showcase Publik</span>
              </button>

              {user && (
                <button
                  onClick={() => handleMobileNav('/dashboard')}
                  className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all ${
                    currentPath.startsWith('/dashboard') ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:bg-white/[0.04]'
                  }`}
                >
                  <Monitor className="h-5 w-5 text-indigo-400" />
                  <span className="font-medium text-sm">Dasbor IoT {user.role === 'SUPER_ADMIN' ? 'All' : 'Saya'}</span>
                </button>
              )}

              {user && user.role === 'SUPER_ADMIN' && (
                <button
                  onClick={() => handleMobileNav('/admin')}
                  className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all ${
                    currentPath.startsWith('/admin') ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:bg-white/[0.04]'
                  }`}
                >
                  <ShieldAlert className="h-5 w-5 text-purple-400" />
                  <span className="font-medium text-sm">Admin Panel</span>
                </button>
              )}

              <div className="w-full h-[1px] bg-white/[0.06] my-2"></div>

              {user ? (
                <div className="flex flex-col space-y-3">
                  <div className="px-3">
                    <span className="font-mono text-[10px] font-semibold text-indigo-300 block mb-1">
                      {user.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : user.groupSlug.toUpperCase()}
                    </span>
                    <p className="text-xs text-slate-300 font-medium">
                      {user.groupName}
                    </p>
                  </div>
                  <button
                    onClick={handleMobileLogout}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-semibold text-sm">Keluar / Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleMobileLogin}
                  className="flex items-center justify-center space-x-2 w-full p-3 rounded-xl bg-indigo-500/20 text-indigo-200 font-semibold hover:bg-indigo-500/30 transition-all border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="text-sm">Login Portal</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
