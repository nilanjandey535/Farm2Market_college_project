// Application State Management
const AppState = {

    isLoggedIn: false,
    userProfile: null,
    userType: 'customer',

    language: 'en',
    theme: 'light',

    activeTab: 'marketplace',
    previousTab: 'marketplace',
    navigationHistory: ['marketplace'],
    showOrderDetails: false,
    showOrderFeedback: false,
    showOrderTracking: false,

    cartItems: [],
    checkoutItems: [],
    selectedPaymentMethod: null,

    orders: [],
    isOrdersLoading: false,
    isOrdersLoaded: false,
    selectedOrder: null,
    orderFeedback: {},

    myProducts: [],
    marketplaceProducts: [],
    marketplaceFilter: 'all',
    isMarketplaceLoaded: false,
    isMyProductsLoaded: false,

    savedAddresses: [],
    selectedAddressId: null,

    wishlist: [],

    showCart: false,
    showLoginModal: false,
    showRegisterModal: false,
    showForgotPasswordModal: false,
    showProfileModal: false,
    showAccountSettings: false,
    showAddProductModal: false,
    showEditProductModal: false,
    showProductDetails: false,
    showLanguageSelector: false,
    showAddAddressModal: false,
    editingProduct: null,
    editingProductIndex: null,
    editingAddressIndex: null,

    notificationsEnabled: true,

    isLoading: false,
    selectedProduct: null,
    showProductQuickView: false,
    isEditingProfile: false,

    toasts: []
};

function setState(updates) {
    Object.assign(AppState, updates);
    renderApp();
}

function getTranslations() {
    return translations[AppState.language];
}

async function loadOrders() {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');

    if (!userId || (role !== 'customer' && role !== 'farmer')) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/orders/customer/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();

        const formattedOrders = orders.map(order => ({
            id: order.order_id,
            order_id: order.order_id,
            date: new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            items: order.items.map(item => ({
                name: item.product_type,
                quantity: item.quantity,
                price: item.price,
                image: 'https://placehold.co/150'
            })),
            total: order.order_total,
            status: order.status,
            paymentMethod: order.payment_mode
        }));

        AppState.orders = formattedOrders;
        AppState.isOrdersLoaded = true;

        if (
            AppState.activeTab === 'orders' &&
            !AppState.showOrderDetails &&
            !AppState.showOrderTracking &&
            !AppState.showOrderFeedback &&
            typeof refreshOrdersList === 'function'
        ) {
            refreshOrdersList();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    } finally {
        AppState.isOrdersLoading = false;
    }
}

let ordersLoadPromise = null;

function ensureOrdersLoaded() {
    if (AppState.isOrdersLoaded || ordersLoadPromise) return ordersLoadPromise;

    AppState.isOrdersLoading = true;
    ordersLoadPromise = loadOrders().finally(() => {
        ordersLoadPromise = null;
    });

    return ordersLoadPromise;
}

function showToast(message, type = 'success', duration = 2500) {
    const id = Date.now() + Math.random();
    AppState.toasts.push({ id, message, type });
    renderToasts();

    setTimeout(() => {
        AppState.toasts = AppState.toasts.filter(t => t.id !== id);
        renderToasts();
    }, duration);
}

