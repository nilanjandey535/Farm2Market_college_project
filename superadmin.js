// superadmin.js - Super Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', function() {

    const info = getAdminInfo();
    if (info.role !== 'super_admin') {

    }

    document.getElementById('userName').textContent = info.name;
    document.getElementById('userAvatar').textContent = info.name.split(' ').map(n => n[0]).join('').toUpperCase();

    if (typeof lucide !== 'undefined') lucide.createIcons();

    checkSuperAdminExists();

    showDashboard();

    handleDeliveryBoyRegistration('deliveryBoyRegistrationForm');
});

function showDashboard() {
    hideAllViews();
    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Super Admin Dashboard';
    setActiveMenuItem(0);
    loadDashboardStats({
        totalAdmins: 'statTotalAdmins',
        totalRevenue: 'statTotalRevenue',
        totalOrders: 'statTotalOrders',
        avgOrderValue: 'statAvgOrderValue'
    });
}

function showDeliveryMonitoring() {
    hideAllViews();
    document.getElementById('deliveryMonitoringView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Delivery Monitoring';
    setActiveMenuItem(1);
    loadDeliveryMonitoring();
}

async function loadDeliveryMonitoring() {
    try {
        const res = await fetch(`${API}/admin/delivery-monitoring`);
        if (res.ok) {
            const data = await res.json();
            const tbody = document.getElementById('deliveryMonitoringBody');
            if (data.length > 0) {
                tbody.innerHTML = data.map(d => `
                    <tr>
                        <td>#${d.delivery_id}</td>
                        <td>${d.customer_name || 'Guest'}</td>
                        <td>${d.agent_name || 'Unassigned'}</td>
                        <td>${d.delivery_location || 'N/A'}</td>
                        <td><span class="status-badge ${d.status}">${d.status}</span></td>
                        <td>${getTimeAgo(d.timestamp)}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No delivery data found.</td></tr>';
            }
        }
    } catch (err) { console.error(err); }
}

function showPaymentRequests() {
    hideAllViews();
    document.getElementById('paymentRequestsView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Payment Requests';
    setActiveMenuItem(2);
    loadPaymentRequests('paymentRequestsBody');
}

function showProductApprovals() {
    hideAllViews();
    document.getElementById('productApprovalsView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Product Quality Approval';
    setActiveMenuItem(3);
    loadProductApprovals();
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
            showToast('Product approved and assigned successfully', 'success');
            closeApprovalModal();
            loadProductApprovals();
        } else {
            const data = await res.json();
            showToast(data.error || 'Approval failed', 'error');
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

function showPaymentVerification() {
    hideAllViews();
    document.getElementById('paymentVerificationView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Payment Verification';
    setActiveMenuItem(4);
    loadOnlinePayments();
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
                                    <i data-lucide="check" style="width: 14px; height: 14px;"></i> Confirm
                                </button>
                                <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fecaca;" onclick="updateOnlinePaymentStatus(${r.transaction_id}, 'failed')" title="Reject Payment">
                                    <i data-lucide="x" style="width: 14px; height: 14px;"></i> Reject
                                </button>
                            ` : `<span style="color: #9ca3af; font-size: 0.875rem;">Verified</span>`}
                        </td>
                    </tr>
                `).join('');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } else {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:5rem 2rem;">No online payment requests found.</td></tr>';
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

function showPermissionManagement() {
    hideAllViews();
    document.getElementById('permissionManagementView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Permission Management';
    setActiveMenuItem(5);
}

function showAdminManagement() {
    hideAllViews();
    document.getElementById('adminManagementView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Admin Management';
    setActiveMenuItem(6);
    loadAdminList('adminGridContainer');
}

function showRegisterAdmin() {
    hideAllViews();
    document.getElementById('registerAdminView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Register New Admin';
    setActiveMenuItem(7);
}

function showRegisterAgriSpecialist() {
    hideAllViews();
    document.getElementById('registerAgriSpecialistView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Register New Agri Specialist';
    setActiveMenuItem(8);
}

function showRegisterDeliveryBoy() {
    hideAllViews();
    document.getElementById('registerDeliveryBoyView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Register New Delivery Boy';
    setActiveMenuItem(9);
}

function showReports() {
    hideAllViews();
    document.getElementById('reportsView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Cold Storage Reports';
    setActiveMenuItem(10);
    loadColdStorageReports();
}

function formatReportDate(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function formatNum(value, decimals = 2) {
    if (value == null || value === '') return '--';
    const num = parseFloat(value);
    return Number.isNaN(num) ? '--' : num.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}

let coldStorageReportsCache = [];

async function loadColdStorageReports() {
    const tbody = document.getElementById('coldStorageReportsBody');
    const countEl = document.getElementById('csrReportCount');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="15" style="text-align:center;">Loading cold storage reports...</td></tr>';

    const type = document.getElementById('csrReportTypeFilter')?.value || '';
    const fromDate = document.getElementById('csrFromDate')?.value || '';
    const toDate = document.getElementById('csrToDate')?.value || '';

    let url = `${API}/admin/cold-storage-reports`;
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (fromDate) params.set('from_date', fromDate);
    if (toDate) params.set('to_date', toDate);
    if (params.toString()) url += `?${params.toString()}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load cold storage reports');
        const reports = await res.json();
        coldStorageReportsCache = reports;

        if (countEl) {
            countEl.textContent = `${reports.length} report${reports.length === 1 ? '' : 's'} found`;
        }

        if (reports.length > 0) {
            tbody.innerHTML = reports.map(r => `
                <tr>
                    <td style="font-family: monospace; color: #6b7280;">#${r.report_id}</td>
                    <td>${formatReportDate(r.report_date)}</td>
                    <td><span class="status-badge ${r.report_type === 'daily' ? 'stored' : 'transported'}">${r.report_type || '--'}</span></td>
                    <td>
                        <div style="font-weight: 600;">${r.storage_name || 'N/A'}</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">ID: ${r.storage_id ?? '--'}</div>
                    </td>
                    <td>${r.region_name || r.specialist_region || '--'}</td>
                    <td>
                        <div style="font-weight: 600;">${r.specialist_name || 'N/A'}</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">ID: ${r.specialist_id ?? '--'}</div>
                    </td>
                    <td>${r.total_crops ?? 0}</td>
                    <td>${formatNum(r.total_weight_kg)}</td>
                    <td>${formatNum(r.avg_temperature, 1)}°C</td>
                    <td>${formatNum(r.avg_humidity, 1)}%</td>
                    <td>${r.spoiled_count ?? 0}</td>
                    <td>${formatNum(r.energy_kwh)}</td>
                    <td><span class="status-badge ${r.status === 'submitted' ? 'stored' : 'pending'}">${(r.status || 'unknown').toUpperCase()}</span></td>
                    <td style="font-size: 0.8rem; white-space: nowrap;">${formatDateTime(r.created_at)}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-outline btn-sm" onclick="viewColdStorageReport(${r.report_id})" title="View full details">
                            <i data-lucide="eye" style="width: 14px; height: 14px;"></i> View
                        </button>
                    </td>
                </tr>
            `).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            tbody.innerHTML = '<tr><td colspan="15" style="text-align:center; padding: 3rem;">No cold storage reports found.</td></tr>';
        }
    } catch (err) {
        console.error('Cold storage reports error:', err);
        tbody.innerHTML = '<tr><td colspan="15" style="text-align:center; color: #dc2626;">Failed to load cold storage reports.</td></tr>';
        if (countEl) countEl.textContent = 'Error loading reports';
    }
}

function viewColdStorageReport(reportId) {
    const report = coldStorageReportsCache.find(r => r.report_id === reportId);
    if (!report) return;

    const modal = document.getElementById('csrDetailModal');
    const body = document.getElementById('csrDetailBody');
    const title = document.getElementById('csrDetailTitle');

    title.textContent = `Report #${report.report_id} — ${formatReportDate(report.report_date)}`;

    body.innerHTML = `
        <div style="display: grid; gap: 1.25rem;">
            <section style="background: #f9fafb; border-radius: 0.75rem; padding: 1rem;">
                <h4 style="margin: 0 0 0.75rem; font-size: 0.875rem; text-transform: uppercase; color: #6b7280;">Report Summary</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
                    <div><strong>Type:</strong> ${report.report_type || '--'}</div>
                    <div><strong>Status:</strong> ${report.status || '--'}</div>
                    <div><strong>Report Date:</strong> ${formatReportDate(report.report_date)}</div>
                    <div><strong>Submitted:</strong> ${formatDateTime(report.created_at)}</div>
                </div>
            </section>

            <section style="background: #f0fdf4; border-radius: 0.75rem; padding: 1rem;">
                <h4 style="margin: 0 0 0.75rem; font-size: 0.875rem; text-transform: uppercase; color: #166534;">Storage Unit</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
                    <div><strong>Name:</strong> ${report.storage_name || 'N/A'}</div>
                    <div><strong>Storage ID:</strong> ${report.storage_id ?? '--'}</div>
                    <div><strong>Region:</strong> ${report.region_name || '--'}</div>
                    <div><strong>Capacity:</strong> ${formatNum(report.capacity_kg)} kg</div>
                    <div><strong>Current Load:</strong> ${formatNum(report.current_load_kg)} kg</div>
                    <div><strong>Unit Temp:</strong> ${formatNum(report.storage_temperature_c, 1)}°C</div>
                    <div><strong>Unit Humidity:</strong> ${formatNum(report.storage_humidity_percent, 1)}%</div>
                    <div><strong>Unit Status:</strong> ${report.storage_status || '--'}</div>
                </div>
            </section>

            <section style="background: #eff6ff; border-radius: 0.75rem; padding: 1rem;">
                <h4 style="margin: 0 0 0.75rem; font-size: 0.875rem; text-transform: uppercase; color: #1d4ed8;">Agri Specialist</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
                    <div><strong>Name:</strong> ${report.specialist_name || 'N/A'}</div>
                    <div><strong>Specialist ID:</strong> ${report.specialist_id ?? '--'}</div>
                    <div><strong>Email:</strong> ${report.specialist_email || '--'}</div>
                    <div><strong>Phone:</strong> ${report.specialist_phone || '--'}</div>
                    <div><strong>Assigned Region:</strong> ${report.specialist_region || '--'}</div>
                </div>
            </section>

            <section style="background: #fff7ed; border-radius: 0.75rem; padding: 1rem;">
                <h4 style="margin: 0 0 0.75rem; font-size: 0.875rem; text-transform: uppercase; color: #c2410c;">Report Metrics</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
                    <div><strong>Total Crops:</strong> ${report.total_crops ?? 0}</div>
                    <div><strong>Total Weight:</strong> ${formatNum(report.total_weight_kg)} kg</div>
                    <div><strong>Avg Temperature:</strong> ${formatNum(report.avg_temperature, 1)}°C</div>
                    <div><strong>Avg Humidity:</strong> ${formatNum(report.avg_humidity, 1)}%</div>
                    <div><strong>Spoiled Count:</strong> ${report.spoiled_count ?? 0}</div>
                    <div><strong>Energy Consumption:</strong> ${formatNum(report.energy_kwh)} kWh</div>
                </div>
            </section>

            <section style="background: #f9fafb; border-radius: 0.75rem; padding: 1rem;">
                <h4 style="margin: 0 0 0.75rem; font-size: 0.875rem; text-transform: uppercase; color: #6b7280;">Remarks</h4>
                <p style="margin: 0; white-space: pre-wrap;">${report.remarks || 'No remarks provided.'}</p>
            </section>
        </div>
    `;

    modal.style.display = 'flex';
    modal.classList.add('active');
}

function closeCsrDetailModal() {
    const modal = document.getElementById('csrDetailModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

function showSettings() {
    hideAllViews();
    document.getElementById('settingsView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Settings';
    setActiveMenuItem(11);
}

function hideAllViews() {
    const views = [
        'dashboardView', 'deliveryMonitoringView',
        'paymentRequestsView', 'productApprovalsView', 'paymentVerificationView',
        'permissionManagementView', 'adminManagementView', 'registerAdminView', 'registerAgriSpecialistView',
        'registerDeliveryBoyView', 'reportsView', 'settingsView'
    ];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = 'none';
    });
}

function setActiveMenuItem(index) {
    document.querySelectorAll('.sidebar-menu-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

async function checkSuperAdminExists() {
    try {
        const response = await fetch(`${API}/register/admin/check-super-admin`);
        const result = await response.json();

        const warningDiv = document.getElementById('superAdminWarning');
        const superAdminOption = document.getElementById('superAdminOption');

        if (response.ok && !result.exists) {
            if (warningDiv) warningDiv.style.display = 'block';
            if (superAdminOption) {
                superAdminOption.disabled = false;
                superAdminOption.selected = true;
            }
        } else {
            if (warningDiv) warningDiv.style.display = 'none';
            if (superAdminOption) {
                superAdminOption.disabled = true;
                superAdminOption.selected = false;
            }
        }
    } catch (error) { console.error('Error checking super admin:', error); }
}

function getTimeAgo(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = 'home.html';
    }
}
