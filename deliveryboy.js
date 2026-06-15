// deliveryboy.js - Delivery Agent Dashboard
const API = window.API_BASE_URL || 'http://localhost:4000/api';

function getAgentId() {
    return localStorage.getItem('agent_id') || localStorage.getItem('user_id') || 1;
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

function getTimeAgo(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

document.addEventListener('DOMContentLoaded', function() {

    const agentId = getAgentId();

    const role = localStorage.getItem('role');

    const userName = localStorage.getItem('user_name') || 'Delivery Agent';
    document.getElementById('userName').textContent = userName;
    document.getElementById('userAvatar').textContent = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    if (typeof lucide !== 'undefined') lucide.createIcons();

    showView('dashboard');
});

function showView(viewName) {
    const views = ['dashboardView', 'pendingDeliveriesView', 'completedDeliveriesView', 'earningsView', 'profileView'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = 'none';
    });

    const titles = {
        dashboard: 'Delivery Dashboard',
        pendingDeliveries: 'Active Deliveries',
        completedDeliveries: 'Delivery History',
        earnings: 'My Earnings',
        profile: 'My Profile'
    };

    const viewId = viewName + 'View';
    const viewEl = document.getElementById(viewId);
    if (viewEl) viewEl.style.display = 'block';

    document.getElementById('pageTitle').textContent = titles[viewName] || 'Dashboard';

    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    const menuMap = { dashboard: 0, pendingDeliveries: 1, completedDeliveries: 2, earnings: 3, profile: 4 };
    if (menuItems[menuMap[viewName]]) menuItems[menuMap[viewName]].classList.add('active');

    switch(viewName) {
        case 'dashboard': loadDashboard(); break;
        case 'pendingDeliveries': loadPendingDeliveries(); break;
        case 'completedDeliveries': loadCompletedDeliveries(); break;
        case 'earnings': loadEarnings(); break;
        case 'profile': loadProfile(); break;
    }
}

async function loadDashboard() {
    const agentId = getAgentId();
    try {

        const statsRes = await fetch(`${API}/delivery-agents/${agentId}/dashboard-stats`);
        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('statPendingCount').textContent = stats.pendingDeliveries;
            document.getElementById('statTodayEarnings').textContent = `₹${stats.todayEarnings.toLocaleString()}`;
            document.getElementById('statCompletedToday').textContent = stats.completedToday;
            document.getElementById('statRating').textContent = stats.rating.toFixed(1);
        }

        await loadDeliveryOffers();

        const activeRes = await fetch(`${API}/orders/agent/${agentId}/active`);
        if (activeRes.ok) {
            const activeJobs = await activeRes.json();
            const tbody = document.getElementById('dashActiveJobs');
            if (activeJobs.length > 0) {
                tbody.innerHTML = activeJobs.map(job => {
                    const addr = job.delivery_address || {};
                    const addrStr = `${addr.city || ''}, ${addr.state || ''}`;
                    return `
                        <tr>
                            <td>#${job.order_id}</td>
                            <td>${job.storage_name || 'Storage'}</td>
                            <td>${addrStr || 'N/A'}</td>
                            <td>₹${parseFloat(job.delivery_charge).toFixed(2)}</td>
                            <td><span class="status-badge ${job.status}">${job.status.replace('_', ' ')}</span></td>
                            <td class="action-buttons">
                                ${job.status === 'accepted' ?
                                    `<button class="btn btn-primary btn-sm" onclick="updateJobStatus(${job.job_id}, 'in_transit')">Start</button>` :
                                  job.status === 'in_transit' ?
                                    `<button class="btn btn-warning btn-sm" onclick="updateJobStatus(${job.job_id}, 'reached_destination')">Mark Arrived</button>` :
                                  job.status === 'reached_destination' ?
                                    `<span class="text-xs text-orange-600 font-bold">Waiting for Payment</span>` :
                                    `<i data-lucide="check-circle" class="text-green-600"></i>`
                                }
                            </td>
                        </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:2rem;">No active jobs. Accept an offer above!</td></tr>';
            }
        }
    } catch (err) {
        console.error('Dashboard error:', err);
        showToast('Failed to load dashboard', 'error');
    }
}

async function loadDeliveryOffers() {
    const agentId = getAgentId();
    const offersList = document.getElementById('deliveryOffersList');

    try {
        const res = await fetch(`${API}/orders/delivery-offers/${agentId}`);
        if (!res.ok) throw new Error('Failed to fetch offers');
        const offers = await res.json();

        if (offers.length === 0) {
            offersList.innerHTML = '<div class="loading-state"><p>No new delivery offers available at the moment.</p></div>';
            return;
        }

        offersList.innerHTML = offers.map(offer => {
            const addr = offer.delivery_address || {};
            const addrStr = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}`;
            const urgencyClass = offer.urgency_level || 'normal';

            return `
                <div class="delivery-offer-card ${urgencyClass}">
                    <div class="offer-header">
                        <div>
                            <div class="offer-id">Order #${offer.order_id}</div>
                            <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">${getTimeAgo(offer.created_at)}</div>
                        </div>
                        <span class="urgency-badge ${urgencyClass}">${offer.urgency_level}</span>
                    </div>

                    <div class="offer-details">
                        <div class="offer-detail-item">
                            <i data-lucide="map-pin"></i>
                            <div>
                                <strong>Pickup</strong>
                                <span>${offer.storage_name || 'Cold Storage'}</span>
                            </div>
                        </div>
                        <div class="offer-detail-item">
                            <i data-lucide="navigation"></i>
                            <div>
                                <strong>Destination</strong>
                                <span>${addrStr}</span>
                            </div>
                        </div>
                        <div class="offer-detail-item">
                            <i data-lucide="route"></i>
                            <div>
                                <strong>Distance</strong>
                                <span>${offer.distance_km ? parseFloat(offer.distance_km).toFixed(1) : '--'} km</span>
                            </div>
                        </div>
                    </div>

                    <div class="offer-footer">
                        <div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Earnings</div>
                            <div class="offer-amount">₹${parseFloat(offer.delivery_charge).toFixed(2)}</div>
                        </div>
                        <div class="offer-actions">
                            <button class="btn btn-sm btn-success" onclick="acceptOffer(${offer.job_id})">Accept</button>
                            <button class="btn btn-sm btn-danger" onclick="rejectOffer(${offer.job_id})">Reject</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        console.error('Offers error:', err);
        offersList.innerHTML = '<p style="color:red;text-align:center;">Error loading offers</p>';
    }
}

async function acceptOffer(jobId) {
    const agentId = getAgentId();
    try {
        const res = await fetch(`${API}/orders/delivery-offers/${jobId}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: agentId })
        });
        if (!res.ok) throw new Error('Failed to accept offer');
        showToast('Offer accepted successfully!');
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function rejectOffer(jobId) {
    const agentId = getAgentId();
    if (!confirm('Are you sure you want to reject this offer?')) return;
    try {
        const res = await fetch(`${API}/orders/delivery-offers/${jobId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: agentId })
        });
        if (!res.ok) throw new Error('Failed to reject offer');
        showToast('Offer rejected');
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function updateJobStatus(jobId, status) {
    const agentId = getAgentId();
    try {
        const res = await fetch(`${API}/delivery-agents/${agentId}/deliveries/${jobId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update status');
        showToast(`Status updated to ${status.replace('_', ' ')}`);

        const activeView = document.querySelector('.sidebar-menu-item.active').textContent.trim();
        if (activeView === 'Dashboard') loadDashboard();
        else if (activeView === 'Active Deliveries') loadPendingDeliveries();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function loadPendingDeliveries() {
    const agentId = getAgentId();
    try {
        const res = await fetch(`${API}/delivery-agents/${agentId}/deliveries/history?status=pending`);
        if (!res.ok) throw new Error('Failed to load pending jobs');
        const jobs = await res.json();

        const tbody = document.getElementById('pendingJobsTable');
        if (jobs.length > 0) {
            tbody.innerHTML = jobs.map(job => {
                const addr = job.delivery_address || {};
                const addrStr = `${addr.street || ''}, ${addr.city || ''}`;
                return `
                    <tr>
                        <td>#${job.order_id}</td>
                        <td>${formatDateTime(job.accepted_at)}</td>
                        <td>Storage #${job.pickup_storage_id}</td>
                        <td>${addrStr}</td>
                        <td>${job.distance_km} km</td>
                        <td>₹${parseFloat(job.delivery_charge).toFixed(2)}</td>
                        <td><span class="status-badge ${job.status}">${job.status}</span></td>
                        <td class="action-buttons">
                            ${job.status === 'accepted' ?
                                `<button class="btn btn-primary btn-sm" onclick="updateJobStatus(${job.job_id}, 'in_transit')">Start</button>` :
                              job.status === 'in_transit' ?
                                `<button class="btn btn-warning btn-sm" onclick="updateJobStatus(${job.job_id}, 'reached_destination')">Mark Arrived</button>` :
                              job.status === 'reached_destination' ?
                                `<span class="text-xs text-orange-600 font-bold">Waiting for Payment</span>` :
                                `<i data-lucide="check-circle" class="text-green-600"></i>`
                            }
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#6b7280;padding:2rem;">No pending deliveries found.</td></tr>';
        }
    } catch (err) {
        console.error('Pending jobs error:', err);
    }
}

async function loadCompletedDeliveries() {
    const agentId = getAgentId();
    try {
        const res = await fetch(`${API}/delivery-agents/${agentId}/deliveries/history?status=completed`);
        if (!res.ok) throw new Error('Failed to load history');
        const jobs = await res.json();

        const tbody = document.getElementById('completedJobsTable');
        if (jobs.length > 0) {
            tbody.innerHTML = jobs.map(job => `
                <tr>
                    <td>#${job.order_id}</td>
                    <td>${job.customer_name || 'Customer'}</td>
                    <td>${formatDateTime(job.completed_at)}</td>
                    <td>₹${parseFloat(job.delivery_charge).toFixed(2)}</td>
                    <td><span class="status-badge completed">Delivered</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:2rem;">No completed deliveries yet.</td></tr>';
        }
    } catch (err) {
        console.error('History error:', err);
    }
}

async function loadEarnings() {
    const agentId = getAgentId();
    try {
        const res = await fetch(`${API}/delivery-agents/${agentId}/deliveries/history?status=completed`);
        if (!res.ok) throw new Error('Failed to load earnings');
        const jobs = await res.json();

        let total = 0;
        let monthly = 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const dailyBreakdown = {};

        jobs.forEach(job => {
            const amt = parseFloat(job.delivery_charge);
            total += amt;

            const compDate = new Date(job.completed_at);
            if (compDate.getMonth() === thisMonth && compDate.getFullYear() === thisYear) {
                monthly += amt;
            }

            const dateKey = compDate.toISOString().split('T')[0];
            if (!dailyBreakdown[dateKey]) dailyBreakdown[dateKey] = { count: 0, amount: 0 };
            dailyBreakdown[dateKey].count++;
            dailyBreakdown[dateKey].amount += amt;
        });

        document.getElementById('totalEarnings').textContent = `₹${total.toLocaleString()}`;
        document.getElementById('monthlyEarnings').textContent = `₹${monthly.toLocaleString()}`;
        document.getElementById('totalDeliveries').textContent = jobs.length;

        const tbody = document.getElementById('earningsBreakdown');
        const sortedDates = Object.keys(dailyBreakdown).sort().reverse();

        if (sortedDates.length > 0) {
            tbody.innerHTML = sortedDates.map(date => `
                <tr>
                    <td>${formatDate(date)}</td>
                    <td>${dailyBreakdown[date].count}</td>
                    <td>₹${dailyBreakdown[date].amount.toLocaleString()}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:1rem;">No earnings data available</td></tr>';
        }
    } catch (err) {
        console.error('Earnings error:', err);
    }
}

async function loadProfile() {
    const agentId = getAgentId();
    try {
        const res = await fetch(`${API}/delivery-agents/${agentId}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        const p = data.agent;

        document.getElementById('profileName').value = p.name || '';
        document.getElementById('profilePhone').value = p.phone || '';
        document.getElementById('profileVehicleType').value = p.vehicle_type || '';
        document.getElementById('profileVehicleNumber').value = p.vehicle_number || '';
        document.getElementById('profileRegion').value = `Region #${p.assigned_region || '--'}`;
        document.getElementById('profileRating').value = `${p.rating || '0.0'} / 5.0`;
        document.getElementById('profilePassword').value = '';
        document.getElementById('profileMessage').style.display = 'none';
    } catch (err) {
        console.error('Profile error:', err);
    }
}

async function saveProfile() {
    const agentId = getAgentId();
    const body = {
        name: document.getElementById('profileName').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        vehicle_type: document.getElementById('profileVehicleType').value.trim(),
        vehicle_number: document.getElementById('profileVehicleNumber').value.trim()
    };

    const pwd = document.getElementById('profilePassword').value;
    if (pwd) body.password = pwd;

    try {
        const res = await fetch(`${API}/delivery-agents/${agentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Update failed');

        showMsg('profileMessage', 'Profile updated successfully!', 'success');
        showToast('Profile updated');

        localStorage.setItem('user_name', body.name);
        document.getElementById('userName').textContent = body.name;
    } catch (err) {
        showMsg('profileMessage', err.message, 'error');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'home.html';
    }
}

function showNotifications() {
    showToast('Checking for new delivery offers...', 'info');
    loadDeliveryOffers();
}
