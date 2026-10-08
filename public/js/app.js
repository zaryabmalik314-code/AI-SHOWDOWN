// State
let pendingAlerts = 0;
let openIncidents = 0;
let orphanages = [];
let currentFilter = '';
let ws;
let map;
let cachedChildren = [];
let cachedVisitors = [];
let cachedAlerts = [];
let cachedIncidents = [];
let cachedActivities = [];

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
      case 'emotion_detection': handleEmotionDetection(data.detection); break;
      case 'notification': handleNewNotification(data.notification); break;
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
    if (page === 'rankings') loadRankings();
    if (page === 'portal') loadPortal();
    if (page === 'activity') loadActivity();
    if (page === 'analytics') loadAnalytics();
    if (page === 'emotions') loadEmotions();
    if (page === 'anomalies') loadAnomalies();
    if (page === 'briefing') loadBriefing();
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
    await loadOrphanageIndicators();
    renderOrphanageGrid();
    updateStatusBar();
  } catch (e) { console.error(e); }
}

function updateStatusBar() {
  const online = orphanages.filter(o => o.status === 'online').length;
  const totalCameras = orphanages.reduce((s, o) => s + o.cameras, 0);
  const highRisk = orphanages.filter(o => o.risk_level === 'high').length;
  const el = document.getElementById('ssb-cameras');
  if (el) el.textContent = totalCameras + ' active';
  const onlineEl = document.getElementById('ssb-online-count');
  if (onlineEl) onlineEl.textContent = online + '/' + orphanages.length + ' sites online';
  const threatEl = document.getElementById('ssb-threat');
  if (threatEl) {
    if (highRisk > 2) { threatEl.textContent = 'Elevated'; threatEl.style.color = 'var(--danger)'; }
    else if (highRisk > 0) { threatEl.textContent = 'Guarded'; threatEl.style.color = 'var(--warning)'; }
    else { threatEl.textContent = 'Normal'; threatEl.style.color = 'var(--success)'; }
  }
}

let orphanageAlertCounts = {};
let orphanageIncidentCounts = {};

let orphanageRankings = {};

async function loadOrphanageIndicators() {
  try {
    const [alertsRes, incidentsRes, rankingsRes] = await Promise.all([
      fetch('/api/alerts'), fetch('/api/incidents'), fetch('/api/rankings')
    ]);
    const [alerts, incidents, rankings] = await Promise.all([alertsRes.json(), incidentsRes.json(), rankingsRes.json()]);
    orphanageAlertCounts = {};
    orphanageIncidentCounts = {};
    orphanageRankings = {};
    alerts.filter(a => !a.acknowledged).forEach(a => {
      orphanageAlertCounts[a.orphanage_id] = (orphanageAlertCounts[a.orphanage_id] || 0) + 1;
    });
    incidents.filter(i => !i.reviewed).forEach(i => {
      orphanageIncidentCounts[i.orphanage_id] = (orphanageIncidentCounts[i.orphanage_id] || 0) + 1;
    });
    rankings.forEach(r => { orphanageRankings[r.id] = r; });
  } catch (e) { /* ignore */ }
}

function renderOrphanageGrid(filter) {
  const grid = document.getElementById('orphanage-grid');
  if (!grid) return;
  let list = orphanages;
  if (filter) {
    const q = filter.toLowerCase();
    list = orphanages.filter(o => o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q) || o.district.toLowerCase().includes(q));
  }
  grid.innerHTML = list.map(o => {
    const alertCount = orphanageAlertCounts[o.id] || 0;
    const incidentCount = orphanageIncidentCounts[o.id] || 0;
    const rank = orphanageRankings[o.id];
    const gradeColor = rank ? (rank.grade === 'A' ? 'var(--success)' : rank.grade === 'B' ? 'var(--accent)' : rank.grade === 'C' ? 'var(--warning)' : 'var(--danger)') : 'var(--text-secondary)';
    return `
    <div class="orphanage-card" onclick="openOrphanageDetail(${o.id})">
      <div class="oc-header">
        <div>
          <div class="oc-name"><span class="status-dot ${o.status}"></span> ${o.name}</div>
          <div class="oc-city">${o.city}, ${o.district}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${rank ? `<div class="oc-grade" style="color:${gradeColor};border-color:${gradeColor}">${rank.grade}</div>` : ''}
          <span class="risk-badge ${o.risk_level}">${o.risk_level} risk</span>
        </div>
      </div>
      ${rank ? `<div class="oc-score-row">
        <span class="oc-rank">#${rank.rank}</span>
        <div class="oc-score-bar"><div class="oc-score-fill" style="width:${rank.score}%;background:${gradeColor}"></div></div>
        <span class="oc-score-text" style="color:${gradeColor}">${rank.score}</span>
      </div>` : ''}
      ${(alertCount > 0 || incidentCount > 0) ? `<div class="oc-indicators">
        ${alertCount > 0 ? `<span class="oc-indicator alerts"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg> ${alertCount} alert${alertCount > 1 ? 's' : ''}</span>` : ''}
        ${incidentCount > 0 ? `<span class="oc-indicator incidents"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M3.26 19h17.48a1 1 0 0 0 .87-1.5L13.37 3.5a1 1 0 0 0-1.74 0L3.39 17.5a1 1 0 0 0 .87 1.5z"/></svg> ${incidentCount} incident${incidentCount > 1 ? 's' : ''}</span>` : ''}
      </div>` : ''}
      <div class="oc-stats">
        <div class="oc-stat"><div class="oc-stat-val">${o.total_children}</div><div class="oc-stat-label">Children</div></div>
        <div class="oc-stat"><div class="oc-stat-val">${o.staff_count}</div><div class="oc-stat-label">Staff</div></div>
        <div class="oc-stat"><div class="oc-stat-val">${o.cameras}</div><div class="oc-stat-label">Cameras</div></div>
      </div>
    </div>`;
  }).join('');
}

function filterOrphanageGrid(query) {
  renderOrphanageGrid(query);
}

// Orphanage Detail View
let currentDetailOrphanage = null;

async function openOrphanageDetail(id) {
  const o = orphanages.find(x => x.id === id);
  if (!o) return;
  currentDetailOrphanage = o;

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.getElementById('page-detail').classList.add('active');

  document.getElementById('detail-title').textContent = o.name;
  const dot = document.getElementById('detail-status-dot');
  dot.style.background = o.status === 'online' ? 'var(--success)' : 'var(--danger)';
  document.getElementById('detail-status-text').textContent = o.status.toUpperCase();

  document.getElementById('detail-header-info').innerHTML = `
    <div class="detail-info-bar">
      <div class="detail-info-item">
        <div class="dii-icon" style="background:rgba(79,140,255,0.15)">&#127968;</div>
        <div><div class="dii-label">Location</div><div class="dii-value" style="font-size:14px">${o.address}</div></div>
      </div>
      <div class="detail-info-item">
        <div class="dii-icon" style="background:rgba(52,211,153,0.15)">&#128118;</div>
        <div><div class="dii-label">Children</div><div class="dii-value" style="color:var(--success)">${o.total_children}</div></div>
      </div>
      <div class="detail-info-item">
        <div class="dii-icon" style="background:rgba(167,139,250,0.15)">&#128101;</div>
        <div><div class="dii-label">Staff</div><div class="dii-value" style="color:var(--purple)">${o.staff_count}</div></div>
      </div>
      <div class="detail-info-item">
        <div class="dii-icon" style="background:rgba(251,191,36,0.15)">&#128247;</div>
        <div><div class="dii-label">Cameras</div><div class="dii-value" style="color:var(--warning)">${o.cameras}</div></div>
      </div>
      <div class="detail-info-item">
        <div class="dii-icon" style="background:${o.risk_level === 'high' ? 'rgba(239,68,68,0.15)' : o.risk_level === 'medium' ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)'}">&#9888;</div>
        <div><div class="dii-label">Risk Level</div><div class="dii-value"><span class="risk-badge ${o.risk_level}" style="font-size:13px;padding:4px 12px">${o.risk_level.toUpperCase()}</span></div></div>
      </div>
      <div class="detail-info-item">
        <div class="dii-icon" style="background:rgba(79,140,255,0.15)">&#127759;</div>
        <div><div class="dii-label">City / District</div><div class="dii-value" style="font-size:14px">${o.city}, ${o.district}</div></div>
      </div>
    </div>
  `;

  switchDetailTab('overview');
}

function closeDetail() {
  currentDetailOrphanage = null;
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.getElementById('page-command').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('.nav-item[data-page="command"]').classList.add('active');
}

