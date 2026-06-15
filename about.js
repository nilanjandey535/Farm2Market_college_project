// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

const header = document.getElementById('header');

if (header && navMenu) {
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

function animateCounter(element, target) {
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + '+';
    }, 16);
}

const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            if (entry.target.classList.contains('stat-card')) {
                const numberEl = entry.target.querySelector('.stat-number');
                const targetValue = parseInt(entry.target.getAttribute('data-count'));
                if (numberEl && targetValue) {
                    animateCounter(numberEl, targetValue);
                }
            }

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const animateElements = document.querySelectorAll('.mission-card, .stat-card, .team-card, .impact-card, .testimonial-card');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

const backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        alert('Thank you for your message! We will get back to you soon.');

        contactForm.reset();

        console.log('Form submitted:', formData);
    });
}

const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = newsletterForm.querySelector('input[type="email"]').value;

        alert('Successfully subscribed to newsletter!');

        newsletterForm.reset();

        console.log('Newsletter subscription:', email);
    });
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(255, 255, 255, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        particlesContainer.appendChild(particle);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
        }
        50% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.5);
            opacity: 0.6;
        }
    }
`;
document.head.appendChild(style);

createParticles();

setTimeout(() => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}, 100);

const accountTypeBtns = document.querySelectorAll('.account-type-btn');
const customerForm = document.getElementById('customerRegistrationForm');
const farmerForm = document.getElementById('farmerRegistrationForm');

if (accountTypeBtns.length > 0) {
    accountTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {

            accountTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const type = btn.getAttribute('data-type');
            if (type === 'customer') {
                customerForm.style.display = 'block';
                farmerForm.style.display = 'none';
            } else if (type === 'farmer') {
                customerForm.style.display = 'none';
                farmerForm.style.display = 'block';
            }

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });
}

function showRegistrationSuccess(message, userType) {
    const successDiv = document.getElementById('registrationSuccess');
    const successMessage = document.getElementById('successMessage');

    if (customerForm) customerForm.style.display = 'none';
    if (farmerForm) farmerForm.style.display = 'none';

    successMessage.textContent = message;
    successDiv.style.display = 'block';

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showRegistrationError(message) {
    alert('Registration Failed: ' + message);
}

async function handleRegistrationSubmit(e, formType) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" style="animation: spin 1s linear infinite;"></i> Registering...';

    const spinStyle = document.createElement('style');
    spinStyle.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(spinStyle);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const url = `${window.API_BASE_URL}/register/${formType === 'farmer' ? 'farmer' : 'customer'}`;
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            formType === 'farmer'
                ? {
                    farm_name: data.name,
                    address: '',
                    phone_no: data.phone,
                    password: data.password
                }
                : {
                    customer_name: data.name,
                    address: '',
                    phone_no: data.phone,
                    password: data.password
                }
        )
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Registration failed');
            });
        }
        return response.json();
    })
    .then(result => {
        console.log('Registration successful:', result);
        const message = formType === 'customer'
            ? `Welcome ${result.name}! Your customer account has been created successfully. You can now start shopping for fresh produce.`
            : `Welcome ${result.name}! Your farmer account has been created successfully. You can now start listing your products.`;
        showRegistrationSuccess(message, formType);
        e.target.reset();
    })
    .catch(error => {
        console.error('Registration error:', error);
        showRegistrationError(error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
}

if (customerForm) {
    customerForm.addEventListener('submit', (e) => handleRegistrationSubmit(e, 'customer'));
}

if (farmerForm) {
    farmerForm.addEventListener('submit', (e) => handleRegistrationSubmit(e, 'farmer'));
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginName').value.trim();
    const phone_no = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const role = document.querySelector('input[name="loginUserType"]:checked').value;

    if (!username || !phone_no || !password || !role) {
        alert("⚠️ Please fill in all required fields.");
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                phone_no,
                password,
                role,
                ip_address: window.location.hostname
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ " + data.message);
            console.log("Login successful:", data);

        }
        else if (data.error && data.error.includes("locked")) {

            localStorage.setItem("user_id", data.id || phone_no);
            localStorage.setItem("role", role);
            alert("⚠️ " + data.error);
            window.location.href = "otp.html";
        }
        else {
            alert("❌ " + data.error);
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("⚠️ Server error during login.");
    }
}

console.log('Farm2Market About Page Loaded Successfully!');
console.log('Registration system ready. Backend API:', window.API_BASE_URL);
