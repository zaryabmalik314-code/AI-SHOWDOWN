const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/orphanage_ai'
});

app.use(express.json());
app.use(express.static('public'));

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});

// WebSocket broadcast
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg);
  });
}

// AI Detection simulation - in production, replace with real TensorFlow.js / OpenCV
let detectionInterval;
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

  detectionInterval = setInterval(async () => {
    // Simulate zone headcounts
    for (const zoneName of zones) {
      const count = Math.floor(Math.random() * 15);
      try {
        await pool.query('UPDATE zones SET current_count = $1 WHERE name = $2', [count, zoneName]);
      } catch (e) { /* ignore */ }
      broadcast({ type: 'zone_update', zone: zoneName, count });
    }

    // Random alert generation (10% chance per tick)
    if (Math.random() < 0.1) {
      const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const alertData = {
        type: alert.type,
        severity: alert.severity,
        message: `${alert.msg} in ${zone}`,
        zone
      };

      try {
        const result = await pool.query(
          'INSERT INTO alerts (type, severity, message, zone) VALUES ($1, $2, $3, $4) RETURNING *',
          [alertData.type, alertData.severity, alertData.message, alertData.zone]
        );
        broadcast({ type: 'alert', alert: result.rows[0] });

        await pool.query(
          'INSERT INTO activity_log (event_type, description, zone_id) VALUES ($1, $2, (SELECT id FROM zones WHERE name = $3))',
          [alert.type, alertData.message, zone]
        );
      } catch (e) { /* ignore */ }
    }
  }, 5000);
}

// === API Routes ===

// Dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const [children, visitors, alerts, zones] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM children WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) FROM visitors WHERE status = 'checked_in'"),
      pool.query("SELECT COUNT(*) FROM alerts WHERE acknowledged = false"),
      pool.query('SELECT * FROM zones ORDER BY id')
    ]);
    res.json({
      totalChildren: parseInt(children.rows[0].count),
      activeVisitors: parseInt(visitors.rows[0].count),
      pendingAlerts: parseInt(alerts.rows[0].count),
      zones: zones.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Children CRUD
app.get('/api/children', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM children ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/children', upload.single('photo'), async (req, res) => {
  const { name, age, gender, medical_notes } = req.body;
  const photo_url = req.file ? '/uploads/' + req.file.filename : null;
  try {
    const result = await pool.query(
      'INSERT INTO children (name, age, gender, photo_url, medical_notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, age, gender, photo_url, medical_notes]
    );
    broadcast({ type: 'child_added', child: result.rows[0] });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/children/:id', async (req, res) => {
  const { name, age, gender, medical_notes, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE children SET name=$1, age=$2, gender=$3, medical_notes=$4, status=$5 WHERE id=$6 RETURNING *',
      [name, age, gender, medical_notes, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health records
app.get('/api/children/:id/health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM health_records WHERE child_id = $1 ORDER BY record_date DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/children/:id/health', async (req, res) => {
  const { record_type, description, doctor_name, next_due } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO health_records (child_id, record_type, description, doctor_name, next_due) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, record_type, description, doctor_name, next_due || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visitors
app.get('/api/visitors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitors ORDER BY check_in DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visitors', upload.single('photo'), async (req, res) => {
  const { name, cnic, phone, purpose } = req.body;
  const photo_url = req.file ? '/uploads/' + req.file.filename : null;
  try {
    const result = await pool.query(
      'INSERT INTO visitors (name, cnic, phone, purpose, photo_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, cnic, phone, purpose, photo_url]
    );
    broadcast({ type: 'visitor_checkin', visitor: result.rows[0] });
    await pool.query(
      "INSERT INTO activity_log (event_type, description) VALUES ('visitor_entry', $1)",
      [`Visitor ${name} checked in - Purpose: ${purpose}`]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/visitors/:id/checkout', async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE visitors SET check_out = NOW(), status = 'checked_out' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    broadcast({ type: 'visitor_checkout', visitor: result.rows[0] });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/alerts/:id/acknowledge', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE alerts SET acknowledged = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    broadcast({ type: 'alert_ack', alertId: parseInt(req.params.id) });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activity log
app.get('/api/activity', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT al.*, z.name as zone_name FROM activity_log al LEFT JOIN zones z ON al.zone_id = z.id ORDER BY al.created_at DESC LIMIT 30'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Zones
app.get('/api/zones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM zones ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startAIDetection();
});
