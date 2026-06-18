import { create } from 'zustand';
import { User, Project, Device, TelemetryLog, GroupConfig } from './types';

interface AppState {
  user: User | null;
  groups: GroupConfig[];
  devices: Device[];
  projects: Project[];
  usersList: any[];
  logs: TelemetryLog[];
  isRealtimeConnected: boolean;
  eventSourceRef: EventSource | null;

  setUser: (user: User | null) => void;
  setGroups: (groups: GroupConfig[]) => void;
  setDevices: (devices: Device[]) => void;
  setProjects: (projects: Project[]) => void;
  setUsersList: (users: any[]) => void;
  setLogs: (logs: TelemetryLog[]) => void;
  addLog: (log: TelemetryLog) => void;
  updateDevice: (groupSlug: string, device: Device) => void;
  updateGroupConfig: (groupSlug: string, config: GroupConfig) => void;
  setIsRealtimeConnected: (connected: boolean) => void;
  setEventSourceRef: (ref: EventSource | null) => void;
  connectSSE: () => void;
  fetchInitialData: () => Promise<void>;
  updateGroupConfigApi: (groupSlug: string, updates: Partial<GroupConfig>, token: string) => Promise<boolean>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  groups: [],
  devices: [],
  projects: [],
  usersList: [],
  logs: [],
  isRealtimeConnected: false,
  eventSourceRef: null,

  setUser: (user) => set({ user }),
  setGroups: (groups) => set({ groups }),
  setDevices: (devices) => set({ devices }),
  setProjects: (projects) => set({ projects }),
  setUsersList: (usersList) => set({ usersList }),
  setLogs: (logs) => set({ logs }),
  
  addLog: (log) => set((state) => {
    // Limit cache length for performance
    const updated = [...state.logs, log].slice(-350);
    return { logs: updated };
  }),
  
  updateDevice: (groupSlug, device) => set((state) => ({
    devices: state.devices.map(d => d.groupSlug === groupSlug ? device : d)
  })),

  updateGroupConfig: (groupSlug, config) => set((state) => ({
    groups: state.groups.map(g => g.groupSlug === groupSlug ? config : g),
    projects: state.projects.map(p => p.groupSlug === groupSlug ? {
      ...p,
      name: config.projectName,
      description: config.projectDesc,
      lastUpdated: new Date().toISOString()
    } : p)
  })),

  setIsRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
  setEventSourceRef: (ref) => set({ eventSourceRef: ref }),

  connectSSE: () => {
    const { eventSourceRef, setIsRealtimeConnected, addLog, updateDevice, updateGroupConfig } = get();
    
    if (eventSourceRef) {
      eventSourceRef.close();
    }

    const sse = new EventSource('/api/telemetry/stream');
    get().setEventSourceRef(sse);

    sse.onopen = () => {
      setIsRealtimeConnected(true);
    };

    sse.onerror = () => {
      setIsRealtimeConnected(false);
      sse.close();
      get().setEventSourceRef(null);
      // Attempt reconnection
      setTimeout(() => get().connectSSE(), 4000);
    };

    sse.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'TELEMETRY_UPDATE') {
          addLog(msg.log);
          if (msg.device) {
            updateDevice(msg.groupSlug, msg.device);
          }
        } else if (msg.type === 'CONFIG_UPDATE') {
          if (msg.config) {
            updateGroupConfig(msg.groupSlug, msg.config);
          }
        }
      } catch (e) {
        // parsing issues
      }
    };
  },

  fetchInitialData: async () => {
    try {
      const response = await fetch('/api/dashboard/summary');
      const data = await response.json();

      set((state) => {
        const isFirstLoad = state.logs.length === 0 && state.devices.length === 0;

        if (isFirstLoad) {
          // First load: set everything fresh, no flicker risk
          return {
            groups: data.groups || [],
            devices: data.devices || [],
            projects: data.projects || [],
            usersList: data.users || [],
            logs: (data.logs || []).slice(-350),
          };
        }

        // Subsequent polls: merge ONLY what's new so React doesn't re-render everything

        // 1. Merge logs: only add logs with IDs that don't already exist in state
        const existingLogIds = new Set(state.logs.map((l: any) => l.id));
        const newLogs = (data.logs || []).filter((l: any) => !existingLogIds.has(l.id));
        const mergedLogs = newLogs.length > 0
          ? [...state.logs, ...newLogs].slice(-350)
          : state.logs; // No change = no re-render for logs

        // 2. Merge devices: update only fields that changed (prevents unnecessary re-renders)
        const mergedDevices = state.devices.map((existing: any) => {
          const updated = (data.devices || []).find((d: any) => d.groupSlug === existing.groupSlug);
          if (!updated) return existing;
          // Only return new object if something actually changed
          if (
            updated.telemetryCount !== existing.telemetryCount ||
            updated.ping !== existing.ping ||
            updated.lastSeen !== existing.lastSeen ||
            updated.status !== existing.status
          ) {
            return { ...existing, ...updated };
          }
          return existing;
        });

        // 3. Keep groups, projects, users as-is unless this is first load
        // (they rarely change during normal use and re-setting them causes flicker)
        return {
          logs: mergedLogs,
          devices: mergedDevices,
          // Only update groups/projects/users if they are empty (safety net)
          groups: state.groups.length > 0 ? state.groups : (data.groups || []),
          projects: state.projects.length > 0 ? state.projects : (data.projects || []),
          usersList: state.usersList.length > 0 ? state.usersList : (data.users || []),
        };
      });
    } catch (e) {
      console.error("Gagal sinkronisasi data awal", e);
    }
  },

  updateGroupConfigApi: async (groupSlug, updates, token) => {
    try {
      const response = await fetch(`/api/groups/${groupSlug}/widgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        set((state) => {
          const newGroups = state.groups.map(g => g.groupSlug === groupSlug ? { ...g, ...updates } : g);
          return { groups: newGroups };
        });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}));
