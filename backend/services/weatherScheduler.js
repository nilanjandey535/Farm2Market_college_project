// backend/services/weatherScheduler.js

const cron = require("node-cron");
const axios = require("axios");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000";

const weatherJob = cron.schedule("0 * * * *", async () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled weather data collection...`);

    try {
        const response = await axios.post(`${API_BASE_URL}/api/weather/collect-all`);
        console.log(`[${new Date().toISOString()}] Weather data collection completed:`, response.data);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in scheduled weather collection:`, error.message);
    }
}, {
    scheduled: false,
    timezone: "Asia/Kolkata"
});

function startWeatherScheduler() {
    weatherJob.start();
    console.log("✅ Weather data scheduler started (runs every hour)");
}

function stopWeatherScheduler() {
    weatherJob.stop();
    console.log("⏸️ Weather data scheduler stopped");
}

module.exports = {
    startWeatherScheduler,
    stopWeatherScheduler,
    weatherJob
};