async function switchDetailTab(tab) {
  document.querySelectorAll('.detail-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.detail-tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('dtab-' + tab).classList.add('active');

  const o = currentDetailOrphanage;
  if (!o) return;
  const oid = o.id;

  if (tab === 'overview') await loadDetailOverview(oid);
  else if (tab === 'children') await loadDetailChildren(oid);
  else if (tab === 'visitors') await loadDetailVisitors(oid);
  else if (tab === 'zones') await loadDetailZones(oid);
  else if (tab === 'alerts') await loadDetailAlerts(oid);
  else if (tab === 'incidents') await loadDetailIncidents(oid);
  else if (tab === 'activity') await loadDetailActivity(oid);
}

async function loadDetailOverview(oid) {
  const [statsRes, childrenRes, visitorsRes, alertsRes, incidentsRes, zonesRes, rankingsRes] = await Promise.all([
    fetch('/api/stats?orphanage_id=' + oid),
    fetch('/api/children?orphanage_id=' + oid),
    fetch('/api/visitors?orphanage_id=' + oid),
    fetch('/api/alerts?orphanage_id=' + oid),
    fetch('/api/incidents?orphanage_id=' + oid),
    fetch('/api/zones?orphanage_id=' + oid),
    fetch('/api/rankings'),
  ]);
  const [stats, children, visitors, alerts, incidents, zones, rankings] = await Promise.all([
    statsRes.json(), childrenRes.json(), visitorsRes.json(), alertsRes.json(), incidentsRes.json(), zonesRes.json(), rankingsRes.json()
  ]);

  const thisRank = rankings.find(r => r.id === oid);
  const activeVisitors = visitors.filter(v => v.status === 'checked_in');
  const unresolvedAlerts = alerts.filter(a => !a.acknowledged);
  const openIncs = incidents.filter(i => !i.reviewed);

  const gradeColor = thisRank ? (thisRank.grade === 'A' ? 'var(--success)' : thisRank.grade === 'B' ? 'var(--accent)' : thisRank.grade === 'C' ? 'var(--warning)' : 'var(--danger)') : 'var(--text-secondary)';
  const scoreBarColor = thisRank ? (thisRank.score >= 80 ? 'var(--success)' : thisRank.score >= 60 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-secondary)';

  document.getElementById('dtab-overview').innerHTML = `
    ${thisRank ? `
    <div class="safety-scorecard">
      <div class="ssc-main">
        <div class="ssc-grade" style="color:${gradeColor};border-color:${gradeColor}">${thisRank.grade}</div>
        <div class="ssc-info">
          <div class="ssc-title">Safety Score</div>
          <div class="ssc-score" style="color:${gradeColor}">${thisRank.score}<span>/100</span></div>
          <div class="ssc-bar"><div class="ssc-bar-fill" style="width:${thisRank.score}%;background:${scoreBarColor}"></div></div>
        </div>
        <div class="ssc-rank">
          <div class="ssc-rank-label">Provincial Rank</div>
          <div class="ssc-rank-val">#${thisRank.rank}<span> of ${rankings.length}</span></div>
        </div>
      </div>
      <div class="ssc-metrics">
        <div class="ssc-metric"><div class="ssc-m-val">${thisRank.responseRate}%</div><div class="ssc-m-label">Response Rate</div></div>
        <div class="ssc-metric"><div class="ssc-m-val">${thisRank.staffRatio}%</div><div class="ssc-m-label">Staff Ratio</div></div>
        <div class="ssc-metric"><div class="ssc-m-val">${thisRank.cameraCoverage}%</div><div class="ssc-m-label">Camera Coverage</div></div>
        <div class="ssc-metric"><div class="ssc-m-val" style="color:${thisRank.criticalIncidents > 0 ? 'var(--danger)' : 'var(--success)'}">${thisRank.criticalIncidents}</div><div class="ssc-m-label">Critical Open</div></div>
        <div class="ssc-metric"><div class="ssc-m-val">${thisRank.totalIncidents}</div><div class="ssc-m-label">Total Incidents</div></div>
        <div class="ssc-metric"><div class="ssc-m-val" style="color:var(--success)">${thisRank.reviewedIncidents}</div><div class="ssc-m-label">Reviewed</div></div>
      </div>
    </div>` : ''}

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card green"><div class="label">Children</div><div class="value">${stats.totalChildren}</div><div class="sub">Registered</div></div>
      <div class="stat-card yellow"><div class="label">Visitors</div><div class="value">${stats.activeVisitors}</div><div class="sub">Currently here</div></div>
      <div class="stat-card red"><div class="label">Alerts</div><div class="value">${stats.pendingAlerts}</div><div class="sub">Unresolved</div></div>
      <div class="stat-card purple"><div class="label">AI Incidents</div><div class="value">${stats.openIncidents}</div><div class="sub">Open</div></div>
    </div>

    <div class="detail-overview-grid">
      <div class="detail-panel">
        <div class="detail-panel-header">Children <span class="count">${children.length}</span></div>
        <div class="detail-panel-body">
          ${children.length === 0 ? '<div class="detail-empty">No children registered</div>' :
            children.slice(0, 10).map(c => `
              <div class="detail-child-row">
                <div class="detail-child-avatar">${c.name.charAt(0)}</div>
                <div class="detail-child-info">
                  <div class="dci-name">${c.name}</div>
                  <div class="dci-meta">Age ${c.age} &middot; ${c.gender} &middot; ${c.medical_notes || 'No notes'}</div>
                </div>
              </div>
            `).join('')}
          ${children.length > 10 ? `<div style="text-align:center;padding:8px"><button class="btn btn-outline btn-sm" onclick="switchDetailTab('children')">View all ${children.length}</button></div>` : ''}
        </div>
      </div>

      <div class="detail-panel">
        <div class="detail-panel-header">Active Visitors <span class="count">${activeVisitors.length}</span></div>
        <div class="detail-panel-body">
          ${activeVisitors.length === 0 ? '<div class="detail-empty">No visitors on premises</div>' :
            activeVisitors.map(v => `
              <div class="detail-visitor-row">
                <div class="detail-child-avatar" style="background:rgba(167,139,250,0.15);color:var(--purple)">${v.name.charAt(0)}</div>
                <div class="detail-child-info">
                  <div class="dci-name">${v.name}</div>
                  <div class="dci-meta">${v.purpose} &middot; Since ${new Date(v.check_in).toLocaleTimeString('en-PK')}</div>
                </div>
              </div>
            `).join('')}
        </div>
      </div>

      <div class="detail-panel">
        <div class="detail-panel-header">Live Zones <span class="count">${zones.length}</span></div>
        <div class="detail-panel-body">
          ${zones.length === 0 ? '<div class="detail-empty">No zones configured</div>' :
            zones.map(z => {
              const pct = z.expected_count > 0 ? Math.min(100, (z.current_count / z.expected_count) * 100) : 0;
              const barColor = pct > 100 ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--success)';
              return `<div class="detail-zone-card">
                <div class="dz-info"><div class="dz-name">${z.name}</div><div class="dz-desc">${z.description}</div></div>
                <div class="dz-count">
                  <div class="dz-count-val">${z.current_count}</div>
                  <div class="dz-count-exp">/ ${z.expected_count} expected</div>
                  <div class="dz-bar"><div class="dz-bar-fill" style="width:${Math.min(pct, 100)}%;background:${barColor}"></div></div>
                </div>
              </div>`;
            }).join('')}
        </div>
      </div>

      <div class="detail-panel">
        <div class="detail-panel-header" style="color:var(--danger)">Recent Alerts <span class="count" style="background:rgba(239,68,68,0.15);color:var(--danger)">${unresolvedAlerts.length}</span></div>
        <div class="detail-panel-body">
          ${unresolvedAlerts.length === 0 ? '<div class="detail-empty">No pending alerts</div>' :
            unresolvedAlerts.slice(0, 8).map(a => `
              <div class="detail-mini-alert">
                <div class="alert-severity ${a.severity}"></div>
                <div style="flex:1;font-size:13px">${a.message.replace(currentDetailOrphanage.name + ' - ', '').replace(' - ' + currentDetailOrphanage.name, '')}</div>
                <div class="dma-time">${new Date(a.created_at).toLocaleTimeString('en-PK')}</div>
              </div>
            `).join('')}
        </div>
      </div>
    </div>

    ${openIncs.length > 0 ? `
      <div style="margin-top:16px">
        <div class="detail-panel">
          <div class="detail-panel-header" style="color:var(--critical)">AI Detections <span class="count" style="background:rgba(239,68,68,0.15);color:var(--critical)">${openIncs.length} open</span></div>
          <div class="detail-panel-body" style="max-height:400px">
            <div class="alerts-list">${openIncs.slice(0, 5).map(renderIncidentItem).join('')}</div>
            ${openIncs.length > 5 ? `<div style="text-align:center;padding:12px"><button class="btn btn-outline btn-sm" onclick="switchDetailTab('incidents')">View all ${openIncs.length} incidents</button></div>` : ''}
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

async function loadDetailChildren(oid) {
  const res = await fetch('/api/children?orphanage_id=' + oid);
  const children = await res.json();
  document.getElementById('dtab-children').innerHTML = children.length === 0 ? '<div class="detail-empty">No children registered at this orphanage</div>' : `
    <table class="data-table">
      <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Admitted</th><th>Medical Notes</th><th>Actions</th></tr></thead>
      <tbody>${children.map(c => `
        <tr>
          <td><div style="display:flex;align-items:center;gap:8px"><div class="detail-child-avatar">${c.name.charAt(0)}</div><strong>${c.name}</strong></div></td>
          <td>${c.age}</td><td>${c.gender}</td>
          <td>${new Date(c.admitted_date).toLocaleDateString('en-PK')}</td>
          <td>${c.medical_notes || '-'}</td>
          <td><button class="btn btn-outline btn-sm" onclick="viewHealth(${c.id},'${c.name}')">Health</button></td>
        </tr>
      `).join('')}</tbody>
    </table>
  `;
}

async function loadDetailVisitors(oid) {
  const res = await fetch('/api/visitors?orphanage_id=' + oid);
  const visitors = await res.json();
  document.getElementById('dtab-visitors').innerHTML = visitors.length === 0 ? '<div class="detail-empty">No visitor records</div>' : `
    <table class="data-table">
      <thead><tr><th>Name</th><th>CNIC</th><th>Phone</th><th>Purpose</th><th>Check In</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${visitors.map(v => `
        <tr>
          <td><strong>${v.name}</strong></td><td>${v.cnic || '-'}</td><td>${v.phone || '-'}</td><td>${v.purpose}</td>
          <td>${new Date(v.check_in).toLocaleString('en-PK')}</td>
          <td><span class="badge-status ${v.status}">${v.status.replace('_', ' ')}</span></td>
          <td>${v.status === 'checked_in' ? `<button class="btn btn-outline btn-sm" onclick="checkoutVisitor(${v.id});switchDetailTab('visitors')">Check Out</button>` : ''}</td>
        </tr>
      `).join('')}</tbody>
    </table>
  `;
}

async function loadDetailZones(oid) {
  const res = await fetch('/api/zones?orphanage_id=' + oid);
  const zones = await res.json();
  document.getElementById('dtab-zones').innerHTML = zones.length === 0 ? '<div class="detail-empty">No zones configured for this orphanage</div>' : `
    <div class="zone-grid">${zones.map(z => {
      const pct = z.expected_count > 0 ? Math.min(150, (z.current_count / z.expected_count) * 100) : 0;
      const status = pct > 120 ? 'danger' : pct > 90 ? 'warning' : '';
      return `<div class="zone-card">
        <div class="zone-status ${status}"></div>
        <div class="zone-name">${z.name}</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">${z.description}</div>
        <div class="zone-count">${z.current_count}</div>
        <div class="zone-expected">Expected: ${z.expected_count}</div>
        <div class="dz-bar" style="margin-top:8px;width:100%"><div class="dz-bar-fill" style="width:${Math.min(pct, 100)}%;background:${pct > 120 ? 'var(--danger)' : pct > 90 ? 'var(--warning)' : 'var(--success)'}"></div></div>
      </div>`;
    }).join('')}</div>
  `;
}

async function loadDetailAlerts(oid) {
  const res = await fetch('/api/alerts?orphanage_id=' + oid);
  const alerts = await res.json();
  document.getElementById('dtab-alerts').innerHTML = alerts.length === 0 ? '<div class="detail-empty">No alerts for this orphanage</div>' :
    `<div class="alerts-list">${alerts.map(renderAlertItem).join('')}</div>`;
}

async function loadDetailIncidents(oid) {
  const res = await fetch('/api/incidents?orphanage_id=' + oid);
  const incidents = await res.json();
  document.getElementById('dtab-incidents').innerHTML = incidents.length === 0 ? '<div class="detail-empty">No AI detections for this orphanage</div>' :
    `<div class="alerts-list">${incidents.map(renderIncidentItem).join('')}</div>`;
}

async function loadDetailActivity(oid) {
  const res = await fetch('/api/activity?orphanage_id=' + oid);
  const activities = await res.json();
  const icons = {
    visitor_entry: { icon: '&#128694;', bg: 'rgba(79,140,255,0.15)' },
    ai_detection: { icon: '&#129302;', bg: 'rgba(239,68,68,0.15)' },
    headcount_mismatch: { icon: '&#9888;', bg: 'rgba(251,191,36,0.15)' },
    restricted_zone: { icon: '&#128683;', bg: 'rgba(248,113,113,0.15)' },
    perimeter_breach: { icon: '&#128680;', bg: 'rgba(239,68,68,0.15)' },
    child_missing: { icon: '&#128557;', bg: 'rgba(239,68,68,0.15)' },
  };
  document.getElementById('dtab-activity').innerHTML = activities.length === 0 ? '<div class="detail-empty">No activity logged</div>' :
    `<div class="activity-feed">${activities.map(a => {
      const cfg = icons[a.event_type] || { icon: '&#128196;', bg: 'rgba(154,160,166,0.15)' };
      return `<div class="activity-item"><div class="activity-icon" style="background:${cfg.bg}">${cfg.icon}</div><div style="flex:1">${a.description}</div><div class="activity-time">${new Date(a.created_at).toLocaleTimeString('en-PK')}</div></div>`;
    }).join('')}</div>`;
}

function updateOrphanageRisk(id, level) {
  const o = orphanages.find(x => x.id === id);
  if (o) { o.risk_level = level; renderOrphanageGrid(); updateStatusBar(); }
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
  orphanageAlertCounts[alert.orphanage_id] = (orphanageAlertCounts[alert.orphanage_id] || 0) + 1;
  renderOrphanageGrid();
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
    cachedAlerts = alerts;
    document.getElementById('alerts-list').innerHTML = alerts.map(renderAlertItem).join('');
    const searchEl = document.getElementById('alerts-search');
    if (searchEl) searchEl.value = '';
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
  orphanageIncidentCounts[incident.orphanage_id] = (orphanageIncidentCounts[incident.orphanage_id] || 0) + 1;
  renderOrphanageGrid();
  updateStatusBar();
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
    cachedIncidents = incidents;
    document.getElementById('incidents-list').innerHTML = incidents.map(renderIncidentItem).join('') || '<p style="color:var(--text-secondary);padding:20px">No incidents detected yet.</p>';
    document.getElementById('command-incidents').innerHTML = incidents.slice(0, 5).map(renderIncidentItem).join('');
    const searchEl = document.getElementById('incidents-search');
    if (searchEl) searchEl.value = '';

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

// Rankings
async function loadRankings() {
  try {
    const res = await fetch('/api/rankings');
    const rankings = await res.json();
    const avgScore = rankings.length > 0 ? Math.round(rankings.reduce((s, r) => s + r.score, 0) / rankings.length) : 0;
    const topPerformers = rankings.filter(r => r.grade === 'A' || r.grade === 'B').length;
    const needsAttention = rankings.filter(r => r.grade === 'D' || r.grade === 'F').length;

    document.getElementById('ranking-summary').innerHTML = `
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat-card green"><div class="label">Avg Safety Score</div><div class="value">${avgScore}</div><div class="sub">Out of 100</div></div>
        <div class="stat-card blue"><div class="label">Top Performers</div><div class="value">${topPerformers}</div><div class="sub">Grade A/B</div></div>
        <div class="stat-card red"><div class="label">Needs Attention</div><div class="value">${needsAttention}</div><div class="sub">Grade D/F</div></div>
        <div class="stat-card purple"><div class="label">Total Monitored</div><div class="value">${rankings.length}</div><div class="sub">Across Punjab</div></div>
      </div>
    `;

    document.getElementById('ranking-list').innerHTML = rankings.map(r => {
      const gradeColor = r.grade === 'A' ? 'var(--success)' : r.grade === 'B' ? 'var(--accent)' : r.grade === 'C' ? 'var(--warning)' : 'var(--danger)';
      const scoreBarColor = r.score >= 80 ? 'var(--success)' : r.score >= 60 ? 'var(--warning)' : 'var(--danger)';
      const medalIcon = r.rank === 1 ? '&#129351;' : r.rank === 2 ? '&#129352;' : r.rank === 3 ? '&#129353;' : '';
      return `
      <div class="rank-card ${r.rank <= 3 ? 'top-rank' : ''}" onclick="openOrphanageDetail(${r.id})">
        <div class="rank-position">
          <div class="rank-number">#${r.rank}</div>
          ${medalIcon ? `<div class="rank-medal">${medalIcon}</div>` : ''}
        </div>
        <div class="rank-info">
          <div class="rank-name">
            <span class="status-dot ${r.status}"></span>
            ${r.name}
          </div>
          <div class="rank-city">${r.city}, ${r.district}</div>
        </div>
        <div class="rank-metrics">
          <div class="rank-metric">
            <div class="rm-label">Children</div>
            <div class="rm-val">${r.total_children}</div>
          </div>
          <div class="rank-metric">
            <div class="rm-label">Staff Ratio</div>
            <div class="rm-val">${r.staffRatio}%</div>
          </div>
          <div class="rank-metric">
            <div class="rm-label">Camera</div>
            <div class="rm-val">${r.cameraCoverage}%</div>
          </div>
          <div class="rank-metric">
            <div class="rm-label">Response</div>
            <div class="rm-val">${r.responseRate}%</div>
          </div>
          <div class="rank-metric">
            <div class="rm-label">Open</div>
            <div class="rm-val" style="color:${r.openIncidents > 0 ? 'var(--danger)' : 'var(--success)'}">${r.openIncidents}</div>
          </div>
        </div>
        <div class="rank-score-area">
          <div class="rank-grade" style="color:${gradeColor};border-color:${gradeColor}">${r.grade}</div>
          <div class="rank-score-bar">
            <div class="rank-score-fill" style="width:${r.score}%;background:${scoreBarColor}"></div>
          </div>
          <div class="rank-score-val" style="color:${gradeColor}">${r.score}/100</div>
        </div>
      </div>`;
    }).join('');
  } catch (e) { console.error(e); }
}

// Add Orphanage
async function addOrphanage(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  data.total_children = parseInt(data.total_children) || 0;
  data.staff_count = parseInt(data.staff_count) || 0;
  data.cameras = parseInt(data.cameras) || 0;
  data.lat = parseFloat(data.lat) || 31.5;
  data.lng = parseFloat(data.lng) || 74.3;
  await fetch('/api/orphanages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  form.reset();
  closeModal('orphanage-modal');
  loadOrphanages();
  loadStats();
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
function renderChildRow(c) {
  const getOrg = (id) => { const o = orphanages.find(x => x.id === id); return o ? o.name : '-'; };
  return `<tr>
    <td><strong>${c.name}</strong></td><td>${c.age}</td><td>${c.gender}</td>
    <td>${getOrg(c.orphanage_id)}</td>
    <td>${new Date(c.admitted_date).toLocaleDateString('en-PK')}</td>
    <td>${c.medical_notes || '-'}</td>
    <td style="display:flex;gap:6px"><button class="btn btn-outline btn-sm" onclick="viewHealth(${c.id},'${c.name}')">Health</button><button class="btn btn-outline btn-sm" style="border-color:var(--accent);color:var(--accent)" onclick="viewGrowth(${c.id},'${c.name}')">Growth</button></td>
  </tr>`;
}

async function loadChildren() {
  try {
    const res = await fetch('/api/children' + qs(currentFilter));
    const children = await res.json();
    cachedChildren = children;
    document.getElementById('children-table').innerHTML = children.map(renderChildRow).join('');
    const searchEl = document.getElementById('children-search');
    if (searchEl) searchEl.value = '';
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
function renderVisitorRow(v) {
  const getOrg = (id) => { const o = orphanages.find(x => x.id === id); return o ? o.name : '-'; };
  return `<tr>
    <td><strong>${v.name}</strong></td><td>${v.cnic || '-'}</td><td>${v.phone || '-'}</td><td>${v.purpose}</td>
    <td>${getOrg(v.orphanage_id)}</td>
    <td>${new Date(v.check_in).toLocaleString('en-PK')}</td>
    <td><span class="badge-status ${v.status}">${v.status.replace('_', ' ')}</span></td>
    <td>${v.status === 'checked_in' ? `<button class="btn btn-outline btn-sm" onclick="checkoutVisitor(${v.id})">Check Out</button>` : ''}</td>
  </tr>`;
}

async function loadVisitors() {
  try {
    const res = await fetch('/api/visitors' + qs(currentFilter));
    const visitors = await res.json();
    cachedVisitors = visitors;
    document.getElementById('visitors-table').innerHTML = visitors.map(renderVisitorRow).join('');
    const searchEl = document.getElementById('visitors-search');
    if (searchEl) searchEl.value = '';
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
let cameraFeeds = [];
let cameraOrgFilter = '';
let cameraStream = null;
let cameraDetectionInterval = null;

async function initCameras() {
  const filter = document.getElementById('camera-org-filter');
  filter.innerHTML = '<option value="">All Orphanages</option>' + orphanages.map(o => `<option value="${o.id}" ${cameraOrgFilter == o.id ? 'selected' : ''}>${o.name} — ${o.city}</option>`).join('');
  filter.onchange = (e) => { cameraOrgFilter = e.target.value; initCameras(); };

  const allZones = [];
  const orgList = cameraOrgFilter ? orphanages.filter(o => o.id === parseInt(cameraOrgFilter)) : orphanages;
  for (const o of orgList) {
    try {
      const res = await fetch('/api/zones?orphanage_id=' + o.id);
      const zones = await res.json();
      zones.forEach(z => allZones.push({ ...z, orgName: o.name, orgStatus: o.status, orgId: o.id }));
      if (zones.length === 0) {
        for (let i = 0; i < Math.min(o.cameras, 4); i++) {
          allZones.push({ name: `Camera ${i + 1}`, description: 'General surveillance', orgName: o.name, orgStatus: o.status, orgId: o.id });
        }
      }
    } catch (e) { /* skip */ }
  }
  cameraFeeds = allZones;

  const totalCams = orgList.reduce((s, o) => s + o.cameras, 0);
  const onlineCams = orgList.filter(o => o.status === 'online').reduce((s, o) => s + o.cameras, 0);
  const offlineOrgs = orgList.filter(o => o.status !== 'online').length;
  document.getElementById('camera-stats').innerHTML = `
    <div class="cam-stat-row">
      <div class="cam-stat"><span class="cam-stat-val" style="color:var(--accent)">${totalCams}</span><span class="cam-stat-label">Total Cameras</span></div>
      <div class="cam-stat"><span class="cam-stat-val" style="color:var(--success)">${onlineCams}</span><span class="cam-stat-label">Online</span></div>
      <div class="cam-stat"><span class="cam-stat-val" style="color:var(--danger)">${totalCams - onlineCams}</span><span class="cam-stat-label">Offline</span></div>
      <div class="cam-stat"><span class="cam-stat-val" style="color:var(--purple)">${orgList.length}</span><span class="cam-stat-label">Orphanages</span></div>
      <div class="cam-stat"><span class="cam-stat-val" style="color:var(--cyan)">${allZones.length}</span><span class="cam-stat-label">Feed Zones</span></div>
    </div>
  `;

  const grid = document.getElementById('camera-grid');
  grid.innerHTML = allZones.map((z, i) => `
    <div class="camera-feed ${z.orgStatus !== 'online' ? 'cam-offline' : ''}">
      <div class="feed-header">
        <div>
          <span class="feed-zone-name">${z.name}</span>
          <span class="feed-org-name">${z.orgName}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="feed-status-badge ${z.orgStatus === 'online' ? 'online' : 'offline'}">${z.orgStatus === 'online' ? 'LIVE' : 'OFFLINE'}</span>
          ${z.orgStatus === 'online' ? '<div class="live-dot"></div>' : ''}
        </div>
      </div>
      <div class="feed-body" id="feed-${i}">
        ${i === 0 && z.orgStatus === 'online' ? '<video id="cam-live" autoplay muted playsinline></video>' :
          z.orgStatus === 'online' ?
            `<div class="sim-feed" id="sim-feed-${i}"><canvas class="sim-canvas" id="sim-canvas-${i}"></canvas></div>` :
            '<div class="no-feed"><span style="font-size:28px">&#128683;</span><span>Feed Unavailable</span><span style="font-size:10px;color:var(--danger)">Orphanage Offline</span></div>'
        }
        ${z.orgStatus === 'online' ? `<div class="feed-overlay"><span>AI: Active</span><span id="feed-count-${i}">Persons: 0</span></div>` : ''}
      </div>
    </div>
  `).join('');

  if (cameraDetectionInterval) clearInterval(cameraDetectionInterval);
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }

  const firstOnline = allZones.findIndex(z => z.orgStatus === 'online');
  if (firstOnline === 0) {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      const v = document.getElementById('cam-live');
      if (v) v.srcObject = cameraStream;
    } catch (e) {
      const f = document.getElementById('feed-0');
      if (f) f.innerHTML = '<div class="sim-feed" id="sim-feed-0"><canvas class="sim-canvas" id="sim-canvas-0"></canvas></div><div class="feed-overlay"><span>AI: Simulated</span><span id="feed-count-0">Persons: 0</span></div>';
    }
  }

  allZones.forEach((z, i) => {
    if (z.orgStatus !== 'online') return;
    if (i === 0 && document.getElementById('cam-live')) return;
    const canvas = document.getElementById('sim-canvas-' + i);
    if (canvas) drawSimFeed(canvas, z.name);
  });

  startDetectionSim();
}

function drawSimFeed(canvas, label) {
  const ctx = canvas.getContext('2d');
  canvas.width = 320; canvas.height = 180;

  function render() {
    const t = Date.now() * 0.001;
    ctx.fillStyle = `hsl(${140 + Math.sin(t) * 10}, 8%, ${8 + Math.sin(t * 0.5) * 2}%)`;
    ctx.fillRect(0, 0, 320, 180);

    for (let i = 0; i < 5; i++) {
      const x = (Math.sin(t * 0.3 + i * 2) + 1) * 100 + 40;
      const y = 90 + Math.sin(t * 0.4 + i) * 30;
      ctx.fillStyle = `rgba(16, 185, 129, ${0.03 + Math.sin(t + i) * 0.02})`;
      ctx.beginPath(); ctx.arc(x, y, 8 + i * 2, 0, Math.PI * 2); ctx.fill();
    }

    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.015)';
      const y = ((t * 30 + i * 60) % 180);
      ctx.fillRect(0, y, 320, 1);
    }

    ctx.fillStyle = 'rgba(16,185,129,0.06)';
    ctx.fillRect(0, 0, 320, 1);
    ctx.fillRect(0, 179, 320, 1);
    ctx.fillRect(0, 0, 1, 180);
    ctx.fillRect(319, 0, 1, 180);

    ctx.fillStyle = 'rgba(16,185,129,0.3)';
    ctx.font = '9px Inter, sans-serif';
    const ts = new Date().toLocaleTimeString('en-PK');
    ctx.fillText(ts, 6, 14);
    ctx.fillText('REC', 280, 14);

    const recDot = Math.sin(t * 3) > 0;
    if (recDot) { ctx.beginPath(); ctx.arc(274, 11, 3, 0, Math.PI * 2); ctx.fill(); }

    requestAnimationFrame(render);
  }
  render();
}

function startDetectionSim() {
  if (cameraDetectionInterval) clearInterval(cameraDetectionInterval);
  const analysisCanvas = document.createElement('canvas');
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });

  function detectPersonRegions(video) {
    if (!video || !video.videoWidth) return [];
    const w = 160, h = 120;
    analysisCanvas.width = w; analysisCanvas.height = h;
    analysisCtx.drawImage(video, 0, 0, w, h);
    let imgData;
    try { imgData = analysisCtx.getImageData(0, 0, w, h); } catch (e) { return []; }
    const d = imgData.data;
    const grid = [];
    const cellW = 10, cellH = 10;
    const cols = Math.floor(w / cellW), rows = Math.floor(h / cellH);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let skinCount = 0, total = 0;
        for (let y = r * cellH; y < (r + 1) * cellH; y++) {
          for (let x = c * cellW; x < (c + 1) * cellW; x++) {
            const i = (y * w + x) * 4;
            const R = d[i], G = d[i+1], B = d[i+2];
            if (R > 80 && G > 40 && B > 20 && R > G && R > B && Math.abs(R - G) > 15 && R - B > 15) skinCount++;
            total++;
          }
        }
        grid.push({ r, c, ratio: skinCount / total });
      }
    }
    const regions = [];
    const visited = new Set();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (visited.has(idx) || grid[idx].ratio < 0.25) continue;
        let minR = r, maxR = r, minC = c, maxC = c;
        const queue = [idx];
        visited.add(idx);
        while (queue.length) {
          const cur = queue.shift();
          const cr = Math.floor(cur / cols), cc = cur % cols;
          minR = Math.min(minR, cr); maxR = Math.max(maxR, cr);
          minC = Math.min(minC, cc); maxC = Math.max(maxC, cc);
          for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nr = cr + dr, nc = cc + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            const ni = nr * cols + nc;
            if (!visited.has(ni) && grid[ni].ratio >= 0.2) { visited.add(ni); queue.push(ni); }
          }
        }
        const bw = (maxC - minC + 1) * cellW, bh = (maxR - minR + 1) * cellH;
        if (bw >= 15 && bh >= 20) {
          const padX = bw * 0.3, padY = bh * 0.6;
          regions.push({
            x: Math.max(0, (minC * cellW - padX) / w * 100),
            y: Math.max(0, (minR * cellH - padY) / h * 100),
            w: Math.min(100, (bw + padX * 2) / w * 100),
            h: Math.min(100, (bh + padY * 2) / h * 100),
          });
        }
      }
    }
    regions.sort((a, b) => (b.w * b.h) - (a.w * a.h));
    return regions.slice(0, 4);
  }

  cameraDetectionInterval = setInterval(() => {
    cameraFeeds.forEach((z, i) => {
      if (z.orgStatus !== 'online') return;
      const feed = document.getElementById('feed-' + i);
      if (!feed) return;
      feed.querySelectorAll('.detection-box').forEach(b => b.remove());
      const countEl = document.getElementById('feed-count-' + i);

      if (i === 0 && document.getElementById('cam-live')) {
        const video = document.getElementById('cam-live');
        const regions = detectPersonRegions(video);
        if (countEl) countEl.textContent = 'Persons: ' + regions.length;
        regions.forEach(reg => {
          const conf = (82 + Math.random() * 17).toFixed(0);
          const box = document.createElement('div');
          box.className = 'detection-box';
          const mirroredX = 100 - reg.x - reg.w;
          box.style.cssText = `left:${mirroredX}%;top:${reg.y}%;width:${reg.w}%;height:${reg.h}%`;
          box.innerHTML = `<div class="det-label">Person ${conf}%</div>`;
          feed.appendChild(box);
        });
      } else {
        const simCount = Math.floor(Math.random() * 5) + 1;
        if (countEl) countEl.textContent = 'Persons: ' + simCount;
        for (let j = 0; j < Math.min(simCount, 2); j++) {
          const conf = (78 + Math.random() * 21).toFixed(0);
          const box = document.createElement('div');
          box.className = 'detection-box';
          const bx = 15 + j * 30 + Math.random() * 15;
          const by = 10 + Math.random() * 25;
          box.style.cssText = `left:${bx}%;top:${by}%;width:${18 + Math.random() * 10}%;height:${30 + Math.random() * 20}%`;
          box.innerHTML = `<div class="det-label">Person ${conf}%</div>`;
          feed.appendChild(box);
        }
      }
    });
  }, 2500);
}

