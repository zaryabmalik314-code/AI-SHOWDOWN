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
app.use(express.static(path.join(__dirname, 'public')));

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
const aiModels = [
  { name: 'ViolenceNet v2.1', type: 'action_recognition', backbone: 'SlowFast-R50' },
  { name: 'PoseGuard v1.4', type: 'pose_analysis', backbone: 'YOLOv8-pose + GRU' },
  { name: 'ProximityAI v1.2', type: 'spatial_analysis', backbone: 'DeepSORT + ReID' },
  { name: 'AudioSense v2.0', type: 'audio_classification', backbone: 'YAMNet + LSTM' },
];

const violenceTypes = [
  { type: 'physical_violence', severity: 'critical', label: 'Physical Violence', desc: 'Hitting/pushing detected between individuals', model: 0, weight: 8, minConf: 82 },
  { type: 'verbal_abuse', severity: 'high', label: 'Verbal Abuse', desc: 'Aggressive shouting/screaming pattern detected', model: 3, weight: 15, minConf: 71 },
  { type: 'harassment', severity: 'critical', label: 'Harassment', desc: 'Inappropriate physical contact detected', model: 1, weight: 5, minConf: 85 },
  { type: 'bullying', severity: 'high', label: 'Bullying', desc: 'Repeated aggressive behavior toward same individual', model: 0, weight: 12, minConf: 74 },
  { type: 'neglect', severity: 'medium', label: 'Neglect Indicator', desc: 'Child isolated/unattended for extended period', model: 2, weight: 25, minConf: 68 },
  { type: 'distress', severity: 'high', label: 'Child Distress', desc: 'Crying/screaming audio pattern detected', model: 3, weight: 20, minConf: 72 },
  { type: 'rough_handling', severity: 'high', label: 'Rough Handling', desc: 'Staff using excessive force with child', model: 1, weight: 10, minConf: 79 },
  { type: 'unauthorized_contact', severity: 'critical', label: 'Unauthorized Contact', desc: 'Unknown adult in close proximity to children unsupervised', model: 2, weight: 5, minConf: 88 },
];

const cameraNames = ['CAM-A1 Main Hall', 'CAM-A2 Corridor', 'CAM-B1 Dormitory', 'CAM-B2 Washroom Entry', 'CAM-C1 Kitchen', 'CAM-C2 Dining', 'CAM-D1 Playground', 'CAM-D2 Garden', 'CAM-E1 Main Gate', 'CAM-E2 Back Gate', 'CAM-F1 Study Room', 'CAM-F2 Library', 'CAM-G1 Staff Room', 'CAM-G2 Office'];

