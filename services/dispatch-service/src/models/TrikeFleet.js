const mongoose = require("mongoose");

const trikeFleetSchema = new mongoose.Schema(
  {
    trikeId: {
      type: String,
      required: true,
      unique: true,
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["available", "in-use", "maintenance"],
      default: "available",
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    maxPayload: {
      type: Number,
      default: 150,
    },
    currentRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },
    zone: {
      type: String,
      enum: ["Lagos Island", "Lagos Mainland", "Lekki", "Ikeja", "Surulere"],
      required: true,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    lastMaintenance: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrikeFleet", trikeFleetSchema);