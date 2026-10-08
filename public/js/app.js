// State
let pendingAlerts = 0;
let openIncidents = 0;
let orphanages = [];
let currentFilter = '';
let ws;
let map;

// WebSocket
function connectWS() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${proto}//${location.host}`);
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    switch (data.type) {
      case 'zone_update': updateZoneCard(data.zone, data.count); break;
      case 'alert': handleNewAlert(data.alert); break;
      case 'alert_ack': markAlertAcknowledged(data.alertId); break;
      case 'incident': handleNewIncident(data.incident); break;
      case 'risk_update': updateOrphanageRisk(data.orphanage_id, data.risk_level); break;
      case 'visitor_checkin': case 'visitor_checkout': loadVisitors(); loadStats(); break;
      case 'child_added': loadChildren(); loadStats(); break;
    }
  };
  ws.onclose = () => setTimeout(connectWS, 3000);
  ws.onerror = () => ws.close();
}
connectWS();

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('page-' + item.dataset.page).classList.add('active');
    const page = item.dataset.page;
    if (page === 'map') initMap();
    if (page === 'cameras') initCameras();
    if (page === 'children') loadChildren();
    if (page === 'visitors') loadVisitors();
    if (page === 'alerts') loadAlerts();
    if (page === 'incidents') loadIncidents();
    if (page === 'activity') loadActivity();
  });
});

// Orphanage filter
document.getElementById('orphanage-filter').addEventListener('change', (e) => {
  currentFilter = e.target.value;
  loadStats();
  loadAlerts();
  const activePage = document.querySelector('.page-section.active');
  if (activePage) {
    const id = activePage.id.replace('page-', '');
    if (id === 'children') loadChildren();
    if (id === 'visitors') loadVisitors();
    if (id === 'incidents') loadIncidents();
    if (id === 'activity') loadActivity();
  }
});

