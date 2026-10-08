// WebSocket connection
const ws = new WebSocket(`ws://${location.host}`);
let pendingAlerts = 0;

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'zone_update':
      updateZoneCard(data.zone, data.count);
      break;
    case 'alert':
      handleNewAlert(data.alert);
      break;
    case 'alert_ack':
      markAlertAcknowledged(data.alertId);
      break;
    case 'visitor_checkin':
    case 'visitor_checkout':
      loadVisitors();
      loadStats();
      break;
    case 'child_added':
      loadChildren();
      loadStats();
      break;
  }
};

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('page-' + item.dataset.page).classList.add('active');

    if (item.dataset.page === 'cameras') initCameras();
    if (item.dataset.page === 'children') loadChildren();
    if (item.dataset.page === 'visitors') loadVisitors();
    if (item.dataset.page === 'alerts') loadAlerts();
    if (item.dataset.page === 'activity') loadActivity();
  });
});

// Live clock
function updateClock() {
  const now = new Date();
  const el = document.getElementById('live-time');
  if (el) el.textContent = now.toLocaleString('en-PK', {
    weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
setInterval(updateClock, 1000);
updateClock();

// Load stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    document.getElementById('stat-children').textContent = data.totalChildren;
    document.getElementById('stat-visitors').textContent = data.activeVisitors;
    document.getElementById('stat-alerts').textContent = data.pendingAlerts;
    pendingAlerts = data.pendingAlerts;
    updateAlertBadge();
    renderZones(data.zones);
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
}

function updateAlertBadge() {
  const badge = document.getElementById('alert-badge');
  if (pendingAlerts > 0) {
    badge.style.display = 'inline';
    badge.textContent = pendingAlerts;
  } else {
    badge.style.display = 'none';
  }
}

// Zones
function renderZones(zones) {
  const grid = document.getElementById('zone-grid');
  grid.innerHTML = zones.map(z => {
    const ratio = z.expected_count > 0 ? z.current_count / z.expected_count : 0;
    const statusClass = ratio > 1.3 ? 'danger' : ratio > 1 ? 'warning' : '';
    return `
      <div class="zone-card">
        <div class="zone-status ${statusClass}"></div>
        <div class="zone-name">${z.name}</div>
        <div class="zone-count">${z.current_count}</div>
        <div class="zone-expected">Expected: ${z.expected_count} | ${z.description || ''}</div>
      </div>
    `;
  }).join('');
}

function updateZoneCard(zoneName, count) {
  const cards = document.querySelectorAll('.zone-card');
  cards.forEach(card => {
    if (card.querySelector('.zone-name').textContent.trim() === zoneName) {
      card.querySelector('.zone-count').textContent = count;
    }
  });
}

// Alerts
function handleNewAlert(alert) {
  pendingAlerts++;
  updateAlertBadge();
  document.getElementById('stat-alerts').textContent = pendingAlerts;

  const dashAlerts = document.getElementById('dashboard-alerts');
  const html = renderAlertItem(alert);
  dashAlerts.insertAdjacentHTML('afterbegin', html);
  if (dashAlerts.children.length > 5) dashAlerts.lastChild.remove();

  const alertsList = document.getElementById('alerts-list');
  if (alertsList.children.length > 0) {
    alertsList.insertAdjacentHTML('afterbegin', html);
  }

  if (alert.severity === 'critical') {
    showNotification(alert.message);
  }
}

function renderAlertItem(a) {
  const time = new Date(a.created_at).toLocaleTimeString('en-PK');
  return `
    <div class="alert-item ${a.acknowledged ? 'acknowledged' : ''}" id="alert-${a.id}">
      <div class="alert-severity ${a.severity}"></div>
      <div class="alert-content">
        <div class="alert-msg">${a.message}</div>
        <div class="alert-time">${a.type.replace(/_/g, ' ').toUpperCase()} &middot; ${time}</div>
      </div>
      <div class="alert-actions">
        ${!a.acknowledged ? `<button class="btn-ack" onclick="acknowledgeAlert(${a.id})">Acknowledge</button>` : '<span style="color:var(--success);font-size:12px">Resolved</span>'}
      </div>
    </div>
  `;
}

async function loadAlerts() {
  try {
    const res = await fetch('/api/alerts');
    const alerts = await res.json();
    document.getElementById('alerts-list').innerHTML = alerts.map(renderAlertItem).join('');
    document.getElementById('dashboard-alerts').innerHTML = alerts.slice(0, 5).map(renderAlertItem).join('');
  } catch (e) {
    console.error('Failed to load alerts:', e);
  }
}

async function acknowledgeAlert(id) {
  try {
    await fetch(`/api/alerts/${id}/acknowledge`, { method: 'PUT' });
    pendingAlerts = Math.max(0, pendingAlerts - 1);
    updateAlertBadge();
    document.getElementById('stat-alerts').textContent = pendingAlerts;
  } catch (e) {
    console.error('Failed to acknowledge alert:', e);
  }
}

function markAlertAcknowledged(id) {
  const el = document.getElementById('alert-' + id);
  if (el) {
    el.classList.add('acknowledged');
    const btn = el.querySelector('.btn-ack');
    if (btn) btn.outerHTML = '<span style="color:var(--success);font-size:12px">Resolved</span>';
  }
}

function showNotification(msg) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('OrphanGuard AI Alert', { body: msg });
  }
}

