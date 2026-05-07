const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Mock transporter (no real email needed for demo)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "demo@ethereal.email",
    pass: "demo",
  },
});

// In-memory notification log
const notifications = [];

// Helper: log notification
const logNotification = (type, recipient, message, orderId) => {
  const notification = {
    id: Date.now().toString(),
    type,
    recipient,
    message,
    orderId: orderId || null,
    status: "sent",
    timestamp: new Date(),
  };
  notifications.push(notification);
  console.log(`[NOTIFY] ${type} to ${recipient}: ${message}`);
  return notification;
};

// GET all notifications
router.get("/", (req, res) => {
  res.json({
    notifications: notifications.slice(-50).reverse(),
    total: notifications.length,
  });
});

// POST send order status notification
router.post("/order-status", (req, res) => {
  try {
    const { orderId, trackingNumber, status, customerName, customerPhone, customerEmail } = req.body;

    const messages = {
      pending: `Your order ${trackingNumber} has been received and is pending assignment.`,
      assigned: `Great news! Your order ${trackingNumber} has been assigned to a rider.`,
      "in-transit": `Your order ${trackingNumber} is on its way! Your rider is heading to you.`,
      delivered: `Your order ${trackingNumber} has been delivered successfully. Thank you!`,
      cancelled: `Your order ${trackingNumber} has been cancelled.`,
    };

    const message = messages[status] || `Your order ${trackingNumber} status has been updated to ${status}.`;

    // Log SMS notification
    const smsNotification = logNotification("SMS", customerPhone, message, orderId);

    // Log email notification if email provided
    let emailNotification = null;
    if (customerEmail) {
      emailNotification = logNotification("EMAIL", customerEmail, message, orderId);
    }

    res.json({
      message: "Notifications sent successfully",
      sms: smsNotification,
      email: emailNotification,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send custom notification
router.post("/send", (req, res) => {
  try {
    const { type, recipient, message, orderId } = req.body;

    if (!type || !recipient || !message) {
      return res.status(400).json({ error: "type, recipient and message are required" });
    }

    const notification = logNotification(type, recipient, message, orderId);
    res.json({ message: "Notification sent", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send bulk notifications
router.post("/bulk", (req, res) => {
  try {
    const { notifications: bulkNotifications } = req.body;

    if (!Array.isArray(bulkNotifications)) {
      return res.status(400).json({ error: "notifications must be an array" });
    }

    const results = bulkNotifications.map(({ type, recipient, message, orderId }) =>
      logNotification(type, recipient, message, orderId)
    );

    res.json({ message: `${results.length} notifications sent`, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE clear notifications log
router.delete("/clear", (req, res) => {
  notifications.length = 0;
  res.json({ message: "Notifications log cleared" });
});

module.exports = router;