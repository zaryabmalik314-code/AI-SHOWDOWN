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
      const notif = store.addNotification({
        type: 'security_alert',
        title: at.msg,
        message: `${at.msg} - ${org.name}${zone ? ', ' + zone.name : ''}`,
        severity: at.severity === 'critical' ? 'critical' : 'high',
        orphanage_id: org.id,
      });
      broadcast({ type: 'notification', notification: notif });
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
      const notif = store.addNotification({
        type: 'ai_detection',
        title: vt.label,
        message: `${vt.desc} - ${org.name}${zone ? ', ' + zone.name : ''} (${confidence}% confidence)`,
        severity: vt.severity,
        orphanage_id: org.id,
      });
      broadcast({ type: 'notification', notification: notif });

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

    // Emotion detection (5% chance per tick)
    if (Math.random() < 0.05) {
      const org = orphanages.filter(o => o.status === 'online')[Math.floor(Math.random() * orphanages.filter(o => o.status === 'online').length)];
      if (org) {
        const zones = store.getZones(org.id);
        const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : null;
        const children = store.getChildren(org.id);
        const child = children.length > 0 ? children[Math.floor(Math.random() * children.length)] : null;
        const emotions = [
          { emotion: 'distressed', severity: 'high', action: 'Staff notified for immediate check' },
          { emotion: 'crying', severity: 'high', action: 'Caretaker dispatched to location' },
          { emotion: 'anxious', severity: 'medium', action: 'Monitoring increased' },
          { emotion: 'fearful', severity: 'high', action: 'Security alert raised' },
          { emotion: 'happy', severity: 'low', action: 'No action needed' },
          { emotion: 'neutral', severity: 'low', action: 'Normal behavior' },
          { emotion: 'excited', severity: 'low', action: 'No action needed' },
          { emotion: 'sad', severity: 'medium', action: 'Counselor notified' },
        ];
        const emo = emotions[Math.floor(Math.random() * emotions.length)];
        const confidence = (65 + Math.random() * 34).toFixed(1);
        const detection = store.addEmotionDetection({
          child_name: child ? child.name : 'Unknown Child',
          emotion: emo.emotion,
          confidence: parseFloat(confidence),
          severity: emo.severity,
          zone: zone ? zone.name : 'Unknown',
          orphanage_id: org.id,
          orphanage_name: org.name,
          action_taken: emo.action,
        });
        broadcast({ type: 'emotion_detection', detection });

        // Create notification for distress emotions
        if (['distressed', 'crying', 'fearful'].includes(emo.emotion)) {
          const notif = store.addNotification({
            type: 'emotion_alert',
            title: `${emo.emotion.charAt(0).toUpperCase() + emo.emotion.slice(1)} Child Detected`,
            message: `${child ? child.name : 'A child'} detected as ${emo.emotion} at ${org.name}${zone ? ', ' + zone.name : ''} (${confidence}% confidence)`,
            severity: emo.severity,
            orphanage_id: org.id,
          });
          broadcast({ type: 'notification', notification: notif });
        }
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

// Emotion detections
app.get('/api/emotions', (req, res) => res.json(store.getEmotionDetections(req.query.orphanage_id)));

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