// Children
async function loadChildren() {
  try {
    const res = await fetch('/api/children');
    const children = await res.json();
    document.getElementById('children-table').innerHTML = children.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.age}</td>
        <td>${c.gender}</td>
        <td>${new Date(c.admitted_date).toLocaleDateString('en-PK')}</td>
        <td>${c.medical_notes || '-'}</td>
        <td><span class="badge-status ${c.status}">${c.status}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="viewHealth(${c.id}, '${c.name}')">Health</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Failed to load children:', e);
  }
}

async function addChild(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  try {
    await fetch('/api/children', { method: 'POST', body: formData });
    form.reset();
    closeModal('child-modal');
    loadChildren();
    loadStats();
  } catch (err) {
    console.error('Failed to add child:', err);
  }
}

// Health records
async function viewHealth(childId, childName) {
  document.getElementById('health-child-id').value = childId;
  try {
    const res = await fetch(`/api/children/${childId}/health`);
    const records = await res.json();

    const modal = document.getElementById('health-modal');
    modal.querySelector('h3').textContent = `Health Records - ${childName}`;

    let timelineHtml = '<div class="health-timeline">';
    if (records.length === 0) {
      timelineHtml += '<p style="color:var(--text-secondary);font-size:13px">No health records yet.</p>';
    } else {
      timelineHtml += records.map(r => `
        <div class="timeline-item">
          <div class="timeline-date">${new Date(r.record_date).toLocaleDateString('en-PK')}</div>
          <div class="timeline-type">${r.record_type}</div>
          <div class="timeline-desc">${r.description}${r.doctor_name ? ' - Dr. ' + r.doctor_name : ''}</div>
          ${r.next_due ? `<div class="timeline-desc" style="color:var(--warning)">Next due: ${new Date(r.next_due).toLocaleDateString('en-PK')}</div>` : ''}
        </div>
      `).join('');
    }
    timelineHtml += '</div>';

    const form = document.getElementById('health-form');
    const existingTimeline = modal.querySelector('.health-timeline');
    if (existingTimeline) existingTimeline.remove();
    form.insertAdjacentHTML('beforebegin', timelineHtml);

    openModal('health-modal');
  } catch (err) {
    console.error('Failed to load health records:', err);
  }
}

async function addHealthRecord(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const childId = data.child_id;
  delete data.child_id;
  try {
    await fetch(`/api/children/${childId}/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    closeModal('health-modal');
    form.reset();
  } catch (err) {
    console.error('Failed to add health record:', err);
  }
}

// Visitors
async function loadVisitors() {
  try {
    const res = await fetch('/api/visitors');
    const visitors = await res.json();
    document.getElementById('visitors-table').innerHTML = visitors.map(v => `
      <tr>
        <td><strong>${v.name}</strong></td>
        <td>${v.cnic || '-'}</td>
        <td>${v.phone || '-'}</td>
        <td>${v.purpose}</td>
        <td>${new Date(v.check_in).toLocaleString('en-PK')}</td>
        <td>${v.check_out ? new Date(v.check_out).toLocaleString('en-PK') : '-'}</td>
        <td><span class="badge-status ${v.status}">${v.status.replace('_', ' ')}</span></td>
        <td>
          ${v.status === 'checked_in' ? `<button class="btn btn-outline btn-sm" onclick="checkoutVisitor(${v.id})">Check Out</button>` : ''}
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Failed to load visitors:', e);
  }
}

async function addVisitor(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  try {
    await fetch('/api/visitors', { method: 'POST', body: formData });
    form.reset();
    closeModal('visitor-modal');
    stopVisitorCam();
    loadVisitors();
    loadStats();
  } catch (err) {
    console.error('Failed to add visitor:', err);
  }
}

async function checkoutVisitor(id) {
  try {
    await fetch(`/api/visitors/${id}/checkout`, { method: 'PUT' });
    loadVisitors();
    loadStats();
  } catch (e) {
    console.error('Failed to checkout visitor:', e);
  }
}

// Visitor camera
let visitorStream = null;

function startVisitorCam() {
  const video = document.getElementById('visitor-cam');
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
    .then(stream => {
      visitorStream = stream;
      video.srcObject = stream;
    })
    .catch(err => console.log('Camera not available:', err));
}

function stopVisitorCam() {
  if (visitorStream) {
    visitorStream.getTracks().forEach(t => t.stop());
    visitorStream = null;
  }
}

function captureVisitorPhoto() {
  const video = document.getElementById('visitor-cam');
  const canvas = document.getElementById('visitor-canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  canvas.toBlob(blob => {
    const file = new File([blob], 'visitor-photo.jpg', { type: 'image/jpeg' });
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'photo';
    input.files = dt.files;
    input.style.display = 'none';
    const form = document.getElementById('visitor-form');
    const existing = form.querySelector('input[name="photo"]');
    if (existing) existing.remove();
    form.appendChild(input);
    canvas.style.display = 'block';
    canvas.style.borderRadius = '8px';
    canvas.style.width = '100%';
    canvas.style.marginTop = '8px';
  }, 'image/jpeg', 0.8);
}