function weightedRandom(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.weight; if (r <= 0) return item; }
  return items[0];
}

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
      if (org.status !== 'online') return;
      const zones = store.getZones(org.id);
      const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : null;
      const camera = cameraNames[Math.floor(Math.random() * Math.min(org.cameras, cameraNames.length))];
      const alertTypes = [
        { type: 'headcount_mismatch', severity: 'high', msg: 'Headcount mismatch detected', detail: 'Expected: {exp}, Detected: {det}. Scanning adjacent zones.', model: 'ProximityAI v1.2', weight: 30 },
        { type: 'restricted_zone', severity: 'critical', msg: 'Unauthorized person in restricted zone', detail: 'Unregistered adult detected via facial recognition. ID match: NONE.', model: 'ProximityAI v1.2', weight: 15 },
        { type: 'perimeter_breach', severity: 'critical', msg: 'Perimeter movement detected after hours', detail: 'Motion sensor + thermal camera triggered. Recording flagged for review.', model: 'PoseGuard v1.4', weight: 10 },
        { type: 'child_missing', severity: 'critical', msg: 'Child not detected in expected zone', detail: 'Last seen {min} minutes ago at {lastZone}. Cross-camera tracking initiated.', model: 'ProximityAI v1.2', weight: 20 },
        { type: 'camera_offline', severity: 'medium', msg: 'Camera feed interrupted', detail: 'Feed lost for {sec}s. Network check in progress. Last frame saved.', model: 'System', weight: 15 },
        { type: 'loitering', severity: 'medium', msg: 'Loitering detected near entrance', detail: 'Individual stationary for {min}+ minutes at facility perimeter.', model: 'PoseGuard v1.4', weight: 10 },
      ];
      const at = weightedRandom(alertTypes);
      const detail = at.detail
        .replace('{exp}', zone ? zone.expected_count : 12)
        .replace('{det}', zone ? Math.max(0, zone.expected_count + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4 + 1)) : 8)
        .replace('{min}', Math.floor(Math.random() * 15) + 3)
        .replace('{sec}', Math.floor(Math.random() * 45) + 10)
        .replace('{lastZone}', zone ? zone.name : 'Main Hall');
      const alert = store.addAlert({
        type: at.type,
        severity: at.severity,
        message: `${at.msg} at ${org.name}, ${org.city}`,
        detail: detail,
        camera_id: camera,
        ai_model: at.model,
        zone: zone ? zone.name : null,
        orphanage_id: org.id
      });
      broadcast({ type: 'alert', alert });
      const notif = store.addNotification({
        type: 'security_alert',
        title: `${at.msg} [${at.model}]`,
        message: `[${camera}] ${at.msg} at ${org.name}, ${org.city}. ${detail}`,
        severity: at.severity === 'critical' ? 'critical' : 'high',
        orphanage_id: org.id,
      });
      broadcast({ type: 'notification', notification: notif });
    }

    // Violence/Harassment incidents (3% chance per tick)
    if (Math.random() < 0.03) {
      const onlineOrgs = orphanages.filter(o => o.status === 'online');
      const org = onlineOrgs[Math.floor(Math.random() * onlineOrgs.length)];
      const zones = store.getZones(org.id);
      const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : null;
      const vt = weightedRandom(violenceTypes);
      const model = aiModels[vt.model];
      const confidence = (vt.minConf + Math.random() * (99 - vt.minConf)).toFixed(1);
      const camera = cameraNames[Math.floor(Math.random() * Math.min(org.cameras, cameraNames.length))];
      const personsDetected = vt.type === 'neglect' ? 1 : Math.floor(Math.random() * 3) + 2;
      const bbox = { x: Math.floor(Math.random() * 400) + 100, y: Math.floor(Math.random() * 200) + 50, w: Math.floor(Math.random() * 150) + 80, h: Math.floor(Math.random() * 200) + 100 };
      const incident = store.addIncident({
        type: vt.type,
        label: vt.label,
        severity: vt.severity,
        description: `${vt.desc} at ${org.name}, ${org.city}. Detected: ${personsDetected} person(s). Zone: ${zone ? zone.name : 'Unknown'}. Expected: ${zone ? zone.expected_count : '?'}.`,
        zone: zone ? zone.name : null,
        orphanage_id: org.id,
        orphanage_name: org.name,
        confidence: parseFloat(confidence),
        ai_model: model.name,
        model_backbone: model.backbone,
        detection_type: model.type,
        camera_id: camera,
        frame_count: Math.floor(Math.random() * 45) + 10,
        persons_detected: personsDetected,
        bounding_box: bbox,
        inference_ms: Math.floor(Math.random() * 80) + 20,
      });
      broadcast({ type: 'incident', incident });
      const notif = store.addNotification({
        type: 'ai_detection',
        title: `${vt.label} [${model.name}]`,
        message: `${camera}: ${vt.desc} at ${org.name}, ${org.city} (${confidence}% confidence, ${personsDetected} person(s))`,
        severity: vt.severity,
        orphanage_id: org.id,
      });
      broadcast({ type: 'notification', notification: notif });

      store.addActivity({
        event_type: 'ai_detection',
        description: `${model.name}: ${vt.label} at ${org.name} [${camera}] — ${confidence}% confidence, ${personsDetected} person(s)`,
        zone_id: zone ? zone.id : null,
        orphanage_id: org.id
      });

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

// Rankings
app.get('/api/rankings', (req, res) => res.json(store.getRankings()));

// Zones
app.get('/api/zones', (req, res) => res.json(store.getZones(req.query.orphanage_id)));

// Growth records
app.get('/api/children/:id/growth', (req, res) => res.json(store.getGrowthRecords(req.params.id)));
app.post('/api/children/:id/growth', (req, res) => {
  const record = req.body;
  record.height_cm = parseFloat(record.height_cm);
  record.weight_kg = parseFloat(record.weight_kg);
  record.bmi = parseFloat((record.weight_kg / Math.pow(record.height_cm / 100, 2)).toFixed(1));
  res.json(store.addGrowthRecord(req.params.id, record));
});

// Notifications
app.get('/api/notifications', (req, res) => res.json(store.getNotifications()));
app.get('/api/notifications/unread-count', (req, res) => res.json({ count: store.getUnreadCount() }));
app.put('/api/notifications/:id/read', (req, res) => { store.markNotificationRead(req.params.id); res.json({ ok: true }); });
app.put('/api/notifications/read-all', (req, res) => { store.markAllNotificationsRead(); res.json({ ok: true }); });


// Analytics/Charts data
app.get('/api/analytics/incidents-timeline', (req, res) => {
  const incidents = store.getIncidents(req.query.orphanage_id, 500);
  const days = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days[key] = { date: key, physical_violence: 0, verbal_abuse: 0, harassment: 0, bullying: 0, neglect: 0, distress: 0, rough_handling: 0, unauthorized_contact: 0, total: 0 };
  }
  incidents.forEach(inc => {
    const key = inc.detected_at.split('T')[0];
    if (days[key]) { days[key][inc.type] = (days[key][inc.type] || 0) + 1; days[key].total++; }
  });
  res.json(Object.values(days));
});

