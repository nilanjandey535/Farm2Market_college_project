// corestorage.js - Cold Storage Expert Dashboard
const API = window.API_BASE_URL || 'http://localhost:4000/api';

function getSpecialistId() {
    return localStorage.getItem('specialist_id') || localStorage.getItem('user_id');
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
}

function showMsg(divId, message, type = 'success') {
    const div = document.getElementById(divId);
    if (!div) return;
    div.textContent = message;
    div.style.display = 'block';
    div.style.background = type === 'error' ? '#fecaca' : '#dcfce7';
    div.style.color = type === 'error' ? '#dc2626' : '#15803d';
    div.style.border = `1px solid ${type === 'error' ? '#f87171' : '#86efac'}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

document.addEventListener('DOMContentLoaded', function() {

    const specialistId = getSpecialistId();
    const role = localStorage.getItem('role');
    if (!specialistId || role !== 'agri_specialist') {
        window.location.href = 'home.html';
        return;
    }

    const userName = localStorage.getItem('user_name') || 'Storage Expert';
    document.getElementById('userName').textContent = userName;
    document.getElementById('userAvatar').textContent = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    if (typeof lucide !== 'undefined') lucide.createIcons();

    document.getElementById('dashboard').style.display = 'flex';
    loadDashboard();
});

function showView(viewName) {
    const views = ['dashboardView', 'inventoryView', 'storageAreasView', 'qualityControlView', 'reportsView', 'profileView'];
    views.forEach(v => document.getElementById(v).style.display = 'none');

    const titles = {
        dashboard: 'Cold Storage Dashboard',
        inventory: 'Crop Inventory Management',
        storageAreas: 'Storage Areas Overview',
        qualityControl: 'Quality Control',
        reports: 'Cold Storage Reports',
        profile: 'My Profile'
    };

    switch(viewName) {
        case 'dashboard':
            document.getElementById('dashboardView').style.display = 'block';
            loadDashboard();
            break;
        case 'inventory':
            document.getElementById('inventoryView').style.display = 'block';
            loadInventory();
            break;
        case 'storageAreas':
            document.getElementById('storageAreasView').style.display = 'block';
            loadStorageAreas();
            break;
        case 'qualityControl':
            document.getElementById('qualityControlView').style.display = 'block';
            loadQualityControl();
            break;
        case 'reports':
            document.getElementById('reportsView').style.display = 'block';
            loadReports();
            break;
        case 'profile':
            document.getElementById('profileView').style.display = 'block';
            loadProfile();
            break;
    }

    document.getElementById('pageTitle').textContent = titles[viewName] || 'Dashboard';

    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    const menuMap = { dashboard: 0, inventory: 1, storageAreas: 2, qualityControl: 3, reports: 4, profile: 5 };
    if (menuItems[menuMap[viewName]]) menuItems[menuMap[viewName]].classList.add('active');
}

async function loadDashboard() {
    const specialistId = getSpecialistId();
    try {
        const res = await fetch(`${API}/cold-storage/dashboard?specialist_id=${specialistId}`);
        if (!res.ok) throw new Error('Failed to load dashboard');
        const data = await res.json();

        document.getElementById('statTotalCrops').textContent = data.totalCrops || 0;
        document.getElementById('statUtilization').textContent = `${data.utilizationPercent}%`;
        document.getElementById('statStorageUnits').textContent = data.totalStorageUnits || 0;
        document.getElementById('statQuality').textContent = `${data.qualityScore}%`;
        document.getElementById('statAvgTemp').textContent = `${data.avgTemperature}°C`;
        document.getElementById('statAvgHumidity').textContent = `${data.avgHumidity}%`;
        document.getElementById('statTodayReports').textContent = data.todayReportsCount || 0;

        const tbody = document.getElementById('dashRecentCrops');
        if (data.recentCrops && data.recentCrops.length > 0) {
            tbody.innerHTML = data.recentCrops.map(crop => `
                <tr>
                    <td>#${crop.badge_id}</td>
                    <td>${crop.crop_type || '--'}</td>
                    <td>${crop.farmer_name || 'Unknown'}</td>
                    <td>${crop.storage_name || '--'}</td>
                    <td><span class="status-badge ${crop.status}">${crop.status}</span></td>
                    <td>${formatDateTime(crop.entry_time)}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:2rem;">No crop entries yet. Add crops from the Inventory section.</td></tr>';
        }

        if (data.todayReportsCount > 0) {
            document.getElementById('notifBadge').style.display = 'inline';
            document.getElementById('notifBadge').textContent = data.todayReportsCount;
        }
    } catch (err) {
        console.error('Dashboard error:', err);
        showToast('Failed to load dashboard data', 'error');
    }
}

