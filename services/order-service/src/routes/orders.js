const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

// Generate tracking number
const generateTrackingNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `LM-${year}-${random}`;
};

// GET all orders
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .populate("assignedRider", "name phone zone")
      .populate("assignedTrike", "trikeId plateNumber")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("assignedRider", "name phone zone currentLocation")
      .populate("assignedTrike", "trikeId plateNumber batteryLevel");

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET order by tracking number
router.get("/track/:trackingNumber", async (req, res) => {
  try {
    const order = await Order.findOne({
      trackingNumber: req.params.trackingNumber,
    })
      .populate("assignedRider", "name phone")
      .populate("assignedTrike", "trikeId plateNumber");

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create order
router.post("/", async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      trackingNumber: generateTrackingNumber(),
      statusHistory: [{ status: "pending", note: "Order created" }],
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update order status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    order.statusHistory.push({ status, note, timestamp: new Date() });

    if (status === "delivered") {
      order.actualDelivery = new Date();
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH assign rider and trike to order
router.patch("/:id/assign", async (req, res) => {
  try {
    const { riderId, trikeId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        assignedRider: riderId,
        assignedTrike: trikeId,
        status: "assigned",
        $push: {
          statusHistory: {
            status: "assigned",
            note: "Rider and trike assigned",
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate("assignedRider", "name phone zone")
      .populate("assignedTrike", "trikeId plateNumber");

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;