// Activity
const activityIcons = {
  visitor_entry: { icon: '&#128694;', bg: 'rgba(79,140,255,0.15)' },
  ai_detection: { icon: '&#129302;', bg: 'rgba(239,68,68,0.15)' },
  headcount_mismatch: { icon: '&#9888;', bg: 'rgba(251,191,36,0.15)' },
  restricted_zone: { icon: '&#128683;', bg: 'rgba(248,113,113,0.15)' },
  perimeter_breach: { icon: '&#128680;', bg: 'rgba(239,68,68,0.15)' },
  child_missing: { icon: '&#128557;', bg: 'rgba(239,68,68,0.15)' },
};

function renderActivityItem(a) {
  const cfg = activityIcons[a.event_type] || { icon: '&#128196;', bg: 'rgba(154,160,166,0.15)' };
  return `<div class="activity-item"><div class="activity-icon" style="background:${cfg.bg}">${cfg.icon}</div><div>${a.description}</div><div class="activity-time">${new Date(a.created_at).toLocaleTimeString('en-PK')}</div></div>`;
}

async function loadActivity() {
  try {
    const res = await fetch('/api/activity' + qs(currentFilter));
    const activities = await res.json();
    cachedActivities = activities;
    document.getElementById('activity-feed').innerHTML = activities.map(renderActivityItem).join('') || '<p style="color:var(--text-secondary);padding:20px">No activity yet.</p>';
    const searchEl = document.getElementById('activity-search');
    if (searchEl) searchEl.value = '';
  } catch (e) { console.error(e); }
}