let _storageUnits = [];
let _availableBadges = [];

async function loadInventory() {
    const specialistId = getSpecialistId();
    try {
        const res = await fetch(`${API}/cold-storage/crops?specialist_id=${specialistId}`);
        if (!res.ok) throw new Error('Failed to load inventory');
        const crops = await res.json();

        const tbody = document.getElementById('inventoryTable');
        if (crops.length > 0) {
            tbody.innerHTML = crops.map(crop => {
                const isPending = crop.status === 'pending_storage';
                return `
                <tr class="${isPending ? 'pending-row' : ''}">
                    <td>#${crop.badge_id}</td>
                    <td>${crop.crop_type || '--'}</td>
                    <td>${crop.farmer_name || 'Unknown'}</td>
                    <td>${crop.storage_name || '--'}</td>
                    <td>${crop.require_temperature !== null ? crop.require_temperature + '°C' : '--'}</td>
                    <td>${crop.require_humidity !== null ? crop.require_humidity + '%' : '--'}</td>
                    <td>${crop.shelf_life_days !== null ? crop.shelf_life_days + ' days' : '--'}</td>
                    <td><span class="status-badge ${crop.status}">${crop.status.replace('_', ' ')}</span></td>
                    <td>${formatDateTime(crop.entry_time)}</td>
                    <td class="action-buttons">
                        ${isPending ?
                            `<button class="btn btn-success btn-sm" onclick="showConfirmStorageModal(${JSON.stringify(crop).replace(/"/g, '&quot;')})">Confirm Storage</button>` :
                            `<button class="btn btn-primary btn-sm" onclick="showUpdateCropModal(${crop.badge_id}, '${crop.status}')">Update</button>`
                        }
                    </td>
                </tr>
            `}).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#6b7280;padding:2rem;">No crop entries found.</td></tr>';
        }
    } catch (err) {
        console.error('Inventory error:', err);
        showToast('Failed to load inventory', 'error');
    }
}

function showConfirmStorageModal(crop) {
    document.getElementById('confirmStorageModal').style.display = 'flex';
    document.getElementById('confirmStorageMessage').style.display = 'none';

    document.getElementById('confirmBadgeId').value = crop.badge_id || '';
    document.getElementById('originalBadgeId').value = crop.badge_id || '';
    document.getElementById('confirmFarmerId').value = crop.farmer_id || '';
    document.getElementById('confirmEntryTime').value = crop.entry_time || '';
    document.getElementById('confirmCropType').value = crop.crop_type || '';
    document.getElementById('confirmStorageInfo').innerHTML = `
        <div style="font-size: 0.875rem; color: #4b5563;">
            <p><strong>Product:</strong> ${crop.crop_type}</p>
            <p><strong>Farmer:</strong> ${crop.farmer_name}</p>
            <p><strong>Target Storage:</strong> ${crop.storage_name}</p>
            <p style="margin-top:0.5rem; color: #059669; font-weight: 600;">Action Required: Please verify the environmental requirements for this crop before storage.</p>
        </div>
    `;

    document.getElementById('confirmTemp').value = '';
    document.getElementById('confirmHumidity').value = '';
    document.getElementById('confirmShelfLife').value = '';
}

async function submitConfirmStorage() {
    const originalBadgeId = document.getElementById('originalBadgeId').value;
    const farmerId = document.getElementById('confirmFarmerId').value;
    const entryTime = document.getElementById('confirmEntryTime').value;
    const cropType = document.getElementById('confirmCropType').value;
    const newBadgeId = document.getElementById('confirmBadgeId').value;
    const temp = document.getElementById('confirmTemp').value;
    const humidity = document.getElementById('confirmHumidity').value;
    const shelfLife = document.getElementById('confirmShelfLife').value;

    if (!newBadgeId) {
        showMsg('confirmStorageMessage', 'Please provide a valid Badge ID', 'error');
        return;
    }

    if (!temp || !humidity || !shelfLife) {
        showMsg('confirmStorageMessage', 'Please fill in all environmental requirements', 'error');
        return;
    }

    try {

        const badgeIdParam = originalBadgeId || '_';
        const res = await fetch(`${API}/cold-storage/crops/${badgeIdParam}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                new_badge_id: parseInt(newBadgeId),
                farmer_id: parseInt(farmerId),
                entry_time: entryTime,
                crop_type: cropType,
                temperature: parseFloat(temp),
                humidity: parseFloat(humidity),
                shelf_life: parseInt(shelfLife)
            })
        });

        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await res.json();
        } else {
            const text = await res.text();
            throw new Error(res.ok ? 'Unexpected response format' : `Server Error: ${res.status} ${res.statusText}`);
        }

        if (!res.ok) throw new Error(data.error || 'Failed to confirm storage');

        showMsg('confirmStorageMessage', 'Crop confirmed and added to inventory!', 'success');
        showToast('Crop storage confirmed');
        setTimeout(() => {
            closeModal('confirmStorageModal');
            loadInventory();
            loadDashboard();
        }, 1500);
    } catch (err) {
        showMsg('confirmStorageMessage', err.message, 'error');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function showAddCropModal() {
    document.getElementById('addCropModal').style.display = 'flex';
    document.getElementById('addCropMessage').style.display = 'none';

    try {
        const res = await fetch(`${API}/cold-storage/available-badges`);
        _availableBadges = await res.json();
        const badgeSelect = document.getElementById('addCropBadgeSelect');
        badgeSelect.innerHTML = '<option value="">Select a product</option>';
        _availableBadges.forEach(b => {
            badgeSelect.innerHTML += `<option value="${b.badge_id}">${b.crop_type} - Badge #${b.badge_id} (${b.farm_name})</option>`;
        });
    } catch(e) {
        console.error('Failed to load available badges', e);
        _availableBadges = [];
    }

    if (_storageUnits.length === 0) {
        const specialistId = getSpecialistId();
        try {
            const res = await fetch(`${API}/cold-storage/units?specialist_id=${specialistId}`);
            _storageUnits = await res.json();
        } catch(e) { _storageUnits = []; }
    }

    const select = document.getElementById('addCropStorageId');
    select.innerHTML = '<option value="">Select storage unit</option>';
    _storageUnits.forEach(u => {
        select.innerHTML += `<option value="${u.storage_id}">${u.storage_name} (Capacity: ${u.capacity_kg}kg)</option>`;
    });

    document.getElementById('addCropBadgeId').value = '';
    document.getElementById('addCropFarmerId').value = '';
    document.getElementById('addCropType').value = '';

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function onBadgeSelectChange() {
    const badgeId = document.getElementById('addCropBadgeSelect').value;
    const badge = _availableBadges.find(b => b.badge_id == badgeId);
    if (badge) {
        document.getElementById('addCropBadgeId').value = badge.badge_id;
        document.getElementById('addCropFarmerId').value = badge.farmer_id;
        document.getElementById('addCropType').value = badge.crop_type;
    } else {
        document.getElementById('addCropBadgeId').value = '';
        document.getElementById('addCropFarmerId').value = '';
        document.getElementById('addCropType').value = '';
    }
}

async function addCropEntry() {
    const badge_id = document.getElementById('addCropBadgeId').value;
    const farmer_id = document.getElementById('addCropFarmerId').value;
    const crop_type = document.getElementById('addCropType').value.trim();
    const require_temperature = document.getElementById('addCropTemp').value;
    const require_humidity = document.getElementById('addCropHumidity').value;
    const shelf_life_days = document.getElementById('addCropShelfLife').value;
    const storage_id = document.getElementById('addCropStorageId').value;

    if (!badge_id || !farmer_id || !crop_type || !storage_id) {
        showMsg('addCropMessage', 'Please fill in all required fields (*)', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/cold-storage/crops`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                badge_id: parseInt(badge_id), farmer_id: parseInt(farmer_id),
                crop_type, require_temperature: parseFloat(require_temperature) || null,
                require_humidity: parseFloat(require_humidity) || null,
                shelf_life_days: parseInt(shelf_life_days) || null,
                storage_id: parseInt(storage_id)
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add crop');

        showMsg('addCropMessage', 'Crop entry added successfully!', 'success');
        showToast('Crop entry added successfully');
        setTimeout(() => { closeModal('addCropModal'); loadInventory(); }, 1500);
    } catch (err) {
        showMsg('addCropMessage', err.message, 'error');
    }
}

function showUpdateCropModal(badgeId, currentStatus) {
    document.getElementById('updateCropModal').style.display = 'flex';
    document.getElementById('updateCropMessage').style.display = 'none';
    document.getElementById('updateCropBadgeId').value = badgeId;
    document.getElementById('updateCropStatus').value = currentStatus;
    document.getElementById('transportTimeGroup').style.display = (currentStatus === 'transported') ? 'block' : 'none';

    document.getElementById('updateCropStatus').onchange = function() {
        document.getElementById('transportTimeGroup').style.display = (this.value === 'transported') ? 'block' : 'none';
    };
}

async function updateCropStatus() {
    const badgeId = document.getElementById('updateCropBadgeId').value;
    const status = document.getElementById('updateCropStatus').value;
    const transportTime = document.getElementById('updateCropTransportTime').value;

    try {
        const res = await fetch(`${API}/cold-storage/crops/${badgeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status,
                transport_time: transportTime || null
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update');

        showMsg('updateCropMessage', 'Crop status updated successfully!', 'success');
        showToast('Crop status updated');
        setTimeout(() => { closeModal('updateCropModal'); loadInventory(); }, 1500);
    } catch (err) {
        showMsg('updateCropMessage', err.message, 'error');
    }
}

async function loadStorageAreas() {
    const specialistId = getSpecialistId();
    try {
        const res = await fetch(`${API}/cold-storage/areas?specialist_id=${specialistId}`);
        if (!res.ok) throw new Error('Failed to load storage areas');
        const areas = await res.json();

        const grid = document.getElementById('storageAreasGrid');
        if (areas.length > 0) {
            grid.innerHTML = areas.map(area => {
                const capacity = parseInt(area.capacity_kg) || 0;
                const currentLoad = parseInt(area.current_load_kg) || parseInt(area.current_kg) || 0;
                const loadPercent = capacity > 0 ? Math.round((currentLoad / capacity) * 100) : 0;
                const loadColor = loadPercent > 90 ? 'red' : (loadPercent > 70 ? 'orange' : 'green');
                const statusClass = area.status === 'active' ? 'active' : (area.status === 'maintenance' ? 'maintenance' : 'inactive');

                return `
                    <div class="storage-area-card">
                        <div class="card-header">
                            <h4><i data-lucide="warehouse" style="width:18px;height:18px;color:#7c3aed;vertical-align:middle;margin-right:0.5rem;"></i>${area.storage_name}</h4>
                            <span class="status-badge ${statusClass}">${area.status}</span>
                        </div>
                        <div class="card-stats">
                            <div class="card-stat">
                                <span class="card-stat-label">Capacity</span>
                                <span class="card-stat-value">${capacity.toLocaleString()} kg</span>
                            </div>
                            <div class="card-stat">
                                <span class="card-stat-label">Current Load</span>
                                <span class="card-stat-value">${currentLoad.toLocaleString()} kg (${loadPercent}%)</span>
                                <div class="progress-bar"><div class="progress-bar-fill ${loadColor}" style="width:${Math.min(loadPercent,100)}%"></div></div>
                            </div>
                            <div class="card-stat">
                                <span class="card-stat-label">Temperature</span>
                                <span class="card-stat-value">${area.temperature_c || '--'}°C</span>
                            </div>
                            <div class="card-stat">
                                <span class="card-stat-label">Humidity</span>
                                <span class="card-stat-value">${area.humidity_percent || '--'}%</span>
                            </div>
                            <div class="card-stat">
                                <span class="card-stat-label">Region</span>
                                <span class="card-stat-value">${area.region_name || 'Unassigned'}</span>
                            </div>
                            <div class="card-stat">
                                <span class="card-stat-label">Active Crops</span>
                                <span class="card-stat-value">${area.active_crops || 0} / ${area.total_crops || 0}</span>
                            </div>
                        </div>
                        <div style="margin-top:1rem;font-size:0.8rem;color:#6b7280;">Last updated: ${formatDateTime(area.last_updated)}</div>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<p style="text-align:center;color:#6b7280;grid-column:1/-1;padding:3rem;">No storage areas assigned to you yet.</p>';
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        console.error('Storage areas error:', err);
        showToast('Failed to load storage areas', 'error');
    }
}

async function loadQualityControl() {
    const specialistId = getSpecialistId();
    try {
        const res = await fetch(`${API}/cold-storage/quality?specialist_id=${specialistId}`);
        if (!res.ok) throw new Error('Failed to load quality data');
        const data = await res.json();

        const grid = document.getElementById('qualityUnitsGrid');
        if (data.units && data.units.length > 0) {
            grid.innerHTML = data.units.map(unit => `
                <div class="stat-card">
                    <h4 style="margin-bottom:1rem;font-size:1rem;">${unit.storage_name}</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                        <div>
                            <span style="font-size:0.75rem;color:#6b7280;">Temperature</span>
                            <div style="font-weight:600;">${unit.temperature_c}°C <span class="quality-badge ${unit.temp_status}">${unit.temp_status}</span></div>
                        </div>
                        <div>
                            <span style="font-size:0.75rem;color:#6b7280;">Humidity</span>
                            <div style="font-weight:600;">${unit.humidity_percent}% <span class="quality-badge ${unit.humid_status}">${unit.humid_status}</span></div>
                        </div>
                        <div>
                            <span style="font-size:0.75rem;color:#6b7280;">Load</span>
                            <div style="font-weight:600;">${unit.load_percent}% <span class="quality-badge ${unit.load_status}">${unit.load_status}</span></div>
                        </div>
                        <div>
                            <span style="font-size:0.75rem;color:#6b7280;">Status</span>
                            <div style="font-weight:600;"><span class="status-badge ${unit.status}">${unit.status}</span></div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<p style="text-align:center;color:#6b7280;grid-column:1/-1;">No storage units to monitor.</p>';
        }

        const atRiskTbody = document.getElementById('atRiskCropsTable');
        if (data.atRiskCrops && data.atRiskCrops.length > 0) {
            atRiskTbody.innerHTML = data.atRiskCrops.map(crop => {
                const shelfLifeUsed = parseFloat(crop.shelf_life_used_percent) || 0;
                const riskColor = shelfLifeUsed > 80 ? 'red' : (shelfLifeUsed > 50 ? 'orange' : 'green');
                const riskLabel = shelfLifeUsed > 80 ? 'Critical' : (shelfLifeUsed > 50 ? 'Warning' : 'Normal');
                return `
                    <tr>
                        <td>#${crop.badge_id}</td>
                        <td>${crop.crop_type}</td>
                        <td>${crop.storage_name}</td>
                        <td>${crop.days_stored || 0} days</td>
                        <td>${crop.shelf_life_days || '--'} days</td>
                        <td>
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <div class="progress-bar" style="flex:1;"><div class="progress-bar-fill ${riskColor}" style="width:${Math.min(shelfLifeUsed,100)}%"></div></div>
                                <span style="font-size:0.8rem;font-weight:600;">${shelfLifeUsed}%</span>
                            </div>
                        </td>
                        <td><span class="quality-badge ${shelfLifeUsed > 80 ? 'critical' : (shelfLifeUsed > 50 ? 'warning' : 'optimal')}">${riskLabel}</span></td>
                    </tr>
                `;
            }).join('');
        } else {
            atRiskTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;padding:2rem;">No stored crops found.</td></tr>';
        }
    } catch (err) {
        console.error('Quality control error:', err);
        showToast('Failed to load quality data', 'error');
    }
}

async function loadReports() {
    const specialistId = getSpecialistId();
    const type = document.getElementById('reportTypeFilter').value;
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;

    let url = `${API}/cold-storage/reports?specialist_id=${specialistId}`;
    if (type) url += `&type=${type}`;
    if (fromDate) url += `&from_date=${fromDate}`;
    if (toDate) url += `&to_date=${toDate}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load reports');
        const reports = await res.json();

        const tbody = document.getElementById('reportsTable');
        if (reports.length > 0) {
            tbody.innerHTML = reports.map(r => `
                <tr>
                    <td>${formatDate(r.report_date)}</td>
                    <td><span class="status-badge ${r.report_type === 'daily' ? 'stored' : 'transported'}">${r.report_type}</span></td>
                    <td>${r.storage_name}</td>
                    <td>${r.total_crops}</td>
                    <td>${parseFloat(r.total_weight_kg).toLocaleString()}</td>
                    <td>${r.avg_temperature}°C</td>
                    <td>${r.avg_humidity}%</td>
                    <td>${r.spoiled_count}</td>
                    <td>${parseFloat(r.energy_kwh).toLocaleString()}</td>
                    <td><span class="status-badge ${r.status === 'submitted' ? 'stored' : 'released'}">${r.status}</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#6b7280;padding:2rem;">No reports found. Submit a new report using the button above.</td></tr>';
        }
    } catch (err) {
        console.error('Reports error:', err);
        showToast('Failed to load reports', 'error');
    }
}

async function showAddReportModal() {
    document.getElementById('addReportModal').style.display = 'flex';
    document.getElementById('addReportMessage').style.display = 'none';

    document.getElementById('reportReportDate').value = new Date().toISOString().split('T')[0];

    if (_storageUnits.length === 0) {
        const specialistId = getSpecialistId();
        try {
            const res = await fetch(`${API}/cold-storage/units?specialist_id=${specialistId}`);
            _storageUnits = await res.json();
        } catch(e) { _storageUnits = []; }
    }

    const select = document.getElementById('reportStorageId');
    select.innerHTML = '<option value="">Select unit</option>';
    _storageUnits.forEach(u => {
        select.innerHTML += `<option value="${u.storage_id}">${u.storage_name}</option>`;
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function submitReport() {
    const storage_id = document.getElementById('reportStorageId').value;
    const report_type = document.getElementById('reportReportType').value;
    const report_date = document.getElementById('reportReportDate').value;

    if (!storage_id || !report_type || !report_date) {
        showMsg('addReportMessage', 'Please fill in all required fields (*)', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/cold-storage/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storage_id: parseInt(storage_id),
                specialist_id: parseInt(getSpecialistId()),
                report_type, report_date,
                total_crops: parseInt(document.getElementById('reportTotalCrops').value) || 0,
                total_weight_kg: parseFloat(document.getElementById('reportTotalWeight').value) || 0,
                avg_temperature: parseFloat(document.getElementById('reportAvgTemp').value) || null,
                avg_humidity: parseFloat(document.getElementById('reportAvgHumidity').value) || null,
                spoiled_count: parseInt(document.getElementById('reportCropsSpoiled').value) || 0,
                energy_kwh: parseFloat(document.getElementById('reportEnergy').value) || 0
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit report');

        showMsg('addReportMessage', 'Report submitted successfully!', 'success');
        showToast('Report submitted successfully');
        setTimeout(() => { closeModal('addReportModal'); loadReports(); }, 1500);
    } catch (err) {
        showMsg('addReportMessage', err.message, 'error');
    }
}

async function loadProfile() {
    const specialistId = getSpecialistId();
    try {
        const res = await fetch(`${API}/cold-storage/profile?specialist_id=${specialistId}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const p = await res.json();

        document.getElementById('profileName').value = p.fullname || '';
        document.getElementById('profileEmail').value = p.email || '';
        document.getElementById('profilePhone').value = p.phone || '';
        document.getElementById('profileQualification').value = p.qualification || '';
        document.getElementById('profileExperience').value = p.experience_year ? `${p.experience_year} years` : '--';
        document.getElementById('profileRegion').value = p.assigned_region || '--';
        document.getElementById('profilePassword').value = '';
        document.getElementById('profileMessage').style.display = 'none';
    } catch (err) {
        console.error('Profile error:', err);
        showToast('Failed to load profile', 'error');
    }
}

async function saveProfile() {
    const specialistId = getSpecialistId();
    const body = {
        fullname: document.getElementById('profileName').value.trim(),
        email: document.getElementById('profileEmail').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        qualification: document.getElementById('profileQualification').value.trim()
    };

    const password = document.getElementById('profilePassword').value;
    if (password) body.password = password;

    try {
        const res = await fetch(`${API}/cold-storage/profile?specialist_id=${specialistId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update profile');

        showMsg('profileMessage', 'Profile updated successfully!', 'success');
        showToast('Profile updated successfully');

        if (body.fullname) {
            localStorage.setItem('user_name', body.fullname);
            document.getElementById('userName').textContent = body.fullname;
            document.getElementById('userAvatar').textContent = body.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
    } catch (err) {
        showMsg('profileMessage', err.message, 'error');
        showToast(err.message, 'error');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showNotifications() {
    showToast('You have reports submitted today. Check the Reports section.', 'success');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'home.html';
    }
}
