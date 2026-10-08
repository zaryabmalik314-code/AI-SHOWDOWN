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

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase()));
  }
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(msg); });
}

// AI Violence/Harassment Detection Simulation
const violenceTypes = [
  { type: 'physical_violence', severity: 'critical', label: 'Physical Violence', desc: 'Hitting/pushing detected between individuals' },
  { type: 'verbal_abuse', severity: 'high', label: 'Verbal Abuse', desc: 'Aggressive shouting/screaming pattern detected' },
  { type: 'harassment', severity: 'critical', label: 'Harassment', desc: 'Inappropriate physical contact detected' },
  { type: 'bullying', severity: 'high', label: 'Bullying', desc: 'Repeated aggressive behavior toward same individual' },
  { type: 'neglect', severity: 'medium', label: 'Neglect Indicator', desc: 'Child isolated/unattended for extended period' },
  { type: 'distress', severity: 'high', label: 'Child Distress', desc: 'Crying/distress pattern detected in child' },
  { type: 'rough_handling', severity: 'high', label: 'Rough Handling', desc: 'Staff using excessive force with child' },
  { type: 'unauthorized_contact', severity: 'critical', label: 'Unauthorized Contact', desc: 'Unknown adult in close proximity to children unsupervised' },
];

function startAIDetection() {
  const orphanages = store.getOrphanages();

  setInterval(() => {
    // Zone updates for all orphanages
    orphanages.forEach(org => {
      if (org.status !== 'online') return;
      const zones = store.getZones(org.id);
      zones.forEach(z => {
        const count = Math.floor(Math.random() * (z.expected_count + 5));
        store.updateZoneCount(z.name, count);
        broadcast({ type: 'zone_update', orphanage_id: org.id, zone: z.name, count });
      });
    });

    // Security alerts (10% chance per tick)
    if (Math.random() < 0.1) {
      const org = orphanages[Math.floor(Math.random() * orphanages.length)];
      const zones = store.getZones(org.id);
      const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : null;
      const alertTypes = [
        { type: 'headcount_mismatch', severity: 'high', msg: 'Headcount mismatch detected' },
        { type: 'restricted_zone', severity: 'critical', msg: 'Unauthorized person in restricted zone' },
        { type: 'perimeter_breach', severity: 'critical', msg: 'Movement at perimeter after hours' },
        { type: 'child_missing', severity: 'critical', msg: 'Child not detected in expected zone' },
      ];
      const at = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const alert = store.addAlert({
        type: at.type,
        severity: at.severity,
        message: `${at.msg} - ${org.name}${zone ? ', ' + zone.name : ''}`,
        zone: zone ? zone.name : null,
        orphanage_id: org.id
      });
      broadcast({ type: 'alert', alert });
    }

    // Violence/Harassment incidents (3% chance per tick)
    if (Math.random() < 0.03) {
      const org = orphanages.filter(o => o.status === 'online')[Math.floor(Math.random() * orphanages.filter(o => o.status === 'online').length)];
      const zones = store.getZones(org.id);
      const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : null;
      const vt = violenceTypes[Math.floor(Math.random() * violenceTypes.length)];
      const confidence = (70 + Math.random() * 29).toFixed(1);
      const incident = store.addIncident({
        type: vt.type,
        label: vt.label,
        severity: vt.severity,
        description: `${vt.desc} - ${org.name}${zone ? ', ' + zone.name : ''}`,
        zone: zone ? zone.name : null,
        orphanage_id: org.id,
        orphanage_name: org.name,
        confidence: parseFloat(confidence),
        ai_model: 'ViolenceNet v2.1',
        frame_count: Math.floor(Math.random() * 30) + 5,
      });
      broadcast({ type: 'incident', incident });

      store.addActivity({
        event_type: 'ai_detection',
        description: `AI ALERT: ${vt.label} detected at ${org.name}${zone ? ' - ' + zone.name : ''} (${confidence}% confidence)`,
        zone_id: zone ? zone.id : null,
        orphanage_id: org.id
      });

      // Update orphanage risk
      if (vt.severity === 'critical') {
        store.updateOrphanage(org.id, { risk_level: 'high' });
        broadcast({ type: 'risk_update', orphanage_id: org.id, risk_level: 'high' });
      }
    }
  }, 5000);
}