// Clock
function updateClock() {
  const el = document.getElementById('live-time');
  if (el) el.textContent = new Date().toLocaleString('en-PK', { weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// Query helper
function qs(orphanageId) {
  return orphanageId ? `?orphanage_id=${orphanageId}` : '';
}

// Load orphanages
async function loadOrphanages() {
  try {
    const res = await fetch('/api/orphanages');
    orphanages = await res.json();
    const filter = document.getElementById('orphanage-filter');
    filter.innerHTML = '<option value="">All Orphanages</option>' +
      orphanages.map(o => `<option value="${o.id}">${o.name} - ${o.city}</option>`).join('');
    document.querySelectorAll('.orphanage-select').forEach(sel => {
      sel.innerHTML = orphanages.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    });
    renderOrphanageGrid();
  } catch (e) { console.error(e); }
}

function renderOrphanageGrid() {
  const grid = document.getElementById('orphanage-grid');
  if (!grid) return;
  grid.innerHTML = orphanages.map(o => `
    <div class="orphanage-card" onclick="document.getElementById('orphanage-filter').value='${o.id}';document.getElementById('orphanage-filter').dispatchEvent(new Event('change'))">
      <div class="oc-header">
        <div>
          <div class="oc-name"><span class="status-dot ${o.status}"></span> ${o.name}</div>
          <div class="oc-city">${o.city}, ${o.district}</div>
        </div>
        <span class="risk-badge ${o.risk_level}">${o.risk_level} risk</span>
      </div>
      <div class="oc-stats">
        <div class="oc-stat"><div class="oc-stat-val">${o.total_children}</div><div class="oc-stat-label">Children</div></div>
        <div class="oc-stat"><div class="oc-stat-val">${o.staff_count}</div><div class="oc-stat-label">Staff</div></div>
        <div class="oc-stat"><div class="oc-stat-val">${o.cameras}</div><div class="oc-stat-label">Cameras</div></div>
      </div>
    </div>
  `).join('');
}

function updateOrphanageRisk(id, level) {
  const o = orphanages.find(x => x.id === id);
  if (o) { o.risk_level = level; renderOrphanageGrid(); }
}

// Stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats' + qs(currentFilter));
    const d = await res.json();
    document.getElementById('stat-children').textContent = d.totalChildren;
    document.getElementById('stat-visitors').textContent = d.activeVisitors;
    document.getElementById('stat-alerts').textContent = d.pendingAlerts;
    document.getElementById('stat-incidents').textContent = d.openIncidents;
    document.getElementById('stat-orphanages').textContent = d.totalOrphanages;
    document.getElementById('stat-online').textContent = d.onlineOrphanages;
    pendingAlerts = d.pendingAlerts;
    openIncidents = d.openIncidents;
    updateBadges();
  } catch (e) { console.error(e); }
}

function updateBadges() {
  const ab = document.getElementById('alert-badge');
  ab.style.display = pendingAlerts > 0 ? 'inline' : 'none';
  ab.textContent = pendingAlerts;
  const ib = document.getElementById('incident-badge');
  ib.style.display = openIncidents > 0 ? 'inline' : 'none';
  ib.textContent = openIncidents;
}

// Zone updates
function updateZoneCard(zoneName, count) {
  document.querySelectorAll('.zone-card').forEach(card => {
    if (card.querySelector('.zone-name')?.textContent.trim() === zoneName)
      card.querySelector('.zone-count').textContent = count;
  });
}

// Alerts
function renderAlertItem(a) {
  const time = new Date(a.created_at).toLocaleTimeString('en-PK');
  return `<div class="alert-item ${a.acknowledged ? 'acknowledged' : ''}" id="alert-${a.id}">
    <div class="alert-severity ${a.severity}"></div>
    <div class="alert-content">
      <div class="alert-msg">${a.message}</div>
      <div class="alert-time">${a.type.replace(/_/g, ' ').toUpperCase()} &middot; ${time}</div>
    </div>
    <div class="alert-actions">
      ${!a.acknowledged ? `<button class="btn-ack" onclick="acknowledgeAlert(${a.id})">Acknowledge</button>` : '<span style="color:var(--success);font-size:12px">Resolved</span>'}
    </div>
  </div>`;
}

function handleNewAlert(alert) {
  if (currentFilter && alert.orphanage_id !== parseInt(currentFilter)) return;
  pendingAlerts++;
  updateBadges();
  document.getElementById('stat-alerts').textContent = pendingAlerts;
  const list = document.getElementById('alerts-list');
  if (list.children.length > 0) list.insertAdjacentHTML('afterbegin', renderAlertItem(alert));
}

async function loadAlerts() {
  try {
    const res = await fetch('/api/alerts' + qs(currentFilter));
    const alerts = await res.json();
    document.getElementById('alerts-list').innerHTML = alerts.map(renderAlertItem).join('');
  } catch (e) { console.error(e); }
}

async function acknowledgeAlert(id) {
  await fetch(`/api/alerts/${id}/acknowledge`, { method: 'PUT' });
  pendingAlerts = Math.max(0, pendingAlerts - 1);
  updateBadges();
  document.getElementById('stat-alerts').textContent = pendingAlerts;
}

function markAlertAcknowledged(id) {
  const el = document.getElementById('alert-' + id);
  if (el) { el.classList.add('acknowledged'); const btn = el.querySelector('.btn-ack'); if (btn) btn.outerHTML = '<span style="color:var(--success);font-size:12px">Resolved</span>'; }
}

// Incidents (Violence/Harassment Detection)
const incidentIcons = {
  physical_violence: '&#9994;', verbal_abuse: '&#128483;', harassment: '&#9888;',
  bullying: '&#128544;', neglect: '&#128557;', distress: '&#128546;',
  rough_handling: '&#9995;', unauthorized_contact: '&#128683;'
};

function renderIncidentItem(i) {
  const time = new Date(i.detected_at).toLocaleString('en-PK');
  const icon = incidentIcons[i.type] || '&#9888;';
  const confColor = i.confidence > 85 ? 'var(--danger)' : i.confidence > 70 ? 'var(--warning)' : 'var(--accent)';
  return `<div class="incident-item ${i.severity} ${i.reviewed ? 'reviewed' : ''}" onclick="viewIncident(${i.id})">
    <div class="incident-icon ${i.severity}">${icon}</div>
    <div class="incident-content">
      <div class="inc-label">${i.label}</div>
      <div class="inc-desc">${i.description}</div>
      <div class="inc-meta">
        <span>&#128337; ${time}</span>
        <span>&#129302; ${i.ai_model}</span>
        <span>Confidence: <span class="confidence-bar"><span class="fill" style="width:${i.confidence}%;background:${confColor}"></span></span> ${i.confidence}%</span>
        <span>&#127909; ${i.frame_count} frames</span>
      </div>
    </div>
    <div style="text-align:right">
      <span class="risk-badge ${i.severity}">${i.severity}</span>
      ${i.reviewed ? '<div style="color:var(--success);font-size:11px;margin-top:6px">Reviewed</div>' : '<div style="color:var(--warning);font-size:11px;margin-top:6px">Pending Review</div>'}
    </div>
  </div>`;
}

function handleNewIncident(incident) {
  if (currentFilter && incident.orphanage_id !== parseInt(currentFilter)) return;
  openIncidents++;
  updateBadges();
  document.getElementById('stat-incidents').textContent = openIncidents;
  const cmdList = document.getElementById('command-incidents');
  if (cmdList) { cmdList.insertAdjacentHTML('afterbegin', renderIncidentItem(incident)); if (cmdList.children.length > 5) cmdList.lastChild.remove(); }
  const list = document.getElementById('incidents-list');
  if (list.children.length > 0) list.insertAdjacentHTML('afterbegin', renderIncidentItem(incident));
  if (incident.severity === 'critical' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('CRITICAL: ' + incident.label, { body: incident.description });
  }
}

async function loadIncidents() {
  try {
    const res = await fetch('/api/incidents' + qs(currentFilter));
    const incidents = await res.json();
    document.getElementById('incidents-list').innerHTML = incidents.map(renderIncidentItem).join('') || '<p style="color:var(--text-secondary);padding:20px">No incidents detected yet.</p>';
    document.getElementById('command-incidents').innerHTML = incidents.slice(0, 5).map(renderIncidentItem).join('');

    const types = {};
    incidents.forEach(i => { types[i.type] = (types[i.type] || 0) + 1; });
    const critical = incidents.filter(i => i.severity === 'critical' && !i.reviewed).length;
    const reviewed = incidents.filter(i => i.reviewed).length;
    const avgConf = incidents.length > 0 ? (incidents.reduce((s, i) => s + i.confidence, 0) / incidents.length).toFixed(1) : 0;
    document.getElementById('detection-stats').innerHTML = `
      <div class="det-stat"><div class="det-val" style="color:var(--danger)">${critical}</div><div class="det-label">Critical Open</div></div>
      <div class="det-stat"><div class="det-val" style="color:var(--warning)">${incidents.length - reviewed}</div><div class="det-label">Pending Review</div></div>
      <div class="det-stat"><div class="det-val" style="color:var(--success)">${reviewed}</div><div class="det-label">Reviewed</div></div>
      <div class="det-stat"><div class="det-val" style="color:var(--accent)">${avgConf}%</div><div class="det-label">Avg Confidence</div></div>
    `;
  } catch (e) { console.error(e); }
}

async function viewIncident(id) {
  try {
    const res = await fetch('/api/incidents');
    const incidents = await res.json();
    const i = incidents.find(x => x.id === id);
    if (!i) return;
    const confColor = i.confidence > 85 ? 'var(--danger)' : i.confidence > 70 ? 'var(--warning)' : 'var(--accent)';
    document.getElementById('incident-detail').innerHTML = `
      <div style="margin-bottom:16px">
        <span class="risk-badge ${i.severity}" style="font-size:12px">${i.severity.toUpperCase()}</span>
        <span style="margin-left:8px;font-size:11px;color:var(--text-secondary)">${i.reviewed ? 'REVIEWED' : 'PENDING REVIEW'}</span>
      </div>
      <h4 style="margin-bottom:8px">${i.label}</h4>
      <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">${i.description}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
        <div><strong>Detection Model:</strong> ${i.ai_model}</div>
        <div><strong>Confidence:</strong> <span class="confidence-bar" style="width:80px"><span class="fill" style="width:${i.confidence}%;background:${confColor}"></span></span> ${i.confidence}%</div>
        <div><strong>Frames Analyzed:</strong> ${i.frame_count}</div>
        <div><strong>Zone:</strong> ${i.zone || 'N/A'}</div>
        <div><strong>Orphanage:</strong> ${i.orphanage_name || 'N/A'}</div>
        <div><strong>Detected:</strong> ${new Date(i.detected_at).toLocaleString('en-PK')}</div>
      </div>
    `;
    const btn = document.getElementById('btn-review-incident');
    btn.onclick = async () => {
      await fetch(`/api/incidents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'reviewed', reviewed: true }) });
      closeModal('incident-modal');
      loadIncidents();
      loadStats();
    };
    btn.textContent = i.reviewed ? 'Already Reviewed' : 'Mark as Reviewed';
    btn.disabled = i.reviewed;
    openModal('incident-modal');
  } catch (e) { console.error(e); }
}

// Map
function initMap() {
  if (map) { map.invalidateSize(); return; }
  map = L.map('punjab-map').setView([31.5, 73.0], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  orphanages.forEach(o => {
    const color = o.risk_level === 'high' ? '#ef4444' : o.risk_level === 'medium' ? '#fbbf24' : '#34d399';
    const icon = L.divIcon({
      html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}"></div>`,
      className: '', iconSize: [14, 14], iconAnchor: [7, 7]
    });
    L.marker([o.lat, o.lng], { icon }).addTo(map).bindPopup(`
      <strong>${o.name}</strong><br>
      ${o.city}, ${o.district}<br>
      <span style="color:${o.status === 'online' ? '#34d399' : '#ef4444'}">${o.status.toUpperCase()}</span><br>
      Children: ${o.total_children} | Staff: ${o.staff_count} | Cameras: ${o.cameras}<br>
      Risk: <span style="color:${color};font-weight:700">${o.risk_level.toUpperCase()}</span>
    `);
  });

  setTimeout(() => map.invalidateSize(), 200);
}

