import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, GroupConfig, TelemetryLog } from '../types';
import { Activity, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';

export default function ShowcaseView() {
  const projects = useAppStore((s) => s.projects);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Systems');
  const navigate = useNavigate();

  const categories = ['All Systems', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = selectedCategory === 'All Systems'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200">
      <section className="py-20 border-b border-white/[0.06] bg-gradient-to-b from-[#0a0a0c] to-[#030303]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-4">
            Showcase Platform <span className="text-indigo-400">Terbuka</span>
          </h1>
          <p className="text-slate-300 md:text-lg max-w-2xl mx-auto">
            Akses langsung ke jaringan telemetri publik dan riset IoT yang dibangun oleh inkubasi mahasiswa dengan transparansi data real-time penuh tanpa login.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#030303]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.06] pb-8 gap-4">
            <div>
              <span className="font-mono text-xs text-indigo-300 uppercase tracking-widest">DIREKTORI RISET</span>
              <h2 className="text-3xl font-bold text-white mt-1">Daftar Project Teknologi Mahasiswa</h2>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-white/[0.02] p-1 rounded-xl border border-white/[0.08]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-mono font-medium transition-all duration-300 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-indigo-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((p) => (
                <motion.div
                  key={p.id}
                  layoutId={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-indigo-500/25 hover:bg-[#08080b] transition-all duration-300 flex flex-col h-full overflow-hidden group shadow-xl relative"
                >
                  {/* Decorative high tech card header */}
                  <div className="p-4 border-b border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                    <span className="font-mono text-[10px] bg-white/[0.04] text-slate-200 px-2.5 py-1 rounded border border-white/[0.08]">
                      {p.groupSlug.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-2 w-2">
                        <span className={`absolute inline-flex h-full w-full rounded-full ${p.status === 'online' ? 'bg-indigo-400 animate-ping' : 'bg-red-400'} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${p.status === 'online' ? 'bg-indigo-500' : 'bg-red-500'}`}></span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-300">
                        {p.status === 'online' ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {p.name}
                      </h3>
                      <p className="mt-2 text-slate-300/90 text-xs leading-relaxed line-clamp-3">
                        {p.description}
                      </p>

                      <div className="mt-4 flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                        <span className="bg-[#0a0a0c] px-2 py-0.5 rounded border border-white/[0.06] text-slate-300">
                          Cat: {p.category}
                        </span>
                        <span className="text-slate-700">|</span>
                        <span className="text-slate-300">Upb: {new Date(p.lastUpdated).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-end justify-between">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-200/90 border border-indigo-500/20 px-2 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/showcase/${p.groupSlug}`)}
                          className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition-all cursor-pointer"
                          title="Buka Pemantauan Akses Publik"
                        >
                          <Activity className="h-3.5 w-3.5 text-indigo-300" />
                          <span>Quick View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
