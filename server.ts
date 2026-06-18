import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed database file from packaged database if it does not exist
if (!fs.existsSync(DATA_FILE)) {
  const seedPaths = [
    path.join(process.cwd(), 'data', 'db.json'),
    path.join(__dirname, '..', 'data', 'db.json'),
    path.join(__dirname, 'data', 'db.json')
  ];
  for (const sPath of seedPaths) {
    if (fs.existsSync(sPath)) {
      try {
        fs.copyFileSync(sPath, DATA_FILE);
        console.log(`Seeded database from ${sPath} to ${DATA_FILE}`);
        break;
      } catch (err) {
        console.error(`Failed to copy seed file from ${sPath}`, err);
      }
    }
  }
}

// In-Memory Database Structure
let db: {
  users: any[];
  projects: any[];
  devices: any[];
  telemetryLogs: any[];
  groupConfigs: any[];
} = {
  users: [],
  projects: [],
  devices: [],
  telemetryLogs: [],
  groupConfigs: []
};

// Help helper to hash passwords simply
function getHash(password: string) {
  // Safe simple client/server checksum hashing for isolated environment
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'HASH_' + Math.abs(hash).toString(16);
}

// Init database with realistic starting values for over 6 groups
function initDB() {
  const initialUsers = [
    {
      id: "u-admin",
      username: "admin",
      passwordHash: getHash("admin123"),
      role: "SUPER_ADMIN",
      groupSlug: "all",
      groupName: "Super Administrator",
      apiKey: "SK-KEY-ADMIN-SUPER-99",
      deviceToken: "TOKEN-ADMIN-00",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-ahmad",
      username: "ahmad.faizal4307@smk.belajar.id",
      passwordHash: getHash("admin123"),
      role: "SUPER_ADMIN",
      groupSlug: "all",
      groupName: "Ketua Jurusan Sistem Komputer",
      apiKey: "SK-KEY-AHMAD-SUPER-88",
      deviceToken: "TOKEN-AHMAD-01",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-g1",
      username: "kelompok1",
      passwordHash: getHash("pass123"),
      role: "USER",
      groupSlug: "group-1",
      groupName: "Kelompok 1",
      apiKey: "SK-KEY-G1-9874",
      deviceToken: "TOKEN-G1-IOT-AGRI",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-g2",
      username: "kelompok2",
      passwordHash: getHash("pass123"),
      role: "USER",
      groupSlug: "group-2",
      groupName: "Kelompok 2",
      apiKey: "SK-KEY-G2-1143",
      deviceToken: "TOKEN-G2-IOT-GAS",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-g3",
      username: "kelompok3",
      passwordHash: getHash("pass123"),
      role: "USER",
      groupSlug: "group-3",
      groupName: "Kelompok 3",
      apiKey: "SK-KEY-G3-5521",
      deviceToken: "TOKEN-G3-EMBED-ROBOT",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-g4",
      username: "kelompok4",
      passwordHash: getHash("pass123"),
      role: "USER",
      groupSlug: "group-4",
      groupName: "Kelompok 4",
      apiKey: "SK-KEY-G4-3669",
      deviceToken: "TOKEN-G4-POWER-GRID",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-g5",
      username: "kelompok5",
      passwordHash: getHash("pass123"),
      role: "USER",
      groupSlug: "group-5",
      groupName: "Kelompok 5",
      apiKey: "SK-KEY-G5-2248",
      deviceToken: "TOKEN-G5-AQUAPONICS",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-g6",
      username: "kelompok6",
      passwordHash: getHash("pass123"),
      role: "USER",
      groupSlug: "group-6",
      groupName: "Kelompok 6",
      apiKey: "SK-KEY-G6-8104",
      deviceToken: "TOKEN-G6-DRONE-SPEC",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-g7",
      username: "kelompok7",
      passwordHash: getHash("pass123"),
      role: "USER",
      groupSlug: "group-7",
      groupName: "Kelompok 7",
      apiKey: "SK-KEY-G7-7740",
      deviceToken: "TOKEN-G7-TRAFFIC-CITY",
      createdAt: new Date().toISOString()
    }
  ];

  const initialGroupConfigs = [
    {
      groupSlug: "group-1",
      groupName: "Kelompok 1",
      projectName: "Smart Agriculture & Soil Telemetry",
      projectDesc: "Sistem otomasi nutrisi dan pemantauan kelembapan tanah greenhouse jarak jauh berpresisi tinggi berbasis ESP32.",
      widgets: [
        { id: "g1-w1", type: "line_chart", title: "Kelembaban Tanah", sensorKey: "soil_moisture", unit: "%", min: 0, max: 100, color: "#10b981" },
        { id: "g1-w2", type: "gauge", title: "Suhu Indoor", sensorKey: "temperature", unit: "°C", min: 10, max: 50, color: "#ef4444" },
        { id: "g1-w3", type: "realtime_card", title: "Kelembaban Udara", sensorKey: "air_humidity", unit: "%", min: 0, max: 100, color: "#3b82f6" },
        { id: "g1-w4", type: "gauge", title: "Suhu Tanah", sensorKey: "soil_temperature", unit: "°C", min: 10, max: 50, color: "#f59e0b" },
        { id: "g1-w5", type: "realtime_card", title: "Sensor Hujan", sensorKey: "rain_sensor", unit: "raw", min: 0, max: 4095, color: "#8b5cf6" },
        { id: "g1-w6", type: "log_telemetry", title: "Telemetry Feed Logs", sensorKey: "*", unit: "", min: 0, max: 0 }
      ]
    },
    {
      groupSlug: "group-2",
      groupName: "Kelompok 2",
      projectName: "AI-Powered Gas Leakage & Air Quality System",
      projectDesc: "Pusat monitoring polusi gas berbahaya (Methane, CO2) dengan klasifikasi anomali AI terintegrasi di laboratorium.",
      widgets: [
        { id: "g2-w1", type: "line_chart", title: "Kadar Gas CO2", sensorKey: "co2", unit: "ppm", min: 300, max: 2000, color: "#f59e0b" },
        { id: "g2-w2", type: "gauge", title: "Kadar Gas Metana", sensorKey: "methane", unit: "ppm", min: 0, max: 1000, color: "#eab308" },
        { id: "g2-w3", type: "status_indicator", title: "Status Alarm Bahaya", sensorKey: "gas_leak", unit: "safe_warning", min: 0, max: 1, color: "#ef4444" },
        { id: "g2-w4", type: "log_telemetry", title: "Gas Logs", sensorKey: "*", unit: "", min: 0, max: 0 }
      ]
    },
    {
      groupSlug: "group-3",
      groupName: "Kelompok 3",
      projectName: "Autonomous Embedded Robotic Arm",
      projectDesc: "Robotic arm 4-Axis berbasis servo presisi tinggi dengan control telemetry penyeimbang motor.",
      widgets: [
        { id: "g3-w1", type: "bar_chart", title: "Sudut Servo Motor", sensorKey: "servo_angle", unit: "deg", min: 0, max: 180, color: "#ec4899" },
        { id: "g3-w2", type: "realtime_card", title: "Arus Motor Listrik", sensorKey: "servo_current", unit: "mA", min: 0, max: 1000, color: "#22c55e" },
        { id: "g3-w3", type: "status_indicator", title: "State Automation Calibrator", sensorKey: "calibration_state", unit: "status", min: 0, max: 3, color: "#6366f1" },
        { id: "g3-w4", type: "log_telemetry", title: "Robot System Signals", sensorKey: "*", unit: "", min: 0, max: 0 }
      ]
    },
    {
      groupSlug: "group-4",
      groupName: "Kelompok 4",
      projectName: "Smart Electrical Grid Monitor",
      projectDesc: "Smart grid telemetry system yang memonitor konsumsi energi gedung, daya, tegangan, dan faktor daya waktu nyata.",
      widgets: [
        { id: "g4-w1", type: "line_chart", title: "Volatilitas Tegangan Line", sensorKey: "line_voltage", unit: "Volt", min: 190, max: 250, color: "#f59e0b" },
        { id: "g4-w2", type: "line_chart", title: "Daya Konsumsi Watts", sensorKey: "power_load", unit: "Watt", min: 0, max: 3500, color: "#ef4444" },
        { id: "g4-w3", type: "realtime_card", title: "Arus Beban", sensorKey: "current_load", unit: "Ampere", min: 0, max: 15, color: "#3b82f6" },
        { id: "g4-w4", type: "gauge", title: "Grid Power Factor", sensorKey: "power_factor", unit: "pf", min: 0, max: 1, color: "#8b5cf6" }
      ]
    },
    {
      groupSlug: "group-5",
      groupName: "Kelompok 5",
      projectName: "Aquaponics IoT Smart Controller",
      projectDesc: "Sistem kendali pH air kolam, pemberi pakan otomatis, dan sirkulasi air cerdas terintegrasi sensor turbidity.",
      widgets: [
        { id: "g5-w1", type: "gauge", title: "Tingkat Keasaman pH", sensorKey: "water_ph", unit: "pH", min: 0, max: 14, color: "#06b6d4" },
        { id: "g5-w2", type: "line_chart", title: "Suhu Air Kolam", sensorKey: "water_temp", unit: "°C", min: 15, max: 40, color: "#3b82f6" },
        { id: "g5-w3", type: "status_indicator", title: "Status Pakan Otomatis", sensorKey: "feeder_triggered", unit: "triggered", min: 0, max: 1, color: "#10b981" },
        { id: "g5-w4", type: "realtime_card", title: "Kekeruhan Air (Turbidity)", sensorKey: "turbidity", unit: "NTU", min: 0, max: 500, color: "#f59e0b" }
      ]
    },
    {
      groupSlug: "group-6",
      groupName: "Kelompok 6",
      projectName: "Unmanned Environmental Drone Telemetry",
      projectDesc: "Payload telemetry sensor cuaca (tekanan udara, ketinggian, kelembapan) pada robot drone inspeksi.",
      widgets: [
        { id: "g6-w1", type: "line_chart", title: "Ketinggian Terbang (Altimeter)", sensorKey: "altitude", unit: "meter", min: 0, max: 200, color: "#8b5cf6" },
        { id: "g6-w2", type: "gauge", title: "Daya Baterai Telemetry", sensorKey: "battery_volt", unit: "%", min: 0, max: 100, color: "#ef4444" },
        { id: "g6-w3", type: "realtime_card", title: "Temperatur Udara Drone", sensorKey: "air_temp", unit: "°C", min: 0, max: 50, color: "#10b981" },
        { id: "g6-w4", type: "status_indicator", title: "Sinyal GPS Lock", sensorKey: "gps_lock", unit: "lock", min: 0, max: 1, color: "#3b82f6" }
      ]
    },
    {
      groupSlug: "group-7",
      groupName: "Kelompok 7",
      projectName: "Smart City Crowd Sensing & Lighting System",
      projectDesc: "Penerangan jalan otomatis responsif berbasis korelasi volume kendaraan lewat dan intensitas ambien cahaya.",
      widgets: [
        { id: "g7-w1", type: "bar_chart", title: "Volume Kendaraan per Menit", sensorKey: "traffic_count", unit: "unit", min: 0, max: 60, color: "#10b981" },
        { id: "g7-w2", type: "line_chart", title: "Intensitas Cahaya (LDR)", sensorKey: "lux", unit: "Lux", min: 0, max: 1000, color: "#eab308" },
        { id: "g7-w3", type: "status_indicator", title: "Daya Lampu Pintar", sensorKey: "street_light", unit: "on_off", min: 0, max: 1, color: "#6366f1" }
      ]
    }
  ];

  const initialProjects = initialGroupConfigs.map((g, idx) => ({
    id: `proj-${g.groupSlug}`,
    groupSlug: g.groupSlug,
    groupName: g.groupName,
    name: g.projectName,
    description: g.projectDesc,
    category: idx % 5 === 0 ? 'IoT' : idx % 5 === 1 ? 'AI' : idx % 5 === 2 ? 'Embedded' : idx % 5 === 3 ? 'Networking' : 'Automation',
    status: 'online',
    lastUpdated: new Date().toISOString(),
    tags: [g.groupSlug.toUpperCase(), 'SMK', 'TEKNIK', 'REALTIME']
  }));

  const initialDevices = initialGroupConfigs.map((g, idx) => {
    const user = initialUsers.find(u => u.groupSlug === g.groupSlug);
    return {
      id: `dev-${g.groupSlug}`,
      name: `ESP32-${g.groupSlug.toUpperCase()}-Gateway`,
      groupSlug: g.groupSlug,
      status: 'online',
      ping: 24 + Math.floor(Math.random() * 15),
      lastSeen: new Date().toISOString(),
      apiKey: user ? user.apiKey : `SK-KEY-${g.groupSlug.toUpperCase()}`,
      telemetryCount: 60
    };
  });

  // Prefill historical payload data
  const initialTelemetryLogs: any[] = [];
  const now = new Date();
  initialGroupConfigs.forEach((g) => {
    // Generate 15 logs back in time
    for (let i = 15; i >= 0; i--) {
      const logTime = new Date(now.getTime() - i * 60 * 1000);
      let sensorData: Record<string, any> = {};

      if (g.groupSlug === "group-1") {
        sensorData = {
          soil_moisture: Math.floor(55 + Math.sin(i) * 10 + Math.random() * 4),
          temperature: Math.floor(26 + Math.cos(i) * 2 + Math.random() * 2),
          air_humidity: Math.floor(70 + Math.sin(i / 2) * 8),
          soil_temperature: Math.floor(24 + Math.cos(i) * 1.5 + Math.random() * 1),
          rain_sensor: Math.floor(4000 - Math.abs(Math.sin(i)) * 3000)
        };
      } else if (g.groupSlug === "group-2") {
        sensorData = {
          co2: Math.floor(410 + Math.sin(i) * 150 + Math.random() * 20),
          methane: Math.floor(150 + Math.cos(i) * 50),
          gas_leak: Math.random() > 0.95 ? 1 : 0
        };
      } else if (g.groupSlug === "group-3") {
        sensorData = {
          servo_angle: Math.floor(90 + Math.sin(i * 0.5) * 60),
          servo_current: Math.floor(300 + Math.sin(i) * 100 + Math.random() * 50),
          calibration_state: 1
        };
      } else if (g.groupSlug === "group-4") {
        sensorData = {
          line_voltage: Math.floor(220 + Math.sin(i * 0.8) * 4 + Math.random() * 2),
          power_load: Math.floor(1500 + Math.sin(i) * 800 + Math.random() * 100),
          current_load: Math.floor(6.8 + Math.sin(i) * 3),
          power_factor: 0.92
        };
      } else if (g.groupSlug === "group-5") {
        sensorData = {
          water_ph: parseFloat((6.8 + Math.sin(i * 0.1) * 0.4 + Math.random() * 0.1).toFixed(2)),
          water_temp: Math.floor(25 + Math.cos(i) * 1.5),
          feeder_triggered: Math.random() > 0.85 ? 1 : 0,
          turbidity: Math.floor(12 + Math.sin(i) * 5 + Math.random() * 3)
        };
      } else if (g.groupSlug === "group-6") {
        sensorData = {
          altitude: Math.floor(40 + Math.sin(i * 0.3) * 15 + Math.random() * 2),
          battery_volt: Math.floor(82 - i * 0.5),
          air_temp: Math.floor(22 + Math.sin(i) * 3),
          gps_lock: 1
        };
      } else {
        sensorData = {
          traffic_count: Math.floor(12 + Math.sin(i * 0.5) * 10 + Math.random() * 5),
          lux: Math.floor(520 + Math.cos(i * 0.2) * 400),
          street_light: Math.random() > 0.5 ? 1 : 0
        };
      }

      initialTelemetryLogs.push({
        id: `log-${g.groupSlug}-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        groupSlug: g.groupSlug,
        timestamp: logTime.toISOString(),
        data: sensorData
      });
    }
  });

  db = {
    users: initialUsers,
    groupConfigs: initialGroupConfigs,
    projects: initialProjects,
    devices: initialDevices,
    telemetryLogs: initialTelemetryLogs
  };

  saveDB();
}

function saveDB() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write persistence database file", err);
  }
}

// Load and read DB
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    db = JSON.parse(raw);
    console.log("Database successfully loaded from storage with records:", db.users.length, "users");
  } catch (err) {
    console.warn("Corrupt database file, initializing fresh starting data.");
    initDB();
  }
} else {
  initDB();
}

// Global active client connections for Real-Time SSE
let activeSSEResponses: express.Response[] = [];

function broadcastSSE(data: any) {
  activeSSEResponses.forEach(res => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      // ignore
    }
  });
}


// API REST routes

// SSE Endpoint for real-time monitoring streams
app.get('/api/telemetry/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');
  activeSSEResponses.push(res);

  req.on('close', () => {
    activeSSEResponses = activeSSEResponses.filter(r => r !== res);
  });
});

// Login authentication API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi." });
  }

  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Akun tidak ditemukan. Gunakan username kelompok atau admin." });
  }

  const inputHash = getHash(password);
  if (user.passwordHash !== inputHash) {
    return res.status(401).json({ error: "Password salah. Silakan periksa kembali." });
  }

  // Authenticated safely
  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Get context profile
app.get('/api/auth/me', (req, res) => {
  // Simple session proxy in standard template
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: "Missing authorization header credentials" });
  }
  const token = authorization.replace('Bearer ', '');
  const user = db.users.find(u => u.apiKey === token);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

// Fetch all database records for administrative/visual dashboards
app.get('/api/dashboard/summary', (req, res) => {
  const safeUsers = db.users.map(({ passwordHash, ...u }) => u);
  res.json({
    groups: db.groupConfigs,
    devices: db.devices,
    projects: db.projects,
    users: safeUsers,
    logs: db.telemetryLogs.slice(-250) // Return last 250 records to save transfer
  });
});

// Post device telemetry from microcontrollers (the real IoT endpoint requested!)
app.post('/api/telemetry/device/:groupSlug', (req, res) => {
  const { groupSlug } = req.params;
  const apiKey = req.headers['x-api-key'] || req.body.apiKey;
  let sensorData = req.body.sensorData || req.body.data;

  // Fallback: If payload is not wrapped inside 'sensorData' or 'data', 
  // check if telemetry keys are directly at the root of the JSON body.
  if (!sensorData && typeof req.body === 'object' && req.body !== null) {
    const keys = Object.keys(req.body);
    // If the body has fields and is not empty or just metadata, treat root body as sensorData
    if (keys.length > 0 && !keys.includes('apiKey') && !keys.includes('sensorData') && !keys.includes('data')) {
      sensorData = req.body;
    }
  }

  if (!sensorData) {
    return res.status(400).json({ error: "JSON Telemetry 'sensorData' is required." });
  }

  // Validate API key aligns to user of this group
  const matchedUser = db.users.find(u => u.groupSlug === groupSlug && u.apiKey === apiKey);
  const isAdmin = db.users.find(u => u.role === "SUPER_ADMIN" && u.apiKey === apiKey);

  if (!matchedUser && !isAdmin) {
    return res.status(401).json({ error: "Invalid API Key or X-API-Key header credentials for group " + groupSlug });
  }

  // Authenticated! Insert log records
  const now = new Date();
  const newLog = {
    id: `log-${groupSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    groupSlug,
    timestamp: now.toISOString(),
    data: sensorData
  };

  db.telemetryLogs.push(newLog);
  if (db.telemetryLogs.length > 400) {
    db.telemetryLogs.shift();
  }

  // Update device record details
  const dev = db.devices.find(d => d.groupSlug === groupSlug);
  if (dev) {
    dev.telemetryCount += 1;
    dev.lastSeen = now.toISOString();
    dev.status = 'online';
    dev.ping = 8 + Math.floor(Math.random() * 10);
  }

  saveDB();

  // Broadcast out in SSE
  broadcastSSE({
    type: 'TELEMETRY_UPDATE',
    groupSlug,
    log: newLog,
    device: dev
  });

  res.json({ success: true, message: "Telemetry received & stored successfully.", log: newLog });
});

// User Management (Super Admin only can build, delete reset)
app.post('/api/admin/users/create', (req, res) => {
  const { username, password, role, groupSlug, groupName } = req.body;
  const requesterKey = req.headers.authorization?.replace('Bearer ', '');
  const requester = db.users.find(u => u.apiKey === requesterKey && u.role === 'SUPER_ADMIN');

  if (!requester) {
    return res.status(403).json({ error: "Hanya Super Admin yang berwenang menambahkan pengguna baru." });
  }

  if (!username || !password || !groupSlug) {
    return res.status(400).json({ error: "Username, password, dan kelompok slug wajib diisi." });
  }

  const existing = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Username sudah terdaftar di platform." });
  }

  const id = `u-new-${Date.now()}`;
  const slug = groupSlug.toLowerCase().trim().replace(/\s+/g, '-');
  const apiKey = `SK-KEY-${slug.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const deviceToken = `TOKEN-${slug.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newUser = {
    id,
    username,
    passwordHash: getHash(password),
    role: role || 'USER',
    groupSlug: slug,
    groupName: groupName || `Kelompok Baru ${slug.toUpperCase()}`,
    apiKey,
    deviceToken,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  // Auto-generate initial config & device for the group
  if (!db.groupConfigs.find(g => g.groupSlug === slug)) {
    db.groupConfigs.push({
      groupSlug: slug,
      groupName: newUser.groupName,
      projectName: `Project IoT ${newUser.groupName}`,
      projectDesc: `Smart monitoring system inovatif yang dibangun oleh ${newUser.groupName}.`,
      widgets: [
        { id: `widget-${slug}-temp`, type: "gauge", title: "Sensor Suhu Inti", sensorKey: "temperature", unit: "°C", min: 0, max: 80, color: "#ef4444" },
        { id: `widget-${slug}-humidity`, type: "line_chart", title: "Kelembaban Ambient", sensorKey: "humidity", unit: "%", min: 0, max: 100, color: "#3b82f6" },
        { id: `widget-${slug}-logs`, type: "log_telemetry", title: "Feed Logs", sensorKey: "*", unit: "", min: 0, max: 0 }
      ]
    });

    db.projects.push({
      id: `proj-${slug}`,
      groupSlug: slug,
      groupName: newUser.groupName,
      name: `Project IoT ${newUser.groupName}`,
      description: `Smart monitoring system inovatif yang dibangun oleh ${newUser.groupName}.`,
      category: 'IoT',
      status: 'online',
      lastUpdated: new Date().toISOString(),
      tags: [slug.toUpperCase(), 'IOT', 'STUDENT']
    });

    db.devices.push({
      id: `dev-${slug}`,
      name: `Gateway-${slug.toUpperCase()}-Node`,
      groupSlug: slug,
      status: 'online',
      ping: 28,
      lastSeen: new Date().toISOString(),
      apiKey: apiKey,
      telemetryCount: 0
    });
  }

  saveDB();
  const { passwordHash, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

// Delete user account (Super Admin only)
app.delete('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;
  const requesterKey = req.headers.authorization?.replace('Bearer ', '');
  const requester = db.users.find(u => u.apiKey === requesterKey && u.role === 'SUPER_ADMIN');

  if (!requester) {
    return res.status(403).json({ error: "Hanya Super Admin yang berwenang menonaktifkan pengguna." });
  }

  const usr = db.users.find(u => u.id === userId);
  if (!usr) {
    return res.status(404).json({ error: "Pengguna tidak ditemukan." });
  }

  if (usr.username === "admin") {
    return res.status(400).json({ error: "Akun Super Admin master tidak boleh dihapus." });
  }

  db.users = db.users.filter(u => u.id !== userId);
  saveDB();
  res.json({ success: true, message: "Akun pengguna berhasil dihapus." });
});

// Custom widgets edit/save configurator for custom dashboards
app.post('/api/groups/:groupSlug/widgets', (req, res) => {
  const { groupSlug } = req.params;
  const { widgets, projectName, projectDesc } = req.body;
  const requesterKey = req.headers.authorization?.replace('Bearer ', '');
  const requester = db.users.find(u => u.apiKey === requesterKey);

  if (!requester) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu." });
  }

  // Check if they are authorized for this group or is Super Admin
  if (requester.groupSlug !== groupSlug && requester.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: "Anda tidak memiliki hak akses mengubah dasbor kelompok ini." });
  }

  const config = db.groupConfigs.find(g => g.groupSlug === groupSlug);
  if (config) {
    if (widgets) config.widgets = widgets;
    if (projectName) config.projectName = projectName;
    if (projectDesc) config.projectDesc = projectDesc;

    // sync to projects
    const proj = db.projects.find(p => p.groupSlug === groupSlug);
    if (proj) {
      if (projectName) proj.name = projectName;
      if (projectDesc) proj.description = projectDesc;
      proj.lastUpdated = new Date().toISOString();
    }

    saveDB();
    res.json({ success: true, config });

    // Broadcast updates
    broadcastSSE({
      type: 'CONFIG_UPDATE',
      groupSlug,
      config
    });
  } else {
    res.status(404).json({ error: "Konfigurasi kelompok tidak ditemukan." });
  }
});

// Call Gemini API on the server side to gain Smart Anomaly & Intelligence analytical logs
app.post('/api/ai/analyze', async (req, res) => {
  const { groupSlug } = req.body;
  const config = db.groupConfigs.find(g => g.groupSlug === groupSlug);
  const logs = db.telemetryLogs.filter(l => l.groupSlug === groupSlug).slice(-10);

  if (!config) {
    return res.status(404).json({ error: "Sistem kelompok tidak ditemukan." });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === "MY_GEMINI_API_KEY") {
    return res.json({
      success: true,
      analysis: `### 🤖 AI Analisis Telemetri (${config.projectName})
Gagal memanggil modul analisis kecerdasan mikro. Kunci API Gemini tidak disetel dalam Rahasia Sistem Anda. 
      
* **Rekomendasi Operasional**: 
  Silakan tambahkan kunci API Gemini yang sah \`GEMINI_API_KEY\` pada panel **Settings > Secrets** di Google AI Studio untuk mengaktifkan audit korelasi mendalam bermuatan kecerdasan buatan secara real-time.`
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const logsSummary = JSON.stringify(logs, null, 2);
    const widgetsSummary = JSON.stringify(config.widgets, null, 2);

    const promptMessage = `Anda adalah asisten AI ahli Rekayasa embedded IoT, otomasi industri, dan pengawas siber di Program Studi Sistem Komputer.
Lakukan analisis data telemetri real-time terbaru pada project sensor mahasiswa berikut ini:

Nama Projek: ${config.projectName}
Deskripsi Projek: ${config.projectDesc}
Widget Sensor Terpasang:
${widgetsSummary}

Data Sensor 10 Log Terakhir:
${logsSummary}

Berikan audit ringkas profesional berbahasa Indonesia dalam format Markdown:
1. **Status Kesehatan Device**: Tinjau apakah ada anomali dikoordinasikan data sensor.
2. **Interpretasi Teoretis**: Jelaskan makna data tersebut terhadap performa operasional.
3. **Saran Optimalisasi Hardware/Software**: Tuliskan saran inovasi konkret untuk mahasiswa.
4. **Kode Snippet ESP32 (ESP-IDF/Arduino)**: Sediakan cuplikan struktur kode Arduino sederhana berkorelasi untuk membaca sensor utama projek ini dan mengirimkannya ke endpoint POST /api/telemetry/device/${groupSlug} degan header x-api-key: "${config.groupSlug.toUpperCase()}".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage
    });

    res.json({ success: true, analysis: response.text });
  } catch (err: any) {
    console.error("Gemini API call failed:", err);
    res.status(500).json({ error: "Gagal menghubungkan modul intelejensi Gemini: " + err.message });
  }
});


// Set up Vite development server or build output server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start the server if not running on Vercel
if (!isVercel) {
  startServer();
}

export default app;