// Children
async function loadChildren() {
  try {
    const res = await fetch('/api/children' + qs(currentFilter));
    const children = await res.json();
    const getOrg = (id) => { const o = orphanages.find(x => x.id === id); return o ? o.name : '-'; };
    document.getElementById('children-table').innerHTML = children.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td><td>${c.age}</td><td>${c.gender}</td>
        <td>${getOrg(c.orphanage_id)}</td>
        <td>${new Date(c.admitted_date).toLocaleDateString('en-PK')}</td>
        <td>${c.medical_notes || '-'}</td>
        <td><button class="btn btn-outline btn-sm" onclick="viewHealth(${c.id},'${c.name}')">Health</button></td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

async function addChild(e) {
  e.preventDefault();
  const form = e.target;
  await fetch('/api/children', { method: 'POST', body: new FormData(form) });
  form.reset(); closeModal('child-modal'); loadChildren(); loadStats();
}

async function viewHealth(childId, name) {
  document.getElementById('health-child-id').value = childId;
  const res = await fetch(`/api/children/${childId}/health`);
  const records = await res.json();
  const modal = document.getElementById('health-modal');
  modal.querySelector('h3').textContent = `Health Records - ${name}`;
  const existing = modal.querySelector('.health-timeline');
  if (existing) existing.remove();
  let html = '<div class="health-timeline">';
  if (!records.length) html += '<p style="color:var(--text-secondary);font-size:13px">No records yet.</p>';
  else html += records.map(r => `<div class="timeline-item"><div class="timeline-date">${new Date(r.record_date).toLocaleDateString('en-PK')}</div><div class="timeline-type">${r.record_type}</div><div class="timeline-desc">${r.description}${r.doctor_name ? ' - Dr. ' + r.doctor_name : ''}</div>${r.next_due ? `<div class="timeline-desc" style="color:var(--warning)">Next: ${new Date(r.next_due).toLocaleDateString('en-PK')}</div>` : ''}</div>`).join('');
  html += '</div>';
  document.getElementById('health-form').insertAdjacentHTML('beforebegin', html);
  openModal('health-modal');
}

async function addHealthRecord(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const childId = data.child_id; delete data.child_id;
  await fetch(`/api/children/${childId}/health`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  closeModal('health-modal'); form.reset();
}

// Visitors
async function loadVisitors() {
  try {
    const res = await fetch('/api/visitors' + qs(currentFilter));
    const visitors = await res.json();
    const getOrg = (id) => { const o = orphanages.find(x => x.id === id); return o ? o.name : '-'; };
    document.getElementById('visitors-table').innerHTML = visitors.map(v => `
      <tr>
        <td><strong>${v.name}</strong></td><td>${v.cnic || '-'}</td><td>${v.phone || '-'}</td><td>${v.purpose}</td>
        <td>${getOrg(v.orphanage_id)}</td>
        <td>${new Date(v.check_in).toLocaleString('en-PK')}</td>
        <td><span class="badge-status ${v.status}">${v.status.replace('_', ' ')}</span></td>
        <td>${v.status === 'checked_in' ? `<button class="btn btn-outline btn-sm" onclick="checkoutVisitor(${v.id})">Check Out</button>` : ''}</td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

async function addVisitor(e) {
  e.preventDefault();
  const form = e.target;
  await fetch('/api/visitors', { method: 'POST', body: new FormData(form) });
  form.reset(); closeModal('visitor-modal'); loadVisitors(); loadStats();
}

async function checkoutVisitor(id) {
  await fetch(`/api/visitors/${id}/checkout`, { method: 'PUT' });
  loadVisitors(); loadStats();
}

// Cameras
function initCameras() {
  const grid = document.getElementById('camera-grid');
  const zones = ['Main Hall', 'Main Gate', 'Garden', 'Kitchen'];
  grid.innerHTML = zones.map((zone, i) => `
    <div class="camera-feed">
      <div class="feed-header"><span>${zone}</span><div class="live-dot"></div></div>
      <div class="feed-body" id="feed-${i}">
        ${i === 0 ? '<video id="cam-live" autoplay muted playsinline></video>' : '<div class="no-feed"><span style="font-size:32px">&#128247;</span>Simulated Feed</div>'}
        <div class="feed-overlay"><span>AI Detection: Active</span><span id="feed-count-${i}">Persons: 0</span></div>
      </div>
    </div>
  `).join('');
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
    .then(stream => { const v = document.getElementById('cam-live'); if (v) v.srcObject = stream; startDetectionSim(); })
    .catch(() => {
      const f = document.getElementById('feed-0');
      if (f) f.innerHTML = '<div class="no-feed"><span style="font-size:32px">&#128247;</span>Camera unavailable</div><div class="feed-overlay"><span>AI: Simulated</span><span id="feed-count-0">Persons: 0</span></div>';
      startDetectionSim();
    });
}

function startDetectionSim() {
  setInterval(() => {
    for (let i = 0; i < 4; i++) { const el = document.getElementById('feed-count-' + i); if (el) el.textContent = 'Persons: ' + Math.floor(Math.random() * 8); }
    const feed = document.getElementById('feed-0');
    if (feed) {
      feed.querySelectorAll('.detection-box').forEach(b => b.remove());
      for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
        const box = document.createElement('div');
        box.className = 'detection-box';
        box.style.cssText = `left:${10 + Math.random() * 50}%;top:${10 + Math.random() * 40}%;width:${60 + Math.random() * 40}px;height:${80 + Math.random() * 40}px`;
        box.innerHTML = `<div class="det-label">Person ${(Math.random() * 100).toFixed(0)}%</div>`;
        feed.appendChild(box);
      }
    }
  }, 3000);
}

// Activity
async function loadActivity() {
  try {
    const res = await fetch('/api/activity' + qs(currentFilter));
    const activities = await res.json();
    const icons = {
      visitor_entry: { icon: '&#128694;', bg: 'rgba(79,140,255,0.15)' },
      ai_detection: { icon: '&#129302;', bg: 'rgba(239,68,68,0.15)' },
      headcount_mismatch: { icon: '&#9888;', bg: 'rgba(251,191,36,0.15)' },
      restricted_zone: { icon: '&#128683;', bg: 'rgba(248,113,113,0.15)' },
      perimeter_breach: { icon: '&#128680;', bg: 'rgba(239,68,68,0.15)' },
      child_missing: { icon: '&#128557;', bg: 'rgba(239,68,68,0.15)' },
    };
    document.getElementById('activity-feed').innerHTML = activities.map(a => {
      const cfg = icons[a.event_type] || { icon: '&#128196;', bg: 'rgba(154,160,166,0.15)' };
      return `<div class="activity-item"><div class="activity-icon" style="background:${cfg.bg}">${cfg.icon}</div><div>${a.description}</div><div class="activity-time">${new Date(a.created_at).toLocaleTimeString('en-PK')}</div></div>`;
    }).join('') || '<p style="color:var(--text-secondary);padding:20px">No activity yet.</p>';
  } catch (e) { console.error(e); }
}

// Modals
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'health-modal') { const t = document.querySelector('#health-modal .health-timeline'); if (t) t.remove(); }
}
document.querySelectorAll('.modal-overlay').forEach(o => { o.addEventListener('click', (e) => { if (e.target === o) closeModal(o.id); }); });

// Notifications
if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();

// Init
loadOrphanages();
loadStats();
loadIncidents();
