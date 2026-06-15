// admin-shared.js - Shared logic for Admin and Super Admin
const API = (typeof window !== 'undefined' && window.API_BASE_URL) || 'http://localhost:4000/api';
console.log("Using API Base URL:", API);

function getAdminInfo() {
    return {
        id: localStorage.getItem('admin_id') || localStorage.getItem('user_id'),
        name: localStorage.getItem('user_name') || 'Admin User',
        role: localStorage.getItem('role') || 'admin'
    };
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

function formatCurrency(amt) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt);
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

async function loadDashboardStats(statsIds) {
    try {
        const res = await fetch(`${API}/admin/dashboard-stats`);
        if (res.ok) {
            const stats = await res.json();
            if (statsIds.totalAdmins && document.getElementById(statsIds.totalAdmins)) document.getElementById(statsIds.totalAdmins).textContent = stats.totalAdmins;
            if (statsIds.totalRevenue && document.getElementById(statsIds.totalRevenue)) document.getElementById(statsIds.totalRevenue).textContent = formatCurrency(stats.totalRevenue);
            if (statsIds.totalOrders && document.getElementById(statsIds.totalOrders)) document.getElementById(statsIds.totalOrders).textContent = stats.totalOrders;
            if (statsIds.avgOrderValue && document.getElementById(statsIds.avgOrderValue)) document.getElementById(statsIds.avgOrderValue).textContent = formatCurrency(stats.avgOrderValue);
            if (statsIds.pendingCount && document.getElementById(statsIds.pendingCount)) document.getElementById(statsIds.pendingCount).textContent = stats.pendingOrders || 0;
        }
    } catch (err) {
        console.error('Stats error:', err);
    }
}

async function loadAdminList(containerId) {
    try {
        const res = await fetch(`${API}/admin/list`);
        if (res.ok) {
            const admins = await res.json();
            const container = document.getElementById(containerId);
            if (admins.length > 0) {
                container.innerHTML = admins.map(a => `
                    <div class="admin-card">
                        <div class="admin-header">
                            <div class="admin-info">
                                <h3>${a.admin_name}</h3>
                                <p>${a.email}</p>
                            </div>
                            <div class="admin-avatar">${a.admin_name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                        </div>
                        <div class="admin-status ${a.status}">${a.status}</div>
                        <div class="admin-actions">
                            <button class="btn btn-primary" onclick="editAdmin(${a.admin_id})">Edit</button>
                            <button class="btn btn-outline" onclick="viewAdmin(${a.admin_id})">View</button>
                            <button class="btn btn-danger" onclick="toggleAdminStatus(${a.admin_id}, '${a.status}')">
                                ${a.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p style="text-align:center;width:100%;padding:2rem;">No admins found.</p>';
            }
        }
    } catch (err) {
        console.error('Admin list error:', err);
    }
}

async function loadPaymentRequests(tbodyId) {
    try {
        const res = await fetch(`${API}/admin/payment-requests`);
        if (res.ok) {
            const requests = await res.json();
            const tbody = document.getElementById(tbodyId);
            if (requests.length > 0) {
                tbody.innerHTML = requests.map(r => `
                    <tr>
                        <td>#PAY-${r.payment_id}</td>
                        <td>${r.agent_name}</td>
                        <td>${formatCurrency(r.amount)}</td>
                        <td>${formatDate(r.date_time)}</td>
                        <td><span class="status-badge ${r.status}">${r.status}</span></td>
                        <td class="action-buttons">
                            ${r.status === 'pending' ? `<button class="btn btn-primary" onclick="approvePayment(${r.payment_id})">Approve</button>` : '--'}
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No payment requests found.</td></tr>';
            }
        }
    } catch (err) {
        console.error('Payment requests error:', err);
    }
}

async function approvePayment(id) {
    if (!confirm('Approve this payment?')) return;
    try {
        const res = await fetch(`${API}/admin/approve-payment/${id}`, { method: 'POST' });
        if (res.ok) {
            showToast('Payment approved successfully');
            const tbody = document.getElementById('paymentRequestsTable') || document.getElementById('paymentRequestsBody');
            if (tbody) loadPaymentRequests(tbody.id);
        }
    } catch (err) {
        showToast('Failed to approve payment', 'error');
    }
}

async function handleDeliveryBoyRegistration(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('deliveryBoyPassword').value;
        const confirmPassword = document.getElementById('deliveryBoyConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const data = {
            name: `${document.getElementById('deliveryBoyFirstName').value} ${document.getElementById('deliveryBoyLastName').value}`,
            email: document.getElementById('deliveryBoyEmail').value,
            phone: document.getElementById('deliveryBoyPhone').value,
            vehicle_type: document.getElementById('deliveryBoyVehicle').value,
            password: password,
            address: {
                village: document.getElementById('deliveryBoyVillage').value,
                police_station: document.getElementById('deliveryBoyPoliceStation').value,
                pincode: document.getElementById('deliveryBoyPinCode').value,
                district: document.getElementById('deliveryBoyDistrict').value,
                state: document.getElementById('deliveryBoyState').value
            }
        };

        try {
            const res = await fetch(`${API}/delivery-agents/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showToast('Delivery Boy registered successfully');
                form.reset();
            } else {
                const err = await res.json();
                showToast(err.error || 'Registration failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        }
    });
}
