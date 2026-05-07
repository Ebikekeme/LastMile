const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// ── Register all models ────────────────────────────────
require("./models/Rider");
require("./models/TrikeFleet");

const dispatchRoutes = require("./routes/dispatch");

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());

// ── DB connection ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Dispatch service connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ── Health check ───────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "dispatch-service", timestamp: new Date() });
});

// ── Routes ─────────────────────────────────────────────
app.use("/", dispatchRoutes);

// ── 404 fallback ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Dispatch service running on port ${PORT}`);
});