const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const mongoose = require("mongoose");
const { getJwtSecret } = require("./utils/jwtSecret");

// Route imports
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const merchandiseRoutes = require("./routes/merchandiseRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
// Database connection is established before accepting traffic.

// ─── Middleware ───────────────────────────────────────────────────────────────
// Only explicitly configured browser origins may access the API.
// The frontend uses Bearer tokens, not cross-site cookies.
const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
}));
app.use(express.json({ limit: '100kb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "PLAN-Z API running", status: "ok" });
});
app.get("/healthz", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? "ok" : "database_unavailable" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/merchandise", merchandiseRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CLIENT_ORIGIN) throw new Error('CLIENT_ORIGIN must be configured in production');
    // Fail early if the mandatory production signing secret is absent.
    getJwtSecret();
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('PLAN-Z startup failed:', error.message);
  process.exit(1);
});