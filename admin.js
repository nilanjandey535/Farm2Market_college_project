// admin.js - Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', async function() {

    const info = getAdminInfo();
    if (!info.id) {
        window.location.href = 'home.html';
        return;
    }

    updateAdminUI(info.name);

    try {
        const res = await fetch(`${API}/admin/${info.id}`);
        if (res.ok) {
            const adminData = await res.json();
            updateAdminUI(adminData.admin_name);

            localStorage.setItem('user_name', adminData.admin_name);
        }
    } catch (err) {
        console.error('Failed to fetch admin data from database:', err);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();

    showView('dashboard');

    handleDeliveryBoyRegistration('deliveryBoyRegistrationForm');
});

function updateAdminUI(name) {
    const nameEl = document.getElementById('userName');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) {
        avatarEl.textContent = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
}

function showView(viewName) {
    const views = [
        'dashboardView', 'ordersView', 'deliveryAgentsView', 'agriSpecialistsView',
        'farmerApprovalsView', 'productApprovalsView', 'deliveryMonitoringView', 'reportsView', 'settingsView',
        'paymentsView'
    ];

    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = 'none';
    });

    const viewId = viewName + 'View';
    const viewEl = document.getElementById(viewId);
    if (viewEl) viewEl.style.display = 'block';

    const titles = {
        dashboard: 'Admin Dashboard',
        orders: 'Extracted Order Management',
        deliveryAgents: 'Extracted Agent Registry',
        agriSpecialists: 'Extracted Specialist Registry',
        farmerApprovals: 'Extracted Farmer Approvals',
        productApprovals: 'Product Quality Approval',
        payments: 'Extracted Payment Records',
        deliveryMonitoring: 'Extracted Monitoring Logs',
        reports: 'Extracted Activity Logs',
        settings: 'Extracted Profile Settings'
    };

    document.getElementById('pageTitle').textContent = titles[viewName] || 'Dashboard';
    updateActiveMenuItem(viewName);

    switch(viewName) {
        case 'dashboard':
            loadDashboardStats({
                totalOrders: 'statTotalOrders',
                totalRevenue: 'statTotalRevenue',
                avgOrderValue: 'statAvgOrderValue',
                pendingCount: 'statPendingCount'
            });
            loadRecentOrders();
            break;
        case 'orders':
            loadOrders('all');
            break;
        case 'deliveryAgents':
            loadDeliveryAgents();
            break;
        case 'agriSpecialists':
            loadAgriSpecialists();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'deliveryMonitoring':
            loadDeliveryMonitoring();
            break;
        case 'farmerApprovals':
            loadFarmerApprovals();
            break;
        case 'productApprovals':
            loadProductApprovals();
            break;
        case 'reports':
            loadActivityLogs();
            break;
        case 'settings':
            loadAdminSettings();
            break;
    }
}

let assignmentData = { storages: [], specialists: [] };
let productToApprove = null;

