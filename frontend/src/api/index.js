import axios from "axios";

const API = axios.create({
  baseURL: "https://lastmile-0grf.onrender.com",
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Orders
export const getOrders = () => API.get("/api/orders");
export const getOrder = (id) => API.get(`/api/orders/${id}`);
export const getOrderByTracking = (trackingNumber) => API.get(`/api/orders/track/${trackingNumber}`);
export const createOrder = (data) => API.post("/api/orders", data);
export const updateOrderStatus = (id, data) => API.patch(`/api/orders/${id}/status`, data);
export const deleteOrder = (id) => API.delete(`/api/orders/${id}`);

// Dispatch
export const getRiders = () => API.get("/api/dispatch/riders");
export const getAvailableRiders = () => API.get("/api/dispatch/riders/available");
export const getTrikes = () => API.get("/api/dispatch/trikes");
export const getAvailableTrikes = () => API.get("/api/dispatch/trikes/available");
export const assignOrder = (data) => API.post("/api/dispatch/assign", data);
export const completeDelivery = (data) => API.post("/api/dispatch/complete", data);

// Tracking
// Tracking
export const getRiderLocation = (riderId) =>
  axios.get(`https://lastmile-tracking-service.onrender.com/${riderId}/location`);
export const getAllLocations = () =>
  axios.get("https://lastmile-tracking-service.onrender.com/live/all");
export const updateLocation = (riderId, data) =>
  axios.patch(`https://lastmile-tracking-service.onrender.com/${riderId}/location`, data);

// Auth
export const login = (data) => API.post("/api/auth/login", data);
export const register = (data) => API.post("/api/auth/register", data);
export const getMe = () => API.get("/api/auth/me");

export default API;