function showSuccessMessage(title, message) {

    const overlay = document.createElement('div');
    overlay.id = 'successMessageOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in;
    `;

    overlay.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.4s ease-out;
        ">
            <div style="
                width: 80px;
                height: 80px;
                margin: 0 auto 1.5rem;
                background: linear-gradient(135deg, #10b981, #059669);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: scaleIn 0.5s ease-out;
            ">
                <i data-lucide="check" style="width: 40px; height: 40px; color: white; stroke-width: 3;"></i>
            </div>
            <h3 style="
                font-size: 1.5rem;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 0.5rem;
            ">${title}</h3>
            <p style="
                color: #6b7280;
                font-size: 1rem;
                margin-bottom: 0;
            ">${message}</p>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes scaleIn {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);

    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 100);
    }

    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            overlay.remove();
            style.remove();
        }, 300);
    }, 1200);

    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);
    setTimeout(() => fadeOutStyle.remove(), 600);
}

function addToCart(product) {

    const cartItem = {
        product_id: product.product_id,
        name: product.product_name || product.name,
        price: parseFloat(product.price_per_kg || product.price || 0),
        category: product.category,
        image: product.images && product.images.length > 0 ? product.images[0] : (product.image || 'https://placehold.co/400?text=No+Image'),
        farmer: product.owner_name || product.farmer || 'Local Farmer',
        quantity: 1
    };

    AppState.cartItems.push(cartItem);
    setState({ cartItems: AppState.cartItems });
    showToast(`${cartItem.name} added to cart`, 'success');
}

function removeFromCart(index) {
    AppState.cartItems.splice(index, 1);
    setState({ cartItems: AppState.cartItems });
}

function updateCartQuantity(index, quantity) {
    if (quantity <= 0) {
        removeFromCart(index);
    } else {
        AppState.cartItems[index].quantity = quantity;
        setState({ cartItems: AppState.cartItems });
    }
}

function clearCart() {
    setState({ cartItems: [] });
}

function getCartTotal() {
    return AppState.cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

function toggleWishlist(product, event) {

    if (!AppState.isLoggedIn) {
        showToast('Please login to add items to wishlist', 'info');
        openModal('login');
        return;
    }

    const clickedButton = event ? event.currentTarget : null;

    const index = AppState.wishlist.findIndex(item => item.id === product.id);
    const isAdding = index === -1;

    if (index > -1) {
        AppState.wishlist.splice(index, 1);
        showToast(`${product.name} removed from wishlist`, 'info');
    } else {
        AppState.wishlist.push(product);
        showToast(`${product.name} added to wishlist`, 'success');
    }

    if (clickedButton) {
        const icon = clickedButton.querySelector('i');
        if (isAdding) {
            clickedButton.classList.add('active');
            if (icon) icon.classList.add('fill-current');
        } else {
            clickedButton.classList.remove('active');
            if (icon) icon.classList.remove('fill-current');
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    if (AppState.showAccountSettings) {
        renderAccountSettings();
    }
}

function isInWishlist(productId) {
    return AppState.wishlist.some(item => item.id === productId);
}

function updateWishlistUI() {

    if (AppState.showAccountSettings) {
        renderAccountSettings();
    }

    const currentTab = AppState.activeTab;
    if (currentTab === 'marketplace') {

        document.querySelectorAll('.wishlist-floating').forEach(button => {
            const productData = button.getAttribute('onclick');
            if (productData) {
                const productId = extractProductId(productData);
                if (productId) {
                    const inWishlist = isInWishlist(productId);
                    if (inWishlist) {
                        button.classList.add('active');
                        button.querySelector('i').classList.add('fill-current');
                    } else {
                        button.classList.remove('active');
                        button.querySelector('i').classList.remove('fill-current');
                    }
                }
            }
        });
    } else if (currentTab === 'tools') {

        document.querySelectorAll('.wishlist-floating').forEach(button => {
            const productData = button.getAttribute('onclick');
            if (productData) {
                const productId = extractProductId(productData);
                if (productId) {
                    const inWishlist = isInWishlist(productId);
                    if (inWishlist) {
                        button.classList.add('active');
                        button.querySelector('i').classList.add('fill-current');
                    } else {
                        button.classList.remove('active');
                        button.querySelector('i').classList.remove('fill-current');
                    }
                }
            }
        });
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function extractProductId(onclickStr) {
    try {
        const match = onclickStr.match(/"id":(\d+)/);
        return match ? parseInt(match[1]) : null;
    } catch (e) {
        return null;
    }
}

function toggleAdminFields(formType) {
    const userTypeRadios = document.querySelectorAll(`input[name="${formType === 'login' ? 'loginUserType' : 'userType'}"]`);
    let selectedType = '';

    userTypeRadios.forEach(radio => {
        if (radio.checked) {
            selectedType = radio.value;
        }
    });

    if (formType === 'login') {
        const modalContent = document.getElementById('loginModalContent');
        const submitBtn = document.getElementById('loginSubmitBtn');
        if (modalContent) {
            modalContent.classList.remove('theme-green', 'theme-blue', 'theme-orange', 'theme-purple');
            if (selectedType === 'admin') {
                modalContent.classList.add('theme-blue');
                if (submitBtn) {
                    submitBtn.className = 'btn w-full py-2';
                    submitBtn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                    submitBtn.style.color = 'white';
                    submitBtn.style.border = 'none';
                }
            } else if (selectedType === 'delivery_agent') {
                modalContent.classList.add('theme-orange');
                if (submitBtn) {
                    submitBtn.className = 'btn w-full py-2';
                    submitBtn.style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
                    submitBtn.style.color = 'white';
                    submitBtn.style.border = 'none';
                }
            } else if (selectedType === 'agri_specialist') {
                modalContent.classList.add('theme-purple');
                if (submitBtn) {
                    submitBtn.className = 'btn w-full py-2';
                    submitBtn.style.background = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
                    submitBtn.style.color = 'white';
                    submitBtn.style.border = 'none';
                }
            } else {
                modalContent.classList.add('theme-green');
                if (submitBtn) {
                    submitBtn.className = 'btn btn-primary w-full py-2';
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.style.border = '';
                }
            }
        }
    }

    const adminFieldsId = formType === 'login' ? 'loginAdminFields' : 'registerAdminFields';
    const deliveryAgentFieldsId = formType === 'login' ? 'loginDeliveryAgentFields' : 'registerDeliveryAgentFields';
    const regularFieldsId = formType === 'login' ? 'loginRegularFields' : 'registerRegularFields';
    const agriSpecialistFieldsId = formType === 'login' ? 'loginAgriSpecialistFields' : 'registerAgriSpecialistFields';
    const adminFields = document.getElementById(adminFieldsId);
    const deliveryAgentFields = document.getElementById(deliveryAgentFieldsId);
    const regularFields = document.getElementById(regularFieldsId);
    const agriSpecialistFields = document.getElementById(agriSpecialistFieldsId);

    if (selectedType === 'delivery_agent') {

        if (deliveryAgentFields) deliveryAgentFields.style.display = 'block';
        if (adminFields) adminFields.style.display = 'none';
        if (agriSpecialistFields) agriSpecialistFields.style.display = 'none';
        if (regularFields) {
            regularFields.style.display = 'none';
            regularFields.classList.remove('login-fields-green', 'login-fields-blue', 'login-fields-orange');
        }

        if (formType === 'login') {

            const loginAgentName = document.getElementById('loginAgentName');
            const loginAgentPhone = document.getElementById('loginAgentPhone');
            const loginAgentPassword = document.getElementById('loginAgentPassword');
            if (loginAgentName) {
                loginAgentName.disabled = false;
                loginAgentName.setAttribute('required', 'required');
            }
            if (loginAgentPhone) {
                loginAgentPhone.disabled = false;
                loginAgentPhone.setAttribute('required', 'required');
            }
            if (loginAgentPassword) {
                loginAgentPassword.disabled = false;
                loginAgentPassword.setAttribute('required', 'required');
            }

            const adminIdField = document.getElementById('loginAdminId');
            const adminNameField = document.getElementById('loginAdminName');
            const adminPhoneField = document.getElementById('loginAdminPhone');
            const adminPasswordField = document.getElementById('loginAdminPassword');

            [adminIdField, adminNameField, adminPhoneField, adminPasswordField].forEach(field => {
                if (field) {
                    field.disabled = true;
                    field.removeAttribute('required');
                }
            });

            const loginName = document.getElementById('loginName');
            const loginPhone = document.getElementById('loginPhone');
            const loginPassword = document.getElementById('loginPassword');
            if (loginName) {
                loginName.required = false;
                loginName.removeAttribute('required');
                loginName.disabled = true;
            }
            if (loginPhone) {
                loginPhone.required = false;
                loginPhone.removeAttribute('required');
                loginPhone.disabled = true;
            }
            if (loginPassword) {
                loginPassword.required = false;
                loginPassword.removeAttribute('required');
                loginPassword.disabled = true;
            }
        }
    } else if (selectedType === 'admin') {

        if (adminFields) adminFields.style.display = 'block';
        if (deliveryAgentFields) deliveryAgentFields.style.display = 'none';
        if (agriSpecialistFields) agriSpecialistFields.style.display = 'none';
        if (regularFields) {
            regularFields.style.display = 'none';
            regularFields.classList.remove('login-fields-green', 'login-fields-blue', 'login-fields-orange');
        }

        if (formType === 'login') {

            const loginAdminId = document.getElementById('loginAdminId');
            const loginAdminName = document.getElementById('loginAdminName');
            const loginAdminPhone = document.getElementById('loginAdminPhone');
            const loginAdminPassword = document.getElementById('loginAdminPassword');
            if (loginAdminId) loginAdminId.required = true;
            if (loginAdminName) loginAdminName.required = true;
            if (loginAdminPhone) loginAdminPhone.required = true;
            if (loginAdminPassword) loginAdminPassword.required = true;

            const loginName = document.getElementById('loginName');
            const loginPhone = document.getElementById('loginPhone');
            const loginPassword = document.getElementById('loginPassword');
            if (loginName) {
                loginName.required = false;
                loginName.removeAttribute('required');
            }
            if (loginPhone) {
                loginPhone.required = false;
                loginPhone.removeAttribute('required');
            }
            if (loginPassword) {
                loginPassword.required = false;
                loginPassword.removeAttribute('required');
            }

            const loginAgentName = document.getElementById('loginAgentName');
            const loginAgentPhone = document.getElementById('loginAgentPhone');
            const loginAgentPassword = document.getElementById('loginAgentPassword');
            if (loginAgentName) {
                loginAgentName.required = false;
                loginAgentName.removeAttribute('required');
            }
            if (loginAgentPhone) {
                loginAgentPhone.required = false;
                loginAgentPhone.removeAttribute('required');
            }
            if (loginAgentPassword) {
                loginAgentPassword.required = false;
                loginAgentPassword.removeAttribute('required');
            }
        } else {

            const regAdminId = document.getElementById('regAdminId');
            const regAdminName = document.getElementById('regAdminName');
            const regAdminEmail = document.getElementById('regAdminEmail');
            const regAdminPassword = document.getElementById('regAdminPassword');
            const regAdminDepartment = document.getElementById('regAdminDepartment');
            const regAdminRole = document.getElementById('regAdminRole');
            if (regAdminId) regAdminId.required = true;
            if (regAdminName) regAdminName.required = true;
            if (regAdminEmail) regAdminEmail.required = true;
            if (regAdminPassword) regAdminPassword.required = true;
            if (regAdminDepartment) regAdminDepartment.required = true;
            if (regAdminRole) regAdminRole.required = true;

            const regName = document.getElementById('regName');
            const regPhone = document.getElementById('regPhone');
            const regPassword = document.getElementById('regPassword');
            if (regName) regName.required = false;
            if (regPhone) regPhone.required = false;
            if (regPassword) regPassword.required = false;
        }
    } else if (selectedType === 'agri_specialist') {

        if (agriSpecialistFields) agriSpecialistFields.style.display = 'block';
        if (adminFields) adminFields.style.display = 'none';
        if (deliveryAgentFields) deliveryAgentFields.style.display = 'none';
        if (regularFields) {
            regularFields.style.display = 'none';
            regularFields.classList.remove('login-fields-green', 'login-fields-blue', 'login-fields-orange');
        }

        if (formType === 'login') {

            const loginAgriName = document.getElementById('loginAgriName');
            const loginAgriPhone = document.getElementById('loginAgriPhone');
            const loginAgriPassword = document.getElementById('loginAgriPassword');
            if (loginAgriName) {
                loginAgriName.disabled = false;
                loginAgriName.setAttribute('required', 'required');
            }
            if (loginAgriPhone) {
                loginAgriPhone.disabled = false;
                loginAgriPhone.setAttribute('required', 'required');
            }
            if (loginAgriPassword) {
                loginAgriPassword.disabled = false;
                loginAgriPassword.setAttribute('required', 'required');
            }

            const loginName = document.getElementById('loginName');
            const loginPhone = document.getElementById('loginPhone');
            const loginPassword = document.getElementById('loginPassword');
            const loginAdminId = document.getElementById('loginAdminId');
            const loginAdminName = document.getElementById('loginAdminName');
            const loginAdminPhone = document.getElementById('loginAdminPhone');
            const loginAdminPassword = document.getElementById('loginAdminPassword');
            const loginAgentName = document.getElementById('loginAgentName');
            const loginAgentPhone = document.getElementById('loginAgentPhone');
            const loginAgentPassword = document.getElementById('loginAgentPassword');

            [loginName, loginPhone, loginPassword,
                loginAdminId, loginAdminName, loginAdminPhone, loginAdminPassword,
                loginAgentName, loginAgentPhone, loginAgentPassword].forEach(field => {
                    if (field) {
                        field.disabled = true;
                        field.removeAttribute('required');
                    }
                });
        }
    } else {

        if (adminFields) adminFields.style.display = 'none';
        if (deliveryAgentFields) deliveryAgentFields.style.display = 'none';
        if (agriSpecialistFields) agriSpecialistFields.style.display = 'none';
        if (regularFields) {
            regularFields.style.display = 'block';

            regularFields.classList.remove('login-fields-green', 'login-fields-blue', 'login-fields-orange');
            regularFields.classList.add('login-fields-green');
        }

        if (formType === 'login') {
            const loginName = document.getElementById('loginName');
            const loginPhone = document.getElementById('loginPhone');
            const loginPassword = document.getElementById('loginPassword');
            if (loginName) {
                loginName.disabled = false;
                loginName.setAttribute('required', 'required');
            }
            if (loginPhone) {
                loginPhone.disabled = false;
                loginPhone.setAttribute('required', 'required');
            }
            if (loginPassword) {
                loginPassword.disabled = false;
                loginPassword.setAttribute('required', 'required');
            }

            const loginAdminId = document.getElementById('loginAdminId');
            const loginAdminName = document.getElementById('loginAdminName');
            const loginAdminPhone = document.getElementById('loginAdminPhone');
            const loginAdminPassword = document.getElementById('loginAdminPassword');
            const loginAgentName = document.getElementById('loginAgentName');
            const loginAgentPhone = document.getElementById('loginAgentPhone');
            const loginAgentPassword = document.getElementById('loginAgentPassword');
            const loginAgriName = document.getElementById('loginAgriName');
            const loginAgriPhone = document.getElementById('loginAgriPhone');
            const loginAgriPassword = document.getElementById('loginAgriPassword');

            [loginAdminId, loginAdminName, loginAdminPhone, loginAdminPassword,
                loginAgentName, loginAgentPhone, loginAgentPassword,
                loginAgriName, loginAgriPhone, loginAgriPassword].forEach(field => {
                    if (field) {
                        field.disabled = true;
                        field.removeAttribute('required');
                    }
                });
        }

        if (formType === 'login') {

            const loginPhone = document.getElementById('loginPhone');
            const loginPassword = document.getElementById('loginPassword');
            if (loginPhone) loginPhone.required = true;
            if (loginPassword) loginPassword.required = true;

            const loginAdminId = document.getElementById('loginAdminId');
            const loginAdminName = document.getElementById('loginAdminName');
            const loginAdminPhone = document.getElementById('loginAdminPhone');
            const loginAdminPassword = document.getElementById('loginAdminPassword');
            if (loginAdminId) loginAdminId.required = false;
            if (loginAdminName) loginAdminName.required = false;
            if (loginAdminPhone) loginAdminPhone.required = false;
            if (loginAdminPassword) loginAdminPassword.required = false;
        } else {

            const regName = document.getElementById('regName');
            const regPhone = document.getElementById('regPhone');
            const regPassword = document.getElementById('regPassword');
            if (regName) regName.required = true;
            if (regPhone) regPhone.required = true;
            if (regPassword) regPassword.required = true;

            const regAdminId = document.getElementById('regAdminId');
            const regAdminName = document.getElementById('regAdminName');
            const regAdminEmail = document.getElementById('regAdminEmail');
            const regAdminPassword = document.getElementById('regAdminPassword');
            const regAdminDepartment = document.getElementById('regAdminDepartment');
            const regAdminRole = document.getElementById('regAdminRole');
            if (regAdminId) regAdminId.required = false;
            if (regAdminName) regAdminName.required = false;
            if (regAdminEmail) regAdminEmail.required = false;
            if (regAdminPassword) regAdminPassword.required = false;
            if (regAdminDepartment) regAdminDepartment.required = false;
            if (regAdminRole) regAdminRole.required = false;
        }
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function setActiveTab(tab) {

    if (AppState.activeTab !== tab) {
        AppState.navigationHistory.push(AppState.activeTab);

        if (AppState.navigationHistory.length > 10) {
            AppState.navigationHistory.shift();
        }
    }

    if (AppState.activeTab !== 'orderdetails' && AppState.activeTab !== 'orderfeedback') {
        AppState.previousTab = AppState.activeTab;
    }

    const nextState = {
        activeTab: tab,
        showOrderDetails: false,
        showOrderFeedback: false,
        showOrderTracking: false
    };

    if (tab === 'addresses' && typeof loadAddressesFromBackend === 'function') {
        loadAddressesFromBackend().then(() => {
            setState(nextState);
        });
        return;
    }

    setState(nextState);

    if (tab === 'orders' && typeof ensureOrdersLoaded === 'function') {
        ensureOrdersLoaded();
    }
}

function goBack() {

    if (AppState.activeTab === 'orders' && AppState.navigationHistory.length > 0 &&
        (AppState.navigationHistory[AppState.navigationHistory.length - 1] === 'payment' ||
            AppState.navigationHistory[AppState.navigationHistory.length - 1] === 'ordersummary')) {

        AppState.navigationHistory = ['marketplace'];
        AppState.activeTab = 'marketplace';
        setState({
            activeTab: 'marketplace',
            navigationHistory: AppState.navigationHistory,
            showOrderDetails: false,
            showOrderTracking: false,
            showOrderFeedback: false
        });
        return;
    }

    if (AppState.navigationHistory.length > 0) {
        const previousPage = AppState.navigationHistory.pop();
        AppState.activeTab = previousPage;
        setState({
            activeTab: previousPage,
            navigationHistory: AppState.navigationHistory,
            showOrderDetails: false,
            showOrderTracking: false,
            showOrderFeedback: false
        });
    } else {

        AppState.navigationHistory = ['marketplace'];
        AppState.activeTab = 'marketplace';
        setState({
            activeTab: 'marketplace',
            navigationHistory: AppState.navigationHistory,
            showOrderDetails: false,
            showOrderTracking: false,
            showOrderFeedback: false
        });
    }
}

async function openModal(modalName) {
    if (modalName === 'settings' && typeof openAccountSettings === 'function') {
        await openAccountSettings();
        return;
    }

    const modalStates = {
        cart: 'showCart',
        login: 'showLoginModal',
        register: 'showRegisterModal',
        forgotPassword: 'showForgotPasswordModal',
        profile: 'showProfileModal',
        settings: 'showAccountSettings',
        addProduct: 'showAddProductModal',
        editProduct: 'showEditProductModal',
        productDetails: 'showProductDetails',
        language: 'showLanguageSelector'
    };

    const modalId = modalName === 'productDetails' ? 'productDetailsModal' :
        modalName === 'cart' ? 'cartSidebar' : modalName;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }

    if (modalStates[modalName]) {
        setState({ [modalStates[modalName]]: true });
    }
}

function closeModal(modalName) {
    console.log('Closing modal:', modalName);
    const modalStates = {
        cart: 'showCart',
        login: 'showLoginModal',
        register: 'showRegisterModal',
        forgotPassword: 'showForgotPasswordModal',
        profile: 'showProfileModal',
        settings: 'showAccountSettings',
        addProduct: 'showAddProductModal',
        editProduct: 'showEditProductModal',
        productDetails: 'showProductDetails',
        language: 'showLanguageSelector'
    };

    const modalId = modalName === 'productDetails' ? 'productDetailsModal' :
        modalName === 'cart' ? 'cartSidebar' : modalName;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        console.log(`Removed active class from ${modalId}`);
    }

    if (modalStates[modalName]) {
        setState({ [modalStates[modalName]]: false });
    }
}

function renderToasts() {
    const container = document.getElementById('toastContainer');
    if (!container) {

        return;
    }
    container.innerHTML = AppState.toasts.map(toast => `
        <div class="toast ${toast.type}">
            <span>${toast.message}</span>
        </div>
    `).join('');
}

function renderApp() {

    const app = document.getElementById('app');

    if (!app) {
        return;
    }
    if (AppState.theme === 'dark') {
        app.classList.add('dark-theme');
    } else {
        app.classList.remove('dark-theme');
    }

    renderHeader();
    renderCheckoutStepper();
    renderMainContent();
    renderFooter();
    renderCartSidebar();
    renderLoginModal();
    renderRegisterModal();
    renderForgotPasswordModal();
    renderLanguageSelector();
    renderAccountSettings();
    renderProfileModal();
    renderAddProductModal();
    renderEditProductModal();
    renderAddAddressModal();
    renderProductQuickView();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    if (AppState.activeTab === 'marketplace') {
        setTimeout(() => setupMarketplaceFilters(), 100);
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    const storedRole = localStorage.getItem('role');
    const storedUserName = localStorage.getItem('user_name');
    const storedUserId = localStorage.getItem('user_id');

    if (storedRole && storedUserId) {
        const storedPhone = localStorage.getItem('phone_no') || localStorage.getItem('user_phone') || '';
        AppState.isLoggedIn = true;
        AppState.userType = storedRole === 'farmer' ? 'farmer' : storedRole === 'customer' ? 'customer' : storedRole;
        AppState.userProfile = {
            fullName: storedUserName || '',
            phone: storedPhone,
            userType: storedRole,
        };

        if (storedRole === 'farmer') {
            AppState.activeTab = 'weather';
            AppState.previousTab = 'marketplace';
            AppState.navigationHistory = ['marketplace', 'weather'];
        }

        if (typeof loadAddressesFromBackend === 'function') {
            await loadAddressesFromBackend();
        }
    }

    renderApp();
});

function handleContactSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const question = document.getElementById('contactQuestion').value;

    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactQuestion').value = '';

    showToast('Your message has been sent successfully! We\'ll get back to you within 24 hours.', 'success');
}

function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formattedValue;
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

function selectPaymentMethod(method) {
    showToast(`Selected payment method: ${method.toUpperCase()}`, 'success');

    AppState.selectedPaymentMethod = method;
}

function viewOrderDetails(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (order) {
        setState({
            selectedOrder: order,
            showOrderDetails: true,
            activeTab: 'orders'
        });
    }
}

function trackOrder(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (order) {
        setState({
            selectedOrder: order,
            showOrderTracking: true,
            activeTab: 'orders'
        });
    }
}