async function loadProductApprovals() {
    try {
        const res = await fetch(`${API}/admin/products/pending-approvals`);
        if (res.ok) {
            const products = await res.json();
            const tbody = document.getElementById('productApprovalsBody');
            if (products.length > 0) {
                tbody.innerHTML = products.map(p => `
                    <tr>
                        <td style="color: #6b7280; font-family: monospace;">#PRD-${p.product_id}</td>
                        <td>
                            <div style="font-weight: 600; color: var(--dark);">${p.product_name}</div>
                            <div style="font-size: 0.75rem; color: #6b7280; text-transform: uppercase;">${p.category}</div>
                        </td>
                        <td>
                            <div style="font-weight: 500;">${p.owner_name}</div>
                        </td>
                        <td><span class="status-badge stored">${p.owner_type}</span></td>
                        <td style="font-weight: 600; color: var(--primary-green);">₹${p.price_per_kg} <span style="font-size: 0.75rem; color: #6b7280; font-weight: normal;">/kg</span></td>
                        <td>${p.stock_quantity_kg} <span style="font-size: 0.75rem; color: #6b7280;">Kg</span></td>
                        <td>
                            ${p.images && p.images.length > 0 ?
                                `<div style="position: relative; width: 60px; height: 60px;">
                                    <img src="${p.images[0]}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid var(--light-gray); cursor: zoom-in;" onclick="viewImage('${p.images[0]}')">
                                 </div>` :
                                '<span style="color: #9ca3af; font-size: 0.875rem;">No image</span>'}
                        </td>
                        <td>
                            <div class="action-buttons" style="justify-content: flex-end; padding-right: 1rem;">
                                <button class="btn btn-primary" onclick="openApprovalModal(${JSON.stringify(p).replace(/"/g, '&quot;')})" title="Approve Product">
                                    <i data-lucide="check" style="width: 16px; height: 16px;"></i> Approve
                                </button>
                                <button class="btn btn-outline" style="color: var(--danger); border-color: #fecaca;" onclick="approveProduct(${p.product_id}, 'rejected')" title="Reject Product">
                                    <i data-lucide="x" style="width: 16px; height: 16px;"></i> Reject
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } else {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 5rem 2rem;">No pending product submissions</td></tr>';
            }
        }
    } catch (err) { console.error('Load products error:', err); }
}

async function openApprovalModal(product) {
    productToApprove = product;
    try {
        const res = await fetch(`${API}/admin/assignment-data`);
        if (res.ok) {
            assignmentData = await res.json();
            renderApprovalModal();
        }
    } catch (err) { console.error(err); }
}

function renderApprovalModal() {
    const modal = document.createElement('div');
    modal.id = 'approvalAssignmentModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; border-radius: 1.5rem;">
            <div class="modal-header">
                <h2 style="font-weight: 800;">Storage Assignment</h2>
                <button onclick="closeApprovalModal()" class="btn-close">×</button>
            </div>
            <div class="modal-body" style="padding-top: 1rem;">
                <div style="background: #f0fdf4; padding: 1rem; border-radius: 1rem; margin-bottom: 1.5rem; border: 1px solid #dcfce7;">
                    <div style="font-size: 0.75rem; color: #166534; font-weight: 800; text-transform: uppercase;">Approving Product</div>
                    <div style="font-weight: 800; color: #14532d; font-size: 1.25rem;">${productToApprove.product_name}</div>
                    <div style="color: #166534; font-size: 0.875rem;">From: ${productToApprove.owner_name} (${productToApprove.stock_quantity_kg} Kg)</div>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label style="font-weight: 700; margin-bottom: 0.5rem; display: block;">Select Cold Storage</label>
                    <select id="storageSelect" class="form-control" style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1.5px solid #e2e8f0;">
                        <option value="">-- Choose available storage --</option>
                        ${assignmentData.storages.map(s => `
                            <option value="${s.storage_id}">${s.storage_name} (${s.capacity_kg - s.current_load_kg}kg free)</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 2rem;">
                    <label style="font-weight: 700; margin-bottom: 0.5rem; display: block;">Assign Agri Specialist</label>
                    <select id="specialistSelect" class="form-control" style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1.5px solid #e2e8f0;">
                        <option value="">-- Choose specialist --</option>
                        ${assignmentData.specialists.map(s => `
                            <option value="${s.specialist_id}">${s.fullname} (ID: ${s.specialist_id})</option>
                        `).join('')}
                    </select>
                </div>

                <button onclick="submitApprovalWithAssignment()" class="btn btn-primary" style="width: 100%; padding: 1rem; border-radius: 1rem; font-weight: 800; font-size: 1.1rem; box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.2);">
                    Confirm Approval & Assign
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeApprovalModal() {
    const modal = document.getElementById('approvalAssignmentModal');
    if (modal) modal.remove();
}

async function submitApprovalWithAssignment() {
    const storageId = document.getElementById('storageSelect').value;
    const specialistId = document.getElementById('specialistSelect').value;

    if (!storageId || !specialistId) {
        showToast('Please select both storage and specialist', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/admin/products/${productToApprove.product_id}/approve-and-assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'confirmed',
                storage_id: storageId,
                specialist_id: specialistId
            })
        });

        if (res.ok) {
            showToast('Product approved and assigned!', 'success');
            closeApprovalModal();
            loadProductApprovals();
        } else {
            const data = await res.json();
            showToast(data.error || 'Assignment failed', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Server error', 'error');
    }
}

async function approveProduct(id, status) {
    if (!confirm(`Are you sure you want to ${status === 'confirmed' ? 'approve' : 'reject'} this product?`)) return;

    try {
        const res = await fetch(`${API}/admin/products/${id}/approval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            showToast(`Product ${status} successfully`, 'success');
            loadProductApprovals();
        } else {
            const data = await res.json();
            showToast(data.error || 'Operation failed', 'error');
        }
    } catch (err) {
        console.error('Approve product error:', err);
        showToast('Server error', 'error');
    }
}

function viewImage(url) {
    window.open(url, '_blank');
}

async function loadPayments() {
    try {

        loadOnlinePayments();

        const url = `${API}/admin/customer-payments`;
        console.log("Fetching customer payments from:", url);

        const custRes = await fetch(url);
        if (custRes.ok) {
            const data = await custRes.json();
            const tbody = document.getElementById('customerPaymentsBody');
            if (data.length > 0) {
                tbody.innerHTML = data.map(p => `
                    <tr>
                        <td>#PAY-${p.payment_id}</td>
                        <td>${p.sender_account || 'Guest'}</td>
                        <td>${p.receiver_account || 'Farm2Market'}</td>
                        <td>${formatCurrency(p.amount)}</td>
                        <td><span class="status-badge stored">${p.payment_mode}</span></td>
                        <td>${formatDateTime(p.time)}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No customer payments found.</td></tr>';
            }
        }

        loadPaymentRequests('transportPaymentsBody');
    } catch (err) { console.error(err); }
}

async function loadOnlinePayments() {
    try {
        const res = await fetch(`${API}/payment/requests`);
        if (res.ok) {
            const requests = await res.json();
            const tbody = document.getElementById('onlinePaymentsBody');
            if (requests.length > 0) {
                tbody.innerHTML = requests.map(r => `
                    <tr>
                        <td>#ORD-${r.order_id}</td>
                        <td>
                            <div style="font-weight: 600;">${r.customer_name || 'N/A'}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">ID: ${r.customer_id}</div>
                        </td>
                        <td>${r.product_type} (${r.quantity} Kg)</td>
                        <td style="font-weight: 600;">₹${r.amount}</td>
                        <td style="font-size: 0.8rem;">
                            <div title="Payment ID"><i data-lucide="credit-card" style="width:12px;display:inline;"></i> ${r.razorpay_payment_id}</div>
                            <div title="Order ID" style="color: #6b7280;"><i data-lucide="hash" style="width:12px;display:inline;"></i> ${r.razorpay_order_id}</div>
                        </td>
                        <td>
                            <span class="status-badge ${r.status === 'confirmed' ? 'stored' : r.status === 'failed' ? 'rejected' : 'pending'}">
                                ${r.status.toUpperCase()}
                            </span>
                        </td>
                        <td class="action-buttons">
                            ${r.status === 'pending' ? `
                                <button class="btn btn-primary btn-sm" onclick="updateOnlinePaymentStatus(${r.transaction_id}, 'confirmed')" title="Confirm Payment">
                                    <i data-lucide="check"></i> Confirm
                                </button>
                                <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fecaca;" onclick="updateOnlinePaymentStatus(${r.transaction_id}, 'failed')" title="Reject Payment">
                                    <i data-lucide="x"></i> Reject
                                </button>
                            ` : `<span style="color: #9ca3af; font-size: 0.875rem;">Verified</span>`}
                        </td>
                    </tr>
                `).join('');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } else {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">No online payment requests found.</td></tr>';
            }
        }
    } catch (err) {
        console.error('Load online payments error:', err);
    }
}

async function updateOnlinePaymentStatus(transactionId, status) {
    if (!confirm(`Are you sure you want to mark this payment as ${status}?`)) return;

    try {
        const res = await fetch(`${API}/payment/requests/${transactionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            showToast(`Payment ${status} successfully`, 'success');
            loadOnlinePayments();
        } else {
            const data = await res.json();
            showToast(data.error || 'Update failed', 'error');
        }
    } catch (err) {
        console.error('Update payment status error:', err);
        showToast('Server error', 'error');
    }
}

async function loadDeliveryAgents() {
    try {
        const res = await fetch(`${API}/delivery-agents/list`);
        if (res.ok) {
            const agents = await res.json();
            const tbody = document.getElementById('deliveryAgentsBody');
            if (agents.length > 0) {
                tbody.innerHTML = agents.map(a => `
                    <tr>
                        <td>#${a.agent_id}</td>
                        <td>${a.name}</td>
                        <td>${a.vehicle_type} (${a.vehicle_number || '--'})</td>
                        <td>${a.phone}</td>
                        <td>⭐ ${a.rating ? parseFloat(a.rating).toFixed(1) : '0.0'}</td>
                        <td><span class="status-badge ${a.status}">${a.status}</span></td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No agents found in database.</td></tr>';
            }
        }
    } catch (err) { console.error(err); }
}

async function loadAgriSpecialists() {
    try {
        const res = await fetch(`${API}/agri-specialist/list`);
        if (res.ok) {
            const specialists = await res.json();
            const tbody = document.getElementById('agriSpecialistsBody');
            if (specialists.length > 0) {
                tbody.innerHTML = specialists.map(s => `
                    <tr>
                        <td>#${s.specialist_id}</td>
                        <td>${s.fullname}</td>
                        <td>${s.qualification || '--'}</td>
                        <td>${s.assigned_region || '--'}</td>
                        <td>${s.phone}</td>
                        <td class="action-buttons">
                            <button class="btn btn-outline btn-sm" onclick="viewSpecialist(${s.specialist_id})">View</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No specialists found in database.</td></tr>';
            }
        }
    } catch (err) { console.error(err); }
}

async function loadDeliveryMonitoring() {
    try {
        const res = await fetch(`${API}/admin/delivery-monitoring`);
        if (res.ok) {
            const logs = await res.json();
            const tbody = document.getElementById('deliveryMonitoringBody');
            if (logs.length > 0) {
                tbody.innerHTML = logs.map(l => `
                    <tr>
                        <td>#${l.delivery_id}</td>
                        <td>${l.customer_name || 'Guest'}</td>
                        <td>${l.agent_name || 'Unassigned'}</td>
                        <td>${l.product_name || '--'}</td>
                        <td><span class="status-badge ${l.status}">${l.status}</span></td>
                        <td>${formatDateTime(l.timestamp)}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No monitoring logs in database.</td></tr>';
            }
        }
    } catch (err) { console.error(err); }
}

function showAddAgentModal() {
    alert('Agent registration redirected to Super Admin or registration workflow.');
}

function showAddSpecialistModal() {
    alert('Specialist registration redirected to Super Admin or registration workflow.');
}

function viewSpecialist(id) {
    alert(`Specialist details for #${id} coming soon!`);
}

async function loadRecentOrders() {
    try {
        const res = await fetch(`${API}/orders/list?limit=5`);
        if (res.ok) {
            const orders = await res.json();
            const tbody = document.getElementById('recentOrdersBody');
            renderOrdersTable(tbody, orders);
        }
    } catch (err) { console.error(err); }
}

async function loadOrders(status) {
    try {

        const filters = document.querySelectorAll('.chart-filter');
        filters.forEach(f => {
            f.classList.toggle('active', f.getAttribute('onclick').includes(`'${status}'`));
        });

        const res = await fetch(`${API}/orders/list?status=${status}`);
        if (res.ok) {
            const orders = await res.json();
            const tbody = document.getElementById('allOrdersBody');
            renderOrdersTable(tbody, orders);
        }
    } catch (err) { console.error(err); }
}

function renderOrdersTable(tbody, orders) {
    if (orders.length > 0) {
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>#${o.order_id}</td>
                <td>${o.customer_name || 'Guest'}</td>
                <td>${formatDate(o.created_at)}</td>
                <td>${formatCurrency(o.order_total)}</td>
                <td><span class="status-badge ${o.status}">${o.status}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-outline btn-sm" onclick="viewOrderDetails(${o.order_id})">View</button>
                    ${o.status === 'pending' ? `<button class="btn btn-primary btn-sm" onclick="updateOrderStatus(${o.order_id}, 'confirmed')">Confirm</button>` : ''}
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No orders found.</td></tr>';
    }
}

async function updateOrderStatus(id, status) {
    if (!confirm(`Mark order #${id} as ${status}?`)) return;
    try {
        const res = await fetch(`${API}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            showToast(`Order #${id} ${status}`);
            const activeView = document.querySelector('.sidebar-menu-item.active span').textContent.trim();
            if (activeView === 'Dashboard') loadRecentOrders();
            else loadOrders('all');

            loadDashboardStats({
                totalOrders: 'statTotalOrders',
                totalRevenue: 'statTotalRevenue',
                avgOrderValue: 'statAvgOrderValue',
                pendingCount: 'statPendingCount'
            });
        }
    } catch (err) { showToast('Update failed', 'error'); }
}

async function loadAssignmentData() {
    try {
        const [ordersRes, agentsRes] = await Promise.all([
            fetch(`${API}/orders/list?status=confirmed`),
            fetch(`${API}/admin/list`)
        ]);

        const agentRes2 = await fetch(`${API}/delivery-agents/list`);

        if (ordersRes.ok) {
            const orders = await ordersRes.json();
            const orderSelect = document.getElementById('assignOrderSelect');
            orderSelect.innerHTML = '<option value="">Select an order</option>' +
                orders.map(o => `<option value="${o.order_id}">Order #${o.order_id} - ${o.customer_name}</option>`).join('');
        }

        if (agentRes2.ok) {
            const agents = await agentRes2.json();
            const agentSelect = document.getElementById('deliveryAgentSelect');
            agentSelect.innerHTML = '<option value="">Select an agent</option>' +
                agents.filter(a => a.status === 'active').map(a => `<option value="${a.agent_id}">${a.name} (${a.vehicle_type})</option>`).join('');
        }
    } catch (err) { console.error(err); }
}

async function assignAgent() {
    const order_id = document.getElementById('assignOrderSelect').value;
    const agent_id = document.getElementById('deliveryAgentSelect').value;

    if (!order_id || !agent_id) {
        showToast('Please select both order and agent', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/orders/assign-agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id, agent_id })
        });

        if (res.ok) {
            showToast('Agent assigned successfully');
            loadAssignmentData();
        } else {
            const err = await res.json();
            showToast(err.error || 'Assignment failed', 'error');
        }
    } catch (err) { showToast('Network error', 'error'); }
}

