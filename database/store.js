const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  children: [
    { id: 1, name: 'Ahmed Khan', age: 8, gender: 'Male', photo_url: null, admitted_date: '2024-01-15', medical_notes: 'Healthy, regular checkups', status: 'active', created_at: new Date().toISOString() },
    { id: 2, name: 'Fatima Ali', age: 6, gender: 'Female', photo_url: null, admitted_date: '2024-03-20', medical_notes: 'Mild asthma, inhaler prescribed', status: 'active', created_at: new Date().toISOString() },
    { id: 3, name: 'Hassan Raza', age: 10, gender: 'Male', photo_url: null, admitted_date: '2023-11-01', medical_notes: 'No known conditions', status: 'active', created_at: new Date().toISOString() },
    { id: 4, name: 'Ayesha Bibi', age: 7, gender: 'Female', photo_url: null, admitted_date: '2024-05-10', medical_notes: 'Allergic to peanuts', status: 'active', created_at: new Date().toISOString() },
    { id: 5, name: 'Usman Tariq', age: 9, gender: 'Male', photo_url: null, admitted_date: '2023-08-22', medical_notes: 'Wears glasses, annual eye checkup', status: 'active', created_at: new Date().toISOString() },
    { id: 6, name: 'Zainab Noor', age: 5, gender: 'Female', photo_url: null, admitted_date: '2024-07-01', medical_notes: 'Vaccinations up to date', status: 'active', created_at: new Date().toISOString() },
    { id: 7, name: 'Bilal Ahmed', age: 11, gender: 'Male', photo_url: null, admitted_date: '2023-06-15', medical_notes: 'Fractured arm (healed)', status: 'active', created_at: new Date().toISOString() },
    { id: 8, name: 'Sana Malik', age: 8, gender: 'Female', photo_url: null, admitted_date: '2024-02-28', medical_notes: 'Regular dental checkups needed', status: 'active', created_at: new Date().toISOString() },
  ],
  health_records: [],
  visitors: [],
  alerts: [],
  zones: [
    { id: 1, name: 'Main Hall', description: 'Central play and activity area', camera_url: null, expected_count: 15, current_count: 0, status: 'active' },
    { id: 2, name: 'Dormitory A', description: 'Boys sleeping quarters', camera_url: null, expected_count: 10, current_count: 0, status: 'active' },
    { id: 3, name: 'Dormitory B', description: 'Girls sleeping quarters', camera_url: null, expected_count: 10, current_count: 0, status: 'active' },
    { id: 4, name: 'Kitchen', description: 'Food preparation area - restricted', camera_url: null, expected_count: 3, current_count: 0, status: 'active' },
    { id: 5, name: 'Garden', description: 'Outdoor play area', camera_url: null, expected_count: 12, current_count: 0, status: 'active' },
    { id: 6, name: 'Main Gate', description: 'Entry and exit point', camera_url: null, expected_count: 0, current_count: 0, status: 'active' },
    { id: 7, name: 'Study Room', description: 'Homework and tutoring area', camera_url: null, expected_count: 8, current_count: 0, status: 'active' },
  ],
  activity_log: [],
  counters: { children: 8, health_records: 0, visitors: 0, alerts: 0, activity_log: 0 }
};

class Store {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      }
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(defaultData));
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('Failed to save data:', e.message);
    }
  }

  nextId(table) {
    this.data.counters[table] = (this.data.counters[table] || 0) + 1;
    return this.data.counters[table];
  }

  // Children
  getChildren() {
    return this.data.children.filter(c => c.status === 'active').sort((a, b) => a.name.localeCompare(b.name));
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
    if (child) {
      Object.assign(child, updates);
      this.save();
    }
    return child;
  }

  // Health records
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
  getVisitors(limit = 50) {
    return this.data.visitors
      .sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
      .slice(0, limit);
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
    if (visitor) {
      visitor.check_out = new Date().toISOString();
      visitor.status = 'checked_out';
      this.save();
    }
    return visitor;
  }

  // Alerts
  getAlerts(limit = 50) {
    return this.data.alerts
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
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
    if (alert) {
      alert.acknowledged = true;
      this.save();
    }
    return alert;
  }

  // Zones
  getZones() {
    return this.data.zones.sort((a, b) => a.id - b.id);
  }

  updateZoneCount(zoneName, count) {
    const zone = this.data.zones.find(z => z.name === zoneName);
    if (zone) zone.current_count = count;
  }

  // Activity log
  getActivity(limit = 30) {
    return this.data.activity_log
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
      .map(a => {
        const zone = this.data.zones.find(z => z.id === a.zone_id);
        return { ...a, zone_name: zone ? zone.name : null };
      });
  }

  addActivity(event) {
    event.id = this.nextId('activity_log');
    event.created_at = new Date().toISOString();
    this.data.activity_log.push(event);
    if (this.data.activity_log.length > 200) {
      this.data.activity_log = this.data.activity_log.slice(-100);
    }
    this.save();
    return event;
  }

  // Stats
  getStats() {
    return {
      totalChildren: this.data.children.filter(c => c.status === 'active').length,
      activeVisitors: this.data.visitors.filter(v => v.status === 'checked_in').length,
      pendingAlerts: this.data.alerts.filter(a => !a.acknowledged).length,
      zones: this.getZones()
    };
  }
}

module.exports = new Store();
