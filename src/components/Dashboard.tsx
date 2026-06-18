import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Settings,
  Plus,
  Trash2,
  Copy,
  Check,
  Cpu,
  Brain,
  Terminal,
  RefreshCw,
  Gauge,
  Activity,
  ArrowUpRight,
  Sparkles,
  Layers,
  Code2,
  BookOpen,
  Info,
  Calendar,
  Lock,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { User, GroupConfig, WidgetConfig } from '../types';
import { useAppStore } from '../store';

interface DashboardProps {
  user?: User | null;
  onUpdateGroupConfig: (groupSlug: string, update: Partial<GroupConfig>) => Promise<boolean>;
  isRealtimeConnected: boolean;
  publicGroupSlug?: string; // If viewed publicly, the explicit group to show
}

export default function Dashboard({
  user,
  onUpdateGroupConfig,
  isRealtimeConnected,
  publicGroupSlug
}: DashboardProps) {
  // Pull heavy data directly from store with granular selectors.
  // This way Dashboard re-renders are isolated from App.tsx,
  // preserving scroll position when telemetry data arrives.
  const groups = useAppStore((s) => s.groups);
  const devices = useAppStore((s) => s.devices);
  const logs = useAppStore((s) => s.logs);
  // Current active group slug viewed
  const [activeGroupSlug, setActiveGroupSlug] = useState<string>(
    publicGroupSlug || (user && user.role === 'SUPER_ADMIN' ? 'group-1' : user?.groupSlug) || 'group-1'
  );

  // States
  const [copiedText, setCopiedText] = useState<{ [key: string]: boolean }>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Forms for editing Group Metadata
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Widget builder states
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [newWidget, setNewWidget] = useState<Partial<WidgetConfig>>({
    title: '',
    type: 'realtime_card',
    sensorKey: '',
    unit: '',
    min: 0,
    max: 100,
    color: '#10b981'
  });

  // Get current active group data
  const activeGroup = useMemo(() => {
    return groups.find(g => g.groupSlug === activeGroupSlug) || groups[0];
  }, [groups, activeGroupSlug]);

  // Sync edit mode input placeholders when active group shifts
  useEffect(() => {
    if (activeGroup) {
      setProjectName(activeGroup.projectName);
      setProjectDesc(activeGroup.projectDesc);
    }
    setAiAnalysis(null);
  }, [activeGroup, activeGroupSlug]);

  // Get historical logs for this active group
  const activeLogs = useMemo(() => {
    return logs
      .filter(l => l.groupSlug === activeGroupSlug)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [logs, activeGroupSlug]);

  // Get active device gateway info for the viewed group
  const activeDevice = useMemo(() => {
    return devices.find(d => d.groupSlug === activeGroupSlug);
  }, [devices, activeGroupSlug]);

  // Handle analytical feedback trigger via server-side Gemini intelligence
  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupSlug: activeGroupSlug })
      });
      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysis(`### ❌ Gagal Menganalisis\n\nTerjadi kesalahan: ${data.error}`);
      }
    } catch (e) {
      setAiAnalysis(`### ❌ Koneksi Terputus\n\nGagal memanggil server analitik.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyCreds = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText({ ...copiedText, [id]: true });
    setTimeout(() => {
      setCopiedText(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Save Configured Layouts & Widget adjustments
  const handleSaveConfig = async () => {
    const success = await onUpdateGroupConfig(activeGroupSlug, {
      projectName,
      projectDesc,
      widgets: activeGroup.widgets
    });
    if (success) {
      setIsEditMode(false);
    }
  };

  // Add a newly typed custom sensor widget to current layout list
  const handleAddWidget = async () => {
    if (!newWidget.title || !newWidget.sensorKey) return alert('Judul Widget & Sensor Key wajib diisi.');
    
    const widgetId = `widget-${activeGroupSlug}-${Date.now()}`;
    const added: WidgetConfig = {
      id: widgetId,
      title: newWidget.title,
      type: newWidget.type as any,
      sensorKey: newWidget.sensorKey.toLowerCase().trim().replace(/\s+/g, '_'),
      unit: newWidget.unit || '',
      min: Number(newWidget.min) || 0,
      max: Number(newWidget.max) || 100,
      color: newWidget.color || '#3b82f6'
    };

    const updatedWidgets = [...activeGroup.widgets, added];
    
    const success = await onUpdateGroupConfig(activeGroupSlug, {
      widgets: updatedWidgets
    });

    if (success) {
      setShowAddWidget(false);
      setNewWidget({
        title: '',
        type: 'realtime_card',
        sensorKey: '',
        unit: '',
        min: 0,
        max: 100,
        color: '#10b981'
      });
    }
  };

  // Remove targeted widget from config list
  const handleRemoveWidget = async (widgetId: string) => {
    if (!confirm('Hapus widget sensor monitoring ini?')) return;
    const updated = activeGroup.widgets.filter(w => w.id !== widgetId);
    await onUpdateGroupConfig(activeGroupSlug, {
      widgets: updated
    });
  };

  // Toggle widget visibility
  const handleToggleHideWidget = async (widgetId: string) => {
    const updated = activeGroup.widgets.map(w => w.id === widgetId ? { ...w, isHidden: !w.isHidden } : w);
    await onUpdateGroupConfig(activeGroupSlug, {
      widgets: updated
    });
  };

  // Move widget priority order
  const handleMoveWidget = async (index: number, direction: 'up' | 'down') => {
    const updated = [...activeGroup.widgets];
    if (direction === 'up' && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === 'down' && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    } else {
      return;
    }
    await onUpdateGroupConfig(activeGroupSlug, {
      widgets: updated
    });
  };

  // Get display formatting helper for markdown to text
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-indigo-300 text-base mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-bold text-white mt-3 text-sm">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('* ')) {
        return <li key={idx} className="text-slate-300 text-xs ml-4 list-disc mt-1">{line.replace('* ', '')}</li>;
      }
      if (line.startsWith('1. ')) {
        return <li key={idx} className="text-slate-300 text-xs ml-4 list-decimal mt-1">{line.replace('1. ', '')}</li>;
      }
      if (line.startsWith('```')) {
        if (line === '```' || line.startsWith('```cpp') || line.startsWith('```ts') || line.startsWith('```json')) {
          return null; // boundary tag ignored or styled
        }
      }
      // Detect inline code blocks e.g. `X-API-Key`
      if (line.includes('`')) {
        const parts = line.split('`');
        return (
          <p key={idx} className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            {parts.map((p, i) => i % 2 === 1 ? <code key={i} className="bg-[#0a0a0c] px-1.5 py-0.5 rounded text-indigo-300 border border-white/[0.06] font-mono text-[11px]">{p}</code> : p)}
          </p>
        );
      }
      return <p key={idx} className="text-slate-300 text-xs mt-1 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#030303] p-4 sm:p-6 lg:p-8 text-slate-100 font-sans selection:bg-indigo-500/25 selection:text-indigo-300">
      
      {/* Upper Dashboard Sub-Header bar */}
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs bg-white/[0.02] text-indigo-300 px-2.5 py-0.5 rounded border border-white/[0.08] font-bold">
              {activeGroupSlug.toUpperCase()} STATUS
            </span>
            {user?.role === 'SUPER_ADMIN' && (
              <span className="font-mono text-xs bg-[#1e1530] text-[#c084fc] px-2.5 py-0.5 rounded border border-[#c084fc]/15 font-semibold">
                SUPER AUDIT ACTIVE
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1 flex items-center space-x-1">
            <span>{activeGroup ? activeGroup.projectName : 'Smart Project Dashboard'}</span>
          </h2>
          <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
            {activeGroup ? activeGroup.projectDesc : 'Penjabaran deskripsi project telemetri Sistem Komputer.'}
          </p>
        </div>

        {/* Group Selection Dropdown for Super admin to browse across 6+ groups */}
        <div className="flex items-center space-x-3">
          {user?.role === 'SUPER_ADMIN' ? (
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-slate-400">Pilih Kelompok:</span>
              <select
                value={activeGroupSlug}
                onChange={(e) => {
                  setActiveGroupSlug(e.target.value);
                  setIsEditMode(false);
                }}
                className="bg-white/[0.02]/80 border border-white/[0.08] text-sm font-semibold text-slate-200 rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-400 font-sans"
              >
                {groups.map(g => (
                  <option key={g.groupSlug} value={g.groupSlug}>
                    {g.groupSlug.toUpperCase()} — {g.groupName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            user ? (
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.01]/80 backdrop-blur py-1.5 px-3 flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 animate-ping opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="font-mono text-xs text-slate-300 font-semibold uppercase">
                  {user.groupSlug} — Dedicated Area Mode
                </span>
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.01]/80 backdrop-blur py-1.5 px-3 flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 animate-ping opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="font-mono text-xs text-amber-300 font-semibold uppercase">
                  PUBLIC READ-ONLY MODE
                </span>
              </div>
            )
          )}

          {/* Edit Dashboard config toggle and Add widgets triggers */}
          {user && (
            <button
              onClick={() => {
                if (isEditMode) {
                  handleSaveConfig();
                } else {
                  setIsEditMode(true);
                }
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isEditMode
                  ? 'bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/35 text-indigo-200'
                  : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.08] text-slate-200'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>{isEditMode ? 'Simpan Tata Letak' : 'Kustomisasi Widget'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid containing dynamic monitors */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Active telemetries visualizer grid spanning 3/4 columns */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Real-time Widget list rendering based on group's configs */}
          {activeGroup && activeGroup.widgets && activeGroup.widgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {activeGroup.widgets.map((widget, index) => {
                if (!isEditMode && widget.isHidden) return null;

                // Fetch the absolute newest sensor record
                const latestLog = activeLogs[activeLogs.length - 1];
                const sensorValue = latestLog ? latestLog.data[widget.sensorKey] : undefined;

                return (
                  <div
                    key={widget.id}
                    className={`rounded-xl border ${widget.isHidden ? 'border-amber-500/30' : 'border-white/[0.08]'} bg-white/[0.02]/80 backdrop-blur p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-indigo-500/15 transition-all duration-300 ${widget.isHidden ? 'opacity-60 grayscale' : ''}`}
                  >
                    {/* Floating Action buttons if editing layouts is active */}
                    {isEditMode && (
                      <div className="absolute top-3 right-3 flex items-center space-x-2 z-10 bg-[#0a0a0c]/80 backdrop-blur-md rounded-lg border border-white/[0.08] p-1.5 shadow-xl">
                        <button
                          onClick={() => handleMoveWidget(index, 'up')}
                          className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center h-10 w-10"
                          title="Prioritaskan (Geser Atas/Kiri)"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleMoveWidget(index, 'down')}
                          className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center h-10 w-10"
                          title="Turunkan (Geser Bawah/Kanan)"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleHideWidget(widget.id)}
                          className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center h-10 w-10"
                          title="Sembunyikan / Tampilkan Widget"
                        >
                          {widget.isHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleRemoveWidget(widget.id)}
                          className="text-red-400 hover:bg-red-950/60 hover:text-red-300 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center h-10 w-10"
                          title="Hapus widget permanen"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    {/* Sensor Header Title */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <div>
                        <span className="font-mono text-xs text-slate-400 uppercase tracking-widest font-bold">WIDGET INDIKATOR SENSOR</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-0.5">{widget.title}</h4>
                      </div>
                      <span className="font-mono text-xs text-indigo-300 px-2 py-0.5 rounded bg-[#0a0a0c] border border-white/[0.06]">
                        {widget.sensorKey}
                      </span>
                    </div>

                    {/* Content Rendering based on Widget Type */}
                    <div className="py-5 flex-1 min-h-[140px] flex items-center justify-center">
                      
                      {/* 1. Realtime Card simple look */}
                      {widget.type === 'realtime_card' && (
                        <div className="text-center">
                          <p className="text-4xl font-extrabold text-white font-mono tracking-tight drop-shadow-md">
                            {sensorValue !== undefined ? (typeof sensorValue === 'number' ? sensorValue.toLocaleString() : String(sensorValue)) : '—'}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-1 pr-1 font-semibold uppercase tracking-wider">
                            Satuan Data: {widget.unit || 'No Unit'}
                          </p>
                        </div>
                      )}

                      {/* 2. Status Indicator panel */}
                      {widget.type === 'status_indicator' && (
                        <div className="flex flex-col items-center">
                          <div className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all ${
                            sensorValue ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300 shadow-md' : 'bg-red-950/20 border-red-500/30 text-rose-400 shadow-md'
                          }`}>
                            <Activity className="h-5.5 w-5.5 animate-pulse" />
                          </div>
                          <p className="text-base font-bold text-slate-200 mt-2 font-mono uppercase tracking-wide">
                            {sensorValue ? 'ACTIVE / AMAN' : 'NON-AKTIF / ALERT'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">Value Raw: {sensorValue !== undefined ? String(sensorValue) : '0'}</p>
                        </div>
                      )}

                      {/* 3. Circular-like gauge gradient bars */}
                      {widget.type === 'gauge' && (
                        <div className="flex flex-col items-center w-full max-w-[200px]">
                          <div className="relative flex items-center justify-center h-28 w-28 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_100%)] rounded-full">
                            <span className="text-2xl font-extrabold text-white font-mono drop-shadow-lg">
                              {sensorValue !== undefined ? Number(sensorValue).toFixed(1) : '—'}
                            </span>
                            <span className="absolute bottom-2 text-xs font-mono text-indigo-300 bg-[#0a0a0c] border border-white/[0.08] rounded px-1.5 py-0.5 font-bold uppercase">
                              {widget.unit}
                            </span>
                            
                            {/* Visual glowing progress arc border mock */}
                            <div className="absolute inset-0 rounded-full border-4 border-white/[0.04]"></div>
                            {typeof sensorValue === 'number' && (
                              <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                                <circle
                                  cx="56"
                                  cy="56"
                                  r="50"
                                  fill="transparent"
                                  stroke={widget.color === '#10b981' ? '#6366f1' : (widget.color || '#6366f1')}
                                  strokeWidth="4"
                                  strokeDasharray="314"
                                  strokeDashoffset={314 - (314 * Math.min(100, Math.max(0, ((sensorValue - widget.min) / (widget.max - widget.min)) * 100))) / 100}
                                  className="transition-all duration-500"
                                ></circle>
                              </svg>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono w-full">
                            <span>Min: {widget.min}</span>
                            <span>Max: {widget.max}</span>
                          </div>
                        </div>
                      )}

                      {/* 4. Telemetry Historical Feed Log details */}
                      {widget.type === 'log_telemetry' && (
                        <div className="w-full text-left font-mono text-xs leading-relaxed max-h-[140px] overflow-y-auto bg-[#0a0a0c] p-3.5 rounded-lg border border-white/[0.06] text-slate-300">
                          {activeLogs.length > 0 ? (
                            activeLogs.slice(-4).reverse().map((lg) => (
                              <div key={lg.id} className="pb-1.5 border-b border-white/[0.04] last:border-0 last:pb-0 mb-1.5 last:mb-0">
                                <span className="text-slate-400">[{new Date(lg.timestamp).toLocaleTimeString()}]</span>
                                <span className="text-indigo-300 ml-1">DATA:</span>
                                <span className="text-white ml-1">{JSON.stringify(lg.data)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-slate-400 italic py-2">Belum ada paket log.</p>
                          )}
                        </div>
                      )}

                      {/* 5. Historical line chart in high fidelity Recharts */}
                      {widget.type === 'line_chart' && (
                        <div className="w-full h-full min-h-[140px] cursor-pointer">
                          {activeLogs.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={activeLogs.slice(-12)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis
                                  dataKey="timestamp"
                                  tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  stroke="#334155"
                                  fontSize={10}
                                  fontFamily="monospace"
                                />
                                <YAxis stroke="#334155" fontSize={10} fontFamily="monospace" domain={['auto', 'auto']} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0a0a0d', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                                  labelStyle={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}
                                  itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                                  labelFormatter={(t) => new Date(t).toLocaleString()}
                                />
                                <Line
                                  type="monotone"
                                  dataKey={`data.${widget.sensorKey}`}
                                  stroke={widget.color === '#10b981' ? '#6366f1' : (widget.color || '#6366f1')}
                                  strokeWidth={2}
                                  dot={{ r: 2 }}
                                  activeDot={{ r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="w-full h-full flex flex-col justify-end space-y-2 p-4 animate-pulse">
                              <div className="w-full h-4/6 bg-white/[0.03] rounded-t border border-white/[0.05]"></div>
                              <div className="w-full h-1/6 bg-white/[0.03] rounded-t border border-white/[0.05]"></div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 6. Historical bar charts */}
                      {widget.type === 'bar_chart' && (
                        <div className="w-full h-full min-h-[140px] cursor-pointer">
                          {activeLogs.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={activeLogs.slice(-8)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis
                                  dataKey="timestamp"
                                  tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  stroke="#334155"
                                  fontSize={10}
                                  fontFamily="monospace"
                                />
                                <YAxis stroke="#334155" fontSize={10} fontFamily="monospace" />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0a0a0d', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                                  labelStyle={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}
                                  itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                                />
                                <Bar dataKey={`data.${widget.sensorKey}`} fill={widget.color === '#10b981' ? '#6366f1' : (widget.color || '#6366f1')} radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="w-full h-full flex items-end space-x-2 p-4 animate-pulse">
                              <div className="w-1/4 h-2/6 bg-white/[0.03] rounded-t border border-white/[0.05]"></div>
                              <div className="w-1/4 h-4/6 bg-white/[0.03] rounded-t border border-white/[0.05]"></div>
                              <div className="w-1/4 h-3/6 bg-white/[0.03] rounded-t border border-white/[0.05]"></div>
                              <div className="w-1/4 h-5/6 bg-white/[0.03] rounded-t border border-white/[0.05]"></div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Sensor Scale Footnotes */}
                    <div className="border-t border-white/[0.04] pt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Kalibrasi hardware: OK</span>
                      <span>Ambang: {widget.min} ~ {widget.max} {widget.unit}</span>
                    </div>

                  </div>
                );
              })}

              {/* Add New Widget trigger Button card */}
              {isEditMode && (
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] hover:border-indigo-500/40 hover:bg-white/[0.02] p-5 sm:p-8 flex flex-col items-center justify-center text-slate-300 hover:text-indigo-200 transition-all cursor-pointer min-h-[220px]"
                >
                  <Plus className="h-8 w-8 animate-pulse mb-3" />
                  <span className="text-sm font-bold font-sans">Tambah Widget Sensor Baru</span>
                  <p className="text-slate-400 text-xs mt-1 max-w-xs text-center leading-relaxed">
                    Kustomisasi widget monitoring untuk parameter pembacaan ESP-IDF / Arduino kelompok Anda.
                  </p>
                </button>
              )}

            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.01]/30 p-5 sm:p-8 lg:p-12 text-center text-slate-400 backdrop-blur-sm">
              <Cpu className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm">Belum ada sensor yang dikonfigurasikan pada dasbor kelompok ini.</p>
              {isEditMode && (
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="mt-4 px-4 py-2 bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 rounded-lg text-indigo-300 font-bold font-sans transition-all text-xs cursor-pointer"
                >
                  Tambahkan Widget Utama Pertama
                </button>
              )}
            </div>
          )}

          {/* Inline Edit form to customize project metadata names */}
          {isEditMode && (
            <div className="rounded-xl border border-white/[0.08] bg-[#07070a]/90 backdrop-blur-md p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-extrabold font-mono text-indigo-300 uppercase tracking-widest flex items-center space-x-1.5">
                <Settings className="h-4 w-4" />
                <span>Ubah Informasi Utama Riset & Kelompok</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-1.5">Nama Judul Projek Inovasi:</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/80"
                    placeholder="Contoh: Otomasi Greenhouse"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-1.5">Deskripsi Ringkas Projek:</label>
                  <textarea
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/80"
                    placeholder="Contoh: Sistem monitoring nirkabel sensor klorofil..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/[0.06]">
                <button
                  onClick={handleSaveConfig}
                  className="px-5 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/35 hover:bg-indigo-500/25 text-indigo-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Simpan Perubahan Projek
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Information, API management and Gemini AI Intelligence widgets (1/4 column) */}
        <div className="space-y-6">
          
          {/* Active device status summary monitoring */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]/80 backdrop-blur p-5 shadow-lg">
            <h3 className="text-xs font-extrabold font-mono text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 mb-4">
              🛡️ DEVICE CONFIG STATUS
            </h3>

            {activeDevice ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Nama Gateway:</span>
                  <span className="font-mono text-xs text-indigo-300 bg-[#0a0a0c] px-2 py-0.5 rounded border border-white/[0.06]">
                    {activeDevice.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Kesehatan Sinyal:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 animate-ping opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                    <span className="text-xs font-bold text-indigo-300 font-mono">ONLINE ({status})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Ping Gateway:</span>
                  <span className="font-mono text-xs text-white font-bold">{activeDevice.ping} ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Data Feed Terkirim:</span>
                  <span className="font-mono text-xs text-indigo-300 font-bold">{activeDevice.telemetryCount} packets</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-xs text-slate-400">API Endpoint Device:</span>
                </div>
                <div className="bg-[#0a0a0c] border border-white/[0.06] p-2.5 rounded font-mono text-xs select-all cursor-copy break-all text-indigo-300">
                  POST /api/telemetry/device/{activeGroupSlug}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center">Gateway offline atau tidak tersinkronisasi.</p>
            )}
          </div>

          {/* API Credentials & Secret Tokens (ONLY visible when looking at own group or SUPER ADMIN is viewing) */}
          {user && (user.role === 'SUPER_ADMIN' || user.groupSlug === activeGroupSlug) && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]/80 backdrop-blur p-5 shadow-lg">
              <h3 className="text-xs font-extrabold font-mono text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 mb-4">
                🔑 PRIVATE API CREDENTIALS
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>X-API-Key:</span>
                    <button
                      onClick={() => copyCreds(activeDevice?.apiKey || '', 'key')}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedText['key'] ? <Check className="h-3.5 w-3.5 text-indigo-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="bg-[#0a0a0c] p-2 border border-white/[0.06] rounded font-mono text-xs select-all text-slate-300 truncate">
                    {activeDevice?.apiKey || 'SK-KEY-STALE-882'}
                  </p>
                  <span className="text-xs text-slate-400 leading-none block mt-1">Gunakan header "X-API-Key" dalam REST request mikrokontroler.</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Device Token:</span>
                    <button
                      onClick={() => copyCreds(user?.deviceToken || '', 'token')}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedText['token'] ? <Check className="h-3.5 w-3.5 text-indigo-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="bg-[#0a0a0c] p-2 border border-white/[0.06] rounded font-mono text-xs select-all text-slate-300 truncate">
                    {user?.deviceToken || 'TOKEN-NOT-GENERATED'}
                  </p>
                  <span className="text-xs text-slate-400 leading-none block mt-1">Kunci verifikasi enkripsi MQTT / Socket.io</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Insights & Diagnostics built on Gemini 3.5 Flash */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]/85 backdrop-blur p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 h-28 w-28 bg-indigo-500/5 rounded-full filter blur-2xl"></div>
            
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3 mb-4 relative z-10">
              <Brain className="h-5 w-5 text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-xs text-white tracking-wider uppercase font-mono">
                Gemini Telemetry AI Analyzer
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10">
              Gunakan kecerdasan buatan Gemini untuk mengaudit data sensor real-time {activeGroupSlug.toUpperCase()}, memindai anomali drift, korelasi, dan meng-generate kode implementasi ESP32 otomatis.
            </p>

            <button
              onClick={handleAiAnalysis}
              disabled={isAiLoading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 text-indigo-200 text-xs font-bold font-sans transition-all disabled:opacity-40 cursor-pointer text-center"
            >
              <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: isAiLoading ? '3s' : '0s' }} />
              <span>{isAiLoading ? 'Menyusun Analisis...' : 'Mulai Analisis Telemetri'}</span>
            </button>

            {/* Display AI Results */}
            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-[#0a0a0c] border border-white/[0.06] max-[300px] overflow-y-auto text-left"
              >
                {renderMarkdown(aiAnalysis)}
              </motion.div>
            )}
          </div>

        </div>

      </div>

      {/* ----------------- MODAL WIDGET BUILDER FORM ----------------- */}
      <AnimatePresence>
        {showAddWidget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md h-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07070a]/95 p-6 shadow-2xl relative backdrop-blur-md"
            >
              <div className="border-b border-white/[0.06] pb-4 mb-4">
                <h4 className="text-base font-bold text-white font-sans">Buat Widget Telemetri Baru</h4>
                <p className="text-slate-400 text-xs mt-1 font-sans">Isi formulir parameter sensor yang ingin dion-boardkan ke monitor.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Judul Indikator / Label:</label>
                  <input
                    type="text"
                    value={newWidget.title}
                    onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/80"
                    placeholder="Contoh: Sensor pH Air Kolam"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Tipe visual Widget:</label>
                    <select
                      value={newWidget.type}
                      onChange={(e) => setNewWidget({ ...newWidget, type: e.target.value as any })}
                      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/80"
                    >
                      <option value="realtime_card">Real-time Card</option>
                      <option value="line_chart">Line Chart (Historic)</option>
                      <option value="bar_chart">Bar Chart</option>
                      <option value="gauge">Circular Gauge Arc</option>
                      <option value="status_indicator">Status Indicator</option>
                      <option value="log_telemetry font-mono font-bold">Log Telemetry Raw Feed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Sensor Key (JSON path):</label>
                    <input
                      type="text"
                      value={newWidget.sensorKey}
                      onChange={(e) => setNewWidget({ ...newWidget, sensorKey: e.target.value })}
                      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/80 font-mono"
                      placeholder="Contoh: temperature, ph_level"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Satuan unit:</label>
                    <input
                      type="text"
                      value={newWidget.unit}
                      onChange={(e) => setNewWidget({ ...newWidget, unit: e.target.value })}
                      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/80"
                      placeholder="°C, %"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Skala Min:</label>
                    <input
                      type="number"
                      value={newWidget.min}
                      onChange={(e) => setNewWidget({ ...newWidget, min: Number(e.target.value) })}
                      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/80 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Skala Max:</label>
                    <input
                      type="number"
                      value={newWidget.max}
                      onChange={(e) => setNewWidget({ ...newWidget, max: Number(e.target.value) })}
                      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/80 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Aesthetic theme color:</label>
                  <select
                    value={newWidget.color}
                    onChange={(e) => setNewWidget({ ...newWidget, color: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg py-2 px-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/80"
                  >
                    <option value="#6366f1">Luminous Violet-Blue</option>
                    <option value="#3b82f6">Electric Ocean Blue</option>
                    <option value="#f43f5e">Crimson Accent</option>
                    <option value="#f59e0b">Warm Golden Amber</option>
                    <option value="#ec4899">Saturated Deep Pink</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-white/[0.06] mt-6">
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="px-4 py-2 border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] rounded-lg text-xs font-semibold text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWidget}
                  className="px-5 py-2 bg-indigo-500/15 border border-indigo-500/35 hover:bg-indigo-500/25 text-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Tambahkan Widget
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
