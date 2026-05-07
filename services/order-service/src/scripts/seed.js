const mongoose = require("mongoose");
const Rider = require("../models/Rider");
const TrikeFleet = require("../models/TrikeFleet");
const Order = require("../models/Order");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://admin:secret@localhost:27017/lastmile?authSource=admin";

const riders = [
  {
    name: "Emeka Okafor",
    phone: "+2348011111111",
    email: "emeka@lastmile.com",
    zone: "Lagos Island",
    isAvailable: true,
    currentLocation: { lat: 6.4541, lng: 3.3947 },
    rating: 4.8,
  },
  {
    name: "Chidi Nwosu",
    phone: "+2348022222222",
    email: "chidi@lastmile.com",
    zone: "Lekki",
    isAvailable: true,
    currentLocation: { lat: 6.4698, lng: 3.5852 },
    rating: 4.9,
  },
  {
    name: "Tunde Bakare",
    phone: "+2348033333333",
    email: "tunde@lastmile.com",
    zone: "Ikeja",
    isAvailable: false,
    currentLocation: { lat: 6.6018, lng: 3.3515 },
    rating: 4.7,
  },
  {
    name: "Bola Adeyemi",
    phone: "+2348044444444",
    email: "bola@lastmile.com",
    zone: "Surulere",
    isAvailable: true,
    currentLocation: { lat: 6.5022, lng: 3.3603 },
    rating: 4.6,
  },
  {
    name: "Kelechi Eze",
    phone: "+2348055555555",
    email: "kelechi@lastmile.com",
    zone: "Lagos Mainland",
    isAvailable: true,
    currentLocation: { lat: 6.5244, lng: 3.3792 },
    rating: 4.9,
  },
];

const trikes = [
  {
    trikeId: "TRK-001",
    plateNumber: "LG-001-AA",
    status: "available",
    batteryLevel: 95,
    zone: "Lagos Island",
    maxPayload: 150,
  },
  {
    trikeId: "TRK-002",
    plateNumber: "LG-002-AA",
    status: "available",
    batteryLevel: 80,
    zone: "Lekki",
    maxPayload: 150,
  },
  {
    trikeId: "TRK-003",
    plateNumber: "LG-003-AA",
    status: "in-use",
    batteryLevel: 60,
    zone: "Ikeja",
    maxPayload: 150,
  },
  {
    trikeId: "TRK-004",
    plateNumber: "LG-004-AA",
    status: "available",
    batteryLevel: 100,
    zone: "Surulere",
    maxPayload: 150,
  },
  {
    trikeId: "TRK-005",
    plateNumber: "LG-005-AA",
    status: "maintenance",
    batteryLevel: 20,
    zone: "Lagos Mainland",
    maxPayload: 150,
  },
];

const orders = [
  {
    trackingNumber: "LM-2024-001",
    customer: { name: "Ada Obi", phone: "+2348066666666", email: "ada@gmail.com" },
    pickup: { address: "15 Broad Street, Lagos Island", coordinates: { lat: 6.4541, lng: 3.3947 } },
    dropoff: { address: "22 Admiralty Way, Lekki Phase 1", coordinates: { lat: 6.4698, lng: 3.5852 } },
    status: "pending",
    package: { description: "Electronics", weight: 2.5, fragile: true },
    statusHistory: [{ status: "pending", note: "Order created" }],
  },
  {
    trackingNumber: "LM-2024-002",
    customer: { name: "Seun Martins", phone: "+2348077777777", email: "seun@gmail.com" },
    pickup: { address: "5 Allen Avenue, Ikeja", coordinates: { lat: 6.6018, lng: 3.3515 } },
    dropoff: { address: "10 Bode Thomas, Surulere", coordinates: { lat: 6.5022, lng: 3.3603 } },
    status: "pending",
    package: { description: "Clothing", weight: 1.0, fragile: false },
    statusHistory: [{ status: "pending", note: "Order created" }],
  },
  {
    trackingNumber: "LM-2024-003",
    customer: { name: "Ngozi Eze", phone: "+2348088888888", email: "ngozi@gmail.com" },
    pickup: { address: "3 Marina Road, Lagos Island", coordinates: { lat: 6.4541, lng: 3.3947 } },
    dropoff: { address: "45 Opebi Road, Ikeja", coordinates: { lat: 6.6018, lng: 3.3515 } },
    status: "pending",
    package: { description: "Food items", weight: 3.0, fragile: false },
    statusHistory: [{ status: "pending", note: "Order created" }],
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected!");

    // Clear existing data
    await Order.deleteMany({});
    await Rider.deleteMany({});
    await TrikeFleet.deleteMany({});
    console.log("Cleared existing data");

    // Insert new data
    await Rider.insertMany(riders);
    console.log(`Inserted ${riders.length} riders`);

    await TrikeFleet.insertMany(trikes);
    console.log(`Inserted ${trikes.length} trikes`);

    await Order.insertMany(orders);
    console.log(`Inserted ${orders.length} orders`);

    console.log("Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();