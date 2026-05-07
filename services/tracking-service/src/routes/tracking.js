const express = require("express");
const redis = require("redis");
const Route = require("../models/Route");

const router = express.Router();

let redisClient;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (err) => console.error("Redis error:", err));
    await redisClient.connect();
  }
  return redisClient;
};

// Helper: simulate GPS movement towards destination
const simulateMovement = (current, destination) => {
  const stepSize = 0.001;
  const latDiff = destination.lat - current.lat;
  const lngDiff = destination.lng - current.lng;
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  if (distance < stepSize) return destination;
  return {
    lat: current.lat + (latDiff / distance) * stepSize,
    lng: current.lng + (lngDiff / distance) * stepSize,
  };
};

// GET live location of a rider
router.get("/:riderId/location", async (req, res) => {
  try {
    const client = await getRedisClient();
    const location = await client.get(`rider:${req.params.riderId}:location`);
    if (!location) {
      return res.status(404).json({ error: "No live location found for this rider" });
    }
    res.json(JSON.parse(location));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all live rider locations
router.get("/live/all", async (req, res) => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys("rider:*:location");
    const locations = await Promise.all(
      keys.map(async (key) => {
        const data = await client.get(key);
        return { key, ...JSON.parse(data) };
      })
    );
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update rider location
router.patch("/:riderId/location", async (req, res) => {
  try {
    const client = await getRedisClient();
    const { lat, lng, orderId } = req.body;
    const { riderId } = req.params;

    const locationData = {
      riderId,
      lat,
      lng,
      orderId: orderId || null,
      timestamp: new Date(),
    };

    await client.setEx(
      `rider:${riderId}:location`,
      3600,
      JSON.stringify(locationData)
    );

    res.json({ message: "Location updated", ...locationData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST start a route
router.post("/route/start", async (req, res) => {
  try {
    const client = await getRedisClient();
    const { orderId, riderId, trikeId, startLocation, endLocation } = req.body;

    const route = new Route({
      order: orderId,
      rider: riderId,
      trike: trikeId,
      startLocation,
      endLocation,
      locationHistory: [{ ...startLocation, timestamp: new Date() }],
      status: "active",
    });

    await route.save();

    await client.setEx(
      `rider:${riderId}:location`,
      3600,
      JSON.stringify({
        riderId,
        ...startLocation,
        orderId,
        timestamp: new Date(),
      })
    );

    res.status(201).json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST simulate GPS movement
router.post("/:riderId/simulate", async (req, res) => {
  try {
    const client = await getRedisClient();
    const { riderId } = req.params;
    const { destination } = req.body;

    const locationData = await client.get(`rider:${riderId}:location`);
    if (!locationData) {
      return res.status(404).json({ error: "No active location for this rider" });
    }

    const current = JSON.parse(locationData);
    const newLocation = simulateMovement(
      { lat: current.lat, lng: current.lng },
      destination
    );

    const updated = { ...current, ...newLocation, timestamp: new Date() };
    await client.setEx(
      `rider:${riderId}:location`,
      3600,
      JSON.stringify(updated)
    );

    res.json({ message: "Location simulated", ...updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH complete a route
router.patch("/route/:routeId/complete", async (req, res) => {
  try {
    const client = await getRedisClient();
    const route = await Route.findByIdAndUpdate(
      req.params.routeId,
      { status: "completed", completedAt: new Date() },
      { new: true }
    );

    if (!route) return res.status(404).json({ error: "Route not found" });

    await client.del(`rider:${route.rider}:location`);
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route history for an order
router.get("/route/order/:orderId", async (req, res) => {
  try {
    const route = await Route.findOne({ order: req.params.orderId });
    if (!route) return res.status(404).json({ error: "Route not found" });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;