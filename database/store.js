const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  orphanages: [
    { id: 1, name: 'SOS Children\'s Village Lahore', city: 'Lahore', district: 'Lahore', address: 'Ferozepur Road, Lahore 54600', lat: 31.4505, lng: 74.3150, total_children: 150, staff_count: 45, cameras: 24, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'SOS Children\'s Villages Pakistan' },
    { id: 2, name: 'Edhi Home Lahore', city: 'Lahore', district: 'Lahore', address: '17-A Muslim Block, Allama Iqbal Town, Lahore', lat: 31.5082, lng: 74.2891, total_children: 85, staff_count: 22, cameras: 14, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Edhi Foundation', org: 'Edhi Foundation' },
    { id: 3, name: 'Al-Khidmat Aghosh Home Rawalpindi', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Satellite Town, Rawalpindi', lat: 33.5916, lng: 73.0550, total_children: 60, staff_count: 18, cameras: 12, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 4, name: 'Al-Khidmat Aghosh Home Faisalabad', city: 'Faisalabad', district: 'Faisalabad', address: 'Peoples Colony No. 1, Faisalabad', lat: 31.4290, lng: 73.0840, total_children: 55, staff_count: 15, cameras: 10, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 5, name: 'Pakistan Sweet Home Islamabad', city: 'Islamabad', district: 'Islamabad', address: 'Sector G-9/1, Islamabad', lat: 33.7070, lng: 73.0420, total_children: 200, staff_count: 50, cameras: 32, status: 'online', risk_level: 'low', registered: true, reg_authority: 'ICT Administration', org: 'Pakistan Sweet Home' },
    { id: 6, name: 'Child Protection & Welfare Bureau Lahore', city: 'Lahore', district: 'Lahore', address: 'Jallo Mor, Lahore', lat: 31.5875, lng: 74.3949, total_children: 120, staff_count: 35, cameras: 20, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Home Dept (Govt)', org: 'CPWB Punjab' },
    { id: 7, name: 'Al-Khidmat Aghosh Home Gujranwala', city: 'Gujranwala', district: 'Gujranwala', address: 'Civil Lines, Gujranwala', lat: 32.1617, lng: 74.1883, total_children: 42, staff_count: 11, cameras: 8, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept', org: 'Al-Khidmat Foundation' },
    { id: 8, name: 'Kashana Dar-ul-Atfal Lahore', city: 'Lahore', district: 'Lahore', address: 'Gulberg III, Lahore', lat: 31.5195, lng: 74.3480, total_children: 75, staff_count: 20, cameras: 12, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 9, name: 'Kashana Rawalpindi', city: 'Rawalpindi', district: 'Rawalpindi', address: 'Committee Chowk, Rawalpindi', lat: 33.5977, lng: 73.0479, total_children: 50, staff_count: 14, cameras: 8, status: 'online', risk_level: 'medium', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
    { id: 10, name: 'Kashana Sargodha', city: 'Sargodha', district: 'Sargodha', address: 'University Road, Sargodha', lat: 32.0836, lng: 72.6711, total_children: 35, staff_count: 10, cameras: 6, status: 'online', risk_level: 'low', registered: true, reg_authority: 'Punjab Social Welfare Dept (Govt)', org: 'Social Welfare Dept Punjab' },
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
    { id: 1, name: 'Mozang Police Station', city: 'Lahore', phone: '042-37230015', lat: 31.5460, lng: 74.3370, address: 'Mozang, Lahore' },
    { id: 2, name: 'Iqbal Town Police Station', city: 'Lahore', phone: '042-35430012', lat: 31.5100, lng: 74.2850, address: 'Allama Iqbal Town, Lahore' },
    { id: 3, name: 'Satellite Town Police Station', city: 'Rawalpindi', phone: '051-9290003', lat: 33.5940, lng: 73.0580, address: 'Satellite Town, Rawalpindi' },
    { id: 4, name: 'Peoples Colony Police Station', city: 'Faisalabad', phone: '041-8730004', lat: 31.4310, lng: 73.0860, address: 'Peoples Colony, Faisalabad' },
    { id: 5, name: 'Margalla Police Station', city: 'Islamabad', phone: '051-9261006', lat: 33.7090, lng: 73.0450, address: 'G-9, Islamabad' },
    { id: 6, name: 'Jallo Mor Police Post', city: 'Lahore', phone: '042-35310099', lat: 31.5890, lng: 74.3900, address: 'Jallo Mor, Grand Trunk Road, Lahore' },
    { id: 7, name: 'Civil Lines Police Station', city: 'Gujranwala', phone: '055-9200007', lat: 32.1630, lng: 74.1900, address: 'Civil Lines, Gujranwala' },
    { id: 8, name: 'Gulberg Police Station', city: 'Lahore', phone: '042-35761002', lat: 31.5210, lng: 74.3500, address: 'Gulberg III, Lahore' },
    { id: 9, name: 'City Police Station', city: 'Rawalpindi', phone: '051-9270019', lat: 33.5990, lng: 73.0500, address: 'Committee Chowk, Rawalpindi' },
    { id: 10, name: 'University Road Police Station', city: 'Sargodha', phone: '048-9230010', lat: 32.0850, lng: 72.6730, address: 'University Road, Sargodha' },
  ],
  police_dispatches: [
    { id: 1, incident_id: 101, incident_type: 'physical_violence', incident_label: 'Physical Violence', severity: 'critical', orphanage_id: 7, orphanage_name: 'Al-Khidmat Aghosh Home Gujranwala', orphanage_address: 'Civil Lines, Gujranwala', orphanage_lat: 32.1617, orphanage_lng: 74.1883, station_id: 7, station_name: 'Civil Lines Police Station', station_phone: '055-9200007', station_address: 'Civil Lines, Gujranwala', distance_km: 0.2, zone: 'Main Hall', confidence: 94.3, status: 'on_scene', dispatched_at: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: 2, incident_id: 102, incident_type: 'harassment', incident_label: 'Harassment', severity: 'critical', orphanage_id: 1, orphanage_name: 'SOS Children\'s Village Lahore', orphanage_address: 'Ferozepur Road, Lahore 54600', orphanage_lat: 31.4505, orphanage_lng: 74.3150, station_id: 1, station_name: 'Mozang Police Station', station_phone: '042-37230015', station_address: 'Mozang, Lahore', distance_km: 1.8, zone: 'Garden', confidence: 87.6, status: 'responding', dispatched_at: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 3, incident_id: 103, incident_type: 'unauthorized_contact', incident_label: 'Unauthorized Contact', severity: 'critical', orphanage_id: 5, orphanage_name: 'Pakistan Sweet Home Islamabad', orphanage_address: 'Sector G-9/1, Islamabad', orphanage_lat: 33.7070, orphanage_lng: 73.0420, station_id: 5, station_name: 'Margalla Police Station', station_phone: '051-9261006', station_address: 'G-9, Islamabad', distance_km: 0.3, zone: 'Main Gate', confidence: 91.2, status: 'dispatched', dispatched_at: new Date(Date.now() - 3 * 60000).toISOString() },
    { id: 4, incident_id: 104, incident_type: 'physical_violence', incident_label: 'Physical Violence', severity: 'critical', orphanage_id: 4, orphanage_name: 'Al-Khidmat Aghosh Home Faisalabad', orphanage_address: 'Peoples Colony No. 1, Faisalabad', orphanage_lat: 31.4290, orphanage_lng: 73.0840, station_id: 4, station_name: 'Peoples Colony Police Station', station_phone: '041-8730004', station_address: 'Peoples Colony, Faisalabad', distance_km: 0.3, zone: 'Dormitory A', confidence: 82.9, status: 'resolved', dispatched_at: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 5, incident_id: 105, incident_type: 'harassment', incident_label: 'Harassment', severity: 'critical', orphanage_id: 2, orphanage_name: 'Edhi Home Lahore', orphanage_address: '17-A Muslim Block, Allama Iqbal Town, Lahore', orphanage_lat: 31.5082, orphanage_lng: 74.2891, station_id: 2, station_name: 'Iqbal Town Police Station', station_phone: '042-35430012', station_address: 'Allama Iqbal Town, Lahore', distance_km: 0.3, zone: 'Kitchen', confidence: 78.5, status: 'resolved', dispatched_at: new Date(Date.now() - 180 * 60000).toISOString() },
    { id: 6, incident_id: 106, incident_type: 'unauthorized_contact', incident_label: 'Unauthorized Contact', severity: 'critical', orphanage_id: 8, orphanage_name: 'Kashana Dar-ul-Atfal Lahore', orphanage_address: 'Gulberg III, Lahore', orphanage_lat: 31.5195, orphanage_lng: 74.3480, station_id: 8, station_name: 'Gulberg Police Station', station_phone: '042-35761008', station_address: 'Gulberg, Lahore', distance_km: 0.4, zone: 'Main Gate', confidence: 96.1, status: 'resolved', dispatched_at: new Date(Date.now() - 240 * 60000).toISOString() },
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
