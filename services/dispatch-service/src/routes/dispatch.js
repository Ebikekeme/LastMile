const express = require("express");
const Rider = require("../models/Rider");
const TrikeFleet = require("../models/TrikeFleet");
const axios = require("axios");

const router = express.Router();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://order-service:4001";

// GET all riders
router.get("/riders", async (req, res) => {
  try {
    const riders = await Rider.find().populate("assignedTrike");
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET available riders
router.get("/riders/available", async (req, res) => {
  try {
    const riders = await Rider.find({ isAvailable: true }).populate("assignedTrike");
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all trikes
router.get("/trikes", async (req, res) => {
  try {
    const trikes = await TrikeFleet.find().populate("currentRider");
    res.json(trikes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET available trikes
router.get("/trikes/available", async (req, res) => {
  try {
    const trikes = await TrikeFleet.find({ status: "available" });
    res.json(trikes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST assign order to nearest available rider and trike
router.post("/assign", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    // Find available rider
    const rider = await Rider.findOne({ isAvailable: true });
    if (!rider) {
      return res.status(404).json({ error: "No available riders at the moment" });
    }

    // Find available trike in same zone
    let trike = await TrikeFleet.findOne({
      status: "available",
      zone: rider.zone,
    });

    // If no trike in same zone, find any available trike
    if (!trike) {
      trike = await TrikeFleet.findOne({ status: "available" });
    }

    if (!trike) {
      return res.status(404).json({ error: "No available trikes at the moment" });
    }

    // Update rider availability
    rider.isAvailable = false;
    rider.assignedTrike = trike._id;
    await rider.save();

    // Update trike status
    trike.status = "in-use";
    trike.currentRider = rider._id;
    trike.totalTrips += 1;
    await trike.save();

    // Update order via order service
    await axios.patch(`${ORDER_SERVICE_URL}/${orderId}/assign`, {
      riderId: rider._id,
      trikeId: trike._id,
    });

    res.json({
      message: "Order assigned successfully",
      rider: {
        id: rider._id,
        name: rider.name,
        phone: rider.phone,
        zone: rider.zone,
      },
      trike: {
        id: trike._id,
        trikeId: trike.trikeId,
        plateNumber: trike.plateNumber,
        batteryLevel: trike.batteryLevel,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST complete delivery - free up rider and trike
router.post("/complete", async (req, res) => {
  try {
    const { riderId, trikeId } = req.body;

    // Free up rider
    await Rider.findByIdAndUpdate(riderId, {
      isAvailable: true,
      assignedTrike: null,
      $inc: { totalDeliveries: 1 },
    });

    // Free up trike
    await TrikeFleet.findByIdAndUpdate(trikeId, {
      status: "available",
      currentRider: null,
    });

    res.json({ message: "Delivery completed, rider and trike are now available" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;