const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const store = require('./database/store');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static('public'));

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg);
  });
}

// AI Detection simulation
function startAIDetection() {
  const zones = ['Main Hall', 'Dormitory A', 'Dormitory B', 'Kitchen', 'Garden', 'Main Gate', 'Study Room'];
  const alertTypes = [
    { type: 'headcount_mismatch', severity: 'high', msg: 'Headcount mismatch detected' },
    { type: 'restricted_zone', severity: 'critical', msg: 'Unauthorized person in restricted zone' },
    { type: 'perimeter_breach', severity: 'critical', msg: 'Movement detected at perimeter after hours' },
    { type: 'child_missing', severity: 'critical', msg: 'Child not detected in expected zone' },
    { type: 'fall_detected', severity: 'high', msg: 'Possible fall detected' },
    { type: 'visitor_overstay', severity: 'medium', msg: 'Visitor exceeded allowed duration' },
    { type: 'crowd_forming', severity: 'low', msg: 'Unusual crowd forming in zone' },
  ];

  setInterval(() => {
    for (const zoneName of zones) {
      const count = Math.floor(Math.random() * 15);
      store.updateZoneCount(zoneName, count);
      broadcast({ type: 'zone_update', zone: zoneName, count });
    }

    if (Math.random() < 0.1) {
      const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const alertData = store.addAlert({
        type: alert.type,
        severity: alert.severity,
        message: `${alert.msg} in ${zone}`,
        zone
      });
      broadcast({ type: 'alert', alert: alertData });

      const zoneObj = store.getZones().find(z => z.name === zone);
      store.addActivity({
        event_type: alert.type,
        description: alertData.message,
        zone_id: zoneObj ? zoneObj.id : null
      });
    }
  }, 5000);
}

// === API Routes ===

app.get('/api/stats', (req, res) => {
  res.json(store.getStats());
});

app.get('/api/children', (req, res) => {
  res.json(store.getChildren());
});

app.post('/api/children', upload.single('photo'), (req, res) => {
  const { name, age, gender, medical_notes } = req.body;
  const child = store.addChild({
    name,
    age: parseInt(age),
    gender,
    photo_url: req.file ? '/uploads/' + req.file.filename : null,
    medical_notes
  });
  broadcast({ type: 'child_added', child });
  res.json(child);
});

app.put('/api/children/:id', (req, res) => {
  const child = store.updateChild(req.params.id, req.body);
  if (child) res.json(child);
  else res.status(404).json({ error: 'Child not found' });
});

app.get('/api/children/:id/health', (req, res) => {
  res.json(store.getHealthRecords(req.params.id));
});

app.post('/api/children/:id/health', (req, res) => {
  const record = store.addHealthRecord(req.params.id, req.body);
  res.json(record);
});

app.get('/api/visitors', (req, res) => {
  res.json(store.getVisitors());
});

app.post('/api/visitors', upload.single('photo'), (req, res) => {
  const { name, cnic, phone, purpose } = req.body;
  const visitor = store.addVisitor({
    name,
    cnic,
    phone,
    purpose,
    photo_url: req.file ? '/uploads/' + req.file.filename : null
  });
  broadcast({ type: 'visitor_checkin', visitor });
  store.addActivity({
    event_type: 'visitor_entry',
    description: `Visitor ${name} checked in - Purpose: ${purpose}`,
    zone_id: null
  });
  res.json(visitor);
});

app.put('/api/visitors/:id/checkout', (req, res) => {
  const visitor = store.checkoutVisitor(req.params.id);
  if (visitor) {
    broadcast({ type: 'visitor_checkout', visitor });
    res.json(visitor);
  } else {
    res.status(404).json({ error: 'Visitor not found' });
  }
});

app.get('/api/alerts', (req, res) => {
  res.json(store.getAlerts());
});

app.put('/api/alerts/:id/acknowledge', (req, res) => {
  const alert = store.acknowledgeAlert(req.params.id);
  if (alert) {
    broadcast({ type: 'alert_ack', alertId: parseInt(req.params.id) });
    res.json(alert);
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

app.get('/api/activity', (req, res) => {
  res.json(store.getActivity());
});

app.get('/api/zones', (req, res) => {
  res.json(store.getZones());
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`OrphanGuard AI running on http://localhost:${PORT}`);
  startAIDetection();
});
