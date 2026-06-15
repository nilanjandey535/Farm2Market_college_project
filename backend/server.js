// server.js
const express = require("express");
const cors = require("cors");
const pool = require("./db");
console.log("Database pool initialized");

const registerRoutes = require("./routes/register");
console.log("Register routes loaded");

const loginRoutes = require("./routes/login");
console.log("Login routes loaded");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "*" }));
app.use(express.json());
console.log("Middlewares configured");

console.log("Loading register routes");
app.use("/api/register", require("./routes/register"));
console.log("Register routes mounted");

console.log("Loading login routes");
app.use("/api/login", require("./routes/login"));
console.log("Login routes mounted");

console.log("Loading forgot password routes");
app.use("/api/forgot-password", require("./routes/forgotPassword"));
console.log("Forgot password routes mounted");

console.log("Loading agri specialist routes");
app.use("/api/agri-specialist", require("./routes/agriSpecialist"));
console.log("Agri specialist routes mounted");

console.log("Loading cold storage routes");
app.use("/api/cold-storage", require("./routes/coldStorage"));
console.log("Cold storage routes mounted");

console.log("Loading orders routes");
app.use("/api/orders", require("./routes/orders_adapted"));
console.log("Orders routes mounted");

console.log("Loading payment routes");
app.use("/api/payment", require("./routes/payment"));
console.log("Payment routes mounted");

console.log("Loading products routes");
const productRoutes = require("./routes/products");
app.use("/api/products", productRoutes);

app.get("/api/products-check", (req, res) => res.json({ message: "Products base route check OK" }));
console.log("Products routes mounted");

console.log("Loading weather routes");
app.use("/api/weather", require("./routes/weather"));
console.log("Weather routes mounted");

console.log("Loading admin routes");
app.use("/api/admin", require("./routes/admin"));
console.log("Admin routes mounted");

console.log("Loading AI routes");
app.use("/api/ai", require("./routes/ai"));
console.log("AI routes mounted");

console.log("Mounting address route at /api/address");
app.use("/api/address", require("./routes/address"));
console.log("Address route mounted successfully");

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'farm2market', time: new Date().toISOString() });
});
console.log("Health check route defined");

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});
console.log("Test route defined");

app.get('/api/config', (req, res) => {
  res.json({ razorpay_key_id: process.env.RAZORPAY_KEY_ID });
});
console.log("Config route defined");

console.log("Loading delivery agents routes");
app.use("/api/delivery-agents", require("./routes/deliveryAgents"));
console.log("Delivery agents routes mounted");

app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});
console.log("404 handler defined");

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});
console.log("Global error handler defined");
console.log("Resolved register path:", require.resolve("./routes/register"));

app.listen(PORT, () => {
  console.log(`🚀 Farm2Market backend running on http://localhost:${PORT}`);

});
