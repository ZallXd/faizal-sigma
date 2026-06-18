import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  UserPlus,
  Key,
  Smartphone,
  Cpu,
  RefreshCw,
  Search,
  Users,
  Activity,
  LogOut,
  AlertOctagon,
  Award
} from 'lucide-react';
import { User } from '../types';
import { useAppStore } from '../store';

interface AdminPanelProps {
  currentUser: User;
  onAddUser: (userForm: any) => Promise<boolean>;
  onDeleteUser: (userId: string) => Promise<boolean>;
}

export default function AdminPanel({
  currentUser,
  onAddUser,
  onDeleteUser
}: AdminPanelProps) {
  // Read heavy data directly from store
  const usersList = useAppStore((s) => s.usersList);
  const logsCount = useAppStore((s) => s.logs.length);
  const devicesCount = useAppStore((s) => s.devices.length);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add User state
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'USER',
    groupSlug: '',
    groupName: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.groupSlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.username || !form.password || !form.groupSlug || !form.groupName) {
      setErrorMsg('Semua kolom wajib diisi lengkap.');
      return;
    }

    setIsLoading(true);
    const success = await onAddUser(form);
    setIsLoading(false);

    if (success) {
      setShowAddModal(false);
      setForm({
        username: '',
        password: '',
        role: 'USER',
        groupSlug: '',
        groupName: ''
      });
    } else {
      setErrorMsg('Gagal menambahkan pengguna baru. Username mungkin sudah terdaftar.');
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (username === 'admin' || username === 'ahmad.faizal4307@smk.belajar.id') {
      alert('Akun administrator master tidak dapat dihapus.');
      return;
    }
    if (confirm(`Hapus akun kelompok/user "${username}" secara permanen? Seluruh konfigurasi dasbor dan device akan dinotaktifkan.`)) {
      await onDeleteUser(userId);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] p-4 sm:p-6 lg:p-8 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-400">
      
      {/* Sub header */}
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6 mb-8">
        <div>
          <span className="font-mono text-[9px] bg-purple-950 text-purple-400 px-2.5 py-0.5 rounded border border-purple-800/30 font-semibold uppercase tracking-wider">
            Control Tower Admin
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1 flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-purple-400" />
            <span>Sistem Kontrol Multi-Kelompok & Akun Mahasiswa</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Hak istimewa Super Admin: Menambah kelompok riset baru, mengalokasi API keys serta mengontrol otentikasi device jarak jauh.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg shadow-purple-900/20"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Tambah Kelompok Baru</span>
        </button>
      </div>

      {/* Admin stats dashboard banner */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.01]/80 backdrop-blur p-5 flex items-center space-x-4">
          <div className="h-10 w-10 rounded-lg bg-[#1e1530] border border-[#c084fc]/15 text-[#c084fc] flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Total Akun Terdaftar</span>
            <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">{usersList.length} Accounts</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.01]/80 backdrop-blur p-5 flex items-center space-x-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Nodes Terpasang</span>
            <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">{devicesCount} Gateway Devices</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.01]/80 backdrop-blur p-5 flex items-center space-x-4">
          <div className="h-10 w-10 rounded-lg bg-sky-950/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Historis Telemetri</span>
            <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">{logsCount} Stream Logs Saved</span>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="mx-auto max-w-7xl bg-[#0a0a0c] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.06] bg-[#07070a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-200">Database Akun Program Studi</h3>
            <p className="text-slate-500 text-xs mt-0.5">Ditemukan {filteredUsers.length} pengguna terdaftar di server.</p>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030303] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-400/80"
              placeholder="Cari Kelompok atau Username..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4">Nama Kelompok & Project</th>
                <th className="py-3 px-4">Username Portal</th>
                <th className="py-3 px-4">Ovens Role</th>
                <th className="py-3 px-4">X-API-Key</th>
                <th className="py-3 px-4">Device Token</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/20 transition-all font-medium">
                  
                  {/* Team details */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{u.groupName}</div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                      <span>SLUG: {u.groupSlug}</span>
                    </div>
                  </td>
                  
                  {/* Account detail */}
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {u.username}
                  </td>
                  
                  {/* Role */}
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      u.role === 'SUPER_ADMIN' 
                        ? 'bg-purple-950/50 border border-purple-800/30 text-purple-400 font-bold' 
                        : 'bg-slate-950 border border-slate-800 text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* API Key */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1 max-w-[120px]">
                      <Key className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="font-mono text-[10.5px] text-slate-400 truncate">{u.apiKey}</span>
                    </div>
                  </td>

                  {/* Token */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1 max-w-[125px]">
                      <Smartphone className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="font-mono text-[10.5px] text-slate-400 truncate">{u.deviceToken}</span>
                    </div>
                  </td>

                  {/* Action delete */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={u.username === 'admin' || u.username === 'ahmad.faizal4307@smk.belajar.id'}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-900 disabled:opacity-30 cursor-pointer"
                      title="Hapus Akun Pengguna"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- ADD USER MODAL FORM -------------------- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3.5 mb-4">
                <UserPlus className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Tambah Akun Kelompok / Inovator Baru</h3>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-lg bg-red-950/50 border border-red-500/30 text-rose-400 text-xs font-medium flex items-center space-x-2">
                  <AlertOctagon className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Username Portal (Login):</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="kelompok8, asistenlab..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Password Baru:</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="pass123..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Hak Akses Role:</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="USER">USER / KELOMPOK</option>
                      <option value="SUPER_ADMIN">SUPER ADMIN (Dosen)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Nama Kelompok (Group Name):</label>
                  <input
                    type="text"
                    value={form.groupName}
                    onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                    placeholder="Contoh: Kelompok 8 - Autopilot Boat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold uppercase mb-1">Slug Kelompok (Identifier):</label>
                  <input
                    type="text"
                    value={form.groupSlug}
                    onChange={(e) => setForm({ ...form, groupSlug: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 text-xs focus:outline-none font-mono"
                    placeholder="Contoh: group-8"
                  />
                  <span className="text-[9.5px] text-slate-500 leading-none mt-1.5 block">Hanya huruf kecil, angka, dan strip (e.g. group-8).</span>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Menambahkan Akun...' : 'Konfirmasi Registrasi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