// === API Routes ===

// Orphanages
app.get('/api/orphanages', (req, res) => res.json(store.getOrphanages()));
app.get('/api/orphanages/:id', (req, res) => {
  const o = store.getOrphanage(req.params.id);
  o ? res.json(o) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/orphanages', (req, res) => res.json(store.addOrphanage(req.body)));

// Stats
app.get('/api/stats', (req, res) => res.json(store.getStats(req.query.orphanage_id)));

// Children
app.get('/api/children', (req, res) => res.json(store.getChildren(req.query.orphanage_id)));
app.post('/api/children', upload.single('photo'), (req, res) => {
  const { name, age, gender, medical_notes, orphanage_id } = req.body;
  const child = store.addChild({
    name, age: parseInt(age), gender,
    photo_url: req.file ? '/uploads/' + req.file.filename : null,
    medical_notes, orphanage_id: parseInt(orphanage_id) || 1
  });
  broadcast({ type: 'child_added', child });
  res.json(child);
});
app.put('/api/children/:id', (req, res) => {
  const child = store.updateChild(req.params.id, req.body);
  child ? res.json(child) : res.status(404).json({ error: 'Not found' });
});

// Health
app.get('/api/children/:id/health', (req, res) => res.json(store.getHealthRecords(req.params.id)));
app.post('/api/children/:id/health', (req, res) => res.json(store.addHealthRecord(req.params.id, req.body)));

// Visitors
app.get('/api/visitors', (req, res) => res.json(store.getVisitors(req.query.orphanage_id)));
app.post('/api/visitors', upload.single('photo'), (req, res) => {
  const { name, cnic, phone, purpose, orphanage_id } = req.body;
  const visitor = store.addVisitor({
    name, cnic, phone, purpose,
    photo_url: req.file ? '/uploads/' + req.file.filename : null,
    orphanage_id: parseInt(orphanage_id) || 1
  });
  broadcast({ type: 'visitor_checkin', visitor });
  store.addActivity({ event_type: 'visitor_entry', description: `Visitor ${name} checked in`, orphanage_id: visitor.orphanage_id });
  res.json(visitor);
});
app.put('/api/visitors/:id/checkout', (req, res) => {
  const visitor = store.checkoutVisitor(req.params.id);
  if (visitor) { broadcast({ type: 'visitor_checkout', visitor }); res.json(visitor); }
  else res.status(404).json({ error: 'Not found' });
});

// Alerts
app.get('/api/alerts', (req, res) => res.json(store.getAlerts(req.query.orphanage_id)));
app.put('/api/alerts/:id/acknowledge', (req, res) => {
  const alert = store.acknowledgeAlert(req.params.id);
  if (alert) { broadcast({ type: 'alert_ack', alertId: parseInt(req.params.id) }); res.json(alert); }
  else res.status(404).json({ error: 'Not found' });
});

// Incidents
app.get('/api/incidents', (req, res) => res.json(store.getIncidents(req.query.orphanage_id)));
app.put('/api/incidents/:id', (req, res) => {
  const inc = store.updateIncident(req.params.id, req.body);
  if (inc) { broadcast({ type: 'incident_update', incident: inc }); res.json(inc); }
  else res.status(404).json({ error: 'Not found' });
});

// Activity
app.get('/api/activity', (req, res) => res.json(store.getActivity(req.query.orphanage_id)));

// Zones
app.get('/api/zones', (req, res) => res.json(store.getZones(req.query.orphanage_id)));

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`OrphanGuard AI Command Center running on http://localhost:${PORT}`);
  startAIDetection();
});