app.get('/api/analytics/alerts-by-type', (req, res) => {
  const alerts = store.getAlerts(req.query.orphanage_id, 500);
  const types = {};
  alerts.forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });
  res.json(Object.entries(types).map(([type, count]) => ({ type: type.replace(/_/g, ' '), count })));
});

app.get('/api/analytics/incidents-by-type', (req, res) => {
  const incidents = store.getIncidents(req.query.orphanage_id, 500);
  const types = {};
  incidents.forEach(i => { types[i.type] = (types[i.type] || 0) + 1; });
  res.json(Object.entries(types).map(([type, count]) => ({ type: type.replace(/_/g, ' '), count })).sort((a, b) => b.count - a.count));
});

app.get('/api/analytics/risk-distribution', (req, res) => {
  const orphanages = store.getOrphanages();
  const dist = { low: 0, medium: 0, high: 0 };
  orphanages.forEach(o => { dist[o.risk_level] = (dist[o.risk_level] || 0) + 1; });
  res.json(dist);
});

app.get('/api/analytics/top-hotspots', (req, res) => {
  const orphanages = store.getOrphanages();
  const results = orphanages.map(o => {
    const incidents = store.getIncidents(o.id, 500);
    const alerts = store.getAlerts(o.id, 500);
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const recentIncidents = incidents.filter(i => new Date(i.detected_at) >= weekAgo);
    const critical = recentIncidents.filter(i => i.severity === 'critical').length;
    return {
      id: o.id, name: o.name, city: o.city, district: o.district,
      risk_level: o.risk_level, status: o.status,
      incidents_7d: recentIncidents.length, critical_7d: critical,
      unresolved_alerts: alerts.filter(a => !a.acknowledged).length,
      score: critical * 3 + recentIncidents.length + alerts.filter(a => !a.acknowledged).length
    };
  }).sort((a, b) => b.score - a.score).slice(0, 10);
  res.json(results);
});

app.get('/api/analytics/ai-model-stats', (req, res) => {
  const incidents = store.getIncidents(req.query.orphanage_id, 500);
  const models = {};
  incidents.forEach(i => {
    const m = i.ai_model || 'Unknown';
    if (!models[m]) models[m] = { model: m, detections: 0, totalConf: 0, types: {} };
    models[m].detections++;
    models[m].totalConf += i.confidence || 0;
    models[m].types[i.type] = (models[m].types[i.type] || 0) + 1;
  });
  res.json(Object.values(models).map(m => ({
    ...m, avg_confidence: m.detections > 0 ? Math.round(m.totalConf / m.detections * 10) / 10 : 0,
    top_type: Object.entries(m.types).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, ' ') || 'N/A'
  })).sort((a, b) => b.detections - a.detections));
});

app.get('/api/analytics/district-breakdown', (req, res) => {
  const orphanages = store.getOrphanages();
  const districts = {};
  orphanages.forEach(o => {
    const d = o.district || o.city;
    if (!districts[d]) districts[d] = { district: d, orphanages: 0, children: 0, incidents: 0, online: 0 };
    districts[d].orphanages++;
    districts[d].children += o.total_children || 0;
    if (o.status === 'online') districts[d].online++;
    districts[d].incidents += store.getIncidents(o.id, 500).length;
  });
  res.json(Object.values(districts).sort((a, b) => b.incidents - a.incidents));
});