// === ORPHANAGE PORTAL ===
let portalOrphanageId = null;

function loadPortal() {
  const container = document.getElementById('portal-content');
  if (!portalOrphanageId) {
    container.innerHTML = `
      <div class="portal-login">
        <div class="portal-login-card">
          <div class="portal-login-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h2>Orphanage Portal</h2>
          <p>Select your orphanage to access your dedicated management dashboard</p>
          <div class="form-group" style="margin-top:24px">
            <label>Select Orphanage</label>
            <select id="portal-select" style="width:100%;padding:14px 18px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:15px;font-family:inherit;cursor:pointer;outline:none">
              <option value="">-- Choose your orphanage --</option>
              ${orphanages.map(o => `<option value="${o.id}">${o.name} - ${o.city}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;margin-top:8px" onclick="enterPortal()">Enter Portal</button>
        </div>
      </div>
    `;
    return;
  }
  loadPortalDashboard();
}

function enterPortal() {
  const sel = document.getElementById('portal-select');
  if (!sel || !sel.value) return;
  portalOrphanageId = parseInt(sel.value);
  loadPortalDashboard();
}

function exitPortal() {
  portalOrphanageId = null;
  loadPortal();
}

async function loadPortalDashboard() {
  const oid = portalOrphanageId;
  const o = orphanages.find(x => x.id === oid);
  if (!o) { exitPortal(); return; }

  const [statsRes, childrenRes, visitorsRes, alertsRes, incidentsRes, zonesRes, rankingsRes] = await Promise.all([
    fetch('/api/stats?orphanage_id=' + oid),
    fetch('/api/children?orphanage_id=' + oid),
    fetch('/api/visitors?orphanage_id=' + oid),
    fetch('/api/alerts?orphanage_id=' + oid),
    fetch('/api/incidents?orphanage_id=' + oid),
    fetch('/api/zones?orphanage_id=' + oid),
    fetch('/api/rankings'),
  ]);
  const [stats, children, visitors, alerts, incidents, zones, rankings] = await Promise.all([
    statsRes.json(), childrenRes.json(), visitorsRes.json(), alertsRes.json(), incidentsRes.json(), zonesRes.json(), rankingsRes.json()
  ]);

  const thisRank = rankings.find(r => r.id === oid);
  const avgScore = rankings.length > 0 ? Math.round(rankings.reduce((s, r) => s + r.score, 0) / rankings.length) : 0;
  const avgResponse = rankings.length > 0 ? Math.round(rankings.reduce((s, r) => s + r.responseRate, 0) / rankings.length) : 0;
  const avgStaff = rankings.length > 0 ? Math.round(rankings.reduce((s, r) => s + r.staffRatio, 0) / rankings.length) : 0;
  const avgCamera = rankings.length > 0 ? Math.round(rankings.reduce((s, r) => s + r.cameraCoverage, 0) / rankings.length) : 0;
  const activeVisitors = visitors.filter(v => v.status === 'checked_in');
  const unresolvedAlerts = alerts.filter(a => !a.acknowledged);
  const openIncs = incidents.filter(i => !i.reviewed);
  const gradeColor = thisRank ? (thisRank.grade === 'A' ? 'var(--success)' : thisRank.grade === 'B' ? 'var(--accent)' : thisRank.grade === 'C' ? 'var(--warning)' : 'var(--danger)') : 'var(--text-secondary)';

  const compliance = [];
  if (thisRank) {
    compliance.push({ label: 'Camera Coverage', ok: thisRank.cameraCoverage >= 80, val: thisRank.cameraCoverage + '%', tip: thisRank.cameraCoverage < 80 ? `Install ${Math.max(1, Math.ceil(o.total_children / 8) - o.cameras)} more cameras to reach 80% coverage` : 'Excellent coverage' });
    compliance.push({ label: 'Staff-to-Child Ratio', ok: thisRank.staffRatio >= 30, val: thisRank.staffRatio + '%', tip: thisRank.staffRatio < 30 ? `Hire ${Math.max(1, Math.ceil(o.total_children * 0.3) - o.staff_count)} more staff to meet 1:3 ratio` : 'Meets standard' });
    compliance.push({ label: 'Incident Response Rate', ok: thisRank.responseRate >= 90, val: thisRank.responseRate + '%', tip: thisRank.responseRate < 90 ? 'Review and resolve open incidents promptly' : 'Great response time' });
    compliance.push({ label: 'System Status', ok: o.status === 'online', val: o.status.toUpperCase(), tip: o.status !== 'online' ? 'Bring cameras and sensors back online immediately' : 'All systems operational' });
    compliance.push({ label: 'Risk Level', ok: o.risk_level === 'low', val: o.risk_level.toUpperCase(), tip: o.risk_level !== 'low' ? 'Address critical incidents to lower risk level' : 'No active threats' });
    compliance.push({ label: 'Critical Incidents', ok: thisRank.criticalIncidents === 0, val: thisRank.criticalIncidents, tip: thisRank.criticalIncidents > 0 ? 'Review and resolve all critical incidents urgently' : 'No critical issues' });
  }
  const passedChecks = compliance.filter(c => c.ok).length;

  const improvements = [];
  if (thisRank) {
    if (thisRank.score < 90 && thisRank.cameraCoverage < 80) improvements.push({ icon: '&#128247;', title: 'Increase Camera Coverage', desc: `Current: ${thisRank.cameraCoverage}%. Add cameras to blind spots. Target: 80%+`, impact: '+5 points' });
    if (thisRank.score < 90 && thisRank.staffRatio < 30) improvements.push({ icon: '&#128101;', title: 'Improve Staff Ratio', desc: `Current: ${thisRank.staffRatio}%. Hire additional caregivers. Target: 30%+`, impact: '+5 points' });
    if (thisRank.score < 90 && thisRank.responseRate < 90) improvements.push({ icon: '&#9201;', title: 'Faster Incident Response', desc: `Current: ${thisRank.responseRate}%. Review incidents within 1 hour. Target: 90%+`, impact: '+5 points' });
    if (thisRank.criticalIncidents > 0) improvements.push({ icon: '&#128680;', title: 'Resolve Critical Incidents', desc: `${thisRank.criticalIncidents} critical incidents need immediate review`, impact: `+${thisRank.criticalIncidents * 8} points` });
    if (thisRank.openIncidents > 0) improvements.push({ icon: '&#9888;', title: 'Clear Open Incidents', desc: `${thisRank.openIncidents} incidents pending review`, impact: `+${thisRank.openIncidents * 4} points` });
    if (o.risk_level === 'high') improvements.push({ icon: '&#128308;', title: 'Lower Risk Level', desc: 'Resolving incidents will automatically reduce risk', impact: '+15 points' });
    if (o.status === 'offline') improvements.push({ icon: '&#128268;', title: 'Come Online', desc: 'Bring your surveillance system back online', impact: '+10 points' });
    if (improvements.length === 0) improvements.push({ icon: '&#11088;', title: 'Keep It Up!', desc: 'Your orphanage is performing excellently. Maintain current standards.', impact: 'Top tier' });
  }

  const container = document.getElementById('portal-content');
  container.innerHTML = `
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn btn-outline btn-sm" onclick="exitPortal()">&#8592; Switch</button>
        <h2>${o.name}</h2>
        <span class="risk-badge ${o.risk_level}" style="margin-left:4px">${o.risk_level} risk</span>
      </div>
      <div class="header-time">
        <div class="live-dot" style="background:${o.status === 'online' ? 'var(--success)' : 'var(--danger)'}"></div>
        <span>${o.status.toUpperCase()} &middot; ${o.city}, ${o.district}</span>
      </div>
    </div>

    ${thisRank ? `
    <div class="portal-hero">
      <div class="portal-hero-score">
        <div class="portal-grade" style="color:${gradeColor};border-color:${gradeColor}">${thisRank.grade}</div>
        <div class="portal-score-info">
          <div class="portal-score-label">Your Safety Score</div>
          <div class="portal-score-num" style="color:${gradeColor}">${thisRank.score}<span>/100</span></div>
        </div>
      </div>
      <div class="portal-hero-rank">
        <div class="portal-rank-num">#${thisRank.rank}</div>
        <div class="portal-rank-label">of ${rankings.length} in Punjab</div>
        ${thisRank.rank <= 3 ? '<div class="portal-rank-badge">Top Performer</div>' : thisRank.rank <= Math.ceil(rankings.length / 2) ? '<div class="portal-rank-badge avg">Above Average</div>' : '<div class="portal-rank-badge low">Needs Improvement</div>'}
      </div>
      <div class="portal-hero-compare">
        <div class="portal-compare-title">vs Provincial Average</div>
        <div class="portal-compare-row">
          <span>Score</span>
          <div class="portal-compare-bar"><div class="portal-compare-fill you" style="width:${thisRank.score}%"></div><div class="portal-compare-fill avg" style="width:${avgScore}%"></div></div>
          <span class="portal-compare-vals"><strong style="color:var(--accent)">${thisRank.score}</strong> / ${avgScore}</span>
        </div>
        <div class="portal-compare-row">
          <span>Response</span>
          <div class="portal-compare-bar"><div class="portal-compare-fill you" style="width:${thisRank.responseRate}%"></div><div class="portal-compare-fill avg" style="width:${avgResponse}%"></div></div>
          <span class="portal-compare-vals"><strong style="color:var(--accent)">${thisRank.responseRate}%</strong> / ${avgResponse}%</span>
        </div>
        <div class="portal-compare-row">
          <span>Staff</span>
          <div class="portal-compare-bar"><div class="portal-compare-fill you" style="width:${Math.min(thisRank.staffRatio, 100)}%"></div><div class="portal-compare-fill avg" style="width:${Math.min(avgStaff, 100)}%"></div></div>
          <span class="portal-compare-vals"><strong style="color:var(--accent)">${thisRank.staffRatio}%</strong> / ${avgStaff}%</span>
        </div>
        <div class="portal-compare-row">
          <span>Camera</span>
          <div class="portal-compare-bar"><div class="portal-compare-fill you" style="width:${thisRank.cameraCoverage}%"></div><div class="portal-compare-fill avg" style="width:${avgCamera}%"></div></div>
          <span class="portal-compare-vals"><strong style="color:var(--accent)">${thisRank.cameraCoverage}%</strong> / ${avgCamera}%</span>
        </div>
        <div style="margin-top:8px;font-size:10px;color:var(--text-tertiary)">
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--accent);margin-right:4px;vertical-align:middle"></span>You
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--text-tertiary);margin:0 4px 0 12px;vertical-align:middle"></span>Avg
        </div>
      </div>
    </div>` : ''}

    <div class="stats-grid" style="grid-template-columns:repeat(5,minmax(0,1fr))">
      <div class="stat-card green"><div class="label">Children</div><div class="value">${stats.totalChildren}</div><div class="sub">Registered</div></div>
      <div class="stat-card yellow"><div class="label">Visitors</div><div class="value">${activeVisitors.length}</div><div class="sub">On premises</div></div>
      <div class="stat-card red"><div class="label">Alerts</div><div class="value">${unresolvedAlerts.length}</div><div class="sub">Unresolved</div></div>
      <div class="stat-card purple"><div class="label">AI Incidents</div><div class="value">${openIncs.length}</div><div class="sub">Open</div></div>
      <div class="stat-card blue"><div class="label">Zones</div><div class="value">${zones.length}</div><div class="sub">Monitored</div></div>
    </div>

    <div class="portal-grid">
      <div class="portal-section">
        <div class="portal-section-header">
          <span>&#9989; Compliance Checklist</span>
          <span class="portal-check-count">${passedChecks}/${compliance.length} passed</span>
        </div>
        <div class="portal-section-body">
          ${compliance.map(c => `
            <div class="portal-check-item ${c.ok ? 'pass' : 'fail'}">
              <div class="portal-check-icon">${c.ok ? '&#9989;' : '&#10060;'}</div>
              <div class="portal-check-info">
                <div class="portal-check-label">${c.label}: <strong>${c.val}</strong></div>
                <div class="portal-check-tip">${c.tip}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="portal-section">
        <div class="portal-section-header">
          <span>&#128200; Improvement Plan</span>
          <span class="portal-check-count" style="background:var(--accent-glow);color:var(--accent)">${improvements.length} items</span>
        </div>
        <div class="portal-section-body">
          ${improvements.map(imp => `
            <div class="portal-improve-item">
              <div class="portal-improve-icon">${imp.icon}</div>
              <div class="portal-improve-info">
                <div class="portal-improve-title">${imp.title}</div>
                <div class="portal-improve-desc">${imp.desc}</div>
              </div>
              <div class="portal-improve-impact">${imp.impact}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="portal-section">
        <div class="portal-section-header">
          <span>&#9889; Quick Actions</span>
        </div>
        <div class="portal-section-body" style="padding:16px">
          <div class="portal-actions-grid">
            <button class="portal-action-btn" onclick="portalAddChild()">
              <span class="portal-action-icon" style="background:rgba(16,185,129,0.1);color:var(--success)">&#128118;</span>
              <span>Add Child</span>
            </button>
            <button class="portal-action-btn" onclick="portalCheckInVisitor()">
              <span class="portal-action-icon" style="background:rgba(139,92,246,0.1);color:var(--purple)">&#128100;</span>
              <span>Check In Visitor</span>
            </button>
            <button class="portal-action-btn" onclick="portalViewAlerts()">
              <span class="portal-action-icon" style="background:rgba(239,68,68,0.1);color:var(--danger)">&#128276;</span>
              <span>View Alerts</span>
            </button>
            <button class="portal-action-btn" onclick="portalViewIncidents()">
              <span class="portal-action-icon" style="background:rgba(251,191,36,0.1);color:var(--warning)">&#9888;</span>
              <span>AI Incidents</span>
            </button>
          </div>
        </div>
      </div>

      <div class="portal-section">
        <div class="portal-section-header">
          <span>&#128205; Live Zones</span>
          <span class="portal-check-count">${zones.length} active</span>
        </div>
        <div class="portal-section-body">
          ${zones.length === 0 ? '<div class="detail-empty">No zones configured</div>' :
            zones.map(z => {
              const pct = z.expected_count > 0 ? Math.min(100, (z.current_count / z.expected_count) * 100) : 0;
              const barColor = pct > 100 ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--success)';
              return `<div class="portal-zone-row">
                <div class="portal-zone-name">${z.name}</div>
                <div class="portal-zone-bar"><div class="portal-zone-fill" style="width:${Math.min(pct, 100)}%;background:${barColor}"></div></div>
                <div class="portal-zone-count">${z.current_count}<span>/${z.expected_count}</span></div>
              </div>`;
            }).join('')}
        </div>
      </div>
    </div>

    ${unresolvedAlerts.length > 0 ? `
    <div class="portal-section" style="margin-top:14px">
      <div class="portal-section-header" style="color:var(--danger)">
        <span>&#128680; Pending Alerts</span>
        <span class="portal-check-count" style="background:var(--danger-glow);color:var(--danger)">${unresolvedAlerts.length}</span>
      </div>
      <div class="portal-section-body">
        <div class="alerts-list">${unresolvedAlerts.slice(0, 5).map(renderAlertItem).join('')}</div>
        ${unresolvedAlerts.length > 5 ? `<div style="text-align:center;padding:12px"><span style="color:var(--text-tertiary);font-size:12px">+${unresolvedAlerts.length - 5} more alerts</span></div>` : ''}
      </div>
    </div>` : ''}

    ${openIncs.length > 0 ? `
    <div class="portal-section" style="margin-top:14px">
      <div class="portal-section-header" style="color:var(--critical)">
        <span>&#129302; AI Detections Requiring Review</span>
        <span class="portal-check-count" style="background:var(--danger-glow);color:var(--critical)">${openIncs.length}</span>
      </div>
      <div class="portal-section-body">
        <div class="alerts-list">${openIncs.slice(0, 5).map(renderIncidentItem).join('')}</div>
        ${openIncs.length > 5 ? `<div style="text-align:center;padding:12px"><span style="color:var(--text-tertiary);font-size:12px">+${openIncs.length - 5} more incidents</span></div>` : ''}
      </div>
    </div>` : ''}
  `;
}

function portalAddChild() {
  const selects = document.querySelectorAll('.orphanage-select');
  selects.forEach(sel => { sel.value = portalOrphanageId; });
  openModal('child-modal');
}

function portalCheckInVisitor() {
  const selects = document.querySelectorAll('.orphanage-select');
  selects.forEach(sel => { sel.value = portalOrphanageId; });
  openModal('visitor-modal');
}

function portalViewAlerts() {
  currentFilter = portalOrphanageId.toString();
  document.getElementById('orphanage-filter').value = currentFilter;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.querySelector('.nav-item[data-page="alerts"]').classList.add('active');
  document.getElementById('page-alerts').classList.add('active');
  loadAlerts();
}

function portalViewIncidents() {
  currentFilter = portalOrphanageId.toString();
  document.getElementById('orphanage-filter').value = currentFilter;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.querySelector('.nav-item[data-page="incidents"]').classList.add('active');
  document.getElementById('page-incidents').classList.add('active');
  loadIncidents();
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

// ====== PAGE FILTERS ======
function filterChildren(query) {
  const q = query.toLowerCase().trim();
  if (!q) { document.getElementById('children-table').innerHTML = cachedChildren.map(renderChildRow).join(''); return; }
  const getOrg = (id) => { const o = orphanages.find(x => x.id === id); return o ? o.name : '-'; };
  const filtered = cachedChildren.filter(c =>
    c.name.toLowerCase().includes(q) ||
    String(c.age).includes(q) ||
    c.gender.toLowerCase().includes(q) ||
    getOrg(c.orphanage_id).toLowerCase().includes(q) ||
    (c.medical_notes || '').toLowerCase().includes(q)
  );
  document.getElementById('children-table').innerHTML = filtered.map(renderChildRow).join('') ||
    '<tr><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:24px">No children match your search</td></tr>';
}

function filterVisitors(query) {
  const q = query.toLowerCase().trim();
  if (!q) { document.getElementById('visitors-table').innerHTML = cachedVisitors.map(renderVisitorRow).join(''); return; }
  const getOrg = (id) => { const o = orphanages.find(x => x.id === id); return o ? o.name : '-'; };
  const filtered = cachedVisitors.filter(v =>
    v.name.toLowerCase().includes(q) ||
    (v.cnic || '').includes(q) ||
    (v.phone || '').includes(q) ||
    v.purpose.toLowerCase().includes(q) ||
    getOrg(v.orphanage_id).toLowerCase().includes(q) ||
    v.status.toLowerCase().includes(q)
  );
  document.getElementById('visitors-table').innerHTML = filtered.map(renderVisitorRow).join('') ||
    '<tr><td colspan="8" style="text-align:center;color:var(--text-tertiary);padding:24px">No visitors match your search</td></tr>';
}

function filterAlerts(query) {
  const q = query.toLowerCase().trim();
  if (!q) { document.getElementById('alerts-list').innerHTML = cachedAlerts.map(renderAlertItem).join(''); return; }
  const filtered = cachedAlerts.filter(a =>
    a.message.toLowerCase().includes(q) ||
    a.type.toLowerCase().includes(q) ||
    a.severity.toLowerCase().includes(q)
  );
  document.getElementById('alerts-list').innerHTML = filtered.map(renderAlertItem).join('') ||
    '<p style="color:var(--text-tertiary);padding:24px;text-align:center">No alerts match your search</p>';
}

function filterIncidents(query) {
  const q = query.toLowerCase().trim();
  if (!q) { document.getElementById('incidents-list').innerHTML = cachedIncidents.map(renderIncidentItem).join(''); return; }
  const filtered = cachedIncidents.filter(i =>
    i.label.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q) ||
    i.type.toLowerCase().includes(q) ||
    i.severity.toLowerCase().includes(q) ||
    (i.zone || '').toLowerCase().includes(q) ||
    (i.orphanage_name || '').toLowerCase().includes(q)
  );
  document.getElementById('incidents-list').innerHTML = filtered.map(renderIncidentItem).join('') ||
    '<p style="color:var(--text-tertiary);padding:24px;text-align:center">No incidents match your search</p>';
}

function filterActivity(query) {
  const q = query.toLowerCase().trim();
  if (!q) { document.getElementById('activity-feed').innerHTML = cachedActivities.map(renderActivityItem).join(''); return; }
  const filtered = cachedActivities.filter(a =>
    a.description.toLowerCase().includes(q) ||
    a.event_type.toLowerCase().includes(q)
  );
  document.getElementById('activity-feed').innerHTML = filtered.map(renderActivityItem).join('') ||
    '<p style="color:var(--text-tertiary);padding:24px;text-align:center">No activity matches your search</p>';
}

// ====== GLOBAL SEARCH ======
function openGlobalSearch() {
  document.getElementById('search-overlay').classList.add('active');
  const input = document.getElementById('global-search-input');
  input.value = '';
  input.focus();
  document.getElementById('global-search-results').innerHTML = '<div class="search-empty">Type to search across all data...</div>';
}

function closeGlobalSearch() {
  document.getElementById('search-overlay').classList.remove('active');
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openGlobalSearch();
  }
  if (e.key === 'Escape' && document.getElementById('search-overlay').classList.contains('active')) {
    closeGlobalSearch();
  }
});

function navigateToPage(page) {
  closeGlobalSearch();
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  document.getElementById('page-' + page).classList.add('active');
  if (page === 'map') initMap();
  if (page === 'cameras') initCameras();
  if (page === 'children') loadChildren();
  if (page === 'visitors') loadVisitors();
  if (page === 'alerts') loadAlerts();
  if (page === 'incidents') loadIncidents();
  if (page === 'rankings') loadRankings();
  if (page === 'portal') loadPortal();
  if (page === 'activity') loadActivity();
  if (page === 'analytics') loadAnalytics();
  if (page === 'emotions') loadEmotions();
  if (page === 'anomalies') loadAnomalies();
  if (page === 'briefing') loadBriefing();
}

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) + '<mark style="background:var(--accent);color:#000;border-radius:2px;padding:0 1px">' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
}

function runGlobalSearch(query) {
  const q = query.toLowerCase().trim();
  const results = document.getElementById('global-search-results');

  if (!q) {
    results.innerHTML = '<div class="search-empty">Type to search across all data...</div>';
    return;
  }

  let html = '';
  let totalResults = 0;

  // Search orphanages
  const matchedOrphanages = orphanages.filter(o =>
    o.name.toLowerCase().includes(q) ||
    o.city.toLowerCase().includes(q) ||
    o.district.toLowerCase().includes(q) ||
    (o.address || '').toLowerCase().includes(q)
  );
  if (matchedOrphanages.length) {
    html += '<div class="search-category">Orphanages</div>';
    matchedOrphanages.slice(0, 5).forEach(o => {
      const riskColor = o.risk_level === 'high' ? 'var(--danger)' : o.risk_level === 'medium' ? 'var(--warning)' : 'var(--success)';
      html += `<div class="search-result-item" onclick="openOrphanageDetail(${o.id})">
        <div class="search-result-icon" style="background:rgba(16,185,129,0.15)">&#127968;</div>
        <div class="search-result-info">
          <div class="search-result-title">${highlightMatch(o.name, q)}</div>
          <div class="search-result-sub">${highlightMatch(o.city, q)} &middot; ${o.total_children} children &middot; ${o.cameras} cameras</div>
        </div>
        <span class="search-result-badge" style="background:${riskColor}20;color:${riskColor}">${o.risk_level || 'low'}</span>
      </div>`;
    });
    totalResults += matchedOrphanages.length;
  }

  // Search children
  const getOrg = (id) => { const o = orphanages.find(x => x.id === id); return o ? o.name : '-'; };
  const matchedChildren = cachedChildren.filter(c =>
    c.name.toLowerCase().includes(q) ||
    String(c.age).includes(q) ||
    getOrg(c.orphanage_id).toLowerCase().includes(q)
  );
  if (matchedChildren.length) {
    html += '<div class="search-category">Children</div>';
    matchedChildren.slice(0, 5).forEach(c => {
      html += `<div class="search-result-item" onclick="navigateToPage('children')">
        <div class="search-result-icon" style="background:rgba(79,140,255,0.15)">&#128118;</div>
        <div class="search-result-info">
          <div class="search-result-title">${highlightMatch(c.name, q)}</div>
          <div class="search-result-sub">Age ${c.age} &middot; ${c.gender} &middot; ${getOrg(c.orphanage_id)}</div>
        </div>
      </div>`;
    });
    totalResults += matchedChildren.length;
  }

  // Search visitors
  const matchedVisitors = cachedVisitors.filter(v =>
    v.name.toLowerCase().includes(q) ||
    (v.cnic || '').includes(q) ||
    (v.phone || '').includes(q) ||
    v.purpose.toLowerCase().includes(q)
  );
  if (matchedVisitors.length) {
    html += '<div class="search-category">Visitors</div>';
    matchedVisitors.slice(0, 5).forEach(v => {
      const statusColor = v.status === 'checked_in' ? 'var(--success)' : 'var(--text-tertiary)';
      html += `<div class="search-result-item" onclick="navigateToPage('visitors')">
        <div class="search-result-icon" style="background:rgba(139,92,246,0.15)">&#128100;</div>
        <div class="search-result-info">
          <div class="search-result-title">${highlightMatch(v.name, q)}</div>
          <div class="search-result-sub">${v.purpose} &middot; ${v.cnic || 'No CNIC'}</div>
        </div>
        <span class="search-result-badge" style="background:${statusColor}20;color:${statusColor}">${v.status.replace('_', ' ')}</span>
      </div>`;
    });
    totalResults += matchedVisitors.length;
  }

  // Search alerts
  const matchedAlerts = cachedAlerts.filter(a =>
    a.message.toLowerCase().includes(q) ||
    a.type.toLowerCase().includes(q)
  );
  if (matchedAlerts.length) {
    html += '<div class="search-category">Alerts</div>';
    matchedAlerts.slice(0, 5).forEach(a => {
      const sevColor = a.severity === 'critical' ? 'var(--danger)' : a.severity === 'high' ? 'var(--warning)' : 'var(--accent)';
      html += `<div class="search-result-item" onclick="navigateToPage('alerts')">
        <div class="search-result-icon" style="background:rgba(239,68,68,0.15)">&#128276;</div>
        <div class="search-result-info">
          <div class="search-result-title">${highlightMatch(a.message.slice(0, 80), q)}</div>
          <div class="search-result-sub">${a.type.replace(/_/g, ' ')} &middot; ${a.acknowledged ? 'Resolved' : 'Pending'}</div>
        </div>
        <span class="search-result-badge" style="background:${sevColor}20;color:${sevColor}">${a.severity}</span>
      </div>`;
    });
    totalResults += matchedAlerts.length;
  }

  // Search incidents
  const matchedIncidents = cachedIncidents.filter(i =>
    i.label.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q) ||
    i.type.toLowerCase().includes(q) ||
    (i.orphanage_name || '').toLowerCase().includes(q)
  );
  if (matchedIncidents.length) {
    html += '<div class="search-category">AI Incidents</div>';
    matchedIncidents.slice(0, 5).forEach(i => {
      const sevColor = i.severity === 'critical' ? 'var(--danger)' : i.severity === 'high' ? 'var(--warning)' : 'var(--accent)';
      html += `<div class="search-result-item" onclick="navigateToPage('incidents')">
        <div class="search-result-icon" style="background:rgba(239,68,68,0.15)">&#129302;</div>
        <div class="search-result-info">
          <div class="search-result-title">${highlightMatch(i.label, q)}</div>
          <div class="search-result-sub">${i.type.replace(/_/g, ' ')} &middot; ${i.confidence}% confidence &middot; ${i.orphanage_name || ''}</div>
        </div>
        <span class="search-result-badge" style="background:${sevColor}20;color:${sevColor}">${i.severity}</span>
      </div>`;
    });
    totalResults += matchedIncidents.length;
  }

  if (!totalResults) {
    html = `<div class="search-no-results">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <div>No results for "<strong>${query}</strong>"</div>
      <div style="font-size:12px;margin-top:4px">Try searching by name, city, type, or status</div>
    </div>`;
  }

  results.innerHTML = html;
}

// ====== NOTIFICATION CENTER ======
let notifUnreadCount = 0;

function toggleNotifCenter() {
  document.getElementById('notif-panel').classList.toggle('open');
  if (document.getElementById('notif-panel').classList.contains('open')) loadNotifications();
}

async function loadNotifications() {
  try {
    const res = await fetch('/api/notifications');
    const notifs = await res.json();
    const list = document.getElementById('notif-panel-list');
    if (!notifs.length) {
      list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-tertiary)">No notifications yet</div>';
      return;
    }
    list.innerHTML = notifs.map(n => {
      const time = timeAgo(new Date(n.created_at));
      const icons = { security_alert: '&#128680;', ai_detection: '&#129302;', emotion_alert: '&#128546;' };
      const icon = icons[n.type] || '&#128276;';
      const bgColors = { security_alert: 'rgba(239,68,68,0.15)', ai_detection: 'rgba(139,92,246,0.15)', emotion_alert: 'rgba(251,191,36,0.15)' };
      return `<div class="notif-item ${n.read ? '' : 'unread'} ${n.severity || ''}" onclick="markNotifRead(${n.id})">
        <div class="notif-icon" style="background:${bgColors[n.type] || 'rgba(16,185,129,0.15)'}">${icon}</div>
        <div class="notif-info">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${time}</div>
        </div>
      </div>`;
    }).join('');
  } catch (e) { console.error(e); }
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

async function markNotifRead(id) {
  await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
  loadNotifications();
  updateNotifCount();
}

async function markAllNotifsRead() {
  await fetch('/api/notifications/read-all', { method: 'PUT' });
  loadNotifications();
  updateNotifCount();
}

async function updateNotifCount() {
  try {
    const res = await fetch('/api/notifications/unread-count');
    const { count } = await res.json();
    notifUnreadCount = count;
    const badge = document.getElementById('notif-count');
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  } catch (e) { /* ignore */ }
}

function handleNewNotification(notif) {
  notifUnreadCount++;
  const badge = document.getElementById('notif-count');
  badge.textContent = notifUnreadCount > 99 ? '99+' : notifUnreadCount;
  badge.style.display = 'flex';
  if (document.getElementById('notif-panel').classList.contains('open')) loadNotifications();
}

setInterval(updateNotifCount, 15000);

// ====== ANALYTICS / CHARTS ======
let incidentChart, alertTypeChart, severityChart;

async function loadAnalytics() {
  try {
    const [timelineRes, typesRes, incidentsRes] = await Promise.all([
      fetch('/api/analytics/incidents-timeline' + qs(currentFilter)),
      fetch('/api/analytics/alerts-by-type' + qs(currentFilter)),
      fetch('/api/incidents' + qs(currentFilter)),
    ]);
    const timeline = await timelineRes.json();
    const alertTypes = await typesRes.json();
    const incidents = await incidentsRes.json();

    // Incidents timeline line chart
    const ctx1 = document.getElementById('chart-incidents-timeline');
    if (incidentChart) incidentChart.destroy();
    incidentChart = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: timeline.map(d => d.date.slice(5)),
        datasets: [{
          label: 'Total Incidents',
          data: timeline.map(d => d.total),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#10b981',
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#8a8a9a' } } },
        scales: {
          x: { ticks: { color: '#55555f' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#55555f' }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true }
        }
      }
    });

    // Alerts by type doughnut
    const ctx2 = document.getElementById('chart-alerts-type');
    if (alertTypeChart) alertTypeChart.destroy();
    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
    alertTypeChart = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: alertTypes.map(a => a.type),
        datasets: [{
          data: alertTypes.map(a => a.count),
          backgroundColor: colors.slice(0, alertTypes.length),
          borderColor: '#111114',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8a8a9a', padding: 16, usePointStyle: true } }
        }
      }
    });

    // Severity breakdown bar chart
    const severities = { critical: 0, high: 0, medium: 0, low: 0 };
    incidents.forEach(i => { severities[i.severity] = (severities[i.severity] || 0) + 1; });
    const ctx3 = document.getElementById('chart-severity');
    if (severityChart) severityChart.destroy();
    severityChart = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
          label: 'Count',
          data: [severities.critical, severities.high, severities.medium, severities.low || 0],
          backgroundColor: ['#ef4444', '#f59e0b', '#06b6d4', '#10b981'],
          borderRadius: 6,
          barThickness: 40,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#8a8a9a' }, grid: { display: false } },
          y: { ticks: { color: '#55555f' }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true }
        }
      }
    });
  } catch (e) { console.error(e); }
}

// ====== CHILD GROWTH TRACKER ======
let growthChart;

async function viewGrowth(childId, name) {
  document.getElementById('growth-child-id').value = childId;
  document.getElementById('growth-modal-title').textContent = `Growth Tracker - ${name}`;
  document.getElementById('growth-form').reset();

  try {
    const res = await fetch(`/api/children/${childId}/growth`);
    const records = await res.json();

    // Render chart
    const ctx = document.getElementById('chart-growth');
    if (growthChart) growthChart.destroy();
    if (records.length > 1) {
      const sorted = [...records].reverse();
      growthChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sorted.map(r => r.recorded_date),
          datasets: [
            { label: 'Height (cm)', data: sorted.map(r => r.height_cm), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: false, tension: 0.3, yAxisID: 'y' },
            { label: 'Weight (kg)', data: sorted.map(r => r.weight_kg), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: false, tension: 0.3, yAxisID: 'y1' },
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#8a8a9a' } } },
          scales: {
            x: { ticks: { color: '#55555f' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { type: 'linear', position: 'left', ticks: { color: '#10b981' }, grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Height (cm)', color: '#10b981' } },
            y1: { type: 'linear', position: 'right', ticks: { color: '#8b5cf6' }, grid: { display: false }, title: { display: true, text: 'Weight (kg)', color: '#8b5cf6' } }
          }
        }
      });
      document.getElementById('growth-chart-container').style.display = 'block';
    } else {
      document.getElementById('growth-chart-container').style.display = records.length ? 'none' : 'none';
    }

    // Render history
    document.getElementById('growth-history').innerHTML = records.length
      ? '<h4 style="margin:16px 0 8px;font-size:13px;color:var(--text-secondary)">History</h4>' + records.map(r => `
        <div class="growth-record">
          <span class="growth-date">${r.recorded_date}</span>
          <span class="growth-val">${r.height_cm} cm</span>
          <span class="growth-val">${r.weight_kg} kg</span>
          <span class="growth-val" style="color:var(--accent)">BMI ${r.bmi}</span>
          <span style="color:var(--text-secondary);font-size:12px">${r.notes || ''}</span>
        </div>`).join('')
      : '<p style="color:var(--text-tertiary);font-size:12px;margin-top:12px">No growth records yet. Add the first one above.</p>';

    openModal('growth-modal');
  } catch (e) { console.error(e); }
}

async function addGrowthRecord(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const childId = data.child_id; delete data.child_id;
  await fetch(`/api/children/${childId}/growth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const name = document.getElementById('growth-modal-title').textContent.replace('Growth Tracker - ', '');
  viewGrowth(childId, name);
}

// ====== EMOTION DETECTION ======
const emotionEmojis = {
  distressed: '&#128553;', crying: '&#128557;', anxious: '&#128552;', fearful: '&#128560;',
  happy: '&#128522;', neutral: '&#128528;', excited: '&#129321;', sad: '&#128546;'
};

async function loadEmotions() {
  try {
    const res = await fetch('/api/emotions' + qs(currentFilter));
    const detections = await res.json();

    const counts = {};
    detections.forEach(d => { counts[d.emotion] = (counts[d.emotion] || 0) + 1; });
    const distressed = (counts.distressed || 0) + (counts.crying || 0) + (counts.fearful || 0);
    const positive = (counts.happy || 0) + (counts.excited || 0);
    const neutral = counts.neutral || 0;
    const concerned = (counts.anxious || 0) + (counts.sad || 0);

    document.getElementById('emotion-stats').innerHTML = `
      <div class="emo-stat"><div class="emo-icon">&#128553;</div><div class="emo-val" style="color:var(--danger)">${distressed}</div><div class="emo-label">Distressed</div></div>
      <div class="emo-stat"><div class="emo-icon">&#128546;</div><div class="emo-val" style="color:var(--warning)">${concerned}</div><div class="emo-label">Concerned</div></div>
      <div class="emo-stat"><div class="emo-icon">&#128528;</div><div class="emo-val" style="color:var(--cyan)">${neutral}</div><div class="emo-label">Neutral</div></div>
      <div class="emo-stat"><div class="emo-icon">&#128522;</div><div class="emo-val" style="color:var(--success)">${positive}</div><div class="emo-label">Positive</div></div>
    `;

    document.getElementById('emotion-feed').innerHTML = detections.map(d => {
      const emoji = emotionEmojis[d.emotion] || '&#128528;';
      const time = timeAgo(new Date(d.detected_at));
      const sevClass = d.severity === 'high' ? 'high' : d.severity === 'medium' ? 'medium' : '';
      return `<div class="emotion-item">
        <div class="emotion-emoji">${emoji}</div>
        <div class="emotion-info">
          <div class="emotion-label">${d.child_name} - <span style="text-transform:capitalize">${d.emotion}</span></div>
          <div class="emotion-meta">${d.orphanage_name} &middot; ${d.zone} &middot; ${d.confidence}% confidence &middot; ${time}</div>
        </div>
        <div class="emotion-action ${sevClass}">${d.action_taken}</div>
      </div>`;
    }).join('') || '<p style="color:var(--text-secondary);padding:20px">No emotion detections yet.</p>';
  } catch (e) { console.error(e); }
}

function handleEmotionDetection(detection) {
  const feed = document.getElementById('emotion-feed');
  if (feed && document.getElementById('page-emotions').classList.contains('active')) {
    loadEmotions();
  }
}

// ====== ANOMALY DETECTION ======
async function loadAnomalies() {
  try {
    const res = await fetch('/api/analytics/anomalies');
    const anomalies = await res.json();

    document.getElementById('anomaly-list').innerHTML = anomalies.map(a => {
      const changeClass = a.change_percent > 0 ? 'up' : a.change_percent < 0 ? 'down' : 'flat';
      const changeText = a.change_percent > 0 ? `+${a.change_percent}%` : a.change_percent < 0 ? `${a.change_percent}%` : '0%';
      const arrow = a.change_percent > 0 ? '&#9650;' : a.change_percent < 0 ? '&#9660;' : '&#8212;';
      return `<div class="anomaly-card ${a.anomaly_level}">
        <div>
          <div class="anomaly-name">${a.name}</div>
          <div class="anomaly-city">${a.city}</div>
        </div>
        <div class="anomaly-stats">
          <div class="anomaly-stat-item">
            <div class="anomaly-stat-val">${a.incidents_this_week}</div>
            <div class="anomaly-stat-label">This Week</div>
          </div>
          <div class="anomaly-stat-item">
            <div class="anomaly-stat-val" style="color:var(--text-secondary)">${a.incidents_last_week}</div>
            <div class="anomaly-stat-label">Last Week</div>
          </div>
          <div class="anomaly-stat-item">
            <div class="anomaly-stat-val" style="color:var(--danger)">${a.critical_this_week}</div>
            <div class="anomaly-stat-label">Critical</div>
          </div>
          <div class="anomaly-stat-item">
            <div class="anomaly-stat-val" style="color:var(--warning)">${a.unresolved_alerts}</div>
            <div class="anomaly-stat-label">Unresolved</div>
          </div>
        </div>
        <div class="anomaly-change ${changeClass}">${arrow} ${changeText}</div>
      </div>`;
    }).join('') || '<p style="color:var(--text-secondary);padding:20px">No data yet.</p>';
  } catch (e) { console.error(e); }
}

// ====== DAILY BRIEFING ======
async function loadBriefing() {
  try {
    const res = await fetch('/api/briefing');
    const b = await res.json();

    const breakdownHtml = Object.entries(b.incident_breakdown).map(([type, count]) =>
      `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
        <span style="text-transform:capitalize;color:var(--text-secondary)">${type.replace(/_/g, ' ')}</span>
        <span style="font-weight:700;color:var(--text-primary)">${count}</span>
      </div>`
    ).join('') || '<p style="color:var(--text-tertiary);font-size:12px">No incidents today</p>';

    const criticalHtml = b.recent_critical.map(i =>
      `<div style="padding:10px;background:var(--bg-elevated);border-radius:var(--radius-sm);margin-bottom:8px;border-left:3px solid var(--danger)">
        <div style="font-weight:600;font-size:13px">${i.label}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${i.description}</div>
        <div style="font-size:10px;color:var(--text-tertiary);margin-top:4px">${new Date(i.detected_at).toLocaleString('en-PK')}</div>
      </div>`
    ).join('') || '<p style="color:var(--text-tertiary);font-size:12px">No critical incidents today</p>';

    document.getElementById('briefing-content').innerHTML = `
      <div class="briefing-card">
        <h3>&#128203; System Overview - ${new Date(b.date).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
        <div class="briefing-grid">
          <div class="briefing-stat"><div class="bv" style="color:var(--accent)">${b.summary.total_orphanages}</div><div class="bl">Total Orphanages</div></div>
          <div class="briefing-stat"><div class="bv" style="color:var(--success)">${b.summary.online}</div><div class="bl">Online</div></div>
          <div class="briefing-stat"><div class="bv" style="color:var(--cyan)">${b.summary.total_children}</div><div class="bl">Children</div></div>
          <div class="briefing-stat"><div class="bv" style="color:var(--purple)">${b.summary.active_visitors}</div><div class="bl">Active Visitors</div></div>
        </div>
      </div>

      <div class="briefing-card">
        <h3>&#9888; Today's Activity</h3>
        <div class="briefing-grid">
          <div class="briefing-stat"><div class="bv" style="color:var(--danger)">${b.today.incidents}</div><div class="bl">Incidents</div></div>
          <div class="briefing-stat"><div class="bv" style="color:var(--danger)">${b.today.critical_incidents}</div><div class="bl">Critical</div></div>
          <div class="briefing-stat"><div class="bv" style="color:var(--warning)">${b.today.alerts}</div><div class="bl">Alerts</div></div>
          <div class="briefing-stat"><div class="bv" style="color:var(--success)">${b.today.resolved_alerts}</div><div class="bl">Resolved</div></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="briefing-card">
          <h3>&#128200; Incident Breakdown</h3>
          ${breakdownHtml}
        </div>
        <div class="briefing-card">
          <h3>&#128680; Critical Incidents</h3>
          ${criticalHtml}
        </div>
      </div>

      <div class="briefing-card">
        <h3>&#127942; Performance</h3>
        <div class="briefing-highlight">
          ${b.top_performer ? `<div class="briefing-highlight-card good">
            <div class="bh-label">Top Performer</div>
            <div class="bh-name" style="color:var(--success)">${b.top_performer.name}</div>
            <div class="bh-score">Score: ${b.top_performer.score}/100 &middot; Grade ${b.top_performer.grade}</div>
          </div>` : ''}
          ${b.needs_attention ? `<div class="briefing-highlight-card bad">
            <div class="bh-label">Needs Attention</div>
            <div class="bh-name" style="color:var(--danger)">${b.needs_attention.name}</div>
            <div class="bh-score">Score: ${b.needs_attention.score}/100 &middot; Grade ${b.needs_attention.grade} &middot; ${b.needs_attention.open_incidents} open incidents</div>
          </div>` : ''}
        </div>
      </div>

      <div style="text-align:center;padding:16px;color:var(--text-tertiary);font-size:11px">
        Generated at ${new Date(b.generated_at).toLocaleString('en-PK')} &middot; OrphanGuard AI Punjab Command Center
      </div>
    `;
  } catch (e) { console.error(e); }
}

// ====== LOGIN SYSTEM ======
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  if ((email === 'admin' && password === 'admin123') || email.includes('@')) {
    document.getElementById('login-screen').style.display = 'none';
    document.body.style.overflow = '';
    sessionStorage.setItem('og_auth', '1');
  } else {
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Invalid credentials';
    btn.style.background = 'var(--danger)';
    setTimeout(() => { btn.textContent = 'Access Command Center'; btn.style.background = ''; }, 2000);
  }
}

function checkAuth() {
  if (sessionStorage.getItem('og_auth') === '1') {
    document.getElementById('login-screen').style.display = 'none';
  }
}

function logout() {
  sessionStorage.removeItem('og_auth');
  document.getElementById('login-screen').style.display = '';
}

checkAuth();

// ====== COMPLAINT PORTAL ======
function showComplaintPortal() {
  const portal = document.getElementById('complaint-portal');
  portal.style.display = '';
  document.getElementById('complaint-form').style.display = '';
  document.getElementById('complaint-success').style.display = 'none';
  const sel = document.getElementById('complaint-orphanage');
  sel.innerHTML = '<option value="">Select orphanage or location</option><option value="other">Other Location (specify below)</option>' +
    orphanages.map(o => `<option value="${o.id}">${o.name} - ${o.city}</option>`).join('');
}

function hideComplaintPortal() {
  document.getElementById('complaint-portal').style.display = 'none';
}

function submitComplaint(e) {
  e.preventDefault();
  const ref = 'CPB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  document.getElementById('complaint-ref').textContent = ref;
  document.getElementById('complaint-form').style.display = 'none';
  document.getElementById('complaint-success').style.display = '';
}

// ====== WHATSAPP PANEL ======
function toggleWhatsAppPanel() {
  document.getElementById('whatsapp-panel').classList.toggle('open');
}

function sendWAMessage() {
  const input = document.getElementById('wa-input');
  const msg = input.value.trim();
  if (!msg) return;
  const chat = document.getElementById('wa-chat');
  const now = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  chat.insertAdjacentHTML('beforeend', `<div class="wa-msg outgoing"><div class="wa-msg-body">${msg}</div><div class="wa-msg-time">${now} &#10003;&#10003;</div></div>`);
  input.value = '';
  chat.scrollTop = chat.scrollHeight;
  setTimeout(() => {
    chat.insertAdjacentHTML('beforeend', `<div class="wa-msg incoming"><div class="wa-msg-sender">OrphanGuard AI Bot</div><div class="wa-msg-body">&#9989; Message received. Forwarding to relevant district officer.</div><div class="wa-msg-time">${now}</div></div>`);
    chat.scrollTop = chat.scrollHeight;
  }, 1500);
}

// ====== PDF REPORT GENERATION ======
async function generatePDFReport() {
  const btn = event.target.closest('button');
  const origText = btn.innerHTML;
  btn.innerHTML = '<span style="animation:spin 1s linear infinite;display:inline-block">&#9696;</span> Generating...';
  btn.disabled = true;
  try {
    const [statsRes, rankingsRes, incidentsRes, alertsRes] = await Promise.all([
      fetch('/api/stats'), fetch('/api/rankings'), fetch('/api/incidents'), fetch('/api/alerts')
    ]);
    const [stats, rankings, incidents, alerts] = await Promise.all([
      statsRes.json(), rankingsRes.json(), incidentsRes.json(), alertsRes.json()
    ]);
    const avgScore = rankings.length ? Math.round(rankings.reduce((s, r) => s + r.score, 0) / rankings.length) : 0;
    const critical = incidents.filter(i => i.severity === 'critical').length;
    const reviewed = incidents.filter(i => i.reviewed).length;
    const unresolved = alerts.filter(a => !a.acknowledged).length;

    const reportHtml = `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OrphanGuard AI Monthly Safety Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1a1a2e;padding:40px;max-width:800px;margin:0 auto}
.header{text-align:center;border-bottom:3px solid #10b981;padding-bottom:20px;margin-bottom:30px}
.header h1{color:#10b981;font-size:24px}.header p{color:#666;margin-top:8px}
.badge{display:inline-block;background:#10b981;color:white;padding:4px 14px;border-radius:20px;font-size:11px;margin-top:10px}
.section{margin-bottom:30px}.section h2{font-size:16px;color:#10b981;border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:15px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:20px}
.stat{background:#f0fdf4;padding:15px;border-radius:8px;text-align:center}
.stat .val{font-size:28px;font-weight:700;color:#10b981}.stat .label{font-size:11px;color:#666;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f0fdf4;color:#10b981;padding:10px;text-align:left}
td{padding:8px 10px;border-bottom:1px solid #eee}.grade{font-weight:700;padding:2px 8px;border-radius:4px}
.grade-a{color:#10b981}.grade-b{color:#3b82f6}.grade-c{color:#f59e0b}.grade-d,.grade-f{color:#ef4444}
.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:2px solid #10b981;font-size:11px;color:#666}
.confidential{background:#fef2f2;color:#ef4444;padding:8px;text-align:center;font-size:11px;border-radius:4px;margin-top:20px}
@media print{body{padding:20px}@page{margin:1cm}}
</style></head><body>
<div class="header">
<h1>&#128737; OrphanGuard AI</h1>
<p>Monthly Safety & Compliance Report — Punjab Province</p>
<p style="font-size:12px;color:#888;margin-top:4px">Generated: ${new Date().toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
<span class="badge">OFFICIAL — Government of Punjab</span>
</div>

<div class="section"><h2>Executive Summary</h2>
<div class="stats">
<div class="stat"><div class="val">${stats.totalOrphanages}</div><div class="label">Orphanages Monitored</div></div>
<div class="stat"><div class="val">${stats.totalChildren}</div><div class="label">Children Protected</div></div>
<div class="stat"><div class="val">${avgScore}</div><div class="label">Avg Safety Score</div></div>
<div class="stat"><div class="val">${stats.onlineOrphanages}/${stats.totalOrphanages}</div><div class="label">Online Status</div></div>
</div>
<div class="stats">
<div class="stat"><div class="val" style="color:#ef4444">${critical}</div><div class="label">Critical Incidents</div></div>
<div class="stat"><div class="val" style="color:#f59e0b">${incidents.length}</div><div class="label">Total Detections</div></div>
<div class="stat"><div class="val" style="color:#3b82f6">${reviewed}</div><div class="label">Reviewed</div></div>
<div class="stat"><div class="val" style="color:#ef4444">${unresolved}</div><div class="label">Unresolved Alerts</div></div>
</div></div>

<div class="section"><h2>Orphanage Safety Rankings</h2>
<table><thead><tr><th>#</th><th>Orphanage</th><th>City</th><th>Children</th><th>Score</th><th>Grade</th><th>Critical</th></tr></thead>
<tbody>${rankings.map(r => `<tr><td>${r.rank}</td><td>${r.name}</td><td>${r.city}</td><td>${r.total_children}</td><td>${r.score}/100</td><td><span class="grade grade-${r.grade.toLowerCase()}">${r.grade}</span></td><td style="color:${r.criticalIncidents > 0 ? '#ef4444' : '#10b981'}">${r.criticalIncidents}</td></tr>`).join('')}
</tbody></table></div>

<div class="section"><h2>AI Detection Summary</h2>
<p style="font-size:13px;color:#666;margin-bottom:10px">ViolenceNet v2.1 and EmotionNet analyzed ${incidents.reduce((s,i)=>s+i.frame_count,0).toLocaleString()} video frames across all monitored facilities.</p>
<table><thead><tr><th>Type</th><th>Count</th><th>Avg Confidence</th></tr></thead>
<tbody>${Object.entries(incidents.reduce((acc,i)=>{if(!acc[i.type])acc[i.type]={count:0,conf:0};acc[i.type].count++;acc[i.type].conf+=i.confidence;return acc},{})).map(([type,d])=>`<tr><td style="text-transform:capitalize">${type.replace(/_/g,' ')}</td><td>${d.count}</td><td>${(d.conf/d.count).toFixed(1)}%</td></tr>`).join('')}
</tbody></table></div>

<div class="section"><h2>Recommendations</h2>
<ul style="font-size:13px;line-height:1.8;padding-left:20px">
${rankings.filter(r=>r.grade==='D'||r.grade==='F').map(r=>`<li><strong>${r.name}</strong> (Grade ${r.grade}): Requires immediate inspection and improvement plan.</li>`).join('')}
${rankings.filter(r=>r.cameraCoverage<80).map(r=>`<li><strong>${r.name}</strong>: Camera coverage at ${r.cameraCoverage}% — below 80% minimum standard.</li>`).join('')}
<li>Continue 24/7 AI surveillance across all facilities.</li>
<li>Schedule quarterly in-person inspections for Grade C and below.</li>
</ul></div>

<div class="confidential">CONFIDENTIAL — For authorized personnel of the Punjab Social Welfare Department only.</div>

<div class="footer">
<p><strong>OrphanGuard AI</strong> — Punjab Child Protection Command Center</p>
<p>Government of Punjab | Social Welfare & Bait-ul-Maal Department</p>
<p style="margin-top:8px">Emergency Helpline: 1121 | Punjab Child Protection Bureau</p>
</div>
</body></html>`;

    const win = window.open('', '_blank');
    win.document.write(reportHtml);
    win.document.close();
    setTimeout(() => win.print(), 500);
  } catch (e) { console.error(e); alert('Error generating report'); }
  finally { btn.innerHTML = origText; btn.disabled = false; }
}

// Init - load all data so global search works
loadOrphanages();
loadStats();
loadIncidents();
loadAlerts();
loadChildren();
loadVisitors();
loadActivity();
updateNotifCount();
