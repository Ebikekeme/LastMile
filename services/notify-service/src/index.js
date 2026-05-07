const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const notifyRoutes = require("./routes/notify");

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

// ── DB connection ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Notify service connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ── Health check ───────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "notify-service", timestamp: new Date() });
});

// ── Routes ─────────────────────────────────────────────
app.use("/", notifyRoutes);

// ── 404 fallback ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Notify service running on port ${PORT}`);
});