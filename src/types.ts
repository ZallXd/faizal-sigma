export type UserRole = 'SUPER_ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  groupSlug: string;
  groupName: string;
  apiKey: string;
  deviceToken: string;
  createdAt: string;
}

export interface Project {
  id: string;
  groupSlug: string;
  groupName: string;
  name: string;
  description: string;
  category: 'IoT' | 'Embedded' | 'AI' | 'Networking' | 'Automation';
  status: 'online' | 'offline';
  lastUpdated: string;
  tags: string[];
}

export interface Device {
  id: string;
  name: string;
  groupSlug: string;
  status: 'online' | 'offline';
  ping: number;
  lastSeen: string;
  apiKey: string;
  telemetryCount: number;
}

export interface TelemetryLog {
  id: string;
  groupSlug: string;
  timestamp: string;
  data: Record<string, number | string | boolean>;
}

export interface WidgetConfig {
  id: string;
  type: 'line_chart' | 'bar_chart' | 'gauge' | 'realtime_card' | 'status_indicator' | 'log_telemetry';
  title: string;
  sensorKey: string; // key of value inside telemetry.data, e.g. "temperature"
  unit: string; // unit labels, e.g. "°C", "%", "ppm", "Volt"
  min: number;
  max: number;
  color?: string; // color code for custom aesthetic
  isHidden?: boolean; // visibility toggle
}

export interface GroupConfig {
  groupSlug: string;
  groupName: string;
  projectName: string;
  projectDesc: string;
  widgets: WidgetConfig[];
}

export interface DashboardData {
  groups: GroupConfig[];
  devices: Device[];
  projects: Project[];
  users: Omit<User, 'passwordHash'>[];
  logs: TelemetryLog[];
}
