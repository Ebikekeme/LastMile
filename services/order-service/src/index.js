const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// ── Register all models ────────────────────────────────
require("./models/Order");
require("./models/Rider");
require("./models/TrikeFleet");
require("./models/Route");

const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

// ── DB connection ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Order service connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ── Health check ───────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "order-service", timestamp: new Date() });
});

// ── Routes ─────────────────────────────────────────────
app.use("/", orderRoutes);

// ── 404 fallback ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});