app.get('/api/analytics/response-metrics', (req, res) => {
  const incidents = store.getIncidents(null, 500);
  const alerts = store.getAlerts(null, 500);
  const total = incidents.length;
  const reviewed = incidents.filter(i => i.reviewed).length;
  const critical = incidents.filter(i => i.severity === 'critical').length;
  const criticalReviewed = incidents.filter(i => i.severity === 'critical' && i.reviewed).length;
  const acked = alerts.filter(a => a.acknowledged).length;
  res.json({
    total_incidents: total,
    reviewed_incidents: reviewed,
    review_rate: total > 0 ? Math.round(reviewed / total * 100) : 0,
    total_critical: critical,
    critical_reviewed: criticalReviewed,
    critical_response_rate: critical > 0 ? Math.round(criticalReviewed / critical * 100) : 0,
    total_alerts: alerts.length,
    acknowledged_alerts: acked,
    alert_ack_rate: alerts.length > 0 ? Math.round(acked / alerts.length * 100) : 0,
  });
});

app.get('/api/analytics/anomalies', (req, res) => {
  const orphanages = store.getOrphanages();
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  const anomalies = orphanages.map(o => {
    const allIncidents = store.getIncidents(o.id, 500);
    const thisWeek = allIncidents.filter(i => new Date(i.detected_at) >= weekAgo).length;
    const lastWeek = allIncidents.filter(i => new Date(i.detected_at) >= twoWeeksAgo && new Date(i.detected_at) < weekAgo).length;
    const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : (thisWeek > 0 ? 100 : 0);
    const allAlerts = store.getAlerts(o.id, 500);
    const alertsThisWeek = allAlerts.filter(a => new Date(a.created_at) >= weekAgo).length;
    const unresolvedAlerts = allAlerts.filter(a => !a.acknowledged).length;
    const criticalThisWeek = allIncidents.filter(i => new Date(i.detected_at) >= weekAgo && i.severity === 'critical').length;

    let anomalyLevel = 'normal';
    if (thisWeek > lastWeek * 2 && thisWeek > 2) anomalyLevel = 'warning';
    if (thisWeek > lastWeek * 3 && thisWeek > 3) anomalyLevel = 'critical';
    if (criticalThisWeek > 2) anomalyLevel = 'critical';

    return {
      orphanage_id: o.id, name: o.name, city: o.city,
      incidents_this_week: thisWeek, incidents_last_week: lastWeek, change_percent: change,
      alerts_this_week: alertsThisWeek, unresolved_alerts: unresolvedAlerts,
      critical_this_week: criticalThisWeek, anomaly_level: anomalyLevel
    };
  }).sort((a, b) => b.incidents_this_week - a.incidents_this_week);

  res.json(anomalies);
});

// Daily briefing
app.get('/api/briefing', (req, res) => {
  const stats = store.getStats();
  const rankings = store.getRankings();
  const incidents = store.getIncidents(null, 500);
  const alerts = store.getAlerts(null, 500);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayIncidents = incidents.filter(i => i.detected_at.startsWith(today));
  const todayAlerts = alerts.filter(a => a.created_at.startsWith(today));
  const criticalToday = todayIncidents.filter(i => i.severity === 'critical').length;
  const worst = rankings[rankings.length - 1];
  const best = rankings[0];
  const breakdown = {};
  todayIncidents.forEach(i => { breakdown[i.type] = (breakdown[i.type] || 0) + 1; });

  res.json({
    date: today,
    generated_at: now.toISOString(),
    summary: {
      total_orphanages: stats.totalOrphanages,
      online: stats.onlineOrphanages,
      total_children: stats.totalChildren,
      active_visitors: stats.activeVisitors,
    },
    today: {
      incidents: todayIncidents.length,
      critical_incidents: criticalToday,
      alerts: todayAlerts.length,
      resolved_alerts: todayAlerts.filter(a => a.acknowledged).length,
    },
    top_performer: best ? { name: best.name, score: best.score, grade: best.grade } : null,
    needs_attention: worst ? { name: worst.name, score: worst.score, grade: worst.grade, open_incidents: worst.openIncidents } : null,
    incident_breakdown: breakdown,
    recent_critical: todayIncidents.filter(i => i.severity === 'critical').slice(0, 5),
  });
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`OrphanGuard AI Command Center running on http://localhost:${PORT}`);
  startAIDetection();
});