// Camera feeds with AI detection
let cameraStreams = [];

function initCameras() {
  const grid = document.getElementById('camera-grid');
  const zones = ['Main Hall', 'Main Gate', 'Garden', 'Kitchen'];

  grid.innerHTML = zones.map((zone, i) => `
    <div class="camera-feed">
      <div class="feed-header">
        <span>${zone}</span>
        <div class="live-dot"></div>
      </div>
      <div class="feed-body" id="feed-${i}">
        ${i === 0 ? `<video id="cam-live" autoplay muted playsinline></video>` :
          `<div class="no-feed"><span style="font-size:32px">&#128247;</span>Simulated Feed</div>`}
        <div class="feed-overlay">
          <span>AI Detection: Active</span>
          <span id="feed-count-${i}">Persons: 0</span>
        </div>
      </div>
    </div>
  `).join('');

  // Try to start webcam for first feed
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
    .then(stream => {
      cameraStreams.push(stream);
      const video = document.getElementById('cam-live');
      if (video) video.srcObject = stream;
      startSimulatedDetection();
    })
    .catch(() => {
      const feed0 = document.getElementById('feed-0');
      if (feed0) feed0.innerHTML = `
        <div class="no-feed"><span style="font-size:32px">&#128247;</span>Camera unavailable<br><small>Using simulated feed</small></div>
        <div class="feed-overlay"><span>AI Detection: Simulated</span><span id="feed-count-0">Persons: 0</span></div>
      `;
      startSimulatedDetection();
    });
}

function startSimulatedDetection() {
  setInterval(() => {
    for (let i = 0; i < 4; i++) {
      const count = Math.floor(Math.random() * 8);
      const el = document.getElementById('feed-count-' + i);
      if (el) el.textContent = `Persons: ${count}`;
    }

    // Simulate detection boxes on live feed
    const feed = document.getElementById('feed-0');
    if (feed) {
      feed.querySelectorAll('.detection-box').forEach(b => b.remove());
      const numDetections = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numDetections; j++) {
        const box = document.createElement('div');
        box.className = 'detection-box';
        const x = 10 + Math.random() * 50;
        const y = 10 + Math.random() * 40;
        box.style.cssText = `left:${x}%;top:${y}%;width:${60+Math.random()*40}px;height:${80+Math.random()*40}px`;
        box.innerHTML = `<div class="det-label">Person ${(Math.random()*100).toFixed(0)}%</div>`;
        feed.appendChild(box);
      }
    }
  }, 3000);
}

// Activity log
async function loadActivity() {
  try {
    const res = await fetch('/api/activity');
    const activities = await res.json();
    const icons = {
      visitor_entry: { icon: '&#128694;', bg: 'rgba(79,140,255,0.15)' },
      headcount_mismatch: { icon: '&#9888;', bg: 'rgba(251,191,36,0.15)' },
      restricted_zone: { icon: '&#128683;', bg: 'rgba(248,113,113,0.15)' },
      perimeter_breach: { icon: '&#128680;', bg: 'rgba(239,68,68,0.15)' },
      child_missing: { icon: '&#128557;', bg: 'rgba(239,68,68,0.15)' },
      fall_detected: { icon: '&#9888;', bg: 'rgba(251,191,36,0.15)' },
      visitor_overstay: { icon: '&#9201;', bg: 'rgba(251,191,36,0.15)' },
      crowd_forming: { icon: '&#128101;', bg: 'rgba(79,140,255,0.15)' },
    };

    document.getElementById('activity-feed').innerHTML = activities.map(a => {
      const cfg = icons[a.event_type] || { icon: '&#128196;', bg: 'rgba(154,160,166,0.15)' };
      const time = new Date(a.created_at).toLocaleTimeString('en-PK');
      return `
        <div class="activity-item">
          <div class="activity-icon" style="background:${cfg.bg}">${cfg.icon}</div>
          <div>${a.description}${a.zone_name ? ` <small style="color:var(--text-secondary)">- ${a.zone_name}</small>` : ''}</div>
          <div class="activity-time">${time}</div>
        </div>
      `;
    }).join('') || '<p style="color:var(--text-secondary);padding:20px">No activity recorded yet.</p>';
  } catch (e) {
    console.error('Failed to load activity:', e);
  }
}

// Modal helpers
function openModal(id) {
  document.getElementById(id).classList.add('active');
  if (id === 'visitor-modal') startVisitorCam();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'visitor-modal') stopVisitorCam();
  if (id === 'health-modal') {
    const timeline = document.querySelector('#health-modal .health-timeline');
    if (timeline) timeline.remove();
  }
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Init
loadStats();
loadAlerts();
