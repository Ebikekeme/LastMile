const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      lat: { type: Number, default: 6.5244 },
      lng: { type: Number, default: 3.3792 },
    },
    assignedTrike: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrikeFleet",
      default: null,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    zone: {
      type: String,
      enum: ["Lagos Island", "Lagos Mainland", "Lekki", "Ikeja", "Surulere"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rider", riderSchema);