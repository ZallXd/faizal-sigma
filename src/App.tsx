import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import ShowcaseView from './components/ShowcaseView';
import PublicDashboardView from './components/PublicDashboardView';
import { useAppStore } from './store';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // ONLY subscribe to minimal state here — logs/groups/devices are consumed
  // directly inside their respective child components to avoid App re-rendering
  // on every telemetry update (which causes scroll-to-top reset).
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const isRealtimeConnected = useAppStore((s) => s.isRealtimeConnected);
  const connectSSE = useAppStore((s) => s.connectSSE);
  const fetchInitialData = useAppStore((s) => s.fetchInitialData);
  const updateGroupConfigApi = useAppStore((s) => s.updateGroupConfigApi);

  // Sync session on mount
  useEffect(() => {
    const cached = localStorage.getItem('siskom_session');
    if (cached) {
      try {
        const u = JSON.parse(cached);
        setUser(u);
      } catch (e) {
        localStorage.removeItem('siskom_session');
      }
    }
    fetchInitialData();
  }, [setUser, fetchInitialData]);

  // Set up and connect Server-Sent Events for real-time live push updates
  useEffect(() => {
    connectSSE();
  }, [connectSSE]);

  // Backup polling when SSE is not active (no scroll-reset since App won't re-render on logs change)
  useEffect(() => {
    let intervalId: any;
    if (!isRealtimeConnected) {
      intervalId = setInterval(() => {
        fetchInitialData();
      }, 10000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRealtimeConnected, fetchInitialData]);

  // Login handler
  const handleLogin = async (username: string, pass: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('siskom_session', JSON.stringify(data.user));
        navigate('/dashboard');
        fetchInitialData();
        return null;
      } else {
        return data.error || 'Autentikasi gagal.';
      }
    } catch (e) {
      return 'Koneksi ke server tertutup.';
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('siskom_session');
    setUser(null);
    navigate('/');
  };

  // Update layout customization options (API calls)
  const handleUpdateGroupConfig = async (groupSlug: string, updates: any): Promise<boolean> => {
    if (!user) return false;
    return await updateGroupConfigApi(groupSlug, updates, user.apiKey);
  };

  // Create new user account under admin authorization
  const handleAddUser = async (userForm: any): Promise<boolean> => {
    if (!user || user.role !== 'SUPER_ADMIN') return false;
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.apiKey}`
        },
        body: JSON.stringify(userForm)
      });
      if (response.ok) {
        fetchInitialData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Deactivate account under admin authorization
  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    if (!user || user.role !== 'SUPER_ADMIN') return false;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.apiKey}` }
      });
      if (response.ok) {
        fetchInitialData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-100">

      <Navbar
        currentPath={location.pathname}
        onNavigate={navigate}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        isRealtimeConnected={isRealtimeConnected}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage onOpenLogin={() => setIsLoginOpen(true)} />} />
          {/* ShowcaseView & Dashboard now read groups/devices/logs directly from the store */}
          <Route path="/showcase" element={<ShowcaseView />} />
          <Route path="/showcase/:groupSlug" element={<PublicDashboardView />} />

          <Route path="/dashboard" element={
            user ? (
              <Dashboard
                user={user}
                onUpdateGroupConfig={handleUpdateGroupConfig}
                isRealtimeConnected={isRealtimeConnected}
              />
            ) : <Navigate to="/" />
          } />

          <Route path="/admin" element={
            user && user.role === 'SUPER_ADMIN' ? (
              <AdminPanel
                currentUser={user}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
              />
            ) : <Navigate to="/" />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

    </div>
  );
}
