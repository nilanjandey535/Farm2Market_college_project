// Component Rendering Functions

function renderBackButton() {
    const canGoBack = AppState.navigationHistory.length > 0;

    if (!canGoBack || AppState.activeTab === 'marketplace') return '';

    return `
        <button onclick="goBack()" class="back-button">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
            <span>Back</span>
        </button>
    `;
}

function renderHeader() {
    const t = getTranslations();
    const header = document.getElementById('header');
    const isDark = AppState.theme === 'dark';

    header.className = `header ${isDark ? 'dark-theme' : ''}`;
    header.innerHTML = `
        <div class="container">
            <div class="header-container">
                <div class="flex items-center gap-4">
                    <button id="menuToggle" class="header-menu-toggle">
                        <i data-lucide="${AppState.showMobileMenu ? 'x' : 'menu'}" class="w-6 h-6"></i>
                    </button>
                    <h1 class="header-logo">
                        <i data-lucide="package" class="text-yellow-400"></i>
                        ${t.appName}
                    </h1>
                </div>

                <nav class="header-nav">
                    <button onclick="setActiveTab('marketplace')" class="${AppState.activeTab === 'marketplace' ? 'active' : ''}">${t.marketplace}</button>
                    ${AppState.isLoggedIn ? `<button onclick="setActiveTab('myproducts')" class="${AppState.activeTab === 'myproducts' ? 'active' : ''}">${t.myProducts}</button>` : ''}
                    <button onclick="setActiveTab('orders')" class="${AppState.activeTab === 'orders' ? 'active' : ''}">${t.orders}</button>
                    <button onclick="setActiveTab('tools')" class="${AppState.activeTab === 'tools' ? 'active' : ''}">${t.tools}</button>
                    ${AppState.isLoggedIn && AppState.userType === 'farmer' ? `<button onclick="setActiveTab('weather')" class="${AppState.activeTab === 'weather' ? 'active' : ''}">${t.weather}</button>` : ''}
                    <div class="dropdown">
                        <button class="${AppState.activeTab === 'about' || AppState.activeTab === 'help' ? 'active' : ''}">About Us</button>
                        <div class="dropdown-content">
                            <button onclick="window.location.href='about.html'">About Company</button>
                            <button onclick="window.location.href='about.html#contact'">Help</button>
                        </div>
                    </div>
                </nav>

                <div class="header-actions">
                    <button onclick="openModal('language')" class="btn btn-primary px-3 py-2 text-sm" title="Change Language">
                        <i data-lucide="globe" class="w-4 h-4"></i>
                        <span class="hidden md:inline">
                            ${AppState.language === 'en' ? 'English' : AppState.language === 'hi' ? 'हिंदी' : 'বাংলা'}
                        </span>
                    </button>

                    <button onclick="setState({ theme: AppState.theme === 'light' ? 'dark' : 'light' })" class="btn btn-primary px-3 py-2 text-sm">
                        <i data-lucide="${AppState.theme === 'light' ? 'moon' : 'sun'}" class="w-4 h-4"></i>
                        <span class="hidden md:inline">${AppState.theme === 'light' ? 'Dark' : 'Light'}</span>
                    </button>

                    <select value="${AppState.userType}" onchange="setState({ userType: this.value })" class="select ${isDark ? 'dark-theme' : ''} hidden md:block">
                        <option value="customer">${t.customerView}</option>
                        <option value="farmer">${t.farmerView}</option>
                    </select>

                    <button onclick="openModal('cart')" class="relative">
                        <i data-lucide="shopping-cart" class="w-6 h-6"></i>
                        ${AppState.cartItems.length > 0 ? `<span class="cart-badge">${AppState.cartItems.length}</span>` : ''}
                    </button>

                    ${AppState.isLoggedIn ? `
                        <button onclick="openModal('settings')">
                            <i data-lucide="user" class="w-6 h-6"></i>
                        </button>
                    ` : ``}
                </div>
            </div>
        </div>

        <div class="mobile-menu ${AppState.showMobileMenu ? 'active' : ''}">
            <div class="px-4 py-2">
                <button onclick="setActiveTab('marketplace'); setState({ showMobileMenu: false })">${t.marketplace}</button>
                ${AppState.isLoggedIn ? `<button onclick="setActiveTab('myproducts'); setState({ showMobileMenu: false })">${t.myProducts}</button>` : ''}
                <button onclick="setActiveTab('orders'); setState({ showMobileMenu: false })">${t.orders}</button>
                <button onclick="setActiveTab('tools'); setState({ showMobileMenu: false })">${t.tools}</button>
                ${AppState.isLoggedIn && AppState.userType === 'farmer' ? `<button onclick="setActiveTab('weather'); setState({ showMobileMenu: false })">${t.weather}</button>` : ''}
                <button onclick="window.location.href='about.html'; setState({ showMobileMenu: false })">About Company</button>
                <button onclick="window.location.href='about.html#contact'; setState({ showMobileMenu: false })">Help</button>
            </div>
        </div>
    `;

    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.onclick = () => setState({ showMobileMenu: !AppState.showMobileMenu });
    }
}

function renderFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <div>
                    <h3>About Farm2Market</h3>
                    <p>Connecting farmers directly with customers for fair trade and fresh produce.</p>
                </div>
                <div>
                    <h3>For Farmers</h3>
                    <ul>
                        <li>Direct Market Access</li>
                        <li>Fair Pricing</li>
                        <li>Crop Suggestions</li>
                        <li>Tools & Supplies</li>
                    </ul>
                </div>
                <div>
                    <h3>For Consumers</h3>
                    <ul>
                        <li>Fresh Produce</li>
                        <li>Direct from Farm</li>
                        <li>Best Prices</li>
                        <li>Quality Assured</li>
                    </ul>
                </div>
                <div>
                    <h3>Contact</h3>
                    <p>support@farm2market.example</p>
                    <p>+91 98765 43210</p>
                </div>
            </div>
        </div>
    `;
}

function renderCheckoutStepper() {
    const stepper = document.getElementById('checkoutStepper');
    const checkoutTabs = ['ordersummary', 'payment'];

    if (!checkoutTabs.includes(AppState.activeTab)) {
        stepper.style.display = 'none';
        return;
    }

    stepper.style.display = 'block';
    const t = getTranslations();

    const currentStep = AppState.activeTab === 'ordersummary' ? 2 : 3;

    stepper.innerHTML = `
        <div class="container">
            <div class="checkout-stepper-wrapper">
                <!-- Step 1: Cart (Completed) -->
                <div class="checkout-step completed">
                    <div class="step-circle completed">
                        <i data-lucide="check" class="w-4 h-4"></i>
                    </div>
                    <div class="step-label">Cart</div>
                </div>

                <div class="step-line ${currentStep >= 2 ? 'completed' : ''}"></div>

                <!-- Step 2: Order Summary -->
                <div class="checkout-step ${currentStep >= 2 ? 'active' : ''}">
                    <div class="step-circle ${currentStep >= 2 ? 'active' : ''}">
                        ${currentStep > 2 ? '<i data-lucide="check" class="w-4 h-4"></i>' : '2'}
                    </div>
                    <div class="step-label">Order Summary</div>
                </div>

                <div class="step-line ${currentStep >= 3 ? 'completed' : ''}"></div>

                <!-- Step 3: Payment -->
                <div class="checkout-step ${currentStep >= 3 ? 'active' : ''}">
                    <div class="step-circle ${currentStep >= 3 ? 'active' : ''}">
                        3
                    </div>
                    <div class="step-label">Payment</div>
                </div>
            </div>
        </div>
    `;
}

async function loadMyProducts() {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('role');
    const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';

    try {
        const response = await fetch(`${apiBase}/products/my-products?user_id=${userId}&user_role=${userRole}`);
        const data = await response.json();
        if (response.ok) {
            setState({ myProducts: data, isMyProductsLoaded: true });
        } else {
            console.error('Failed to load products:', data.error);
        }
    } catch (err) {
        console.error('Error loading products:', err);
    }
}

function renderMyProducts() {
    const t = getTranslations();

    if (AppState.myProducts.length === 0 && !AppState.isMyProductsLoaded) {
        AppState.isMyProductsLoaded = true;
        loadMyProducts();
    }

    return `
        <div class="container px-4 py-6">
            ${renderBackButton()}
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">${t.myProductsTitle}</h2>
                <button onclick="openModal('addProduct')" class="btn btn-primary">
                    <i data-lucide="plus" class="w-4 h-4"></i> ${t.addNewProduct}
                </button>
            </div>
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">${t.tableHeaders.product}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">${t.tableHeaders.price}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">${t.tableHeaders.stock}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">${t.tableHeaders.status}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">${t.tableHeaders.actions}</th>
                        </tr>
                    </thead>
                    <tbody id="myProductsTableBody">
                        ${AppState.myProducts.length === 0 ? `
                            <tr>
                                <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                                    No products found. Add your first product to see it here.
                                </td>
                            </tr>
                        ` : AppState.myProducts.map((product, index) => `
                            <tr class="border-t">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        ${product.images && product.images.length > 0 ?
            `<img src="${product.images[0]}" class="w-10 h-10 rounded object-cover" />` :
            `<div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center"><i data-lucide="image" class="w-5 h-5 text-gray-400"></i></div>`
        }
                                        <span>${product.product_name}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">₹${product.price_per_kg}</td>
                                <td class="px-6 py-4">${product.stock_quantity_kg} Kg</td>
                                <td class="px-6 py-4">
                                    <span class="status-badge ${product.status === 'confirmed' ? 'delivered' : product.status === 'rejected' ? 'cancelled' : 'pending'}">
                                        ${product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <button onclick="editMyProduct(${index})" class="text-blue-600 hover:underline mr-2">${t.edit}</button>
                                    <button onclick="removeMyProduct(${index})" class="text-red-600 hover:underline">${t.remove}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderOrders() {
    const t = getTranslations();
    const isDark = AppState.theme === 'dark';

    if (!AppState.isOrdersLoaded && !AppState.isOrdersLoading) {
        ensureOrdersLoaded();
    }

    return `
        <div class="container px-4 py-6">
            ${renderBackButton()}
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 class="text-2xl font-bold">My Orders</h2>
                    <p class="text-gray-500 mt-1">Track and manage your orders</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button onclick="filterOrders('all')" class="filter-button ${!AppState.orderFilter || AppState.orderFilter === 'all' ? 'active btn-primary' : 'btn-outline'} px-4 py-2 rounded-full text-sm font-medium transition-all duration-300">
                        All Orders
                    </button>
                    <button onclick="filterOrders('in-transit')" class="filter-button ${AppState.orderFilter === 'in-transit' ? 'active btn-primary' : 'btn-outline'} px-4 py-2 rounded-full text-sm font-medium transition-all duration-300">
                        In Transit
                    </button>
                    <button onclick="filterOrders('delivered')" class="filter-button ${AppState.orderFilter === 'delivered' ? 'active btn-primary' : 'btn-outline'} px-4 py-2 rounded-full text-sm font-medium transition-all duration-300">
                        Delivered
                    </button>
                </div>
            </div>

            ${AppState.isOrdersLoading && AppState.orders.length === 0 ? `
                <div class="text-center py-16 bg-white rounded-2xl shadow-lg ${isDark ? 'dark-theme' : ''}">
                    <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
                    <p class="text-gray-500">Loading your orders...</p>
                </div>
            ` : AppState.orders.length === 0 ? `
                <div class="text-center py-16 bg-white rounded-2xl shadow-lg ${isDark ? 'dark-theme' : ''}">
                    <div class="mx-auto w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                        <i data-lucide="package" class="w-12 h-12 text-green-500"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">No orders yet</h3>
                    <p class="text-gray-500 mb-6 max-w-md mx-auto">Start shopping to see your orders here. Your purchased items will appear in this section.</p>
                    <button onclick="setActiveTab('marketplace')" class="btn btn-primary px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300">
                        <i data-lucide="shopping-cart" class="w-5 h-5 mr-2"></i>
                        Browse Products
                    </button>
                </div>
            ` : `
                <div class="space-y-4">
                    ${AppState.orders
            .filter(order => !AppState.orderFilter ||
                AppState.orderFilter === 'all' ||
                (AppState.orderFilter === 'in-transit' && order.status === 'In Transit') ||
                (AppState.orderFilter === 'delivered' && order.status === 'Delivered'))
            .map((order, index) => `
                        <div class="order-card order-list-item bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${isDark ? 'dark-theme' : ''}">
                            <div class="p-4 border-b border-gray-100 ${isDark ? 'border-gray-700' : ''}">
                                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div class="flex-1">
                                        <div class="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 class="font-bold text-lg">Order #${order.id}</h3>
                                            <span class="status-badge ${order.status === 'Delivered' || order.status === 'confirmed' ? 'delivered' : (order.status === 'payment_pending_verification' || order.status === 'pending') ? 'pending' : 'in-transit'} text-xs px-2 py-1 rounded-full font-semibold">
                                                ${(order.status === 'payment_pending_verification' || order.status === 'pending') ? 'Verifying Payment' : order.status}
                                            </span>
                                        </div>
                                        ${(order.status === 'payment_pending_verification' || order.status === 'pending') ? `
                                            <div class="bg-blue-50 text-blue-700 p-2 rounded-lg text-xs mt-2 border border-blue-100">
                                                <i data-lucide="clock" class="w-3 h-3 inline mr-1"></i>
                                                We need some time to verify the payment. After verification order will be placed.
                                            </div>
                                        ` : ''}
                                        ${order.status === 'payment_failed' ? `
                                            <div class="bg-red-50 text-red-700 p-2 rounded-lg text-xs mt-2 border border-red-100">
                                                <i data-lucide="alert-circle" class="w-3 h-3 inline mr-1"></i>
                                                Payment verification failed. Please contact support or try again.
                                            </div>
                                        ` : ''}
                                        <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                                            <div class="flex items-center gap-1">
                                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                                <span>${order.date}</span>
                                            </div>
                                            <div class="flex items-center gap-1">
                                                <i data-lucide="package" class="w-3 h-3"></i>
                                                <span>${order.items.length} item${order.items.length > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-lg font-bold text-green-600">₹${order.total}</p>
                                        <p class="text-xs text-gray-500 mt-1">Total</p>
                                    </div>
                                </div>
                            </div>

                            <div class="p-4">
                                <!-- Product Preview with Enhanced Collage Layout - Much smaller images (1/7th size) -->
                                <div class="mb-4">
                                    ${order.items.length === 1 ? `
                                        <!-- Single Item Display - Much smaller images -->
                                        <div class="flex items-center gap-2">
                                            <div class="w-6 h-6 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 transition-transform duration-300 hover:scale-105 product-image-enhanced">
                                                <img src="${order.items[0].image}" alt="${order.items[0].name}"
                                                    class="w-full h-full object-cover"
                                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[8px] font-bold text-green-600 bg-gray-100&quot;>${order.items[0].name.charAt(0)}</div>';" />
                                            </div>
                                            <div>
                                                <p class="font-medium text-gray-900 text-xs">${order.items[0].name}</p>
                                                <p class="text-[8px] text-gray-500">Qty: ${order.items[0].quantity || 1}</p>
                                            </div>
                                        </div>
                                    ` : order.items.length === 2 ? `
                                        <!-- Two Items Display - Much smaller images -->
                                        <div class="flex gap-1">
                                            ${order.items.slice(0, 2).map(item => `
                                                <div class="w-6 h-6 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 transition-transform duration-300 hover:scale-105 product-image-enhanced">
                                                    <img src="${item.image}" alt="${item.name}"
                                                        class="w-full h-full object-cover"
                                                        onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[8px] font-bold text-green-600 bg-gray-100&quot;>${item.name.charAt(0)}</div>';" />
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <!-- Multiple Items Collage Display - Much smaller images -->
                                        <div class="relative w-8 h-8">
                                            <!-- First item (main) -->
                                            <div class="absolute top-0 left-0 w-6 h-6 rounded-md bg-gray-100 overflow-hidden border border-gray-200 z-10 transition-transform duration-300 hover:scale-105 product-image-enhanced">
                                                <img src="${order.items[0].image}" alt="${order.items[0].name}"
                                                    class="w-full h-full object-cover"
                                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[8px] font-bold text-green-600 bg-gray-100&quot;>${order.items[0].name.charAt(0)}</div>';" />
                                            </div>
                                            <!-- Second item (top right) -->
                                            <div class="absolute top-0 right-0 w-4 h-4 rounded bg-gray-100 overflow-hidden border border-white shadow-sm transition-transform duration-300 hover:scale-105 product-image-enhanced">
                                                <img src="${order.items[1].image}" alt="${order.items[1].name}"
                                                    class="w-full h-full object-cover"
                                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[6px] font-bold text-green-600 bg-gray-100&quot;>${order.items[1].name.charAt(0)}</div>';" />
                                            </div>
                                            <!-- Third item (bottom right) -->
                                            <div class="absolute bottom-0 right-0 w-4 h-4 rounded bg-gray-100 overflow-hidden border border-white shadow-sm transition-transform duration-300 hover:scale-105 product-image-enhanced">
                                                <img src="${order.items[2].image}" alt="${order.items[2].name}"
                                                    class="w-full h-full object-cover"
                                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[6px] font-bold text-green-600 bg-gray-100&quot;>${order.items[2].name.charAt(0)}</div>';" />
                                            </div>
                                            <!-- Additional items counter -->
                                            ${order.items.length > 3 ? `
                                                <div class="absolute bottom-0 left-0 w-4 h-4 rounded bg-green-500 flex items-center justify-center border border-white shadow-sm text-white font-bold text-[6px]">
                                                    +${order.items.length - 3}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `}
                                </div>

                                <!-- Action Buttons -->
                                <div class="flex flex-wrap gap-2">
                                    <button onclick="viewOrderDetails(${order.id})" class="flex-1 min-w-[100px] btn btn-outline py-2 text-xs flex items-center justify-center gap-1 rounded-lg font-medium transition-all duration-300 hover:shadow-md btn-enhanced">
                                        <i data-lucide="eye" class="w-3 h-3"></i>
                                        View
                                    </button>
                                    <button onclick="trackOrder(${order.id})" class="flex-1 min-w-[100px] btn btn-primary py-2 text-xs flex items-center justify-center gap-1 rounded-lg font-medium transition-all duration-300 hover:shadow-lg btn-enhanced">
                                        <i data-lucide="truck" class="w-3 h-3"></i>
                                        Track
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function renderFarmTools() {
    const t = getTranslations();
    const isDark = AppState.theme === 'dark';

    if (!AppState.isMarketplaceLoaded) {
        loadMarketplaceProducts();
    }

    const toolProducts = AppState.marketplaceProducts.filter(p => p.category === 'tools');

    return `
        <div class="container px-4 py-12">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 class="text-4xl font-black text-gray-900 tracking-tight">Agricultural Tools</h2>
                    <p class="text-gray-500 mt-2 text-lg">Professional equipment for efficient farming</p>
                </div>
                <div class="p-1 bg-gray-100 rounded-2xl flex">
                    <button class="px-6 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-primary-green">All Tools</button>
                    <button class="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Premium</button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                ${!AppState.isMarketplaceLoaded ? `
                    <div class="col-span-full py-20 text-center">
                        <div class="animate-spin w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p class="text-gray-500 font-medium">Loading inventory...</p>
                    </div>
                ` : toolProducts.length === 0 ? `
                    <div class="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <i data-lucide="wrench" class="w-20 h-20 mx-auto mb-4 text-gray-300"></i>
                        <h3 class="text-xl font-bold text-gray-900">No tools available</h3>
                        <p class="text-gray-500">We currently don't have any tools listed in our inventory.</p>
                    </div>
                ` : toolProducts.map(product => renderProductCard(product)).join('')}
            </div>
        </div>
    `;
}

function openToolDetails(tool) {
    const t = getTranslations();
    const modal = document.getElementById('productDetailsModal');

    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content product-quick-view">
            <button onclick="closeToolDetails()" class="modal-close-absolute">
                <i data-lucide="x" class="w-6 h-6"></i>
            </button>

            <div class="quick-view-grid">
                <div class="quick-view-image">
                    <img src="${tool.image}" alt="${tool.name}" />
                    <div class="quick-view-badge">${tool.discount}% OFF</div>
                </div>

                <div class="quick-view-details">
                    <div class="quick-view-category">Farm Equipment</div>
                    <h2 class="quick-view-title">${tool.name}</h2>

                    <div class="quick-view-meta">
                        <div class="flex items-center gap-2">
                            <i data-lucide="tag" class="w-4 h-4 text-gray-500"></i>
                            <span class="text-sm text-gray-600">${tool.brand || 'Premium Brand'}</span>
                        </div>
                    </div>

                    <div class="quick-view-price">
                        <span class="text-3xl font-bold text-green-600">₹${tool.price.toLocaleString()}</span>
                        <span class="text-lg line-through text-gray-400">₹${Math.round(tool.price / (1 - tool.discount / 100)).toLocaleString()}</span>
                    </div>

                    <div class="mb-4">
                        <p class="text-gray-600">${tool.description || 'High-quality farming equipment for professional use.'}</p>
                    </div>

                    <div class="quick-view-info">
                        <div class="info-item">
                            <i data-lucide="shield-check" class="w-5 h-5 text-green-600"></i>
                            <div>
                                <div class="info-label">Warranty</div>
                                <div class="info-value">1 Year</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <i data-lucide="truck" class="w-5 h-5 text-green-600"></i>
                            <div>
                                <div class="info-label">Delivery</div>
                                <div class="info-value">7-10 Days</div>
                            </div>
                        </div>
                    </div>

                    <div class="quick-view-actions">
                        <button onclick='buyToolNow(${JSON.stringify(tool)}); closeToolDetails();' class="btn btn-primary flex-1 py-3">
                            <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                            Buy Now
                        </button>
                        <button onclick='addToCart(${JSON.stringify(tool)}); closeToolDetails();' class="btn btn-outline py-3">
                            <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeToolDetails();
    };

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeToolDetails() {
    const modal = document.getElementById('productDetailsModal');
    modal.className = 'modal';
}

function buyToolNow(tool) {
    if (!AppState.isLoggedIn) {
        openModal('login');
        showToast('Please login to continue', 'info');
        return;
    }
    addToCart(tool);
    openModal('cart');
    showToast('Item added to cart! Proceed to checkout', 'success');
}

async function renderWeatherCropSuggestion() {
    const t = getTranslations();
    const farmerId = localStorage.getItem('user_id');
    const userType = localStorage.getItem('role');

    if (!farmerId || userType !== 'farmer') {
        return `
            <div class="container px-4 py-6">
                ${renderBackButton()}
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p class="text-yellow-800">Please log in as a farmer to view weather-based crop suggestions.</p>
                </div>
            </div>
        `;
    }

    let weatherInfo = null;
    let soilInfo = null;
    let suggestedCrops = [];
    let isLoading = true;
    let errorMessage = null;

    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:4000/api';
        const response = await fetch(`${apiUrl}/weather/detailed/${farmerId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch weather data');
        if (data.no_address) throw new Error(data.message);

        weatherInfo = data.weather;
        soilInfo = data.soil;
        suggestedCrops = data.suggested_crops || [];
        isLoading = false;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorMessage = error.message;
        isLoading = false;
    }

    if (isLoading) {
        return `
            <div class="container px-4 py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <p class="text-gray-600 font-medium">Analyzing soil and forecast data...</p>
            </div>
        `;
    }

    if (errorMessage) {
        return `
            <div class="container px-4 py-8">
                ${renderBackButton()}
                <div class="bg-blue-50 border border-blue-200 rounded-2xl p-10 text-center shadow-sm">
                    <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📍</div>
                    <h3 class="text-2xl font-bold text-blue-900 mb-2">Location Data Required</h3>
                    <p class="text-blue-800 mb-6 max-w-md mx-auto">${errorMessage}</p>
                    <button onclick="setActiveTab('addresses')" class="btn btn-primary px-8">Go to My Addresses</button>
                </div>
            </div>
        `;
    }

    const getSuitabilityLabel = (score) => {
        if (score >= 76) return { text: 'High Possibility', class: 'bg-green-600 text-white', icon: 'check-circle' };
        if (score >= 61) return { text: 'Medium Possibility', class: 'bg-yellow-500 text-white', icon: 'alert-circle' };
        return { text: 'Low Possibility', class: 'bg-orange-500 text-white', icon: 'help-circle' };
    };

    return `
        <div class="weather-suggestion-page bg-gray-50 min-h-screen pb-20">
            <div class="hero-section bg-gradient-to-br from-green-700 via-green-800 to-emerald-900 text-white py-12 px-4 rounded-b-[4rem] shadow-2xl mb-12 relative overflow-hidden">
                <!-- Decorative elements for visibility -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div class="container relative z-10">
                    ${renderBackButton('text-white/90 hover:text-white bg-white/10 px-4 py-2 rounded-full transition-all')}
                    <div class="flex flex-col md:flex-row justify-between items-center mt-8 gap-10">
                        <div class="text-center md:text-left">
                            <h1 class="text-5xl font-black mb-3 tracking-tighter">Smart Farm Insights</h1>
                            <p class="text-green-100 text-xl font-medium opacity-90">Precision agriculture based on your farm's unique profile</p>
                        </div>
                        <div class="flex gap-6">
                            <div class="glass-card p-6 rounded-3xl text-center min-w-[130px] border border-white/20 shadow-lg">
                                <div class="text-xs uppercase font-black tracking-widest text-green-200 mb-2">Avg Temp</div>
                                <div class="text-3xl font-black">${weatherInfo.avg_temp != null ? weatherInfo.avg_temp.toFixed(1) : '--'}°C</div>
                            </div>
                            <div class="glass-card p-6 rounded-3xl text-center min-w-[130px] border border-white/20 shadow-lg">
                                <div class="text-xs uppercase font-black tracking-widest text-green-200 mb-2">Soil pH</div>
                                <div class="text-3xl font-black">${soilInfo.ph != null ? soilInfo.ph.toFixed(1) : 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container px-4">
                <!-- Layer 1: Environmental Metrics - High Contrast Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div class="metric-layer-card group p-8 rounded-[2.5rem] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-blue-200 hover:shadow-blue-100 transition-all duration-500">
                        <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                            <i data-lucide="cloud-rain" class="w-7 h-7"></i>
                        </div>
                        <div class="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Avg Rainfall</div>
                        <div class="text-3xl font-black text-gray-900">${weatherInfo.avg_rainfall != null ? weatherInfo.avg_rainfall.toFixed(2) : '--'} <span class="text-lg font-bold text-gray-400">mm</span></div>
                        <div class="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> 16-day period</div>
                    </div>

                    <div class="metric-layer-card group p-8 rounded-[2.5rem] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-orange-200 hover:shadow-orange-100 transition-all duration-500">
                        <div class="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform">
                            <i data-lucide="sun" class="w-7 h-7"></i>
                        </div>
                        <div class="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Solar Intensity</div>
                        <div class="text-3xl font-black text-gray-900">${weatherInfo.avg_solar_radiation != null ? weatherInfo.avg_solar_radiation.toFixed(0) : '--'} <span class="text-lg font-bold text-gray-400">W/m²</span></div>
                        <div class="text-xs text-orange-600 font-bold mt-2 flex items-center gap-1"><i data-lucide="zap" class="w-3 h-3"></i> Light energy</div>
                    </div>

                    <div class="metric-layer-card group p-8 rounded-[2.5rem] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-emerald-200 hover:shadow-emerald-100 transition-all duration-500">
                        <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                            <i data-lucide="droplets" class="w-7 h-7"></i>
                        </div>
                        <div class="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Soil Moisture</div>
                        <div class="text-3xl font-black text-gray-900">${weatherInfo.avg_soil_moisture != null ? weatherInfo.avg_soil_moisture.toFixed(3) : '--'}</div>
                        <div class="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><i data-lucide="database" class="w-3 h-3"></i> Volumetric content</div>
                    </div>

                    <div class="metric-layer-card group p-8 rounded-[2.5rem] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-purple-200 hover:shadow-purple-100 transition-all duration-500">
                        <div class="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                            <i data-lucide="wind" class="w-7 h-7"></i>
                        </div>
                        <div class="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Wind Speed</div>
                        <div class="text-3xl font-black text-gray-900">${weatherInfo.avg_wind_speed != null ? weatherInfo.avg_wind_speed.toFixed(1) : '--'} <span class="text-lg font-bold text-gray-400">km/h</span></div>
                        <div class="text-xs text-purple-600 font-bold mt-2 flex items-center gap-1"><i data-lucide="navigation" class="w-3 h-3"></i> At 10m height</div>
                    </div>
                </div>

                <!-- Layer 2: Crop Recommendations -->
                <div class="mb-16">
                    <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-12 h-1.5 rounded-full bg-green-600"></div>
                                <span class="text-sm font-black text-green-700 uppercase tracking-[0.2em]">Recommendations</span>
                            </div>
                            <h2 class="text-4xl font-black text-gray-900 tracking-tight">Best Crops For Your Farm</h2>
                        </div>
                        <div class="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <span class="text-xs font-bold text-gray-400 uppercase">Match Quality:</span>
                            <div class="flex gap-2">
                                <span class="w-3 h-3 rounded-full bg-green-600"></span>
                                <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span class="w-3 h-3 rounded-full bg-orange-500"></span>
                            </div>
                        </div>
                    </div>

                    ${suggestedCrops.length === 0 ? `
                        <div class="bg-white border-2 border-dashed border-gray-200 rounded-[3rem] p-20 text-center shadow-sm">
                            <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl">🌾</div>
                            <h3 class="text-2xl font-black text-gray-800 mb-2">No matches found above 35%</h3>
                            <p class="text-gray-500 max-w-sm mx-auto">Your farm's current environmental profile doesn't align with our indexed crop database.</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            ${suggestedCrops.map((crop, i) => {
        const label = getSuitabilityLabel(crop.final_score);
        return `
                                    <div class="recommendation-card group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full">
                                        <div class="p-10 flex-grow">
                                            <div class="flex justify-between items-start mb-8">
                                                <div class="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                                                    ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🌱'}
                                                </div>
                                                <div class="text-right">
                                                    <div class="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-sm ${label.class}">
                                                        <i data-lucide="${label.icon}" class="w-3 h-3"></i>
                                                        ${label.text}
                                                    </div>
                                                    <div class="text-2xl font-black text-gray-900 mt-2">${crop.final_score != null ? crop.final_score.toFixed(1) : '0.0'}%</div>
                                                </div>
                                            </div>

                                            <h3 class="text-3xl font-black text-gray-900 mb-2 group-hover:text-green-700 transition-colors">${crop.crop_name}</h3>
                                            <div class="inline-block px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">${crop.season || 'All Season'}</div>

                                            <p class="text-gray-600 font-medium text-sm leading-relaxed mb-8 line-clamp-3">${crop.crop_details || 'This crop is analyzed to be a viable option for your farm based on 16-day climate trends and physical soil properties.'}</p>

                                            <div class="space-y-5 mb-2">
                                                <div class="space-y-2">
                                                    <div class="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                        <span>Weather Match</span>
                                                        <span class="text-gray-900">${crop.weather_suitability != null ? crop.weather_suitability.toFixed(0) : '0'}%</span>
                                                    </div>
                                                    <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5">
                                                        <div class="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style="width: ${crop.weather_suitability || 0}%"></div>
                                                    </div>
                                                </div>
                                                <div class="space-y-2">
                                                    <div class="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                        <span>Soil Match</span>
                                                        <span class="text-gray-900">${crop.soil_suitability != null ? crop.soil_suitability.toFixed(0) : '0'}%</span>
                                                    </div>
                                                    <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5">
                                                        <div class="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style="width: ${crop.soil_suitability || 0}%"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="px-10 pb-10">
                                            <div class="bg-gray-900 rounded-[2rem] p-6 text-white group-hover:bg-green-800 transition-all duration-500 shadow-xl">
                                                <div class="flex justify-between items-center">
                                                    <div>
                                                        <div class="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Est. Revenue</div>
                                                        <div class="text-2xl font-black">₹${(crop.expected_revenue || 0).toLocaleString()}<span class="text-xs font-bold text-white/40 ml-1">/acre</span></div>
                                                    </div>
                                                    <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/90">
                                                        <i data-lucide="trending-up" class="w-6 h-6"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <button class="w-full mt-4 py-4 border-2 border-gray-900 rounded-2xl text-gray-900 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-900 hover:text-white transition-all duration-300">
                                                Full Analysis
                                            </button>
                                        </div>
                                    </div>
                                `;
    }).join('')}
                        </div>
                    `}
                </div>

                <!-- Layer 3: 16-Day Weather Outlook - Professional Scrollable -->
                <div class="mb-10">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-12 h-1.5 rounded-full bg-blue-600"></div>
                                <span class="text-sm font-black text-blue-700 uppercase tracking-[0.2em]">Forecasting</span>
                            </div>
                            <h2 class="text-4xl font-black text-gray-900 tracking-tight">16-Day Weather Outlook</h2>
                        </div>
                        <div class="hidden md:flex items-center gap-3 text-gray-400 font-bold text-xs uppercase tracking-widest">
                            Scroll to explore <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </div>
                    </div>

                    <div class="flex gap-6 overflow-x-auto pb-10 no-scrollbar px-2 -mx-2">
                        ${weatherInfo.daily_raw.time.map((date, i) => {
        const d = new Date(date);
        const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const dayNum = d.getDate();
        const isToday = i === 0;
        const isRainy = weatherInfo.daily_raw.precipitation_sum[i] > 2;

        return `
                                <div class="flex-shrink-0 w-36 p-8 rounded-[3rem] ${isToday ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 -translate-y-2' : 'bg-white border border-gray-100 text-gray-900 shadow-sm'} text-center transition-all duration-500 hover:-translate-y-4 hover:shadow-xl">
                                    <div class="text-[10px] font-black uppercase tracking-widest mb-2 ${isToday ? 'text-blue-100' : 'text-gray-400'}">${dayName}</div>
                                    <div class="text-3xl font-black mb-6">${dayNum}</div>

                                    <div class="text-4xl mb-6 transform hover:scale-125 transition-transform">
                                        ${isRainy ? '🌧️' : weatherInfo.daily_raw.temperature_2m_max[i] > 32 ? '☀️' : '⛅'}
                                    </div>

                                    <div class="space-y-1">
                                        <div class="text-xl font-black">${weatherInfo.daily_raw.temperature_2m_max[i] != null ? weatherInfo.daily_raw.temperature_2m_max[i].toFixed(0) : '--'}°</div>
                                        <div class="text-xs font-black ${isToday ? 'text-blue-200' : 'text-gray-300'}">${weatherInfo.daily_raw.temperature_2m_min[i] != null ? weatherInfo.daily_raw.temperature_2m_min[i].toFixed(0) : '--'}°</div>
                                    </div>

                                    ${weatherInfo.daily_raw.precipitation_sum[i] > 0 ? `
                                        <div class="mt-6 inline-flex items-center gap-1 px-3 py-1 rounded-full ${isToday ? 'bg-blue-500' : 'bg-blue-50'} text-[10px] font-black ${isToday ? 'text-white' : 'text-blue-600'}">
                                            ${weatherInfo.daily_raw.precipitation_sum[i] != null ? weatherInfo.daily_raw.precipitation_sum[i].toFixed(1) : '0.0'}mm
                                        </div>
                                    ` : `
                                        <div class="mt-6 text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-400' : 'text-gray-200'}">Dry</div>
                                    `}
                                </div>
                            `;
    }).join('')}
                    </div>
                </div>
            </div>
        </div>

        <style>
            .weather-suggestion-page {
                font-family: 'Inter', sans-serif;
            }
            .glass-card {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(40px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .metric-layer-card { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            .recommendation-card { animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

            .metric-layer-card:nth-child(1) { animation-delay: 0.1s; }
            .metric-layer-card:nth-child(2) { animation-delay: 0.2s; }
            .metric-layer-card:nth-child(3) { animation-delay: 0.3s; }
            .metric-layer-card:nth-child(4) { animation-delay: 0.4s; }
        </style>
    `;
}

function renderWeatherLoading() {
    return `
        <div class="container px-4 py-12 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p class="text-gray-600 font-medium">Analyzing soil and forecast data...</p>
        </div>
    `;
}

function refreshOrdersList() {
    const main = document.getElementById('mainContent');
    if (!main || AppState.activeTab !== 'orders') return;

    if (AppState.showOrderDetails) {
        main.innerHTML = renderOrderDetails();
    } else if (AppState.showOrderTracking) {
        main.innerHTML = renderOrderTracking();
    } else {
        main.innerHTML = renderOrders();
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

async function loadWeatherData() {
    setActiveTab('weather');
}

function renderWishlist() {
    const t = getTranslations();
    const isDark = AppState.theme === 'dark';

    return `
        <div class="container px-4 py-6">
            ${renderBackButton()}
            <h2 class="text-2xl font-bold mb-6">${t.wishlist}</h2>
            ${AppState.wishlist.length === 0 ? `
                <div class="text-center py-12">
                    <i data-lucide="heart" class="w-16 h-16 mx-auto mb-4 text-gray-400"></i>
                    <p class="text-gray-500">Your wishlist is empty</p>
                </div>
            ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${AppState.wishlist.map(product => `
                        <div class="product-card ${isDark ? 'dark-theme' : ''}">
                            <div class="product-image">
                                <img src="${product.image}" alt="${product.name}" />
                            </div>
                            <div class="p-4">
                                <h3 class="font-bold text-lg mb-2">${product.name}</h3>
                                <p class="price mb-3">₹${product.price}</p>
                                <div class="flex gap-2">
                                    <button onclick='addToCart(${JSON.stringify(product)})' class="btn btn-primary flex-1">
                                        ${t.addToCart}
                                    </button>
                                    <button onclick='toggleWishlist(${JSON.stringify(product)})' class="btn btn-danger p-2">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function canManageAddresses() {
    const role = localStorage.getItem('role') || AppState.userType || '';
    return AppState.isLoggedIn && (role === 'farmer' || role === 'customer');
}

function renderAddressListHtml() {
    const isDark = AppState.theme === 'dark';

    if (!AppState.savedAddresses || AppState.savedAddresses.length === 0) {
        return `
            <div class="saved-addresses-empty">
                <i data-lucide="map-pin" class="w-14 h-14 mx-auto mb-4 text-gray-400"></i>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">No Saved Addresses</h3>
                <p class="text-gray-500 mb-4">Add your first delivery address to get started</p>
                <button onclick="openAddAddressModal()" class="btn btn-primary">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Add New Address
                </button>
            </div>
        `;
    }

    return `
        <div class="saved-addresses-list">
            ${AppState.savedAddresses.map((address, index) => {
        const isSelected = address.status === 'selected' || address.isDefault === true;
        return `
                <div class="address-card ${isDark ? 'dark-theme' : ''} ${isSelected ? 'address-card--selected' : 'address-card--plain'}">
                    ${isSelected ? `
                        <div class="address-badge">
                            <i data-lucide="check-circle" class="w-4 h-4"></i>
                            Selected
                        </div>
                    ` : ''}

                    <div class="address-body">
                        <div class="address-body-top">
                            <div>
                                <h3 class="font-bold text-lg mb-1">${address.name}</h3>
                                <p class="text-sm text-gray-600">${address.phone}</p>
                            </div>
                            ${isSelected ? `<span class="address-selected-pill">Active delivery address</span>` : ''}
                        </div>
                        <p class="text-sm text-gray-700 mt-3">${address.street ? `${address.street}, ` : ''}${address.city}</p>
                        <p class="text-sm text-gray-600">${address.district}, ${address.country} - ${address.pincode}</p>
                    </div>

                    <div class="address-actions">
                        ${!isSelected ? `
                            <button onclick="setDefaultAddress(${index})" class="btn btn-outline btn-sm" title="Set as selected">
                                <i data-lucide="star" class="w-4 h-4"></i>
                                Select
                            </button>
                        ` : ''}
                        <button onclick="editAddress(${index})" class="btn btn-outline btn-sm" title="Edit address">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                            Edit
                        </button>
                        <button onclick="deleteAddress(${index})" class="btn btn-danger btn-sm" title="Delete address">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

function renderSavedAddresses() {
    if (!canManageAddresses()) {
        return `
            <div class="container px-4 py-6">
                ${renderBackButton()}
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p class="text-yellow-800">Saved addresses are available for farmer and customer accounts.</p>
                </div>
            </div>
        `;
    }

    const roleLabel = (localStorage.getItem('role') || AppState.userType) === 'farmer' ? 'farm' : 'delivery';

    return `
        <div class="container px-4 py-6 saved-addresses-page">
            ${renderBackButton()}
            <div class="saved-addresses-header">
                <div>
                    <h2 class="text-2xl font-bold">Saved Addresses</h2>
                    <p class="text-sm text-gray-500 mt-1">
                        All ${roleLabel} addresses from your account (${AppState.savedAddresses.length})
                    </p>
                </div>
                <button onclick="openAddAddressModal()" class="btn btn-primary">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Add New Address
                </button>
            </div>

            ${renderAddressListHtml()}
        </div>
    `;
}

function getAddressRequestContext() {
    const role = localStorage.getItem('role') || (typeof AppState !== 'undefined' ? AppState.userType : '') || 'customer';
    const userName = (typeof AppState !== 'undefined' ? AppState.userProfile?.fullName : '') || localStorage.getItem('user_name') || localStorage.getItem('fullName') || '';
    const phoneNo = (typeof AppState !== 'undefined' ? AppState.userProfile?.phone : '') || localStorage.getItem('phone_no') || localStorage.getItem('user_phone') || localStorage.getItem('phone') || '';
    const userId = localStorage.getItem('user_id') || localStorage.getItem('userId') || (typeof AppState !== 'undefined' ? AppState.userProfile?.id : '') || '';
    return { role, userName, phoneNo, userId };
}

function buildAddressAuthPayload() {
    const { role, userName, phoneNo, userId } = getAddressRequestContext();
    const payload = { role };
    if (userId) payload.user_id = userId;
    if (userName) payload.user_name = userName;
    if (phoneNo) payload.phone_no = phoneNo;

    console.log('Built Address Auth Payload:', payload);
    return payload;
}

async function loadAddressesFromBackend() {
    const { role, userName, phoneNo, userId } = getAddressRequestContext();
    if (role !== 'farmer' && role !== 'customer') {
        return [];
    }
    if (!userId && (!userName || !phoneNo)) {
        return [];
    }

    const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
    try {
        const params = new URLSearchParams({ role });
        if (userId) params.set('user_id', userId);
        if (userName) params.set('user_name', userName);
        if (phoneNo) params.set('phone_no', phoneNo);

        const response = await fetch(`${apiBase}/address?${params.toString()}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data.addresses)) {
            setState({ savedAddresses: data.addresses });
            return data.addresses;
        }
        console.warn('Address load failed:', data.error || response.status);
    } catch (err) {
        console.error('Failed to load addresses:', err);
    }
    return [];
}

function openAddAddressModal() {
    setState({ showAddAddressModal: true, editingAddressIndex: null });
}

async function setDefaultAddress(index) {
    const address = AppState.savedAddresses[index];
    if (!address?.add_id) {
        showToast('Unable to select this address', 'error');
        return;
    }

    const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
    const payload = buildAddressAuthPayload();
    console.log('Setting default address. ID:', address.add_id, 'Payload:', payload);

    if (!payload.role) {
        console.error('Cannot set default address: role is missing from payload');
        showToast('Session error: role missing. Please try logging in again.', 'error');
        return;
    }

    const updatedAddresses = AppState.savedAddresses.map((addr, i) => ({
        ...addr,
        status: i === index ? 'selected' : 'unselected',
        isDefault: i === index
    }));
    setState({ savedAddresses: updatedAddresses });

    try {
        const response = await fetch(`${apiBase}/address/${address.add_id}/select`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {

            await loadAddressesFromBackend();
            throw new Error(data.error || 'Failed to update selected address');
        }

        await loadAddressesFromBackend();
        showToast('Selected address updated. All other addresses were unselected.', 'success');
    } catch (err) {
        console.error('Set default address failed:', err);
        showToast(err.message || 'Failed to update selected address', 'error');
    }
}

function editAddress(index) {
    setState({ showAddAddressModal: true, editingAddressIndex: index });
}

async function deleteAddress(index) {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const address = AppState.savedAddresses[index];
    if (!address?.add_id) {
        showToast('Unable to delete this address', 'error');
        return;
    }

    const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
    try {
        const response = await fetch(`${apiBase}/address/${address.add_id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildAddressAuthPayload())
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete address');
        }
        await loadAddressesFromBackend();
        showToast('Address deleted successfully', 'success');
    } catch (err) {
        console.error('Delete address failed:', err);
        showToast(err.message || 'Failed to delete address', 'error');
    }
}

function renderAboutCompany() {
    return `
        <div class="container px-4 py-6">
            ${renderBackButton()}
            <h2 class="text-2xl font-bold mb-6">About Farm2Market</h2>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="mb-4">Farm2Market is a revolutionary platform connecting farmers directly with customers, eliminating middlemen and ensuring fair prices for both parties.</p>
                <h3 class="text-xl font-bold mb-3">Our Mission</h3>
                <p class="mb-4">To empower farmers with direct market access and provide customers with fresh, quality produce at fair prices.</p>
                <h3 class="text-xl font-bold mb-3">Our Vision</h3>
                <p>To create a sustainable agricultural ecosystem that benefits everyone in the supply chain.</p>
            </div>
        </div>
    `;
}

function renderHelp() {
    return `
        <div class="container px-4 py-6">
            ${renderBackButton()}
            <h2 class="text-2xl font-bold mb-6">Help & Support</h2>

            <!-- FAQ Section -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-xl font-bold mb-4">Frequently Asked Questions</h3>
                <div class="space-y-4">
                    <div class="faq-item">
                        <h4 class="font-bold text-lg mb-2">How do I place an order?</h4>
                        <p class="text-gray-600">Browse products, add to cart, and proceed to checkout. You can pay via UPI, cards, or cash on delivery.</p>
                    </div>
                    <div class="faq-item">
                        <h4 class="font-bold text-lg mb-2">What payment methods are accepted?</h4>
                        <p class="text-gray-600">We accept UPI (Paytm, GPay, PhonePe), credit/debit cards, and cash on delivery.</p>
                    </div>
                    <div class="faq-item">
                        <h4 class="font-bold text-lg mb-2">How can I track my order?</h4>
                        <p class="text-gray-600">Go to 'My Orders' section and click on 'Track Order' button to see real-time delivery status.</p>
                    </div>
                    <div class="faq-item">
                        <h4 class="font-bold text-lg mb-2">What is your return policy?</h4>
                        <p class="text-gray-600">We offer a 100% satisfaction guarantee. If you're not happy with the quality, contact us within 24 hours of delivery.</p>
                    </div>
                </div>
            </div>

            <!-- Contact Form Section -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-xl font-bold mb-4">Contact Support</h3>
                <p class="text-gray-600 mb-6">Have a question? Send us a message and we'll get back to you within 24 hours.</p>

                <form onsubmit="handleContactSubmit(event)" class="space-y-4">
                    <!-- Name Field -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <div class="relative">
                            <input type="text" id="contactName" class="input pr-10" placeholder="Enter your name" required />
                            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <i data-lucide="user" class="w-5 h-5"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Email Field -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="contactEmail" class="input" placeholder="Enter your email" required />
                    </div>

                    <!-- Your Question Field -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Your Question</label>
                        <textarea id="contactQuestion" class="input" rows="5" placeholder="Describe your question or issue..." required></textarea>
                    </div>

                    <!-- Submit Button -->
                    <div>
                        <button type="submit" class="btn btn-primary px-8 py-3">
                            <i data-lucide="send" class="w-5 h-5 inline-block mr-2"></i>
                            Submit
                        </button>
                    </div>
                </form>

                <!-- Contact Information -->
                <div class="mt-8 pt-6 border-t border-gray-200">
                    <h4 class="font-bold mb-3">Other Ways to Reach Us</h4>
                    <div class="space-y-2 text-gray-600">
                        <p class="flex items-center gap-2">
                            <i data-lucide="mail" class="w-4 h-4 text-green-600"></i>
                            <span>Email: support@farm2market.example</span>
                        </p>
                        <p class="flex items-center gap-2">
                            <i data-lucide="phone" class="w-4 h-4 text-green-600"></i>
                            <span>Call: +91 98765 43210</span>
                        </p>
                        <p class="flex items-center gap-2">
                            <i data-lucide="clock" class="w-4 h-4 text-green-600"></i>
                            <span>Hours: Mon-Sat, 9 AM - 6 PM</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderOrderSummary() {
    const t = getTranslations();
    const total = getCartTotal();
    const deliveryFee = total > 500 ? 0 : 50;
    const tax = (total * 0.05).toFixed(2);
    const discount = total > 1000 ? 100 : 0;
    const grandTotal = (parseFloat(total) + parseFloat(deliveryFee) + parseFloat(tax) - discount).toFixed(2);
    const isDark = AppState.theme === 'dark';

    const defaultAddress = AppState.savedAddresses.find(addr => addr.isDefault) || AppState.savedAddresses[0];

    return `
        <div class="${isDark ? 'dark-theme' : ''}" style="min-height: 100vh; background: ${isDark ? '#0f172a' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)'}; padding-bottom: 3rem;">

            <div class="container mx-auto px-4 py-8" style="max-width: 1400px;">
                <div class="max-w-7xl mx-auto">
                    ${renderBackButton()}

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <!-- Left Column: Order Items & Delivery Address -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Order Items Card -->
                        <div class="order-summary-card ${isDark ? 'dark-theme' : ''}">
                            <div class="card-header-elegant">
                                <div class="flex items-center gap-3">
                                    <div class="icon-wrapper-elegant">
                                        <i data-lucide="shopping-bag" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <h3 class="card-title-elegant">Order Items</h3>
                                        <p class="card-subtitle-elegant">${AppState.cartItems.length} items in your order</p>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body-elegant">
                                ${AppState.cartItems.map((item, index) => {
        const itemName = item.name || 'Product';
        const itemImage = item.image || 'https://placehold.co/100?text=No+Image';
        const itemFarmer = item.farmer || 'Local Farmer';
        const itemCategory = item.category || 'General';
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = item.quantity || 1;

        return `
                                    <div class="order-item-elegant ${index !== AppState.cartItems.length - 1 ? 'border-b border-gray-100' : ''}">
                                        <div class="flex gap-4">
                                            <div class="order-item-image" style="width: 3.75rem; height: 3.75rem;">
                                                <img src="${itemImage}" alt="${itemName}"
                                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;image-placeholder&quot;>${itemName.charAt(0)}</div>';" />
                                            </div>
                                            <div class="flex-1">
                                                <h4 class="order-item-name">${itemName}</h4>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span class="order-item-category">
                                                        <i data-lucide="tag" class="w-3 h-3"></i>
                                                        ${t.categories[itemCategory] || itemCategory}
                                                    </span>
                                                    <span class="order-item-farmer">
                                                        <i data-lucide="user" class="w-3 h-3"></i>
                                                        ${itemFarmer}
                                                    </span>
                                                </div>
                                                <div class="flex items-center gap-3 mt-2">
                                                    <span class="order-item-quantity">Qty: ${itemQuantity} ${itemCategory === 'tools' ? 'Units' : 'Kg'}</span>
                                                    <span class="order-item-price">₹${itemPrice}/${itemCategory === 'tools' ? 'Unit' : t.unitKg}</span>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <div class="order-item-total">₹${(itemPrice * itemQuantity).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                `;
    }).join('')}
                            </div>
                        </div>

                        <!-- Delivery Address Card -->
                        <div class="order-summary-card ${isDark ? 'dark-theme' : ''}">
                            <div class="card-header-elegant">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="icon-wrapper-elegant">
                                            <i data-lucide="map-pin" class="w-6 h-6"></i>
                                        </div>
                                        <div>
                                            <h3 class="card-title-elegant">Delivery Address</h3>
                                            <p class="card-subtitle-elegant">Your order will be delivered here</p>
                                        </div>
                                    </div>
                                    <button onclick="setActiveTab('addresses')" class="btn btn-outline btn-sm">
                                        <i data-lucide="edit" class="w-4 h-4"></i>
                                        Change
                                    </button>
                                </div>
                            </div>
                            <div class="card-body-elegant">
                                ${defaultAddress ? `
                                    <div class="delivery-address-box ${isDark ? 'dark-theme' : ''}">
                                        <div class="flex items-start gap-3">
                                            <div class="address-type-icon">
                                                <i data-lucide="map-pin" class="w-5 h-5"></i>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex items-center gap-2 mb-2">
                                                    <h4 class="delivery-address-name">${defaultAddress.name}</h4>
                                                    ${defaultAddress.isDefault ? `
                                                        <span class="default-badge">
                                                            <i data-lucide="check-circle" class="w-3 h-3"></i>
                                                            Default
                                                        </span>
                                                    ` : ''}
                                                </div>
                                                <p class="delivery-address-phone">
                                                    <i data-lucide="phone" class="w-4 h-4"></i>
                                                    ${defaultAddress.phone}
                                                </p>
                                                <p class="delivery-address-text">${defaultAddress.street || ''}</p>
                                                <p class="delivery-address-text">${defaultAddress.city}, ${defaultAddress.district}, ${defaultAddress.country} - ${defaultAddress.pincode}</p>
                                            </div>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="text-center py-6">
                                        <i data-lucide="map-pin" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                                        <p class="text-gray-600 mb-3">No delivery address found</p>
                                        <button onclick="openAddAddressModal()" class="btn btn-primary">
                                            <i data-lucide="plus" class="w-4 h-4"></i>
                                            Add Delivery Address
                                        </button>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Order Summary -->
                    <div class="lg:col-span-1">
                        <div class="order-summary-card sticky-summary ${isDark ? 'dark-theme' : ''}">
                            <div class="card-header-elegant">
                                <div class="flex items-center gap-3">
                                    <div class="icon-wrapper-elegant">
                                        <i data-lucide="receipt" class="w-6 h-6"></i>
                                    </div>
                                    <h3 class="card-title-elegant">Price Details</h3>
                                </div>
                            </div>
                            <div class="card-body-elegant">
                                <div class="price-breakdown">
                                    <div class="price-row">
                                        <span>Subtotal (${AppState.cartItems.length} items)</span>
                                        <span>₹${total}</span>
                                    </div>
                                    <div class="price-row">
                                        <span>Delivery Charges</span>
                                        <span class="${deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}">
                                            ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                        </span>
                                    </div>
                                    ${deliveryFee === 0 ? `
                                        <div class="free-delivery-badge">
                                            <i data-lucide="truck" class="w-4 h-4"></i>
                                            You saved ₹50 on delivery!
                                        </div>
                                    ` : ''}
                                    <div class="price-row">
                                        <span>Tax (GST 5%)</span>
                                        <span>₹${tax}</span>
                                    </div>
                                    ${discount > 0 ? `
                                        <div class="price-row discount-row">
                                            <span>Discount</span>
                                            <span>- ₹${discount}</span>
                                        </div>
                                        <div class="discount-badge">
                                            <i data-lucide="gift" class="w-4 h-4"></i>
                                            You saved ₹${discount}!
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="total-row">
                                    <span>Total Amount</span>
                                    <span>₹${grandTotal}</span>
                                </div>
                                <div class="savings-info">
                                    <i data-lucide="sparkles" class="w-4 h-4"></i>
                                    You will save ₹${(deliveryFee === 0 ? 50 : 0) + discount} on this order
                                </div>
                            </div>
                            <div class="card-footer-elegant">
                                <button onclick="${defaultAddress ? "setActiveTab('payment')" : "showToast('Please add a delivery address first', 'error')"}"
                                    class="btn btn-primary w-full py-3 btn-proceed">
                                    <span>Proceed to Payment</span>
                                    <i data-lucide="arrow-right" class="w-5 h-5"></i>
                                </button>
                                <button onclick="showToast('Order tracking will be available after payment', 'info')"
                                    class="btn btn-outline w-full py-2 mt-2 flex items-center justify-center gap-2">
                                    <i data-lucide="truck" class="w-4 h-4"></i>
                                    <span>Track Order</span>
                                </button>
                                <p class="secure-checkout-text">
                                    <i data-lucide="shield-check" class="w-4 h-4"></i>
                                    Safe and Secure Payments
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    `;
}

function renderPayment() {
    const t = getTranslations();
    const total = getCartTotal();
    const deliveryFee = total > 500 ? 0 : 50;
    const tax = (total * 0.05).toFixed(2);
    const discount = total > 1000 ? 100 : 0;
    const grandTotal = (parseFloat(total) + parseFloat(deliveryFee) + parseFloat(tax) - discount).toFixed(2);
    const isDark = AppState.theme === 'dark';

    return `
        <div class="${isDark ? 'dark-theme' : ''}" style="min-height: 100vh; background: ${isDark ? '#0f172a' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)'}; padding-bottom: 3rem;">

            <div class="container mx-auto px-4 py-8" style="max-width: 1400px;">
                <div class="max-w-7xl mx-auto">
                    ${renderBackButton()}

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <!-- Left Column: Payment Methods -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Online Transaction -->
                        <div class="payment-card ${isDark ? 'dark-theme' : ''} ${AppState.selectedPaymentMethod === 'online' ? 'selected-payment-card' : ''}">
                            <div class="card-header-elegant">
                                <div class="flex items-center gap-3">
                                    <div class="icon-wrapper-elegant">
                                        <i data-lucide="globe" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <h3 class="card-title-elegant">Online Transaction</h3>
                                        <p class="card-subtitle-elegant">Pay securely via Razorpay (UPI, Cards, NetBanking)</p>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body-elegant">
                                <button class="payment-method-btn-large ${isDark ? 'dark-theme' : ''} ${AppState.selectedPaymentMethod === 'online' ? 'active' : ''}" onclick="selectPaymentMethod('online')">
                                    <div class="flex items-center gap-4">
                                        <div class="online-icon-wrapper">
                                            <i data-lucide="credit-card" class="w-8 h-8"></i>
                                        </div>
                                        <div class="text-left flex-1">
                                            <div class="font-bold text-lg">Online Transaction</div>
                                            <div class="text-sm text-gray-600">Secure payment via Razorpay Checkout</div>
                                        </div>
                                        <div class="payment-radio ${AppState.selectedPaymentMethod === 'online' ? 'checked' : ''}"></div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Cash on Delivery -->
                        <div class="payment-card ${isDark ? 'dark-theme' : ''} ${AppState.selectedPaymentMethod === 'cod' ? 'selected-payment-card' : ''}">
                            <div class="card-header-elegant">
                                <div class="flex items-center gap-3">
                                    <div class="icon-wrapper-elegant">
                                        <i data-lucide="banknote" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <h3 class="card-title-elegant">Cash on Delivery</h3>
                                        <p class="card-subtitle-elegant">Pay when you receive your order</p>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body-elegant">
                                <button class="payment-method-btn-large ${isDark ? 'dark-theme' : ''} ${AppState.selectedPaymentMethod === 'cod' ? 'active' : ''}" onclick="selectPaymentMethod('cod')">
                                    <div class="flex items-center gap-4">
                                        <div class="cod-icon-wrapper">
                                            <i data-lucide="hand-coins" class="w-8 h-8"></i>
                                        </div>
                                        <div class="text-left flex-1">
                                            <div class="font-bold text-lg">Cash on Delivery</div>
                                            <div class="text-sm text-gray-600">Pay ₹${grandTotal} at the time of delivery</div>
                                        </div>
                                        <div class="payment-radio ${AppState.selectedPaymentMethod === 'cod' ? 'checked' : ''}"></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Order Summary -->
                    <div class="lg:col-span-1">
                        <div class="payment-card sticky-summary ${isDark ? 'dark-theme' : ''}">
                            <div class="card-header-elegant">
                                <div class="flex items-center gap-3">
                                    <div class="icon-wrapper-elegant">
                                        <i data-lucide="receipt" class="w-6 h-6"></i>
                                    </div>
                                    <h3 class="card-title-elegant">Payment Summary</h3>
                                </div>
                            </div>
                            <div class="card-body-elegant">
                                <div class="price-breakdown">
                                    <div class="price-row">
                                        <span>Subtotal</span>
                                        <span>₹${total}</span>
                                    </div>
                                    <div class="price-row">
                                        <span>Delivery</span>
                                        <span class="${deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}">
                                            ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                        </span>
                                    </div>
                                    <div class="price-row">
                                        <span>Tax (GST 5%)</span>
                                        <span>₹${tax}</span>
                                    </div>
                                    ${discount > 0 ? `
                                        <div class="price-row discount-row">
                                            <span>Discount</span>
                                            <span>- ₹${discount}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="total-row">
                                    <span>Amount Payable</span>
                                    <span>₹${grandTotal}</span>
                                </div>
                            </div>
                            <div class="card-footer-elegant">
                                <button onclick="processPayment()" class="btn btn-primary w-full py-3 btn-proceed">
                                    <i data-lucide="${AppState.selectedPaymentMethod === 'online' ? 'credit-card' : 'shopping-bag'}" class="w-5 h-5"></i>
                                    <span>${AppState.selectedPaymentMethod === 'online' ? 'Pay & Confirm Order' : 'Confirm Order'}</span>
                                </button>
                                <div class="payment-security-badges">
                                    <div class="security-badge">
                                        <i data-lucide="shield-check" class="w-4 h-4"></i>
                                        <span>100% Secure</span>
                                    </div>
                                    <div class="security-badge">
                                        <i data-lucide="lock" class="w-4 h-4"></i>
                                        <span>Encrypted</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
        <style>
            .selected-payment-card {
                border: 2px solid #16a34a !important;
                box-shadow: 0 0 15px rgba(22, 163, 74, 0.2) !important;
            }
            .payment-radio {
                width: 20px;
                height: 20px;
                border: 2px solid #cbd5e1;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            .payment-radio.checked {
                border-color: #16a34a;
                background-color: #16a34a;
            }
            .payment-radio.checked::after {
                content: '';
                width: 8px;
                height: 8px;
                background-color: white;
                border-radius: 50%;
            }
            .payment-method-btn-large.active {
                background-color: #f0fdf4;
            }
            .dark-theme .payment-method-btn-large.active {
                background-color: #064e3b;
            }
        </style>
    `;
}

function selectPaymentMethod(method) {
    AppState.selectedPaymentMethod = method;

    const btns = document.querySelectorAll('.payment-method-btn, .payment-method-btn-large, .bank-btn');
    btns.forEach(btn => btn.classList.remove('selected-payment'));

    showToast(`Selected ${method.toUpperCase()} as payment method`, 'info');

    renderPayment();
}

async function processPayment() {
    if (!AppState.selectedPaymentMethod) {
        showToast('Please select a payment method', 'error');
        return;
    }

    const total = getCartTotal();
    const deliveryFee = total > 500 ? 0 : 50;
    const tax = (total * 0.05).toFixed(2);
    const discount = total > 1000 ? 100 : 0;
    const grandTotal = (parseFloat(total) + parseFloat(deliveryFee) + parseFloat(tax) - discount).toFixed(2);
    const defaultAddress = AppState.savedAddresses.find(addr => addr.isDefault) || AppState.savedAddresses[0];
    const customerId = localStorage.getItem('user_id');

    if (!defaultAddress) {
        showToast('Please add a delivery address', 'error');
        return;
    }

    try {

        const orderData = {
            customer_id: customerId,
            items: AppState.cartItems.map(item => ({
                badge_id: item.badge_id || item.id,
                product_type: item.name,
                quantity: item.quantity || 1,
                price: item.price
            })),
            delivery_address: defaultAddress,
            payment_method: AppState.selectedPaymentMethod,
            urgency_level: 'normal'
        };

        const response = await fetch(`${window.API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to place order');

        const orderId = result.order_id;

        if (AppState.selectedPaymentMethod === 'online') {

            await initiateRazorpayPaymentImmediately(orderId, grandTotal);
        } else {
            showToast('Order placed successfully! Waiting for delivery agent.', 'success');

            setState({
                cartItems: [],
                activeTab: 'orders',
                navigationHistory: ['marketplace']
            });
        }

    } catch (error) {
        console.error('Order placement error:', error);
        showToast(error.message, 'error');
    }
}

async function initiateRazorpayPayment(orderId, amount) {
    return initiateRazorpayPaymentImmediately(orderId, amount);
}

async function initiateRazorpayPaymentImmediately(orderId, amount) {
    try {
        await window.loadRazorpayCheckout();

        const response = await fetch(`${window.API_BASE_URL}/payment/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, amount: amount })
        });

        const rzpOrder = await response.json();
        if (!response.ok) throw new Error(rzpOrder.error || 'Failed to create Razorpay order');

        const options = {
            key: window.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: "Farm2Market",
            description: `Payment for Order #${orderId}`,
            order_id: rzpOrder.id,
            handler: async function (response) {
                console.log("[RAZORPAY] Success! Received data from Razorpay:", {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                });

                const verifyRes = await fetch(`${window.API_BASE_URL}/payment/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        order_id: orderId
                    })
                });

                const verifyResult = await verifyRes.json();
                if (verifyRes.ok) {
                    showToast('Payment details recorded. Waiting for Admin verification.', 'success');

                    setState({
                        cartItems: [],
                        activeTab: 'orders',
                        navigationHistory: ['marketplace']
                    });
                } else {
                    showToast('Payment verification failed: ' + verifyResult.error, 'error');
                }
            },
            prefill: {
                name: AppState.userProfile?.fullName || "",
                email: AppState.userProfile?.email || "",
                contact: localStorage.getItem('user_phone') || ""
            },
            theme: { color: "#16a34a" },
            modal: {
                ondismiss: function () {
                    showToast('Payment cancelled. You can try again from your orders.', 'warning');
                    setState({
                        cartItems: [],
                        activeTab: 'orders',
                        navigationHistory: ['marketplace']
                    });
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        showToast('Failed to initiate payment: ' + error.message, 'error');
    }
}

async function completeCODPayment(orderId) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/payment/cod-complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId })
        });

        if (response.ok) {
            showToast('Order completed via Cash!', 'success');
            loadOrders();
        } else {
            showToast('Failed to update COD payment', 'error');
        }
    } catch (error) {
        console.error('COD payment error:', error);
    }
}

function renderOrderDetails() {
    if (!AppState.selectedOrder) {
        return '<div class="container px-4 py-6"><p>No order selected</p></div>';
    }

    const order = AppState.selectedOrder;
    const t = getTranslations();
    const isDark = AppState.theme === 'dark';

    return `
        <div class="container px-4 py-6 order-detail-page">
            ${renderBackButton()}
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden ${isDark ? 'dark-theme' : ''}" style="max-width: 720px; margin: 0 auto;">
                <div class="flex justify-between items-center p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-green-50 to-blue-50'}">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Order #${order.id}</h2>
                        <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1">Placed on ${order.date}</p>
                    </div>
                    <button onclick="setState({ showOrderDetails: false })" class="p-2 rounded-full hover:bg-white/20 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all duration-300">
                        <i data-lucide="x" class="w-6 h-6 text-gray-700 dark:text-gray-300"></i>
                    </button>
                </div>

                <!-- Modal Body with Better Spacing and Visual Hierarchy -->
                <div class="p-6 max-h-[60vh] overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-white'}">
                    <!-- Order Status Section with Enhanced Visual Design -->
                    <div class="mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Order Status</h3>
                            <span class="status-badge ${order.status === 'Delivered' ? 'delivered' : 'in-transit'} px-3 py-1 text-sm font-bold rounded-full">
                                ${order.status}
                            </span>
                        </div>

                        <!-- Progress Bar with Enhanced Visual Design -->
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}">Order Placed</span>
                            <span class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}">${order.status === 'Delivered' ? 'Delivered' : 'In Transit'}</span>
                        </div>
                        <div class="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden ${isDark ? 'from-gray-700 to-gray-800' : ''}">
                            <div class="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out" style="width: ${order.status === 'Delivered' || order.status === 'confirmed' ? '100%' : (order.status === 'payment_pending_verification' || order.status === 'pending') ? '20%' : '60%'}"></div>
                        </div>
                        <div class="mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}">
                            ${(order.status === 'payment_pending_verification' || order.status === 'pending') ? 'Payment received. Admin is verifying the transaction details.' :
            order.status === 'confirmed' ? 'Order confirmed! We are preparing your shipment.' :
                order.status === 'Delivered' ? 'Your order has been successfully delivered and payment completed' :
                    order.status === 'arrived_waiting_payment' ? 'Agent has arrived! Please complete your payment to receive the order.' :
                        'Your order is on its way and will be delivered soon'}
                        </div>

                        ${order.status === 'arrived_waiting_payment' ? `
                            <div class="mt-6 p-6 rounded-2xl bg-green-50 border border-green-200 text-center">
                                <h4 class="text-green-800 font-bold mb-3">Agent has arrived!</h4>
                                <div class="flex gap-3">
                                    <button onclick="initiateRazorpayPayment(${order.order_id || order.id}, ${order.order_total || order.total})" class="btn btn-primary flex-1 py-3">
                                        <i data-lucide="credit-card" class="w-4 h-4"></i>
                                        Online Payment
                                    </button>
                                    <button onclick="completeCODPayment(${order.order_id || order.id})" class="btn btn-outline flex-1 py-3 bg-white">
                                        <i data-lucide="banknote" class="w-4 h-4"></i>
                                        Cash on Delivery
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Order Items Section with Enhanced Visual Design - Much smaller images -->
                    <div class="mb-8">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 rounded-xl bg-white dark:bg-gray-800 shadow">
                                <i data-lucide="shopping-bag" class="w-5 h-5 text-green-600 dark:text-green-400"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Order Items (${order.items.length})</h3>
                        </div>
                        <div class="space-y-4">
                            ${order.items.map(item => `
                                <div class="flex gap-4 p-5 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} transition-all duration-300 hover:shadow-lg shadow-sm">
                                    <!-- Enhanced Product Image Display - Much smaller images -->
                                    <div class="relative w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-lg product-image-enhanced">
                                        <img src="${item.image}" alt="${item.name}"
                                            class="w-full h-full object-cover"
                                            onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-xs font-bold text-green-600 bg-gray-100&quot;>${item.name.charAt(0)}</div>';" />
                                        <!-- Freshness indicator badge -->
                                        <div class="absolute -top-1 -right-1 bg-gradient-to-br from-green-500 to-green-600 text-white text-[6px] font-bold px-1 py-1 rounded-full shadow-lg">
                                            ${item.freshness}%
                                        </div>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-bold text-gray-900 dark:text-white text-sm mb-1">${item.name}</h4>
                                        <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 flex items-center gap-1">
                                            <i data-lucide="user" class="w-3 h-3 text-green-500"></i>
                                            Farmer: ${item.farmer}
                                        </p>
                                        <div class="flex justify-between items-center mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}">
                                            <div>
                                                <p class="text-xs font-medium text-gray-700 dark:text-gray-300">Qty: <span class="font-bold">${item.quantity || 1}</span> × ₹${item.price}</p>
                                                <p class="text-[8px] ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1 flex items-center gap-1">
                                                    <i data-lucide="tag" class="w-3 h-3 text-green-500"></i>
                                                    ${item.category}
                                                </p>
                                            </div>
                                            <p class="font-bold text-green-600 text-base">₹${item.price * (item.quantity || 1)}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Payment Summary Section with Enhanced Visual Design -->
                    <div class="mb-8 p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-green-50 to-blue-50 border border-green-100'} shadow-lg">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 rounded-xl bg-white dark:bg-gray-800 shadow">
                                <i data-lucide="credit-card" class="w-5 h-5 text-green-600 dark:text-green-400"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Payment Summary</h3>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="${isDark ? 'text-gray-400' : 'text-gray-600'}">Subtotal</span>
                                <span class="font-medium">₹${order.subtotal}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="${isDark ? 'text-gray-400' : 'text-gray-600'}">Delivery Charges</span>
                                <span class="${order.deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}">${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="${isDark ? 'text-gray-400' : 'text-gray-600'}">Tax (GST 5%)</span>
                                <span>₹${order.tax}</span>
                            </div>
                            ${order.discount > 0 ? `
                                <div class="flex justify-between text-red-600">
                                    <span>Discount</span>
                                    <span>-₹${order.discount}</span>
                                </div>
                            ` : ''}
                            <div class="flex justify-between pt-3 mt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} font-bold text-lg">
                                <span class="text-gray-900 dark:text-white">Total Paid</span>
                                <span class="text-green-600">₹${order.total}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Delivery Address Section with Enhanced Visual Design -->
                    ${order.deliveryAddress ? `
                        <div class="mb-6 p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-green-50 to-blue-50 border border-green-100'} shadow-lg">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="p-2 rounded-xl bg-white dark:bg-gray-800 shadow">
                                    <i data-lucide="${order.deliveryAddress.type === 'home' ? 'home' : order.deliveryAddress.type === 'work' ? 'briefcase' : 'map-pin'}" class="w-5 h-5 text-green-600 dark:text-green-400"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Delivery Address</h3>
                            </div>
                            <div class="flex gap-4">
                                <div class="p-3 rounded-lg bg-green-100 text-green-800 ${isDark ? 'bg-green-900 text-green-200' : ''}">
                                    <i data-lucide="${order.deliveryAddress.type === 'home' ? 'home' : order.deliveryAddress.type === 'work' ? 'briefcase' : 'map-pin'}" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-900 dark:text-white">${order.deliveryAddress.name}</h4>
                                    <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}">${order.deliveryAddress.phone}</p>
                                    <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Modal Footer with Enhanced Visual Design -->
                <div class="flex gap-4 p-6 ${isDark ? 'bg-gray-800 border-t border-gray-700' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200'} rounded-b-2xl">
                    <button onclick="setState({ showOrderDetails: false, showOrderTracking: true })" class="btn btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg btn-enhanced">
                        <i data-lucide="truck" class="w-5 h-5"></i>
                        <span>Track Order</span>
                    </button>
                    <button onclick="setState({ showOrderDetails: false })" class="btn btn-outline flex-1 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg btn-enhanced">
                        <i data-lucide="x" class="w-5 h-5"></i>
                        <span>Close</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function addSampleOrders() {
    const sampleOrders = [
        {
            id: 1001,
            date: 'Oct 15, 2025',
            items: [
                {
                    id: 1,
                    name: 'Fresh Potatoes',
                    price: 30,
                    unit: 'kg',
                    farmer: 'Ramesh Kumar',
                    location: 'Punjab',
                    rating: 4.5,
                    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop',
                    category: 'vegetables',
                    freshness: 95,
                    harvestDate: '2025-09-28',
                    quantity: 2
                },
                {
                    id: 3,
                    name: 'Fresh Mangoes',
                    price: 120,
                    unit: 'kg',
                    farmer: 'Anjali Sharma',
                    location: 'Maharashtra',
                    rating: 4.9,
                    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop',
                    category: 'fruits',
                    freshness: 92,
                    harvestDate: '2025-09-29',
                    quantity: 1
                }
            ],
            subtotal: 180,
            deliveryFee: 0,
            tax: 9,
            discount: 0,
            total: 189,
            status: 'In Transit',
            paymentMethod: 'UPI',
            deliveryAddress: {
                name: 'John Doe',
                phone: '9876543210',
                street: '123 Main Street',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110001',
                type: 'home'
            }
        },
        {
            id: 1002,
            date: 'Oct 10, 2025',
            items: [
                {
                    id: 2,
                    name: 'Organic Rice',
                    price: 80,
                    unit: 'kg',
                    farmer: 'Suresh Patel',
                    location: 'Haryana',
                    rating: 4.8,
                    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
                    category: 'grains',
                    freshness: 100,
                    harvestDate: '2025-09-25',
                    quantity: 5
                }
            ],
            subtotal: 400,
            deliveryFee: 50,
            tax: 20,
            discount: 40,
            total: 430,
            status: 'Delivered',
            paymentMethod: 'Credit Card',
            deliveryAddress: {
                name: 'John Doe',
                phone: '9876543210',
                street: '123 Main Street',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110001',
                type: 'home'
            }
        }
    ];

    AppState.orders = sampleOrders;
    setState({ orders: AppState.orders });
}

function filterOrders(filter) {
    setState({ orderFilter: filter });
}

function renderOrderFeedback() {
    return '<div class="container px-4 py-6"><p>Order Feedback</p></div>';
}

function renderOrderTracking() {
    if (!AppState.selectedOrder) {
        return '<div class="container px-4 py-6"><p>No order selected</p></div>';
    }

    const order = AppState.selectedOrder;
    const isDark = AppState.theme === 'dark';

    const trackingStages = [
        {
            status: 'Order Placed',
            icon: 'check-circle',
            date: order.date,
            time: '10:30 AM',
            description: 'Your order has been confirmed and is being processed',
            completed: true
        },
        {
            status: 'Order Packed',
            icon: 'package',
            date: order.date,
            time: '02:15 PM',
            description: 'Your order has been packed and is ready for dispatch',
            completed: true
        },
        {
            status: 'In Transit',
            icon: 'truck',
            date: new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            time: '09:00 AM',
            description: 'Your order is on the way and will be delivered soon',
            completed: true,
            active: true
        },
        {
            status: 'Out for Delivery',
            icon: 'navigation',
            date: new Date(Date.now() + 172800000).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            time: 'Expected',
            description: 'Your order is out for delivery and will arrive today',
            completed: false
        },
        {
            status: 'Delivered',
            icon: 'home',
            date: new Date(Date.now() + 259200000).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            time: 'Expected',
            description: 'Your order will be delivered to your address',
            completed: false
        }
    ];

    return `
        <div class="container px-4 py-6 order-detail-page">
            ${renderBackButton()}
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden ${isDark ? 'dark-theme' : ''}" style="max-width: 720px; margin: 0 auto;">
                <div class="flex justify-between items-center p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-green-50 to-blue-50'}">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Track Order #${order.id}</h2>
                        <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1">Expected delivery: ${new Date(Date.now() + 259200000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onclick="setState({ showOrderTracking: false })" class="p-2 rounded-full hover:bg-white/20 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all duration-300">
                        <i data-lucide="x" class="w-6 h-6 text-gray-700 dark:text-gray-300"></i>
                    </button>
                </div>

                <!-- Modal Body with Better Spacing and Visual Hierarchy -->
                <div class="p-6 max-h-[60vh] overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-white'}">
                    <!-- Enhanced Tracking Timeline with Modern Design -->
                    <div class="relative pb-2 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-green-400 before:via-blue-400 before:to-purple-400">
                        ${trackingStages.map((stage, index) => `
                            <div class="relative mb-8 last:mb-0 flex gap-6">
                                <!-- Timeline Dot with Modern Visual Design -->
                                <div class="absolute left-[-1.15rem] top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500
                                    ${stage.completed ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30' :
            stage.active ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 animate-pulse' :
                'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-400'}">
                                    ${stage.completed ? '<i data-lucide="check" class="w-4 h-4"></i>' :
            stage.active ? `<i data-lucide="${stage.icon}" class="w-4 h-4"></i>` :
                `<i data-lucide="${stage.icon}" class="w-4 h-4"></i>`}
                                </div>

                                <!-- Stage Content with Modern Card Design -->
                                <div class="flex-1 ml-2">
                                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl
                                        ${stage.completed || stage.active ? 'border-l-4 border-l-green-500 bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-gray-900' : ''}">
                                        <div class="flex justify-between items-start mb-3">
                                            <h3 class="font-bold text-lg text-gray-900 dark:text-white ${stage.completed || stage.active ? 'text-green-600 dark:text-green-400' : ''}">
                                                ${stage.status}
                                            </h3>
                                            ${stage.active ? `
                                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                                                    <i data-lucide="radio" class="w-3 h-3 mr-1"></i>
                                                    LIVE
                                                </span>
                                            ` : ''}
                                            ${stage.completed ? `
                                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                                                    <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i>
                                                    DONE
                                                </span>
                                            ` : ''}
                                        </div>

                                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 flex items-center">
                                            <i data-lucide="calendar" class="w-4 h-4 mr-2 text-green-500"></i>
                                            <span class="font-medium">${stage.date}</span> at <span class="font-medium">${stage.time}</span>
                                        </p>

                                        <p class="text-gray-700 dark:text-gray-400 pl-6 border-l-2 border-gray-200 dark:border-gray-700 ml-1">
                                            ${stage.description}
                                        </p>

                                        <!-- Progress Indicator for Active Stage -->
                                        ${stage.active && !stage.completed ? `
                                            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div class="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                                                    <i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>
                                                    In progress... updating in real-time
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Order Summary Section with Enhanced Visual Design - Much smaller images -->
                    <div class="mt-8 p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-green-50 to-blue-50 border border-green-100'} shadow-lg">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 rounded-xl bg-white dark:bg-gray-800 shadow">
                                <i data-lucide="package" class="w-5 h-5 text-green-600 dark:text-green-400"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h3>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <!-- Enhanced Product Images Collage - Much smaller images -->
                            <div class="flex-shrink-0">
                                ${order.items.length === 1 ? `
                                    <!-- Single Item Display -->
                                    <div class="w-8 h-8 rounded-md bg-gray-200 overflow-hidden border border-gray-200 product-image-enhanced">
                                        <img src="${order.items[0].image}" alt="${order.items[0].name}"
                                            class="w-full h-full object-cover"
                                            onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-xs font-bold text-green-600 bg-gray-100&quot;>${order.items[0].name.charAt(0)}</div>';" />
                                    </div>
                                ` : order.items.length === 2 ? `
                                    <!-- Two Items Display -->
                                    <div class="flex gap-1">
                                        ${order.items.slice(0, 2).map(item => `
                                            <div class="w-8 h-8 rounded-md bg-gray-200 overflow-hidden border border-gray-200 product-image-enhanced">
                                                <img src="${item.image}" alt="${item.name}"
                                                    class="w-full h-full object-cover"
                                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[8px] font-bold text-green-600 bg-gray-100&quot;>${item.name.charAt(0)}</div>';" />
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <!-- Multiple Items Collage Display -->
                                    <div class="relative w-10 h-10">
                                        <!-- First item (main) -->
                                        <div class="absolute top-0 left-0 w-8 h-8 rounded-md bg-gray-200 overflow-hidden border border-gray-200 z-10 product-image-enhanced">
                                            <img src="${order.items[0].image}" alt="${order.items[0].name}"
                                                class="w-full h-full object-cover"
                                                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[8px] font-bold text-green-600 bg-gray-100&quot;>${order.items[0].name.charAt(0)}</div>';" />
                                        </div>
                                        <!-- Second item (top right) -->
                                        <div class="absolute top-0 right-0 w-5 h-5 rounded bg-gray-200 overflow-hidden border border-white shadow-sm product-image-enhanced">
                                            <img src="${order.items[1].image}" alt="${order.items[1].name}"
                                                class="w-full h-full object-cover"
                                                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[6px] font-bold text-green-600 bg-gray-100&quot;>${order.items[1].name.charAt(0)}</div>';" />
                                        </div>
                                        <!-- Third item (bottom right) -->
                                        <div class="absolute bottom-0 right-0 w-5 h-5 rounded bg-gray-200 overflow-hidden border border-white shadow-sm product-image-enhanced">
                                            <img src="${order.items[2].image}" alt="${order.items[2].name}"
                                                class="w-full h-full object-cover"
                                                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center text-[6px] font-bold text-green-600 bg-gray-100&quot;>${order.items[2].name.charAt(0)}</div>';" />
                                        </div>
                                        <!-- Additional items counter -->
                                        ${order.items.length > 3 ? `
                                            <div class="absolute bottom-0 left-0 w-5 h-5 rounded bg-green-500 flex items-center justify-center border border-white shadow-sm text-white font-bold text-[6px]">
                                                +${order.items.length - 3}
                                            </div>
                                        ` : ''}
                                    </div>
                                `}
                            </div>

                            <!-- Order Details with Enhanced Visual Design -->
                            <div class="flex-1 min-w-0">
                                <p class="font-bold text-gray-900 dark:text-white text-sm">${order.items.length} item${order.items.length > 1 ? 's' : ''}</p>
                                <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1">Total Amount: <span class="font-bold text-base text-green-600">₹${order.total}</span></p>
                                <div class="mt-3 flex items-center gap-2">
                                    <span class="text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}">Status:</span>
                                    <span class="status-badge ${order.status === 'Delivered' ? 'delivered' : 'in-transit'} text-xs px-2 py-1 rounded-full font-bold">
                                        ${order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer with Enhanced Visual Design -->
                <div class="flex gap-4 p-6 ${isDark ? 'bg-gray-800 border-t border-gray-700' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200'} rounded-b-2xl">
                    <button onclick="setState({ showOrderTracking: false, showOrderDetails: true })" class="btn btn-outline flex-1 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg btn-enhanced flex items-center justify-center gap-2">
                        <i data-lucide="eye" class="w-5 h-5"></i>
                        View Details
                    </button>
                    <button onclick="setState({ showOrderTracking: false })" class="btn btn-primary flex-1 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg btn-enhanced flex items-center justify-center gap-2">
                        <i data-lucide="x" class="w-5 h-5"></i>
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderCartSidebar() {
    const t = getTranslations();
    const total = getCartTotal();
    const cartSidebar = document.getElementById('cartSidebar');

    cartSidebar.className = `cart-sidebar ${AppState.showCart ? 'active' : ''}`;
    cartSidebar.innerHTML = `
        <div class="cart-sidebar-content" onclick="event.stopPropagation()">
            <div class="cart-header">
                <h2 class="text-xl font-bold">${t.cartTitle}</h2>
                <button onclick="closeModal('cart')">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <div class="cart-items">
                ${AppState.cartItems.length === 0 ? `
                    <p class="text-gray-500 text-center py-8">${t.cartEmpty}</p>
                ` : AppState.cartItems.map((item, index) => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            ${item.image ? `
                                <img src="${item.image}" alt="${item.name}"
                                    onerror="this.onerror=null; this.parentElement.innerHTML='<div class=&quot;image-placeholder text-sm&quot;>${item.name?.charAt(0) || '?'}</div>';" />
                            ` : `
                                <div class="image-placeholder text-sm">${item.name?.charAt(0) || '?'}</div>
                            `}
                        </div>
                        <div class="flex-1">
                            <p class="font-medium">${item.name}</p>
                            <p class="text-sm text-gray-500">₹${item.price}${item.unit ? `/${item.unit}` : ''}</p>
                        </div>
                        <div class="cart-quantity-controls">
                            <button onclick="updateCartQuantity(${index}, ${(item.quantity || 1) - 1})" class="cart-quantity-btn">-</button>
                            <span>${item.quantity || 1}</span>
                            <button onclick="updateCartQuantity(${index}, ${(item.quantity || 1) + 1})" class="cart-quantity-btn">+</button>
                        </div>
                        <button onclick="removeFromCart(${index})" class="text-xs text-red-600 hover:underline ml-2">${t.remove}</button>
                    </div>
                `).join('')}
            </div>

            ${AppState.cartItems.length > 0 ? `
                <div class="cart-footer">
                    <div class="flex justify-between mb-4">
                        <span class="font-semibold">Total</span>
                        <span class="font-bold text-xl">₹${total}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="clearCart()" class="px-3 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50 text-sm">
                            ${t.clearAll}
                        </button>
                        <button onclick="proceedToCheckout()" class="btn btn-primary flex-1 py-3">
                            ${t.proceedCheckout}
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    cartSidebar.onclick = () => closeModal('cart');
}

function proceedToCheckout() {
    if (!AppState.isLoggedIn) {
        closeModal('cart');
        openModal('login');
        return;
    }
    closeModal('cart');
    setActiveTab('ordersummary');
}

function getLoginFormInnerHtml(t) {
    return `
            <div class="modal-header">
                <h2 class="text-2xl font-bold">${t.loginTitle}</h2>
                <button onclick="closeModal('login')" class="modal-close">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Scrollable body so full form is always accessible -->
            <div class="modal-body-scroll" style="margin-top: 1.25rem; max-height: calc(100vh - 120px); overflow-y: auto; padding: 0.75rem 0.75rem 1.5rem 0.75rem;">
            <form onsubmit="handleLogin(event)" class="space-y-5" id="loginForm" novalidate>
                <!-- Inline error message for wrong credentials -->
                <div id="loginErrorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-2 text-sm" style="display:none;">
                </div>
                <!-- User Type Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <label class="user-type-radio user-type-green">
                            <input type="radio" name="loginUserType" value="customer" checked onchange="toggleAdminFields('login'); updateLoginForgotText();" />
                            <span>
                                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                                <span class="block text-xs font-medium">Customer</span>
                            </span>
                        </label>
                        <label class="user-type-radio user-type-green">
                            <input type="radio" name="loginUserType" value="farmer" onchange="toggleAdminFields('login'); updateLoginForgotText();" />
                            <span>
                                <i data-lucide="sprout" class="w-4 h-4"></i>
                                <span class="block text-xs font-medium">Farmer</span>
                            </span>
                        </label>
                        <label class="user-type-radio user-type-blue">
                            <input type="radio" name="loginUserType" value="admin" onchange="toggleAdminFields('login'); updateLoginForgotText();" />
                            <span>
                                <i data-lucide="shield" class="w-4 h-4"></i>
                                <span class="block text-xs font-medium">Admin</span>
                            </span>
                        </label>
                        <label class="user-type-radio user-type-orange">
                            <input type="radio" name="loginUserType" value="delivery_agent" onchange="toggleAdminFields('login'); updateLoginForgotText();" />
                            <span>
                                <i data-lucide="truck" class="w-4 h-4"></i>
                                <span class="block text-xs font-medium">Delivery Agent</span>
                            </span>
                        </label>
                        <label class="user-type-radio user-type-purple" style="border-color: #7c3aed; background: #f5f3ff;">
                            <input type="radio" name="loginUserType" value="agri_specialist" onchange="toggleAdminFields('login'); updateLoginForgotText();" />
                            <span>
                                <i data-lucide="leaf" class="w-4 h-4" style="color: #7c3aed;"></i>
                                <span class="block text-xs font-medium" style="color: #7c3aed;">Agri Specialist</span>
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Regular User Fields (Consumer/Farmer) - Green Theme -->
                <div id="loginRegularFields" class="login-fields-green">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                        <input type="text" id="loginName" class="input" placeholder="Enter your name" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t.phoneNumber} *</label>
                        <input type="tel" id="loginPhone" class="input" placeholder="+91 98765 43210" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t.password} *</label>
                        <input type="password" id="loginPassword" class="input" required />
                    </div>
                </div>

                <!-- Admin Fields (Hidden by default) -->
                <div id="loginAdminFields" style="display: none;">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="shield-check" class="w-5 h-5 text-blue-600"></i>
                            <span class="font-semibold text-blue-900">Admin Login</span>
                        </div>

                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Admin ID *</label>
                                <input type="text" id="loginAdminId" class="input" placeholder="Enter Admin ID" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                                <input type="text" id="loginAdminName" class="input" placeholder="Enter Admin Name" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input type="tel" id="loginAdminPhone" class="input" placeholder="Enter 10-digit number" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input type="password" id="loginAdminPassword" class="input" placeholder="Enter password" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Delivery Agent Fields (Hidden by default) -->
                <div id="loginDeliveryAgentFields" style="display: none;">
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="truck" class="w-5 h-5 text-orange-600"></i>
                            <span class="font-semibold text-orange-900">Delivery Agent Login</span>
                        </div>

                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
                                <input type="text" id="loginAgentName" class="input" placeholder="Enter your name" required />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input type="tel" id="loginAgentPhone" class="input" placeholder="Enter 10-digit number" required />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input type="password" id="loginAgentPassword" class="input" placeholder="Enter assigned password" required />
                                <p class="text-xs text-gray-500 mt-1">Password assigned by admin</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Agri Specialist Fields (Hidden by default) -->
                <div id="loginAgriSpecialistFields" style="display: none;">
                    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="leaf" class="w-5 h-5 text-purple-600"></i>
                            <span class="font-semibold text-purple-900">Agri Specialist Login</span>
                        </div>

                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input type="text" id="loginAgriName" class="input" placeholder="Enter your full name" required />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input type="tel" id="loginAgriPhone" class="input" placeholder="Enter 10-digit number" required />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input type="password" id="loginAgriPassword" class="input" placeholder="Enter assigned password" required />
                                <p class="text-xs text-gray-500 mt-1">Password assigned by admin</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-right">
                    <button type="button" id="loginForgotAction" class="text-sm text-green-600 hover:underline">
                        ${t.forgotPassword}
                    </button>
                </div>

                <button type="submit" class="btn btn-primary w-full py-2" id="loginSubmitBtn">${t.login}</button>

                <div class="text-center text-sm">
                    Don't have an account?
                    <button type="button" onclick="closeModal('login'); openModal('register');" class="text-green-600 hover:underline ml-1">${t.register}</button>
                </div>
            </form>
            </div>
    `;
}

function renderLoginModal() {
    const t = getTranslations();
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    modal.className = `modal ${AppState.showLoginModal ? 'active' : ''}`;

    const checkedRadio = document.querySelector('input[name="loginUserType"]:checked');
    const initialTheme = checkedRadio ?
        (checkedRadio.value === 'admin' ? 'theme-blue' :
            checkedRadio.value === 'delivery_agent' ? 'theme-orange' :
                checkedRadio.value === 'agri_specialist' ? 'theme-purple' : 'theme-green') : 'theme-green';

    modal.innerHTML = `
        <div class="modal-content ${initialTheme}" id="loginModalContent">
            ${getLoginFormInnerHtml(t)}
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal('login');
    };

    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        updateLoginForgotText();
        normalizeLoginRegularFields();
    }, 50);
}

function toggleAdminFields(context) {
    const selected = document.querySelector('input[name="loginUserType"]:checked');
    if (!selected) return;
    const role = selected.value;

    const regularFields = document.getElementById('loginRegularFields');
    const adminFields = document.getElementById('loginAdminFields');
    const deliveryFields = document.getElementById('loginDeliveryAgentFields');
    const agriFields = document.getElementById('loginAgriSpecialistFields');
    const modalContent = document.getElementById('loginModalContent');

    if (adminFields) adminFields.style.display = 'none';
    if (deliveryFields) deliveryFields.style.display = 'none';
    if (agriFields) agriFields.style.display = 'none';
    if (regularFields) regularFields.style.display = 'none';

    if (role === 'admin') {
        if (adminFields) adminFields.style.display = 'block';
        if (modalContent) { modalContent.className = 'modal-content theme-blue'; }
    } else if (role === 'delivery_agent') {
        if (deliveryFields) deliveryFields.style.display = 'block';
        if (modalContent) { modalContent.className = 'modal-content theme-orange'; }
    } else if (role === 'agri_specialist') {
        if (agriFields) agriFields.style.display = 'block';
        if (modalContent) { modalContent.className = 'modal-content theme-purple'; }
    } else {

        if (regularFields) regularFields.style.display = 'block';
        if (modalContent) { modalContent.className = 'modal-content theme-green'; }
        normalizeLoginRegularFields();
    }

    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 30);
    }
}

function updateLoginForgotText() {
    const forgotBtn = document.getElementById('loginForgotAction');
    if (!forgotBtn) return;

    const selected = document.querySelector('input[name="loginUserType"]:checked');
    const t = typeof getTranslations === 'function' ? getTranslations() : { forgotPassword: 'Forgot Password?' };
    const noteText = 'Admin: Contact Super Admin to reset password.';

    if (selected && selected.value === 'admin') {

        forgotBtn.textContent = noteText;
        forgotBtn.onclick = null;
        forgotBtn.style.cursor = 'default';
        forgotBtn.style.opacity = '0.6';
    } else if (selected && selected.value === 'agri_specialist') {

        forgotBtn.textContent = 'Agri Specialist: Contact Admin to reset password.';
        forgotBtn.onclick = null;
        forgotBtn.style.cursor = 'default';
        forgotBtn.style.opacity = '0.6';
    } else if (selected && selected.value === 'delivery_agent') {

        forgotBtn.textContent = t.forgotPassword;
        forgotBtn.style.cursor = 'pointer';
        forgotBtn.style.opacity = '1';
        forgotBtn.onclick = () => {
            if (typeof closeModal === 'function') closeModal('login');
            window.location.href = 'forgot-password.html?role=delivery_agent';
        };
    } else {

        const role = selected ? selected.value : 'customer';
        forgotBtn.textContent = t.forgotPassword;
        forgotBtn.style.cursor = 'pointer';
        forgotBtn.style.opacity = '1';
        forgotBtn.onclick = () => {
            if (typeof closeModal === 'function') closeModal('login');
            window.location.href = `forgot-password.html?role=${role}`;
        };
    }
}

function normalizeLoginRegularFields() {
    const regularFields = document.getElementById('loginRegularFields');
    if (!regularFields) return;

    regularFields.style.background = '#ffffff';
    regularFields.style.borderRadius = '0.5rem';
    regularFields.style.border = '1px solid #e5e7eb';
    regularFields.style.padding = '1rem';
}

function showAdminLockedScreen(message) {
    const existing = document.getElementById('adminLockedOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'adminLockedOverlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at top, #1f2937, #020617);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.3s ease-in;
    `;

    overlay.innerHTML = `
        <div style="
            max-width: 440px;
            width: 90%;
            background: #0b1120;
            border-radius: 18px;
            padding: 2.25rem 2rem;
            box-shadow: 0 20px 80px rgba(0,0,0,0.9);
            border: 1px solid rgba(148,163,184,0.4);
            color: #e5e7eb;
            text-align: center;
        ">
            <div style="
                width: 90px;
                height: 90px;
                border-radius: 999px;
                margin: 0 auto 1.5rem auto;
                background: radial-gradient(circle at 30% 20%, #60a5fa, #1d4ed8);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 0 6px rgba(59,130,246,0.25);
            ">
                <i data-lucide="shield-alert" style="width: 46px; height: 46px; color: white; stroke-width: 2.6;"></i>
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #e5e7eb;">
                Admin Account Locked
            </h2>
            <p style="font-size: 0.95rem; color: #9ca3af; margin-bottom: 1.5rem; line-height: 1.6;">
                ${message || 'Your account has been locked. Please contact the Super Admin to unlock your account.'}
            </p>
            <div style="font-size: 0.8rem; color: #6b7280; margin-bottom: 1.5rem;">
                For security reasons, admin accounts cannot be unlocked using OTP.
            </div>
            <button onclick="window.location.href='home.html'" style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.4rem;
                padding: 0.6rem 1.4rem;
                border-radius: 999px;
                border: 1px solid rgba(148,163,184,0.8);
                background: transparent;
                color: #e5e7eb;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
            ">
                <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
                Back to Login
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const userType = document.querySelector('input[name="loginUserType"]:checked').value;

    const showInlineLoginError = (message) => {
        const errorDiv = document.getElementById('loginErrorMessage');
        if (errorDiv) {
            errorDiv.textContent = message || 'Wrong name, phone number or password! Please try again.';
            errorDiv.style.display = 'block';
        }

        const fieldsToClear = [
            'loginName',
            'loginPhone',
            'loginPassword',
            'loginAdminId',
            'loginAdminName',
            'loginAdminPhone',
            'loginAdminPassword',
            'loginAgentName',
            'loginAgentPhone',
            'loginAgentPassword',
            'loginAgriName',
            'loginAgriPhone',
            'loginAgriPassword'
        ];
        fieldsToClear.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    };

    if (userType === 'delivery_agent') {
        const agentNameEl = document.getElementById('loginAgentName');
        const agentPhoneEl = document.getElementById('loginAgentPhone');
        const agentPasswordEl = document.getElementById('loginAgentPassword');

        if (!agentNameEl || !agentPhoneEl || !agentPasswordEl) {
            showToast('Form fields not found. Please refresh and try again.', 'error');
            return;
        }

        const agentName = agentNameEl.value.trim();
        const agentPhone = agentPhoneEl.value.trim();
        const agentPassword = agentPasswordEl.value;

        if (!agentName || !agentPhone || !agentPassword) {
            showToast('Please fill in all required fields', 'error');

            if (!agentName) agentNameEl.focus();
            else if (!agentPhone) agentPhoneEl.focus();
            else if (!agentPassword) agentPasswordEl.focus();
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: agentName,
                    phone_no: agentPhone,
                    password: agentPassword,
                    role: 'delivery_agent',
                    ip_address: window.location.hostname
                })
            });

            const data = await res.json();

            if (!res.ok) {
                const isLocked = data.error?.includes('locked');
                const msg = isLocked
                    ? (data.error || 'Account locked after 3 failed attempts.')
                    : 'Wrong name, phone number or password! Please try again.';
                showToast(msg, isLocked ? 'warning' : 'error');
                if (!isLocked) {
                    showInlineLoginError(msg);
                }
                if (data.error?.includes('locked')) {
                    localStorage.setItem('user_id', data.id ?? agentPhone);
                    localStorage.setItem('role', 'delivery_agent');
                    window.location.href = 'otp.html';
                }
                return;
            }

            localStorage.setItem('agent_id', data.id);
            localStorage.setItem('agent_name', data.name);
            localStorage.setItem('user_id', data.id);
            localStorage.setItem('user_name', data.name);
            localStorage.setItem('role', 'delivery_agent');

            setState({
                isLoggedIn: true,
                showLoginModal: false,
                userType: 'delivery_agent',
                userProfile: {
                    fullName: data.name,
                    username: agentName,
                    phone: agentPhone,
                    userType: 'delivery_agent',
                    agentId: data.id
                }
            });

            showSuccessMessage(`Welcome back, ${data.name}!`, 'Login successful');

            setTimeout(() => {
                window.location.href = 'deliveryboy.html';
            }, 1500);
        } catch (err) {
            console.error("Delivery agent login error:", err);
            showToast(err.message || 'Server error during login.', 'error');
        }
    }

    else if (userType === 'admin') {
        const adminId = document.getElementById('loginAdminId').value;
        const adminName = document.getElementById('loginAdminName').value;
        const adminPhone = document.getElementById('loginAdminPhone').value.trim();
        const adminPassword = document.getElementById('loginAdminPassword').value;

        if (!adminId || !adminName || !adminPhone || !adminPassword) {
            showToast('Please fill in all Admin fields!', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: adminName,
                    phone_no: adminPhone,
                    password: adminPassword,
                    role: 'admin',
                    ip_address: window.location.hostname
                })
            });

            const data = await res.json();

            if (!res.ok) {
                const isLocked = data.error?.includes('locked');
                const msg = isLocked
                    ? (data.error || 'Admin account locked after 3 failed attempts. Please contact the Super Admin to unlock your account.')
                    : 'Wrong name, phone number or password! Please try again.';

                if (isLocked) {
                    showAdminLockedScreen(msg);
                } else {
                    showToast(msg, 'error');
                    showInlineLoginError(msg);
                }
                return;
            }

            const roleType = data.role_type || 'admin';
            const isSuperAdmin = roleType === 'super_admin';

            localStorage.setItem('user_id', data.id);
            localStorage.setItem('user_name', data.name);
            localStorage.setItem('role', 'admin');
            localStorage.setItem('role_type', roleType);

            setState({
                isLoggedIn: true,
                showLoginModal: false,
                userType: 'admin',
                userProfile: {
                    fullName: data.name,
                    username: adminName,
                    phone: adminPhone,
                    userType: 'admin',
                    adminId: data.id,
                    roleType: roleType
                },

                orders: AppState.orders.filter(order => order.id > 2000)
            });

            const adminTypeText = isSuperAdmin ? 'Super admin' : 'admin';
            showSuccessMessage(`Welcome back, ${data.name}!`, `Login successful as ${adminTypeText}`);

            setTimeout(() => {
                if (isSuperAdmin) {
                    window.location.href = 'superadmin.html';
                } else {
                    window.location.href = 'admin.html';
                }
            }, 1500);
        } catch (err) {
            console.error("Admin login error:", err);
            showToast(err.message || 'Server error during login.', 'error');
        }
    }

    else if (userType === 'agri_specialist') {
        const agriNameEl = document.getElementById('loginAgriName');
        const agriPhoneEl = document.getElementById('loginAgriPhone');
        const agriPasswordEl = document.getElementById('loginAgriPassword');

        if (!agriNameEl || !agriPhoneEl || !agriPasswordEl) {
            showToast('Form fields not found. Please refresh and try again.', 'error');
            return;
        }

        const agriName = agriNameEl.value.trim();
        const agriPhone = agriPhoneEl.value.trim();
        const agriPassword = agriPasswordEl.value;

        if (!agriName || !agriPhone || !agriPassword) {
            showToast('Please fill in all required fields', 'error');
            if (!agriName) agriNameEl.focus();
            else if (!agriPhone) agriPhoneEl.focus();
            else if (!agriPassword) agriPasswordEl.focus();
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: agriName,
                    phone_no: agriPhone,
                    password: agriPassword,
                    role: 'agri_specialist',
                    ip_address: window.location.hostname
                })
            });

            const data = await res.json();

            if (!res.ok) {
                const isLocked = data.error?.includes('locked');
                const msg = isLocked
                    ? (data.error || 'Account locked after 3 failed attempts.')
                    : 'Wrong name, phone number or password! Please try again.';
                showToast(msg, isLocked ? 'warning' : 'error');
                if (!isLocked) {
                    showInlineLoginError(msg);
                }
                if (isLocked) {
                    localStorage.setItem('user_id', data.id ?? agriPhone);
                    localStorage.setItem('role', 'agri_specialist');
                    window.location.href = 'otp.html';
                }
                return;
            }

            localStorage.setItem('specialist_id', data.id);
            localStorage.setItem('user_id', data.id);
            localStorage.setItem('user_name', data.name);
            localStorage.setItem('role', 'agri_specialist');
            if (data.storage_location_id) {
                localStorage.setItem('storage_location_id', data.storage_location_id);
            }
            if (data.assigned_region) {
                localStorage.setItem('assigned_region', data.assigned_region);
            }
            if (data.email) {
                localStorage.setItem('user_email', data.email);
            }

            setState({
                isLoggedIn: true,
                showLoginModal: false,
                userType: 'agri_specialist',
                userProfile: {
                    fullName: data.name,
                    username: agriName,
                    phone: agriPhone,
                    email: data.email,
                    userType: 'agri_specialist',
                    specialistId: data.id,
                    storageLocationId: data.storage_location_id,
                    assignedRegion: data.assigned_region
                }
            });

            showSuccessMessage(`Welcome, ${data.name}!`, 'Login successful as Agri Specialist');

            setTimeout(() => {
                window.location.href = 'corestorage.html';
            }, 1500);
        } catch (err) {
            console.error("Agri Specialist login error:", err);
            showToast(err.message || 'Server error during login.', 'error');
        }
    } else {
        const username = document.getElementById('loginName').value.trim();
        const phone_no = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const role = userType;

        if (!username || !phone_no || !password) {
            const msg = 'Please fill in all fields!';
            showToast(msg, 'error');
            showInlineLoginError(msg);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, phone_no, password, role, ip_address: window.location.hostname })
            });

            const data = await res.json();

            if (!res.ok) {
                const isLocked = data.error?.includes('locked');
                const msg = isLocked
                    ? (data.error || 'Account locked after 3 failed attempts.')
                    : 'Wrong name, phone number or password! Please try again.';
                showToast(msg, isLocked ? 'warning' : 'error');
                if (!isLocked) {
                    showInlineLoginError(msg);
                }
                if (isLocked) {
                    localStorage.setItem('user_id', data.id ?? phone_no);
                    localStorage.setItem('role', role);
                    window.location.href = 'otp.html';
                }
                return;
            }

            localStorage.setItem('user_id', data.id);
            localStorage.setItem('user_name', data.name);
            localStorage.setItem('phone_no', phone_no);
            localStorage.setItem('role', role);

            setState({
                isLoggedIn: true,
                showLoginModal: false,
                userType: role,
                userProfile: {
                    fullName: data.name,
                    username,
                    phone: phone_no,
                    email: data.email,
                },

                orders: AppState.orders.filter(order => order.id > 2000)

            });

            showSuccessMessage(`Welcome back, ${data.name}!`, 'Login successful');

            setTimeout(() => {
                if (role === 'customer') {
                    window.location.href = 'index.html';
                } else if (role === 'farmer') {

                    setState({
                        activeTab: 'marketplace',
                        navigationHistory: ['marketplace']
                    });
                    window.location.href = 'index.html';
                } else if (role === 'admin') {
                    window.location.href = 'admin.html';
                }
            }, 1500);
        } catch (err) {
            console.error("Login error:", err);
            showToast(err.message || 'Server error during login.', 'error');
        }
    }
}

function renderRegisterModal() {
    const t = getTranslations();
    const modal = document.getElementById('registerModal');
    if (!modal) return;
    modal.className = `modal ${AppState.showRegisterModal ? 'active' : ''}`;
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="text-2xl font-bold">${t.registerTitle}</h2>
                <button onclick="closeModal('register')" class="modal-close">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Scrollable body so full form is always accessible -->
            <div class="modal-body-scroll" style="margin-top: 1.25rem; max-height: calc(100vh - 120px); overflow-y: auto; padding: 0.75rem 0.75rem 1.5rem 0.75rem;">
            <form onsubmit="handleRegister(event)" class="space-y-5" id="registerForm">
                <!-- User Type Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Account Type *</label>
                    <div class="grid grid-cols-2 gap-3">
                        <label class="user-type-radio user-type-green">
                            <input type="radio" name="userType" value="customer" checked />
                            <span>
                                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                                <span class="block text-xs font-medium">Customer</span>
                            </span>
                        </label>
                        <label class="user-type-radio user-type-green">
                            <input type="radio" name="userType" value="farmer" />
                            <span>
                                <i data-lucide="sprout" class="w-4 h-4"></i>
                                <span class="block text-xs font-medium">Farmer</span>
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Regular User Fields (Consumer/Farmer) -->
                <div id="registerRegularFields">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t.fullName} *</label>
                        <input type="text" id="regName" class="input" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t.phoneNumber} *</label>
                        <input type="tel" id="regPhone" class="input" placeholder="Enter 10-digit phone number" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t.password} *</label>
                        <input type="password" id="regPassword" class="input" required />
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-full py-2">${t.register}</button>

                <div class="text-center text-sm">
                    Already have an account?
                    <button type="button" onclick="closeModal('register'); openModal('login');" class="text-green-600 hover:underline ml-1">${t.login}</button>
                </div>
            </form>
            </div>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal('register');
    };

    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

async function handleRegister(event) {
    event.preventDefault();
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value.trim().replace(/\D/g, "");

    const password = document.getElementById('regPassword').value;

    if (!name || !phone || !password) {
        showToast('Please fill in all fields!', 'error');
        return;
    }

    if (phone.length < 10) {
        showToast("Enter a valid 10-digit phone number", "error");
        return;
    }

    const url = `${API_BASE_URL}/register/${userType === 'farmer' ? 'farmer' : 'customer'}`;
    const payload = userType === 'farmer'
        ? { farm_name: name, address: '', phone_no: phone, password: password }
        : { customer_name: name, address: '', phone_no: phone, password: password };

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Registration failed', 'error');
        return;
    }
    const data = await res.json();

    localStorage.setItem('user_id', data.id || phone);
    localStorage.setItem('user_name', data.name);
    localStorage.setItem('phone_no', phone);
    localStorage.setItem('role', userType);

    setState({ isLoggedIn: true, showRegisterModal: false, userType, userProfile: { fullName: data.name, phone } });

    showSuccessMessage(`Welcome, ${data.name}!`, 'Registration successful');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function handleLoginModal(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const t = typeof getTranslations === 'function' ? getTranslations() : {
        loginTitle: 'Login',
        name: 'Name',
        phoneNumber: 'Phone Number',
        password: 'Password',
        login: 'Login',
        register: 'Register',
        forgotPassword: 'Forgot Password?'
    };

    const checkedRadio = document.querySelector('input[name="loginUserType"]:checked');
    const initialTheme = checkedRadio ?
        (checkedRadio.value === 'admin' ? 'theme-blue' :
            checkedRadio.value === 'delivery_agent' ? 'theme-orange' : 'theme-green') : 'theme-green';

    container.innerHTML = `
        <div class="modal-content ${initialTheme}" id="loginModalContent" style="position: static; max-width: 100%; margin: 0; box-shadow: none;">
            ${getLoginFormInnerHtml(t)}
        </div>
    `;

    if (typeof lucide !== 'undefined') {
        setTimeout(() => {
            lucide.createIcons();
            updateLoginForgotText();
            normalizeLoginRegularFields();
        }, 50);
    }
}

function handleRegisterModal(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const t = typeof getTranslations === 'function' ? getTranslations() : {
        registerTitle: 'Registration',
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        password: 'Password',
        register: 'Register',
        login: 'Login'
    };

    container.innerHTML = `
        <div class="modal-content" style="position: static; max-width: 100%; margin: 0; box-shadow: none;">
            <div class="modal-header">
                <h2 class="text-2xl font-bold">${t.registerTitle}</h2>
                <button onclick="closeModal('register')" class="modal-close">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Scrollable body so full form is always accessible -->
            <div class="modal-body-scroll" style="margin-top: 1.25rem; max-height: calc(100vh - 120px); overflow-y: auto; padding: 0.75rem 0.75rem 1.5rem 0.75rem;">
            <form onsubmit="handleRegister(event)" class="space-y-5" id="registerForm">
                <!-- User Type Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Account Type *</label>
                    <div class="grid grid-cols-2 gap-3">
                        <label class="user-type-radio user-type-green">
                            <input type="radio" name="userType" value="customer" checked />
                            <span>
                                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                                <span class="block text-xs font-medium">Customer</span>
                            </span>
                        </label>
                        <label class="user-type-radio user-type-green">
                            <input type="radio" name="userType" value="farmer" />
                            <span>
                                <i data-lucide="sprout" class="w-4 h-4"></i>
                                <span class="block text-xs font-medium">Farmer</span>
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Regular User Fields (Consumer/Farmer) -->
                <div id="registerRegularFields">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t.fullName} *</label>
                        <input type="text" id="regName" class="input" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t.phoneNumber} *</label>
                        <input type="tel" id="regPhone" class="input" placeholder="Enter 10-digit phone number" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t.password} *</label>
                        <input type="password" id="regPassword" class="input" required />
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-full py-2">${t.register}</button>

                <div class="text-center text-sm">
                    Already have an account?
                    <button type="button" onclick="window.switchMode && window.switchMode()" class="text-green-600 hover:underline ml-1">${t.login}</button>
                </div>
            </form>
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

function renderForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (!modal) return;
    modal.className = `modal ${AppState.showForgotPasswordModal ? 'active' : ''}`;
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <!-- Back Button on Left -->
                <button onclick="closeModal('forgotPassword'); openModal('login');" class="btn btn-outline px-3 py-2 text-sm" style="margin-right: auto;">
                    <i data-lucide="arrow-left" class="w-4 h-4 inline-block mr-1"></i>
                    Back
                </button>

                <h2 class="text-2xl font-bold" style="position: absolute; left: 50%; transform: translateX(-50%);">Reset Password</h2>

                <button onclick="closeModal('forgotPassword')" class="modal-close">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <div class="mb-4">
                <p class="text-gray-600">Enter your phone number and we'll send you a verification code to reset your password.</p>
            </div>

            <form onsubmit="handleForgotPassword(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" id="forgotPhone" class="input" placeholder="+91 98765 43210" required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                    <input type="password" id="newPassword" class="input" placeholder="Enter new password" required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <input type="password" id="confirmPassword" class="input" placeholder="Confirm new password" required />
                </div>

                <button type="submit" class="btn btn-primary w-full py-2">
                    <i data-lucide="key" class="w-4 h-4 inline-block mr-2"></i>
                    Reset Password
                </button>

                <div class="text-center text-sm">
                    Remember your password?
                    <button type="button" onclick="closeModal('forgotPassword'); openModal('login');" class="text-green-600 hover:underline ml-1">Back to Login</button>
                </div>
            </form>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal('forgotPassword');
    };

    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

function handleForgotPassword(event) {
    event.preventDefault();
    const phone = document.getElementById('forgotPhone').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters long!', 'error');
        return;
    }

    closeModal('forgotPassword');
    showToast('Password reset successful! You can now login with your new password.', 'success', 3000);
    openModal('login');
}

function renderLanguageSelector() {
    const modal = document.getElementById('languageSelector');

    modal.className = `modal ${AppState.showLanguageSelector ? 'active' : ''}`;
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="text-2xl font-bold">Select Language</h2>
                <button onclick="closeModal('language')" class="modal-close">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <div class="space-y-3">
                <button onclick="selectLanguage('en')" class="btn ${AppState.language === 'en' ? 'btn-primary' : 'btn-outline'} w-full py-3 text-left">
                    <span class="font-bold">English</span>
                </button>
                <button onclick="selectLanguage('hi')" class="btn ${AppState.language === 'hi' ? 'btn-primary' : 'btn-outline'} w-full py-3 text-left">
                    <span class="font-bold">हिंदी (Hindi)</span>
                </button>
                <button onclick="selectLanguage('bn')" class="btn ${AppState.language === 'bn' ? 'btn-primary' : 'btn-outline'} w-full py-3 text-left">
                    <span class="font-bold">বাংলা (Bengali)</span>
                </button>
            </div>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal('language');
    };
}

function selectLanguage(lang) {
    setState({ language: lang, showLanguageSelector: false });
    showToast('Language changed successfully', 'success');
}

function renderAccountSettings() {
    const modal = document.getElementById('accountSettings');

    modal.className = `modal ${AppState.showAccountSettings ? 'active' : ''}`;
    modal.innerHTML = `
        <div class="modal-content account-settings-modal">
            <div class="account-settings-header">
                <div class="flex items-center gap-3">
                    <div class="settings-icon-wrapper">
                        <i data-lucide="settings" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-white">Account Settings</h2>
                        <p class="text-sm text-green-100">Manage your account preferences</p>
                    </div>
                </div>
                <button onclick="closeModal('settings')" class="modal-close-white">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <div class="account-settings-body">
                <!-- Profile Section -->
                <div class="settings-card" onclick="openProfileModal()">
                    <div class="settings-card-icon">
                        <i data-lucide="user" class="w-6 h-6 text-green-600"></i>
                    </div>
                    <div class="settings-card-content">
                        <h3 class="settings-card-title">Profile</h3>
                        <p class="settings-card-desc">Update your personal information</p>
                    </div>
                    <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400"></i>
                </div>

                <!-- Saved Addresses Section -->
                ${canManageAddresses() ? `
                <div class="settings-card" onclick="openAddressManager()">
                    <div class="settings-card-icon">
                        <i data-lucide="map-pin" class="w-6 h-6 text-green-600"></i>
                    </div>
                    <div class="settings-card-content">
                        <h3 class="settings-card-title">Saved Addresses</h3>
                        <p class="settings-card-desc">${AppState.savedAddresses.length} saved address${AppState.savedAddresses.length === 1 ? '' : 'es'}</p>
                    </div>
                    <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400"></i>
                </div>
                ` : ''}

                <!-- My Wishlist Section -->
                <div class="settings-card" onclick="setActiveTab('wishlist'); closeModal('settings');">
                    <div class="settings-card-icon">
                        <i data-lucide="heart" class="w-6 h-6 text-green-600"></i>
                    </div>
                    <div class="settings-card-content">
                        <h3 class="settings-card-title">My Wishlist</h3>
                        <p class="settings-card-desc">${AppState.wishlist.length} items in wishlist</p>
                    </div>
                    <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400"></i>
                </div>

                <!-- My Orders Section -->
                <div class="settings-card" onclick="setActiveTab('orders'); closeModal('settings');">
                    <div class="settings-card-icon">
                        <i data-lucide="package" class="w-6 h-6 text-green-600"></i>
                    </div>
                    <div class="settings-card-content">
                        <h3 class="settings-card-title">My Orders</h3>
                        <p class="settings-card-desc">${AppState.orders.length} active orders</p>
                    </div>
                    <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400"></i>
                </div>

                <!-- Notifications Section -->
                <div class="settings-card">
                    <div class="settings-card-icon">
                        <i data-lucide="bell" class="w-6 h-6 text-green-600"></i>
                    </div>
                    <div class="settings-card-content">
                        <h3 class="settings-card-title">Notifications</h3>
                        <p class="settings-card-desc">Manage notification preferences</p>
                    </div>
                    <label class="toggle-switch" onclick="event.stopPropagation();">
                        <input type="checkbox" ${AppState.notificationsEnabled ? 'checked' : ''} onchange="event.stopPropagation(); toggleNotifications();">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Logout Section -->
                <div class="settings-card logout-card" onclick="handleLogout()">
                    <div class="settings-card-icon">
                        <i data-lucide="log-out" class="w-6 h-6 text-red-600"></i>
                    </div>
                    <div class="settings-card-content">
                        <h3 class="settings-card-title text-red-600">Logout</h3>
                        <p class="settings-card-desc">Sign out of your account</p>
                    </div>
                    <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400"></i>
                </div>

                <p class="text-center text-sm text-gray-500 mt-6">
                    Manage all your account settings in one place
                </p>
            </div>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal('settings');
    };
}

function openProfileModal() {
    closeModal('settings');
    openModal('profile');
}

function openAddressManager() {
    closeModal('settings');
    loadAddressesFromBackend().then(() => {
        setActiveTab('addresses');
    });
}

async function openAccountSettings() {
    setState({ showAccountSettings: true });
}

function toggleNotifications() {
    AppState.notificationsEnabled = !AppState.notificationsEnabled;
    setState({ notificationsEnabled: AppState.notificationsEnabled });
    showToast(AppState.notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled', 'success');
}

function handleLogout() {
    setState({
        isLoggedIn: false,
        userProfile: null,
        showAccountSettings: false,
        cartItems: [],
        orders: [],
        wishlist: []
    });
    showToast('Logged out successfully', 'success');

    window.location.href = 'home.html';
}

function handleLogoutFromProfile() {
    closeModal('profile');
    setState({
        isLoggedIn: false,
        userProfile: null,
        showProfileModal: false,
        cartItems: [],
        orders: [],
        wishlist: [],
        isEditingProfile: false
    });
    showToast('Logged out successfully', 'success');

    window.location.href = 'home.html';
}

function renderProfileModal() {
    const modal = document.getElementById('profileModal');
    const profile = AppState.userProfile || {};
    const isEditing = AppState.isEditingProfile || false;

    modal.className = `modal ${AppState.showProfileModal ? 'active' : ''}`;

    if (!isEditing) {

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="text-2xl font-bold">Profile</h2>
                    <button onclick="closeModal('profile')" class="modal-close">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <div class="profile-view">
                    <div class="text-center mb-6">
                        <div class="profile-avatar-large">
                            ${profile.photoURL ? `<img src="${profile.photoURL}" alt="Profile" class="w-full h-full object-cover rounded-full" />` : '<i data-lucide="user" class="w-16 h-16"></i>'}
                        </div>
                        <h3 class="text-xl font-bold mt-4">${profile.fullName || 'User'}</h3>
                        <p class="text-sm text-gray-500">${profile.email || 'user@example.com'}</p>
                    </div>

                    <div class="profile-info-grid">
                        <div class="profile-info-item">
                            <div class="profile-info-icon">
                                <i data-lucide="phone" class="w-5 h-5 text-green-600"></i>
                            </div>
                            <div>
                                <div class="profile-info-label">Phone Number</div>
                                <div class="profile-info-value">${profile.phone || 'Not provided'}</div>
                            </div>
                        </div>

                        <div class="profile-info-item">
                            <div class="profile-info-icon">
                                <i data-lucide="mail" class="w-5 h-5 text-green-600"></i>
                            </div>
                            <div>
                                <div class="profile-info-label">Email Address</div>
                                <div class="profile-info-value">${profile.email || 'Not provided'}</div>
                            </div>
                        </div>

                        <div class="profile-info-item full-width">
                            <div class="profile-info-icon">
                                <i data-lucide="file-text" class="w-5 h-5 text-green-600"></i>
                            </div>
                            <div>
                                <div class="profile-info-label">Bio</div>
                                <div class="profile-info-value">${profile.bio || 'No bio added yet'}</div>
                            </div>
                        </div>
                    </div>

                    <button onclick="enableProfileEdit()" class="btn btn-primary w-full py-3 mt-6">
                        <i data-lucide="edit" class="w-5 h-5"></i>
                        Edit Profile
                    </button>

                    <button onclick="handleLogoutFromProfile()" class="btn btn-outline w-full py-3 mt-3 text-red-600 border-red-600 hover:bg-red-50">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        Logout
                    </button>
                </div>
            </div>
        `;
    } else {

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="text-2xl font-bold">Edit Profile</h2>
                    <button onclick="closeModal('profile')" class="modal-close">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <form onsubmit="handleProfileUpdate(event)" class="space-y-4">
                    <div class="text-center mb-6">
                        <div class="profile-avatar" id="profileAvatarPreview">
                            ${profile.photoURL ? `<img src="${profile.photoURL}" alt="Profile" class="w-full h-full object-cover rounded-full" />` : '<i data-lucide="user" class="w-12 h-12"></i>'}
                        </div>
                        <input type="file" id="profilePhotoInput" class="hidden" accept="image/*" onchange="handleProfilePhotoChange(event)" />
                        <button type="button" onclick="document.getElementById('profilePhotoInput').click()" class="text-sm text-green-600 hover:underline mt-2">
                            <i data-lucide="camera" class="w-4 h-4 inline-block mr-1"></i>
                            Change Photo
                        </button>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" id="profileName" value="${profile.fullName || ''}" class="input" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="profileEmail" value="${profile.email || ''}" class="input" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="tel" id="profilePhone" value="${profile.phone || ''}" class="input" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea id="profileBio" class="input" rows="3" placeholder="Tell us about yourself...">${profile.bio || ''}</textarea>
                    </div>

                    <div class="flex gap-3">
                        <button type="button" onclick="cancelProfileEdit()" class="btn btn-outline flex-1 py-2">Cancel</button>
                        <button type="submit" class="btn btn-primary flex-1 py-2">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal('profile');
            AppState.isEditingProfile = false;
        }
    };
}

function enableProfileEdit() {
    setState({ isEditingProfile: true });
}

function cancelProfileEdit() {
    setState({ isEditingProfile: false });
}

function handleProfileUpdate(event) {
    event.preventDefault();
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const bio = document.getElementById('profileBio').value;

    setState({
        userProfile: {
            ...AppState.userProfile,
            fullName: name,
            email,
            phone,
            bio
        },
        isEditingProfile: false
    });
    showToast('Profile updated successfully!', 'success');
}

function handleProfilePhotoChange(event) {
    const file = event.target.files[0];
    if (file) {

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const photoURL = e.target.result;

            const preview = document.getElementById('profileAvatarPreview');
            if (preview) {
                preview.innerHTML = `<img src="${photoURL}" alt="Profile" class="w-full h-full object-cover rounded-full" />`;
            }

            AppState.userProfile = {
                ...AppState.userProfile,
                photoURL: photoURL
            };

            showToast('Photo updated! Click Save Changes to confirm', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function renderAddProductModal() {
    const modal = document.getElementById('addProductModal');

    modal.className = `modal ${AppState.showAddProductModal ? 'active' : ''}`;
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2 class="text-2xl font-bold">Add New Product</h2>
                <button onclick="closeModal('addProduct')" class="modal-close">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <form onsubmit="handleAddProduct(event)" class="space-y-4">
                <!-- Product Name -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="package" class="w-4 h-4 inline-block mr-1"></i>
                        Product Name
                    </label>
                    <input type="text" id="productName" class="input" placeholder="Enter product name" required />
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="tag" class="w-4 h-4 inline-block mr-1"></i>
                        Category
                    </label>
                    <select id="productCategory" class="select" required>
                        <option value="">Select Category</option>
                        <option value="vegetables">🥕 Vegetables</option>
                        <option value="fruits">🍎 Fruits</option>
                        <option value="grains">🌾 Grains</option>
                        <option value="dairy">🥛 Dairy</option>
                        <option value="tools">🚜 Farm Tools</option>
                    </select>
                </div>

                <!-- Price per Kg -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="indian-rupee" class="w-4 h-4 inline-block mr-1"></i>
                        Price per Kg
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 text-gray-500">₹</span>
                        <input type="number" id="productPrice" class="input" style="padding-left: 2rem;" placeholder="0.00" step="0.01" min="0" required />
                    </div>
                </div>

                <!-- Stock Quantity -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="boxes" class="w-4 h-4 inline-block mr-1"></i>
                        Stock Quantity (Kg)
                    </label>
                    <input type="number" id="productStock" class="input" placeholder="Enter stock quantity" min="0" required />
                </div>

                <!-- Product Description -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="file-text" class="w-4 h-4 inline-block mr-1"></i>
                        Product Description
                    </label>
                    <textarea id="productDescription" class="input" rows="4" placeholder="Enter product description..." required></textarea>
                </div>

                <!-- Product Images -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="image" class="w-4 h-4 inline-block mr-1"></i>
                        Product Images
                    </label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer" onclick="document.getElementById('productImages').click()">
                        <i data-lucide="upload" class="w-8 h-8 mx-auto mb-2 text-gray-400"></i>
                        <p class="text-sm text-gray-600 mb-1">Click to upload images</p>
                        <p class="text-xs text-gray-400">Upload multiple images of your product</p>
                        <input type="file" id="productImages" class="hidden" multiple accept="image/*" onchange="handleImageUpload(event)" />
                    </div>
                    <div id="imagePreview" class="mt-3 grid grid-cols-3 gap-2"></div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeModal('addProduct')" class="btn btn-outline flex-1 py-3">
                        <i data-lucide="x" class="w-5 h-5"></i>
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary flex-1 py-3">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                        Add Product
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal('addProduct');
    };
}

function handleImageUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    Array.from(files).slice(0, 6).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'relative aspect-square rounded-lg overflow-hidden';
            div.innerHTML = `
                <img src="${e.target.result}" class="w-full h-full object-cover" />
                <button type="button" onclick="removeImage(${index})" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            `;
            preview.appendChild(div);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    const input = document.getElementById('productImages');
    const dt = new DataTransfer();
    const files = input.files;

    for (let i = 0; i < files.length; i++) {
        if (i !== index) dt.items.add(files[i]);
    }

    input.files = dt.files;
    handleImageUpload({ target: input });
}

async function handleAddProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseFloat(document.getElementById('productStock').value);
    const description = document.getElementById('productDescription').value;
    const imageInput = document.getElementById('productImages');

    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('role');
    const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';

    const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    try {
        const imageFiles = Array.from(imageInput.files);
        const imagesBase64 = await Promise.all(imageFiles.map(file => readFileAsBase64(file)));

        const payload = {
            user_id: userId,
            user_role: userRole,
            product_name: name,
            category: category,
            price_per_kg: price,
            stock_quantity_kg: stock,
            product_description: description,
            images: imagesBase64
        };

        const response = await fetch(`${apiBase}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Product added successfully and is pending approval!', 'success');
            setState({ showAddProductModal: false });
            event.target.reset();
            document.getElementById('imagePreview').innerHTML = '';

            loadMyProducts();
        } else {
            showToast(result.error || 'Failed to add product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('Error connecting to server', 'error');
    }
}

function editMyProduct(index) {
    const product = AppState.myProducts[index];
    setState({ editingProduct: product, editingProductIndex: index, showEditProductModal: true });
}

function removeMyProduct(index) {
    if (confirm('Are you sure you want to remove this product?')) {
        AppState.myProducts.splice(index, 1);
        setState({ myProducts: AppState.myProducts });
        showToast('Product removed successfully!', 'success');
    }
}

function renderEditProductModal() {
    const modal = document.getElementById('editProductModal');
    const product = AppState.editingProduct || {};

    modal.className = `modal ${AppState.showEditProductModal ? 'active' : ''}`;
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2 class="text-2xl font-bold">Edit Product</h2>
                <button onclick="closeEditProductModal()" class="modal-close">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <form onsubmit="handleEditProduct(event)" class="space-y-4">
                <!-- Product Name -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="package" class="w-4 h-4 inline-block mr-1"></i>
                        Product Name
                    </label>
                    <input type="text" id="editProductName" value="${product.name || ''}" class="input" placeholder="Enter product name" required />
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="tag" class="w-4 h-4 inline-block mr-1"></i>
                        Category
                    </label>
                    <select id="editProductCategory" class="select" required>
                        <option value="">Select Category</option>
                        <option value="vegetables" ${product.category === 'vegetables' ? 'selected' : ''}>🥕 Vegetables</option>
                        <option value="fruits" ${product.category === 'fruits' ? 'selected' : ''}>🍎 Fruits</option>
                        <option value="grains" ${product.category === 'grains' ? 'selected' : ''}>🌾 Grains</option>
                        <option value="dairy" ${product.category === 'dairy' ? 'selected' : ''}>🥛 Dairy</option>
                    </select>
                </div>

                <!-- Price per Kg -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="indian-rupee" class="w-4 h-4 inline-block mr-1"></i>
                        Price per Kg
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 text-gray-500">₹</span>
                        <input type="number" id="editProductPrice" value="${product.price || ''}" class="input" style="padding-left: 2rem;" placeholder="0.00" step="0.01" min="0" required />
                    </div>
                </div>

                <!-- Stock Quantity -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="boxes" class="w-4 h-4 inline-block mr-1"></i>
                        Stock Quantity (Kg)
                    </label>
                    <input type="number" id="editProductStock" value="${product.stock || ''}" class="input" placeholder="Enter stock quantity" min="0" required />
                </div>

                <!-- Product Description -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="file-text" class="w-4 h-4 inline-block mr-1"></i>
                        Product Description
                    </label>
                    <textarea id="editProductDescription" class="input" rows="4" placeholder="Enter product description..." required>${product.description || ''}</textarea>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeEditProductModal()" class="btn btn-outline flex-1 py-3">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary flex-1 py-3">
                        <i data-lucide="check" class="w-5 h-5"></i>
                        Update Product
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeEditProductModal();
    };

    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

function closeEditProductModal() {
    setState({ showEditProductModal: false, editingProduct: null, editingProductIndex: null });
}

function handleEditProduct(event) {
    event.preventDefault();

    const name = document.getElementById('editProductName').value;
    const category = document.getElementById('editProductCategory').value;
    const price = parseFloat(document.getElementById('editProductPrice').value);
    const stock = parseInt(document.getElementById('editProductStock').value);
    const description = document.getElementById('editProductDescription').value;

    AppState.myProducts[AppState.editingProductIndex] = {
        ...AppState.myProducts[AppState.editingProductIndex],
        name,
        category,
        price,
        stock,
        description
    };

    setState({
        myProducts: AppState.myProducts,
        showEditProductModal: false,
        editingProduct: null,
        editingProductIndex: null
    });

    showToast('Product updated successfully!', 'success');
}

function renderAddAddressModal() {
    const modal = document.getElementById('addAddressModal');
    const isEditing = AppState.editingAddressIndex !== null;
    const address = isEditing ? AppState.savedAddresses[AppState.editingAddressIndex] : {};
    const profile = AppState.userProfile || {};
    const defaultName = profile.fullName || localStorage.getItem('user_name') || '';
    const defaultPhone = profile.phone || localStorage.getItem('user_phone') || localStorage.getItem('phone_no') || '';

    modal.className = `modal ${AppState.showAddAddressModal ? 'active' : ''}`;
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2 class="text-2xl font-bold">${isEditing ? 'Edit Address' : 'Add New Address'}</h2>
                <button onclick="closeAddAddressModal()" class="modal-close">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <form onsubmit="handleSaveAddress(event)" class="space-y-4">
                <!-- Name -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="user" class="w-4 h-4 inline-block mr-1"></i>
                        Full Name
                    </label>
                    <input type="text" id="addressName" value="${address.name || defaultName}" class="input" placeholder="Enter full name" required />
                </div>

                <!-- Phone -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="phone" class="w-4 h-4 inline-block mr-1"></i>
                        Phone Number
                    </label>
                    <input type="tel" id="addressPhone" value="${address.phone || defaultPhone}" class="input" placeholder="Enter phone number" required />
                </div>

                <!-- Street Address -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i data-lucide="map" class="w-4 h-4 inline-block mr-1"></i>
                        Street Address <span class="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <textarea id="addressStreet" class="input" rows="2" placeholder="House no., Building name, Street name">${address.street || ''}</textarea>
                </div>

                <!-- City & District -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input type="text" id="addressCity" value="${address.city || ''}" class="input" placeholder="City" maxlength="40" required />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <input type="text" id="addressDistrict" value="${address.district || ''}" class="input" placeholder="District" maxlength="40" required />
                    </div>
                </div>

                <!-- Country & Pincode -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input type="text" id="addressCountry" value="${address.country || 'India'}" class="input" placeholder="Country" maxlength="40" required />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i data-lucide="hash" class="w-4 h-4 inline-block mr-1"></i>
                            Pincode
                        </label>
                        <input type="text" id="addressPincode" value="${address.pincode || ''}" class="input" placeholder="Enter pincode" pattern="[0-9]{6}" maxlength="6" required />
                    </div>
                </div>

                <!-- Set as Default -->
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="addressDefault" ${address.isDefault ? 'checked' : ''} class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                    <label for="addressDefault" class="text-sm text-gray-700 cursor-pointer">
                        Set as active delivery address
                    </label>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeAddAddressModal()" class="btn btn-outline flex-1 py-3">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary flex-1 py-3">
                        <i data-lucide="${isEditing ? 'check' : 'plus'}" class="w-5 h-5"></i>
                        ${isEditing ? 'Update Address' : 'Save Address'}
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) closeAddAddressModal();
    };

    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

function closeAddAddressModal() {
    setState({ showAddAddressModal: false, editingAddressIndex: null });
}

async function handleSaveAddress(event) {
    event.preventDefault();

    const role = localStorage.getItem('role') || '';
    const userName = document.getElementById('addressName').value.trim();
    const phoneNo = document.getElementById('addressPhone').value.trim();
    const streetAddress = document.getElementById('addressStreet').value.trim();
    const city = document.getElementById('addressCity').value.trim();
    const district = document.getElementById('addressDistrict').value.trim();
    const country = document.getElementById('addressCountry').value.trim();
    const pincode = document.getElementById('addressPincode').value.trim();
    const setAsSelected = document.getElementById('addressDefault').checked;
    const isEditing = AppState.editingAddressIndex !== null;
    const editingAddress = isEditing ? AppState.savedAddresses[AppState.editingAddressIndex] : null;

    if (role !== 'farmer' && role !== 'customer') {
        showToast('Only farmer and customer accounts can save addresses', 'error');
        return;
    }

    const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
    const payload = {
        ...buildAddressAuthPayload(),
        user_name: userName,
        phone_no: phoneNo,
        city,
        district,
        country,
        pincode,
        street_address: streetAddress || null,
        set_as_selected: setAsSelected || AppState.savedAddresses.length === 0
    };

    try {
        const url = isEditing && editingAddress?.add_id
            ? `${apiBase}/address/${editingAddress.add_id}`
            : `${apiBase}/address`;
        const method = isEditing && editingAddress?.add_id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to save address');
        }

        await loadAddressesFromBackend();
        showToast(isEditing ? 'Address updated successfully!' : 'Address added successfully!', 'success');

        setState({
            showAddAddressModal: false,
            editingAddressIndex: null
        });

        if (AppState.activeTab === 'weather') {
            loadWeatherData();
        }
    } catch (err) {
        console.error('Address save request failed:', err);
        showToast(err.message || 'Failed to save address. Please try again.', 'error');
    }
}

function renderProductQuickView() {
    if (!AppState.showProductQuickView || !AppState.selectedProduct) return;

    const modal = document.getElementById('productDetailsModal');
    const product = AppState.selectedProduct;
    const t = getTranslations();
    const isDark = AppState.theme === 'dark';

    modal.className = `modal ${AppState.showProductQuickView ? 'active' : ''}`;
    modal.innerHTML = `
        <!-- Close Button Outside Modal - Same as Farm Tools -->
        <button class="quick-view-back-btn-outside" type="button" onclick="closeQuickView()">
            <i data-lucide="x" class="w-5 h-5"></i>
            <span>Close</span>
        </button>

        <div class="modal-content product-quick-view ${isDark ? 'dark-theme' : ''}" style="max-height: 90vh; overflow-y: auto; position: relative;">
            <div class="quick-view-grid">
                <!-- Product Image Section -->
                <div class="quick-view-image">
                    <img src="${product.image}" alt="${product.name}"
                        onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;image-placeholder-large&quot;>${product.name.charAt(0)}</div>';" />
                    <div class="quick-view-badge">
                        <i data-lucide="sparkles" class="w-4 h-4 inline-block"></i>
                        ${product.freshness}% Fresh
                    </div>
                </div>

                <!-- Product Details Section -->
                <div class="quick-view-details">
                    <div>
                        <div class="quick-view-category">
                            ${t.categories[product.category] || product.category}
                        </div>
                        <h2 class="quick-view-title">${product.name}</h2>
                    </div>

                    <!-- Meta Information -->
                    <div class="quick-view-meta">
                        <div class="flex items-center gap-2">
                            <i data-lucide="user" class="w-4 h-4 text-green-600"></i>
                            <span class="text-sm font-medium text-gray-700">${product.farmer}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="map-pin" class="w-4 h-4 text-green-600"></i>
                            <span class="text-sm font-medium text-gray-700">${product.location}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <i data-lucide="star" class="w-4 h-4 text-yellow-400 fill-current"></i>
                            <span class="text-sm font-bold text-gray-900">${product.rating}</span>
                            <span class="text-xs text-gray-500">(127 reviews)</span>
                        </div>
                    </div>

                    <!-- Price Section -->
                    <div class="quick-view-price">
                        <div>
                            <div class="flex items-baseline gap-2">
                                <span class="text-4xl font-bold text-green-600">₹${product.price}</span>
                                <span class="text-gray-500 text-lg">/${t.unitKg}</span>
                            </div>
                            <p class="text-sm text-green-600 font-medium mt-1">
                                <i data-lucide="tag" class="w-3 h-3 inline-block"></i>
                                Save 15% compared to retail price
                            </p>
                        </div>
                    </div>

                    <!-- Product Features -->
                    <div class="quick-view-features">
                        <div class="feature-item">
                            <i data-lucide="shield-check" class="w-5 h-5 text-green-600"></i>
                            <div>
                                <div class="feature-label">100% Organic</div>
                                <div class="feature-desc">No pesticides used</div>
                            </div>
                        </div>
                        <div class="feature-item">
                            <i data-lucide="calendar" class="w-5 h-5 text-green-600"></i>
                            <div>
                                <div class="feature-label">Fresh Harvest</div>
                                <div class="feature-desc">${product.harvestDate}</div>
                            </div>
                        </div>
                        <div class="feature-item">
                            <i data-lucide="truck" class="w-5 h-5 text-green-600"></i>
                            <div>
                                <div class="feature-label">Fast Delivery</div>
                                <div class="feature-desc">2-3 Days delivery</div>
                            </div>
                        </div>
                    </div>

                    <!-- Quantity Selector -->
                    <div class="quantity-selector">
                        <label class="text-sm font-medium text-gray-700 mb-2 block">Quantity (Kg)</label>
                        <div class="flex items-center gap-3">
                            <button type="button" onclick="decreaseQuantity()" class="quantity-btn">
                                <i data-lucide="minus" class="w-4 h-4"></i>
                            </button>
                            <input type="number" id="quickViewQuantity" value="1" min="1" max="50" class="quantity-input" />
                            <button type="button" onclick="increaseQuantity()" class="quantity-btn">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                            </button>
                            <span class="text-sm text-gray-500 ml-2">Available: ${product.stock || 100} Kg</span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="quick-view-actions">
                        <button onclick='addToCartWithQuantity(${JSON.stringify(product)}); closeQuickView();' class="btn btn-primary flex-1 py-3">
                            <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                            Add to Cart
                        </button>
                        <button
                            id="quickViewWishlistBtn"
                            data-product-id="${product.id}"
                            data-action="wishlist"
                            class="btn ${isInWishlist(product.id) ? 'btn-danger active' : 'btn-outline'} p-3"
                            title="${isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}">
                            <i data-lucide="heart" class="w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}"></i>
                        </button>
                    </div>

                    <!-- Additional Info -->
                    <div class="additional-info">
                        <p class="text-xs text-gray-500">
                            <i data-lucide="info" class="w-3 h-3 inline-block"></i>
                            Direct from farmer • Farm2Market guaranteed • Fresh & healthy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.onclick = function (e) {
            e.stopPropagation();
        };
    }

    modal.onclick = function (e) {
        if (e.target.id === 'productDetailsModal' || e.target === modal) {
            closeQuickView();
        }
    };

    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

function handleQuickView(product) {
    setState({ showProductQuickView: true, selectedProduct: product });
}

function increaseQuantity() {
    const input = document.getElementById('quickViewQuantity');
    if (input) {
        const newValue = parseInt(input.value) + 1;
        if (newValue <= parseInt(input.max)) {
            input.value = newValue;
        }
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quickViewQuantity');
    if (input) {
        const newValue = parseInt(input.value) - 1;
        if (newValue >= parseInt(input.min)) {
            input.value = newValue;
        }
    }
}

function addToCartWithQuantity(product) {
    const quantityInput = document.getElementById('quickViewQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    AppState.cartItems.push({ ...product, quantity });
    setState({ cartItems: AppState.cartItems });
    showToast(`${quantity} Kg of ${product.name} added to cart`, 'success');
}

function openQuickView(product) {
    setState({
        selectedProduct: product,
        showProductQuickView: true
    });
}

function closeQuickView() {
    const modal = document.getElementById('productDetailsModal');

    if (modal) {
        modal.onclick = null;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.onclick = null;
        }
        const backBtn = document.getElementById('quickViewBackBtn');
        if (backBtn) {
            backBtn.onclick = null;
        }
    }

    setState({
        showProductQuickView: false,
        selectedProduct: null
    });
}

function handleQuickViewBack() {
    closeQuickView();
    setActiveTab('marketplace');
}

function renderFilteredProducts(products, searchQuery, category) {
    return products.filter(product => {
        const matchesSearch = searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory;
    });
}

function setupMarketplaceFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const productGrid = document.getElementById('productGrid');
    if (!searchInput || !categoryFilter) return;

    function filterProducts() {
        const searchQuery = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const productCards = productGrid.querySelectorAll('.product-item');

        productCards.forEach(card => {
            const name = card.getAttribute('data-name');
            const farmer = card.getAttribute('data-farmer');
            const cardCategory = card.getAttribute('data-category');

            const matchesSearch = searchQuery === '' ||
                name.includes(searchQuery) ||
                farmer.includes(searchQuery);
            const matchesCategory = category === 'all' || cardCategory === category;

            if (matchesSearch && matchesCategory) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
}

let mainContentRenderId = 0;

function renderMainContent() {
    const main = document.getElementById('mainContent');
    if (!main) return;

    const renderId = ++mainContentRenderId;

    switch (AppState.activeTab) {
        case 'marketplace':
            main.innerHTML = renderMarketplace();
            break;
        case 'myproducts':
            main.innerHTML = renderMyProducts();
            break;
        case 'orders':
            if (AppState.showOrderDetails) {
                main.innerHTML = renderOrderDetails();
            } else if (AppState.showOrderTracking) {
                main.innerHTML = renderOrderTracking();
            } else if (AppState.showOrderFeedback) {
                main.innerHTML = renderOrderFeedback();
            } else {
                main.innerHTML = renderOrders();
            }
            break;
        case 'tools':
            main.innerHTML = renderFarmTools();
            break;
        case 'weather':
            main.innerHTML = renderWeatherLoading();
            renderWeatherCropSuggestion().then(html => {
                if (renderId !== mainContentRenderId) return;
                main.innerHTML = html;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }).catch(error => {
                if (renderId !== mainContentRenderId) return;
                main.innerHTML = `
                    <div class="container px-4 py-8">
                        ${renderBackButton()}
                        <div class="bg-red-50 border border-red-200 rounded-2xl p-10 text-center shadow-sm">
                            <h3 class="text-2xl font-bold text-red-900 mb-2">Unable to load weather data</h3>
                            <p class="text-red-800 mb-6">${error.message || 'Please try again later.'}</p>
                            <button onclick="setActiveTab('weather')" class="btn btn-primary px-8">Retry</button>
                        </div>
                    </div>
                `;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
            break;
        case 'wishlist':
            main.innerHTML = renderWishlist();
            break;
        case 'addresses':
            main.innerHTML = renderSavedAddresses();
            break;
        case 'about':
            main.innerHTML = renderAboutCompany();
            break;
        case 'help':
            main.innerHTML = renderHelp();
            break;
        case 'ordersummary':
            main.innerHTML = renderOrderSummary();
            break;
        case 'payment':
            main.innerHTML = renderPayment();
            break;
        default:
            main.innerHTML = renderMarketplace();
    }
}

async function loadMarketplaceProducts() {
    if (AppState.isMarketplaceLoaded) return;

    const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
    try {
        const response = await fetch(`${apiBase}/products/confirmed`);
        const data = await response.json();
        if (response.ok) {
            setState({
                marketplaceProducts: data,
                isMarketplaceLoaded: true
            });
        } else {
            console.error('Failed to load marketplace products:', data.error);

            if (response.status === 404) {
                showToast('Please restart your backend server to enable Marketplace data.', 'info');
            }
        }
    } catch (err) {
        console.error('Error loading marketplace products:', err);
    }
}

function setMarketplaceFilter(filter) {
    setState({ marketplaceFilter: filter });
}

function renderMarketplace() {
    const t = getTranslations();
    const isDark = AppState.theme === 'dark';

    if (!AppState.isMarketplaceLoaded) {
        loadMarketplaceProducts();
    }

    const filters = [
        { id: 'all', label: 'All Items', icon: 'layout-grid' },
        { id: 'vegetables', label: 'Vegetables', icon: 'carrot' },
        { id: 'fruits', label: 'Fruits', icon: 'apple' },
        { id: 'grains', label: 'Grains', icon: 'wheat' },
        { id: 'dairy', label: 'Dairy', icon: 'milk' }
    ];

    const filteredProducts = AppState.marketplaceProducts.filter(p => {
        const isNotTool = p.category !== 'tools';
        const matchesFilter = AppState.marketplaceFilter === 'all' || p.category === AppState.marketplaceFilter;
        return isNotTool && matchesFilter;
    });

    return `
        <!-- Hero Section -->
        <div class="marketplace-hero ${isDark ? 'dark-theme' : ''}">
            <div class="container px-4">
                <div class="hero-content">
                    <h1 class="hero-title">
                        <i data-lucide="sparkles" class="inline-block w-12 h-12 text-yellow-300 mb-2"></i>
                        <br>Fresh from Farm to Your Table
                    </h1>
                    <p class="hero-subtitle">🌱 Connecting farmers directly with customers for fresh, quality produce at fair prices 🌱</p>
                </div>
            </div>
        </div>

        <div class="container px-4 py-8">
            <!-- Enhanced Filter Bar -->
            <div class="mb-10">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 class="text-3xl font-black text-gray-900 tracking-tight">Available Products</h2>
                        <p class="text-gray-500 mt-1">Discover premium picks from local farms</p>
                    </div>
                    <div class="flex flex-wrap gap-3 w-full md:w-auto">
                        ${filters.map(f => `
                            <button onclick="setMarketplaceFilter('${f.id}')"
                                class="filter-chip-enhanced ${AppState.marketplaceFilter === f.id ? 'active' : ''}">
                                <i data-lucide="${f.icon}" class="w-4 h-4"></i>
                                <span>${f.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div id="productGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                ${!AppState.isMarketplaceLoaded ? `
                    <div class="col-span-full py-20 text-center">
                        <div class="animate-spin w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p class="text-gray-500 font-medium">Fetching freshest products...</p>
                    </div>
                ` : filteredProducts.length === 0 ? `
                    <div class="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <i data-lucide="package-search" class="w-20 h-20 mx-auto mb-4 text-gray-300"></i>
                        <h3 class="text-xl font-bold text-gray-900">No products found</h3>
                        <p class="text-gray-500">We couldn't find any products in the "${AppState.marketplaceFilter}" category.</p>
                        <button onclick="setMarketplaceFilter('all')" class="mt-4 text-primary-green font-bold hover:underline">Clear all filters</button>
                    </div>
                ` : filteredProducts.map(product => renderProductCard(product)).join('')}
            </div>
        </div>
    `;
}

function renderProductCard(product) {
    const isDark = AppState.theme === 'dark';
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/400?text=No+Image';

    return `
        <div class="product-card-enhanced ${isDark ? 'dark-theme' : ''} group">
            <div class="product-image-container relative">
                <img src="${mainImage}" alt="${product.product_name}" class="product-image-main group-hover:scale-110 transition-transform duration-700" />
                <div class="category-badge-floating">${product.category}</div>
            </div>

            <div class="product-info-area p-5">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="product-name-text font-extrabold text-lg text-gray-900 leading-tight">${product.product_name}</h3>
                    <div class="flex gap-2">
                        <button onclick='addToCart(${JSON.stringify(product)}); showToast("Added to cart", "success");'
                            class="action-icon-btn wishlist" title="Quick Add to Cart">
                            <i data-lucide="heart" class="w-4 h-4"></i>
                        </button>
                        <button onclick='openProductDetails(${product.product_id})' class="action-icon-btn view" title="View Details">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <p class="seller-info-text text-gray-500 text-sm mb-4 flex items-center gap-1.5">
                    <span class="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-green">${product.owner_name.charAt(0)}</span>
                    ${product.owner_name}
                </p>

                <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                    <div class="price-display">
                        <span class="text-2xl font-black text-primary-green">₹${product.price_per_kg}</span>
                        <span class="text-xs text-gray-400 font-bold uppercase ml-1">${product.category === 'tools' ? 'Unit' : 'Kg'}</span>
                    </div>
                    <button onclick='addToCart(${JSON.stringify(product)})' class="add-cart-btn-redesign">
                        <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function openProductDetails(id) {
    console.log('Opening details for product:', id);
    const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
    try {
        const response = await fetch(`${apiBase}/products/${id}`);
        const product = await response.json();
        console.log('Product data received:', product);
        if (response.ok) {
            AppState.selectedProduct = product;
            const modal = document.getElementById('productDetailsModal');
            if (modal) {
                modal.innerHTML = renderProductDetailsPage(product);

                if (typeof lucide !== 'undefined') lucide.createIcons();
                openModal('productDetails');
            } else {
                console.error('Modal element not found');
            }
        } else {
            console.error('Failed to fetch product details:', product.error);
        }
    } catch (err) {
        console.error('Error fetching product details:', err);
    }
}

function renderProductDetailsPage(product) {
    const images = product.images && product.images.length > 0 ? product.images : ['https://placehold.co/800?text=No+Image'];
    const isTool = product.category === 'tools';

    return `
        <div class="modal-content product-details-scrollable-container" style="max-width: 1100px; padding: 0; background: transparent;">
            <div class="details-wrapper-card">
                <!-- Close Button -->
                <button onclick="closeModal('productDetails')" class="details-close-btn">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>

                <div class="flex flex-col lg:flex-row">
                    <!-- Left: Gallery Section (Reduced Size) -->
                    <div class="lg:w-2/5 lg:sticky lg:top-0 h-fit">
                        <div class="gallery-main-viewport" style="height: 500px;">
                            <img id="mainProductImg" src="${images[0]}" class="gallery-img-active" />

                            <!-- Floating Info on Image -->
                            <div class="absolute top-6 left-6 flex gap-3">
                                <span class="badge-glass">
                                    <i data-lucide="${isTool ? 'wrench' : 'sprout'}" class="w-4 h-4"></i>
                                    ${product.category}
                                </span>
                                <span class="badge-glass verified">
                                    <i data-lucide="shield-check" class="w-4 h-4"></i>
                                    Verified
                                </span>
                            </div>
                        </div>

                        ${images.length > 1 ? `
                            <div class="gallery-thumbnails-bar p-4 flex gap-3 overflow-x-auto no-scrollbar">
                                ${images.map((img, i) => `
                                    <div onclick="document.getElementById('mainProductImg').src='${img}'" class="thumb-item" style="width: 4rem; height: 4rem;">
                                        <img src="${img}" class="w-full h-full object-cover" />
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Right: Scrollable Info Section (Increased Size) -->
                    <div class="lg:w-3/5 p-8 lg:p-12 bg-white flex flex-col min-h-full">
                        <div class="scrollable-content-area">
                            <div class="mb-10">
                                <div class="flex items-center gap-2 text-primary-green font-bold text-xs uppercase tracking-widest mb-3">
                                    <span class="w-2 h-2 bg-primary-green rounded-full animate-pulse"></span>
                                    In Stock & Ready to Ship
                                </div>
                                <h2 class="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight">${product.product_name}</h2>

                                <div class="flex items-baseline gap-2 mb-6">
                                    <span class="text-5xl font-black text-primary-green">₹${product.price_per_kg}</span>
                                    <span class="text-gray-400 font-bold text-lg">/ ${isTool ? 'unit' : 'kg'}</span>
                                </div>

                                <div class="flex items-center gap-4 p-5 bg-green-50/50 rounded-3xl border border-green-100 mb-10">
                                    <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-green shadow-sm border border-green-50">
                                        <i data-lucide="user" class="w-7 h-7"></i>
                                    </div>
                                    <div>
                                        <div class="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Listed by</div>
                                        <div class="font-bold text-gray-900 text-lg">${product.owner_name}</div>
                                        <div class="text-xs text-primary-green flex items-center gap-1 font-medium">
                                            <i data-lucide="map-pin" class="w-3 h-3"></i>
                                            ${product.owner_location || 'Local Provider'}
                                        </div>
                                    </div>
                                </div>

                                <!-- Specs Grid -->
                                <div class="grid grid-cols-2 gap-4 mb-10">
                                    <div class="spec-card">
                                        <div class="spec-icon bg-blue-50 text-blue-500">
                                            <i data-lucide="package" class="w-5 h-5"></i>
                                        </div>
                                        <div class="spec-info">
                                            <div class="spec-label">Available</div>
                                            <div class="spec-value">${product.stock_quantity_kg} ${isTool ? 'Units' : 'Kg'}</div>
                                        </div>
                                    </div>
                                    <div class="spec-card">
                                        <div class="spec-icon bg-orange-50 text-orange-500">
                                            <i data-lucide="clock" class="w-5 h-5"></i>
                                        </div>
                                        <div class="spec-info">
                                            <div class="spec-label">Freshness</div>
                                            <div class="spec-value">100% Organic</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-10">
                                    <h4 class="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <i data-lucide="align-left" class="w-4 h-4"></i>
                                        About this Product
                                    </h4>
                                    <p class="text-gray-600 leading-relaxed text-lg font-medium">
                                        ${product.product_description || 'Experience the finest quality produce sourced directly from dedicated local farmers. Our products are carefully inspected to ensure they meet the highest standards of freshness and taste.'}
                                    </p>
                                </div>

                                <!-- Trust Badges -->
                                <div class="flex gap-4 py-6 border-t border-b border-gray-50 mb-10">
                                    <div class="flex flex-col items-center flex-1 text-center">
                                        <i data-lucide="truck" class="w-6 h-6 text-gray-400 mb-2"></i>
                                        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Fast Delivery</span>
                                    </div>
                                    <div class="flex flex-col items-center flex-1 text-center">
                                        <i data-lucide="shield-check" class="w-6 h-6 text-gray-400 mb-2"></i>
                                        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Quality Check</span>
                                    </div>
                                    <div class="flex flex-col items-center flex-1 text-center">
                                        <i data-lucide="rotate-ccw" class="w-6 h-6 text-gray-400 mb-2"></i>
                                        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Easy Return</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sticky Bottom Action -->
                        <div class="mt-auto lg:sticky lg:bottom-0 bg-white pt-6 pb-2">
                            <button onclick='addToCart(${JSON.stringify(product)})' class="details-buy-btn">
                                <i data-lucide="shopping-cart" class="w-6 h-6"></i>
                                <span>Add to Cart</span>
                            </button>
                            <p class="text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-4">
                                Guaranteed Safe Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
