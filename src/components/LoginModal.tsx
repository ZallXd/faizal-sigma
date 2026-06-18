import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Key, User, ShieldAlert, X, AlertCircle, Info } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, pass: string) => Promise<string | null>; // returns error message if fails, null on success
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Wajib mengisi kolom Username dan Password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    const err = await onLogin(username, password);
    setIsLoading(false);

    if (err) {
      setErrorMsg(err);
    } else {
      onClose();
      setUsername('');
      setPassword('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030303]/90 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07070a] p-6 shadow-2xl relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-white/[0.06] mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-indigo-300 mb-3 shadow-md">
                <LogIn className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-xl font-bold text-white">Portal Akademik Sistem Komputer</h3>
              <p className="text-slate-300 text-xs mt-1.5 font-medium leading-relaxed max-w-xs">
                Masukkan kredensial otorisasi Anda untuk memonitor, menguji API key, & merancang widget.
              </p>
            </div>

            {/* Local help note explaining preview accounts! */}
            <div className="mb-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-300 leading-normal space-y-1">
              <div className="flex items-center space-x-1 font-bold text-slate-200">
                <Info className="h-3.5 w-3.5 text-indigo-300" />
                <span>Kredensial Pengujian (Demo):</span>
              </div>
              <p>👤 <span className="font-bold text-slate-200 font-mono">admin</span> (Super Admin) / Password: <span className="font-bold text-slate-200 font-mono">admin123</span></p>
              <p>👤 <span className="font-bold text-slate-200 font-mono">ahmad.faizal4307@smk.belajar.id</span> / Password: <span className="font-bold text-slate-200 font-mono">admin123</span></p>
              <p>👤 <span className="font-bold text-slate-300 font-mono">kelompok1</span> s/d <span className="font-bold text-slate-300 font-mono">kelompok7</span> / Password: <span className="font-bold text-slate-300 font-mono">pass123</span></p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/20 border border-red-500/30 text-rose-400 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase tracking-wider mb-1.5">Username / Email Portal:</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 pl-10 pr-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-400/80 font-mono transition-all"
                    placeholder="Contoh: admin atau kelompok1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase tracking-wider mb-1.5">Password Otentikasi:</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2.5 pl-10 pr-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-400/80 font-mono transition-all"
                    placeholder="Masukkan password Anda"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 font-bold text-sm transition-all duration-300 shadow-sm backdrop-blur cursor-pointer mt-6"
              >
                <span>{isLoading ? 'Melakukan Otentikasi...' : 'Masuk Portal'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
