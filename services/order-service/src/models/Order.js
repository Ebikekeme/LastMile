const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "assigned", "in-transit", "delivered", "cancelled"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: String,
});

const orderSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
    },
    pickup: {
      address: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    dropoff: {
      address: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in-transit", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [statusHistorySchema],
    assignedRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },
    assignedTrike: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrikeFleet",
      default: null,
    },
    package: {
      description: String,
      weight: Number,
      fragile: { type: Boolean, default: false },
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);