async function loadFarmerApprovals() {
    try {
        console.log("Fetching pending farmers...");
        const res = await fetch(`${API}/admin/farmers/pending-approvals`);
        if (res.ok) {
            const farmers = await res.json();
            console.log("Loaded farmers for UI:", farmers);
            const tbody = document.getElementById('farmerApprovalsBody');
            if (farmers.length > 0) {
                tbody.innerHTML = farmers.map(f => `
                    <tr>
                        <td>#${f.farmer_id}</td>
                        <td>${f.farm_name || f.fullname || 'N/A'}</td>
                        <td>${f.email || '--'}</td>
                        <td>${f.phone_no || f.phone || '--'}</td>
                        <td><span class="status-badge pending">Pending</span></td>
                        <td class="action-buttons">
                            <button class="btn btn-primary btn-sm" onclick="approveFarmer(${f.farmer_id}, 'approved')">Approve</button>
                            <button class="btn btn-danger btn-sm" onclick="approveFarmer(${f.farmer_id}, 'rejected')">Reject</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No pending approvals.</td></tr>';
            }
        } else {
            console.error("Server error fetching farmers:", res.status);
            showToast('Failed to load pending farmers', 'error');
        }
    } catch (err) { console.error("UI loadFarmerApprovals error:", err); }
}

async function approveFarmer(id, status) {
    if (!confirm(`${status === 'approved' ? 'Approve' : 'Reject'} this farmer?`)) return;
    try {
        const res = await fetch(`${API}/admin/farmers/${id}/approval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            showToast(`Farmer ${status}`);
            loadFarmerApprovals();
        }
    } catch (err) { showToast('Operation failed', 'error'); }
}

async function loadActivityLogs() {
    try {
        const res = await fetch(`${API}/admin/activity-logs`);
        if (res.ok) {
            const logs = await res.json();
            const tbody = document.getElementById('activityLogsBody');
            if (logs.length > 0) {
                tbody.innerHTML = logs.map(l => `
                    <tr>
                        <td>${l.admin_name}</td>
                        <td>${l.activity_type}</td>
                        <td>${l.details || '--'}</td>
                        <td>${formatDateTime(l.time)}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No logs found.</td></tr>';
            }
        }
    } catch (err) { console.error(err); }
}

async function loadAdminSettings() {
    const info = getAdminInfo();
    try {
        const res = await fetch(`${API}/admin/${info.id}`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('settingsName').value = data.admin_name;
            document.getElementById('settingsEmail').value = data.email;
        }
    } catch (err) { console.error(err); }
}

async function updateAdminSettings() {
    const info = getAdminInfo();
    const name = document.getElementById('settingsName').value.trim();
    const password = document.getElementById('settingsPassword').value;

    if (!name) return showToast('Name is required', 'error');

    const body = { admin_name: name };
    if (password) {
        if (!/^[0-9]{4}$/.test(password)) return showToast('Password must be 4 digits', 'error');
        body.password = password;
    }

    try {
        const res = await fetch(`${API}/admin/${info.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showToast('Settings updated');
            localStorage.setItem('user_name', name);
            updateAdminUI(name);
        } else {
            const err = await res.json();
            showToast(err.error || 'Update failed', 'error');
        }
    } catch (err) { showToast('Network error', 'error'); }
}

function viewOrderDetails(id) {
    alert(`Order details for #${id} coming soon!`);
}

function updateActiveMenuItem(viewName) {
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    menuItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`'${viewName}'`)) {
            item.classList.add('active');
        }
    });
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = 'home.html';
    }
}

function showProfile() {
    alert('Profile settings coming soon');
}

function showNotifications() {
    showToast('Checking for new system alerts...', 'info');
}
