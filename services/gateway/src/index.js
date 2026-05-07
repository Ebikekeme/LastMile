const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const logger = require("./middleware/logger");

const app = express();
const PORT = process.env.PORT || 4000;

// ── DB connection ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Gateway connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ── Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(logger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// ── Auth routes ────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Health check ───────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "gateway",
    timestamp: new Date(),
    services: {
      orderService: process.env.ORDER_SERVICE_URL,
      dispatchService: process.env.DISPATCH_SERVICE_URL,
      trackingService: process.env.TRACKING_SERVICE_URL,
      notifyService: process.env.NOTIFY_SERVICE_URL,
    },
  });
});

// ── Service proxies ────────────────────────────────────
app.use("/api/orders", createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { "^/api/orders": "" },
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    error: (err, req, res) => {
      console.error("Proxy error to order-service:", err.message);
      res.status(502).json({ error: "Service unavailable" });
    },
  },
}));

app.use("/api/dispatch", createProxyMiddleware({
  target: process.env.DISPATCH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { "^/api/dispatch": "" },
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    error: (err, req, res) => {
      console.error("Proxy error to dispatch-service:", err.message);
      res.status(502).json({ error: "Service unavailable" });
    },
  },
}));

app.use("/api/tracking", createProxyMiddleware({
  target: process.env.TRACKING_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { "^/api/tracking": "" },
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    error: (err, req, res) => {
      console.error("Proxy error to tracking-service:", err.message);
      res.status(502).json({ error: "Service unavailable" });
    },
  },
}));

app.use("/api/notify", createProxyMiddleware({
  target: process.env.NOTIFY_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { "^/api/notify": "" },
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    error: (err, req, res) => {
      console.error("Proxy error to notify-service:", err.message);
      res.status(502).json({ error: "Service unavailable" });
    },
  },
}));

// ── 404 fallback ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});