// Farm2Market global configuration
window.API_BASE_URL = "http://localhost:4000/api";

window.RAZORPAY_KEY_ID = "";
fetch(window.API_BASE_URL + "/config")
    .then(res => res.json())
    .then(data => {
        window.RAZORPAY_KEY_ID = data.razorpay_key_id;
        console.log("Config loaded from backend");
    })
    .catch(err => console.error("Failed to load config:", err));

window.loadRazorpayCheckout = function loadRazorpayCheckout() {
    if (window.Razorpay) return Promise.resolve();
    if (window._razorpayLoadPromise) return window._razorpayLoadPromise;

    window._razorpayLoadPromise = new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = function () { resolve(); };
        script.onerror = function () {
            window._razorpayLoadPromise = null;
            reject(new Error('Failed to load Razorpay checkout'));
        };
        document.head.appendChild(script);
    });

    return window._razorpayLoadPromise;
};
