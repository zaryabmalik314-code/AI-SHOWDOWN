const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  orphanages: [
    { id: 1, name: 'SOS Children Village', city: 'Lahore', district: 'Lahore', address: 'Johar Town, Lahore', lat: 31.4697, lng: 74.2728, total_children: 45, staff_count: 12, cameras: 8, status: 'online', risk_level: 'low' },
    { id: 2, name: 'Edhi Foundation Home', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Satellite Town, Rawalpindi', lat: 33.5651, lng: 73.0169, total_children: 62, staff_count: 18, cameras: 12, status: 'online', risk_level: 'low' },
    { id: 3, name: 'Dar-ul-Sukoon', city: 'Faisalabad', district: 'Faisalabad', address: 'Peoples Colony, Faisalabad', lat: 31.4187, lng: 73.0791, total_children: 38, staff_count: 10, cameras: 6, status: 'online', risk_level: 'medium' },
    { id: 4, name: 'Al-Khidmat Orphanage', city: 'Multan', district: 'Multan', address: 'Bosan Road, Multan', lat: 30.1575, lng: 71.5249, total_children: 55, staff_count: 14, cameras: 10, status: 'online', risk_level: 'low' },
    { id: 5, name: 'Pakistan Sweet Home', city: 'Islamabad', district: 'Islamabad', address: 'G-9 Markaz, Islamabad', lat: 33.7294, lng: 73.0931, total_children: 80, staff_count: 22, cameras: 16, status: 'online', risk_level: 'low' },
    { id: 6, name: 'Fountain House', city: 'Lahore', district: 'Lahore', address: 'Gulberg III, Lahore', lat: 31.5204, lng: 74.3587, total_children: 30, staff_count: 8, cameras: 5, status: 'online', risk_level: 'low' },
    { id: 7, name: 'Child Protection Bureau', city: 'Gujranwala', district: 'Gujranwala', address: 'Civil Lines, Gujranwala', lat: 32.1877, lng: 74.1945, total_children: 42, staff_count: 11, cameras: 7, status: 'offline', risk_level: 'high' },
    { id: 8, name: 'Saylani Welfare Home', city: 'Sialkot', district: 'Sialkot', address: 'Cantt Area, Sialkot', lat: 32.4945, lng: 74.5229, total_children: 35, staff_count: 9, cameras: 6, status: 'online', risk_level: 'low' },
    { id: 9, name: 'Kashana Orphanage', city: 'Bahawalpur', district: 'Bahawalpur', address: 'Model Town, Bahawalpur', lat: 29.3544, lng: 71.6911, total_children: 28, staff_count: 7, cameras: 4, status: 'online', risk_level: 'medium' },
    { id: 10, name: 'Ehsaas Foundation Home', city: 'Sargodha', district: 'Sargodha', address: 'University Road, Sargodha', lat: 32.0740, lng: 72.6861, total_children: 33, staff_count: 9, cameras: 5, status: 'online', risk_level: 'low' },
  ],
  children: [
    { id: 1, orphanage_id: 1, name: 'Ahmed Khan', age: 8, gender: 'Male', photo_url: null, admitted_date: '2024-01-15', medical_notes: 'Healthy, regular checkups', status: 'active', created_at: new Date().toISOString() },
    { id: 2, orphanage_id: 1, name: 'Fatima Ali', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-03-20', medical_notes: 'Mild asthma, inhaler prescribed', status: 'active', created_at: new Date().toISOString() },
    { id: 3, orphanage_id: 1, name: 'Hassan Raza', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-11-01', medical_notes: 'No known conditions', status: 'active', created_at: new Date().toISOString() },
    { id: 4, orphanage_id: 2, name: 'Ayesha Bibi', age: 7, gender: 'Female', photo_url: null, admitted_date: '2024-05-10', medical_notes: 'Allergic to peanuts', status: 'active', created_at: new Date().toISOString() },
    { id: 5, orphanage_id: 2, name: 'Usman Tariq', age: 9, gender: 'Male', photo_url: null, admitted_date: '2023-08-22', medical_notes: 'Wears glasses, annual eye checkup', status: 'active', created_at: new Date().toISOString() },
    { id: 6, orphanage_id: 3, name: 'Zainab Noor', age: 5, gender: 'Female', photo_url: null, admitted_date: '2024-07-01', medical_notes: 'Vaccinations up to date', status: 'active', created_at: new Date().toISOString() },
    { id: 7, orphanage_id: 4, name: 'Bilal Ahmed', age: 11, gender: 'Male', photo_url: null, admitted_date: '2023-06-15', medical_notes: 'Fractured arm (healed)', status: 'active', created_at: new Date().toISOString() },
    { id: 8, orphanage_id: 5, name: 'Sana Malik', age: 8, gender: 'Female', photo_url: null, admitted_date: '2024-02-28', medical_notes: 'Regular dental checkups needed', status: 'active', created_at: new Date().toISOString() },
  ],
  health_records: [],
  visitors: [],
  alerts: [],
  incidents: [],
  zones: [
    { id: 1, orphanage_id: 1, name: 'Main Hall', description: 'Central play and activity area', expected_count: 15, current_count: 0, status: 'active' },
    { id: 2, orphanage_id: 1, name: 'Dormitory A', description: 'Boys sleeping quarters', expected_count: 10, current_count: 0, status: 'active' },
    { id: 3, orphanage_id: 1, name: 'Dormitory B', description: 'Girls sleeping quarters', expected_count: 10, current_count: 0, status: 'active' },
    { id: 4, orphanage_id: 1, name: 'Kitchen', description: 'Restricted area', expected_count: 3, current_count: 0, status: 'active' },
    { id: 5, orphanage_id: 1, name: 'Garden', description: 'Outdoor play area', expected_count: 12, current_count: 0, status: 'active' },
    { id: 6, orphanage_id: 1, name: 'Main Gate', description: 'Entry and exit', expected_count: 0, current_count: 0, status: 'active' },
    { id: 7, orphanage_id: 1, name: 'Study Room', description: 'Homework area', expected_count: 8, current_count: 0, status: 'active' },
  ],
  activity_log: [],
  growth_records: [],
  notifications: [],
  emotion_detections: [],
  police_stations: [
    { id: 1, name: 'Johar Town Police Station', city: 'Lahore', phone: '042-35310001', lat: 31.4710, lng: 74.2690, address: 'Johar Town, Lahore' },
    { id: 2, name: 'Gulberg Police Station', city: 'Lahore', phone: '042-35761002', lat: 31.5180, lng: 74.3550, address: 'Gulberg III, Lahore' },
    { id: 3, name: 'Satellite Town Police Station', city: 'Rawalpindi', phone: '051-9290003', lat: 33.5670, lng: 73.0200, address: 'Satellite Town, Rawalpindi' },
    { id: 4, name: 'Peoples Colony Police Station', city: 'Faisalabad', phone: '041-8730004', lat: 31.4200, lng: 73.0810, address: 'Peoples Colony, Faisalabad' },
    { id: 5, name: 'Bosan Road Police Station', city: 'Multan', phone: '061-9210005', lat: 30.1590, lng: 71.5270, address: 'Bosan Road, Multan' },
    { id: 6, name: 'Margalla Police Station', city: 'Islamabad', phone: '051-9261006', lat: 33.7310, lng: 73.0900, address: 'G-9, Islamabad' },
    { id: 7, name: 'Civil Lines Police Station', city: 'Gujranwala', phone: '055-9200007', lat: 32.1890, lng: 74.1960, address: 'Civil Lines, Gujranwala' },
    { id: 8, name: 'Cantt Police Station', city: 'Sialkot', phone: '052-9250008', lat: 32.4960, lng: 74.5250, address: 'Cantt Area, Sialkot' },
    { id: 9, name: 'Model Town Police Station', city: 'Bahawalpur', phone: '062-9250009', lat: 29.3560, lng: 71.6930, address: 'Model Town, Bahawalpur' },
    { id: 10, name: 'University Road Police Station', city: 'Sargodha', phone: '048-9230010', lat: 32.0760, lng: 72.6880, address: 'University Road, Sargodha' },
  ],
  police_dispatches: [
    { id: 1, incident_id: 101, incident_type: 'physical_violence', incident_label: 'Physical Violence', severity: 'critical', orphanage_id: 7, orphanage_name: 'Child Protection Bureau', orphanage_address: 'Civil Lines, Gujranwala', orphanage_lat: 32.1877, orphanage_lng: 74.1945, station_id: 7, station_name: 'Civil Lines Police Station', station_phone: '055-9200007', station_address: 'Civil Lines, Gujranwala', distance_km: 0.2, zone: 'Main Hall', confidence: 94.3, status: 'on_scene', dispatched_at: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: 2, incident_id: 102, incident_type: 'harassment', incident_label: 'Harassment', severity: 'critical', orphanage_id: 1, orphanage_name: 'SOS Children Village', orphanage_address: 'Johar Town, Lahore', orphanage_lat: 31.4697, orphanage_lng: 74.2728, station_id: 1, station_name: 'Johar Town Police Station', station_phone: '042-35310001', station_address: 'Johar Town, Lahore', distance_km: 0.2, zone: 'Garden', confidence: 87.6, status: 'responding', dispatched_at: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 3, incident_id: 103, incident_type: 'unauthorized_contact', incident_label: 'Unauthorized Contact', severity: 'critical', orphanage_id: 5, orphanage_name: 'Pakistan Sweet Home', orphanage_address: 'G-9 Markaz, Islamabad', orphanage_lat: 33.7294, orphanage_lng: 73.0931, station_id: 6, station_name: 'Margalla Police Station', station_phone: '051-9261006', station_address: 'G-9, Islamabad', distance_km: 0.2, zone: 'Main Gate', confidence: 91.2, status: 'dispatched', dispatched_at: new Date(Date.now() - 3 * 60000).toISOString() },
    { id: 4, incident_id: 104, incident_type: 'physical_violence', incident_label: 'Physical Violence', severity: 'critical', orphanage_id: 4, orphanage_name: 'Al-Khidmat Orphanage', orphanage_address: 'Bosan Road, Multan', orphanage_lat: 30.1575, orphanage_lng: 71.5249, station_id: 5, station_name: 'Bosan Road Police Station', station_phone: '061-9210005', station_address: 'Bosan Road, Multan', distance_km: 0.2, zone: 'Dormitory A', confidence: 82.9, status: 'resolved', dispatched_at: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 5, incident_id: 105, incident_type: 'harassment', incident_label: 'Harassment', severity: 'critical', orphanage_id: 2, orphanage_name: 'Edhi Foundation Home', orphanage_address: 'Satellite Town, Rawalpindi', orphanage_lat: 33.5651, orphanage_lng: 73.0169, station_id: 3, station_name: 'Satellite Town Police Station', station_phone: '051-9290003', station_address: 'Satellite Town, Rawalpindi', distance_km: 0.4, zone: 'Kitchen', confidence: 78.5, status: 'resolved', dispatched_at: new Date(Date.now() - 180 * 60000).toISOString() },
    { id: 6, incident_id: 106, incident_type: 'unauthorized_contact', incident_label: 'Unauthorized Contact', severity: 'critical', orphanage_id: 8, orphanage_name: 'Saylani Welfare Home', orphanage_address: 'Cantt Area, Sialkot', orphanage_lat: 32.4945, orphanage_lng: 74.5229, station_id: 8, station_name: 'Cantt Police Station', station_phone: '052-9250008', station_address: 'Cantt Area, Sialkot', distance_km: 0.2, zone: 'Main Gate', confidence: 96.1, status: 'resolved', dispatched_at: new Date(Date.now() - 240 * 60000).toISOString() },
  ],
  counters: { children: 8, health_records: 0, visitors: 0, alerts: 0, incidents: 0, activity_log: 0, orphanages: 10, growth_records: 0, notifications: 0, emotion_detections: 0, police_dispatches: 6 }
};

class Store {
  constructor() {
    this.data = this.load();
    if (!this.data.orphanages) this.data = JSON.parse(JSON.stringify(defaultData));
    if (!this.data.incidents) this.data.incidents = [];
    if (!this.data.counters.incidents) this.data.counters.incidents = 0;
    if (!this.data.growth_records) this.data.growth_records = [];
    if (!this.data.counters.growth_records) this.data.counters.growth_records = 0;
    if (!this.data.notifications) this.data.notifications = [];
    if (!this.data.counters.notifications) this.data.counters.notifications = 0;
    if (!this.data.emotion_detections) this.data.emotion_detections = [];
    if (!this.data.counters.emotion_detections) this.data.counters.emotion_detections = 0;
    if (!this.data.police_stations) this.data.police_stations = JSON.parse(JSON.stringify(defaultData.police_stations));
    if (!this.data.police_dispatches) this.data.police_dispatches = [];
    if (!this.data.counters.police_dispatches) this.data.counters.police_dispatches = 0;
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(defaultData));
  }

  save() {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2)); }
    catch (e) { console.error('Save failed:', e.message); }
  }

  nextId(table) {
    this.data.counters[table] = (this.data.counters[table] || 0) + 1;
    return this.data.counters[table];
  }

  // Orphanages
  getOrphanages() { return this.data.orphanages; }

  getOrphanage(id) { return this.data.orphanages.find(o => o.id === parseInt(id)); }

  addOrphanage(orphanage) {
    orphanage.id = this.nextId('orphanages');
    orphanage.status = 'online';
    orphanage.risk_level = 'low';
    this.data.orphanages.push(orphanage);
    this.save();
    return orphanage;
  }

  updateOrphanage(id, updates) {
    const o = this.data.orphanages.find(x => x.id === parseInt(id));
    if (o) { Object.assign(o, updates); this.save(); }
    return o;
  }

  // Children
  getChildren(orphanageId) {
    let list = this.data.children.filter(c => c.status === 'active');
    if (orphanageId) list = list.filter(c => c.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  addChild(child) {
    child.id = this.nextId('children');
    child.created_at = new Date().toISOString();
    child.status = 'active';
    child.admitted_date = child.admitted_date || new Date().toISOString().split('T')[0];
    this.data.children.push(child);
    this.save();
    return child;
  }

  updateChild(id, updates) {
    const child = this.data.children.find(c => c.id === parseInt(id));
    if (child) { Object.assign(child, updates); this.save(); }
    return child;
  }

  getHealthRecords(childId) {
    return this.data.health_records
      .filter(r => r.child_id === parseInt(childId))
      .sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
  }

  addHealthRecord(childId, record) {
    record.id = this.nextId('health_records');
    record.child_id = parseInt(childId);
    record.record_date = record.record_date || new Date().toISOString().split('T')[0];
    record.created_at = new Date().toISOString();
    this.data.health_records.push(record);
    this.save();
    return record;
  }

  // Visitors
  getVisitors(orphanageId, limit = 50) {
    let list = this.data.visitors;
    if (orphanageId) list = list.filter(v => v.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.check_in) - new Date(a.check_in)).slice(0, limit);
  }

  addVisitor(visitor) {
    visitor.id = this.nextId('visitors');
    visitor.check_in = new Date().toISOString();
    visitor.check_out = null;
    visitor.status = 'checked_in';
    this.data.visitors.push(visitor);
    this.save();
    return visitor;
  }

  checkoutVisitor(id) {
    const visitor = this.data.visitors.find(v => v.id === parseInt(id));
    if (visitor) { visitor.check_out = new Date().toISOString(); visitor.status = 'checked_out'; this.save(); }
    return visitor;
  }

  // Alerts
  getAlerts(orphanageId, limit = 50) {
    let list = this.data.alerts;
    if (orphanageId) list = list.filter(a => a.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
  }

  addAlert(alert) {
    alert.id = this.nextId('alerts');
    alert.acknowledged = false;
    alert.created_at = new Date().toISOString();
    this.data.alerts.push(alert);
    this.save();
    return alert;
  }

  acknowledgeAlert(id) {
    const alert = this.data.alerts.find(a => a.id === parseInt(id));
    if (alert) { alert.acknowledged = true; this.save(); }
    return alert;
  }

  // Incidents (violence/harassment)
  getIncidents(orphanageId, limit = 50) {
    let list = this.data.incidents;
    if (orphanageId) list = list.filter(i => i.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at)).slice(0, limit);
  }

  addIncident(incident) {
    incident.id = this.nextId('incidents');
    incident.detected_at = new Date().toISOString();
    incident.status = 'open';
    incident.reviewed = false;
    this.data.incidents.push(incident);
    this.save();
    return incident;
  }

  updateIncident(id, updates) {
    const inc = this.data.incidents.find(i => i.id === parseInt(id));
    if (inc) { Object.assign(inc, updates); this.save(); }
    return inc;
  }

  // Zones
  getZones(orphanageId) {
    let list = this.data.zones;
    if (orphanageId) list = list.filter(z => z.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => a.id - b.id);
  }

  updateZoneCount(zoneName, count) {
    const zone = this.data.zones.find(z => z.name === zoneName);
    if (zone) zone.current_count = count;
  }

  // Activity
  getActivity(orphanageId, limit = 30) {
    let list = this.data.activity_log;
    if (orphanageId) list = list.filter(a => a.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit).map(a => {
      const zone = this.data.zones.find(z => z.id === a.zone_id);
      return { ...a, zone_name: zone ? zone.name : null };
    });
  }

  addActivity(event) {
    event.id = this.nextId('activity_log');
    event.created_at = new Date().toISOString();
    this.data.activity_log.push(event);
    if (this.data.activity_log.length > 500) this.data.activity_log = this.data.activity_log.slice(-250);
    this.save();
    return event;
  }

  // Growth Records
  getGrowthRecords(childId) {
    return this.data.growth_records
      .filter(r => r.child_id === parseInt(childId))
      .sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date));
  }

  addGrowthRecord(childId, record) {
    record.id = this.nextId('growth_records');
    record.child_id = parseInt(childId);
    record.recorded_date = record.recorded_date || new Date().toISOString().split('T')[0];
    record.created_at = new Date().toISOString();
    this.data.growth_records.push(record);
    this.save();
    return record;
  }

  // Notifications
  getNotifications(limit = 50) {
    return this.data.notifications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  addNotification(notification) {
    notification.id = this.nextId('notifications');
    notification.read = false;
    notification.created_at = new Date().toISOString();
    this.data.notifications.push(notification);
    if (this.data.notifications.length > 500) this.data.notifications = this.data.notifications.slice(-250);
    this.save();
    return notification;
  }

  markNotificationRead(id) {
    const notif = this.data.notifications.find(n => n.id === parseInt(id));
    if (notif) { notif.read = true; this.save(); }
    return notif;
  }

  markAllNotificationsRead() {
    this.data.notifications.forEach(n => { n.read = true; });
    this.save();
  }

  getUnreadCount() {
    return this.data.notifications.filter(n => !n.read).length;
  }

  // Emotion Detections
  getEmotionDetections(orphanageId, limit = 50) {
    let list = this.data.emotion_detections;
    if (orphanageId) list = list.filter(e => e.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at)).slice(0, limit);
  }

  addEmotionDetection(detection) {
    detection.id = this.nextId('emotion_detections');
    detection.detected_at = new Date().toISOString();
    this.data.emotion_detections.push(detection);
    if (this.data.emotion_detections.length > 500) this.data.emotion_detections = this.data.emotion_detections.slice(-250);
    this.save();
    return detection;
  }

  // Police Stations & Dispatches
  getPoliceStations() { return this.data.police_stations; }

  getNearestStation(lat, lng) {
    const toRad = d => d * Math.PI / 180;
    let nearest = null;
    let minDist = Infinity;
    this.data.police_stations.forEach(s => {
      const dLat = toRad(s.lat - lat);
      const dLng = toRad(s.lng - lng);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(s.lat)) * Math.sin(dLng / 2) ** 2;
      const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (dist < minDist) { minDist = dist; nearest = s; }
    });
    return nearest ? { ...nearest, distance_km: Math.round(minDist * 10) / 10 } : null;
  }

  getDispatches(orphanageId, limit = 50) {
    let list = this.data.police_dispatches;
    if (orphanageId) list = list.filter(d => d.orphanage_id === parseInt(orphanageId));
    return list.sort((a, b) => new Date(b.dispatched_at) - new Date(a.dispatched_at)).slice(0, limit);
  }

  addDispatch(dispatch) {
    dispatch.id = this.nextId('police_dispatches');
    dispatch.dispatched_at = new Date().toISOString();
    dispatch.status = 'dispatched';
    this.data.police_dispatches.push(dispatch);
    if (this.data.police_dispatches.length > 500) this.data.police_dispatches = this.data.police_dispatches.slice(-250);
    this.save();
    return dispatch;
  }

  updateDispatch(id, updates) {
    const d = this.data.police_dispatches.find(x => x.id === parseInt(id));
    if (d) { Object.assign(d, updates); this.save(); }
    return d;
  }

  // Rankings
  getRankings() {
    return this.data.orphanages.map(o => {
      const incidents = this.data.incidents.filter(i => i.orphanage_id === o.id);
      const alerts = this.data.alerts.filter(a => a.orphanage_id === o.id);
      const openIncidents = incidents.filter(i => !i.reviewed).length;
      const criticalIncidents = incidents.filter(i => i.severity === 'critical' && !i.reviewed).length;
      const unresolvedAlerts = alerts.filter(a => !a.acknowledged).length;
      const totalIncidents = incidents.length;
      const reviewedIncidents = incidents.filter(i => i.reviewed).length;
      const responseRate = totalIncidents > 0 ? Math.round((reviewedIncidents / totalIncidents) * 100) : 100;
      const staffRatio = o.total_children > 0 ? (o.staff_count / o.total_children) : 0;
      const cameraCoverage = o.cameras > 0 ? Math.min(100, Math.round((o.cameras / Math.max(1, Math.ceil(o.total_children / 8))) * 100)) : 0;

      let score = 100;
      score -= criticalIncidents * 8;
      score -= openIncidents * 4;
      score -= unresolvedAlerts * 2;
      score -= (o.risk_level === 'high' ? 15 : o.risk_level === 'medium' ? 5 : 0);
      score += (responseRate >= 90 ? 5 : responseRate >= 70 ? 2 : 0);
      score += (staffRatio >= 0.3 ? 5 : staffRatio >= 0.2 ? 2 : 0);
      score += (cameraCoverage >= 80 ? 5 : cameraCoverage >= 50 ? 2 : 0);
      score -= (o.status === 'offline' ? 10 : 0);
      score = Math.max(0, Math.min(100, Math.round(score)));

      const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 50 ? 'D' : 'F';
      return {
        ...o, score, grade, responseRate, staffRatio: Math.round(staffRatio * 100),
        cameraCoverage, openIncidents, criticalIncidents, unresolvedAlerts,
        totalIncidents, reviewedIncidents
      };
    }).sort((a, b) => b.score - a.score).map((o, i) => ({ ...o, rank: i + 1 }));
  }

  // Stats
  getStats(orphanageId) {
    const filter = orphanageId ? parseInt(orphanageId) : null;
    return {
      totalChildren: this.data.children.filter(c => c.status === 'active' && (!filter || c.orphanage_id === filter)).length,
      activeVisitors: this.data.visitors.filter(v => v.status === 'checked_in' && (!filter || v.orphanage_id === filter)).length,
      pendingAlerts: this.data.alerts.filter(a => !a.acknowledged && (!filter || a.orphanage_id === filter)).length,
      openIncidents: this.data.incidents.filter(i => i.status === 'open' && (!filter || i.orphanage_id === filter)).length,
      zones: this.getZones(orphanageId),
      totalOrphanages: this.data.orphanages.length,
      onlineOrphanages: this.data.orphanages.filter(o => o.status === 'online').length,
    };
  }
}

module.exports = new Store();
