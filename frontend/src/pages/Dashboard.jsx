import { useState, useEffect } from "react";
import { getOrders, getAvailableRiders, getAvailableTrikes } from "../api";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: { backgroundColor: "#fef9ec", color: "#b45309", border: "1px solid #fcd34d" },
    assigned: { backgroundColor: "#eff6ff", color: "#1a3a8f", border: "1px solid #bfdbfe" },
    "in-transit": { backgroundColor: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" },
    delivered: { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
    cancelled: { backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  };

  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium" style={styles[status]}>
      {status}
    </span>
  );
};

const StatCard = ({ label, value, icon, accent }) => (
  <div className="stripe-card p-6">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ backgroundColor: accent + "15" }}>
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold" style={{ color: "#1a3a8f" }}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [availableTrikes, setAvailableTrikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, ridersRes, trikesRes] = await Promise.all([
          getOrders(),
          getAvailableRiders(),
          getAvailableTrikes(),
        ]);
        setOrders(ordersRes.data.orders);
        setAvailableRiders(ridersRes.data);
        setAvailableTrikes(trikesRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const inTransitOrders = orders.filter((o) => o.status === "in-transit").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-3"
            style={{ borderTopColor: "#1a3a8f" }} />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: "#1a3a8f" }}>Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Orders" value={orders.length} icon="📦" accent="#1a3a8f" />
        <StatCard label="Pending" value={pendingOrders} icon="⏳" accent="#f0b429" />
        <StatCard label="In Transit" value={inTransitOrders} icon="🛺" accent="#7c3aed" />
        <StatCard label="Delivered" value={deliveredOrders} icon="✅" accent="#16a34a" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Available Riders" value={availableRiders.length} icon="👤" accent="#1a3a8f" />
        <StatCard label="Available Trikes" value={availableTrikes.length} icon="⚡" accent="#f0b429" />
      </div>

      {/* Recent Orders */}
      <div className="stripe-card overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: "#1a3a8f" }}>Recent Orders</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {orders.length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f7f8fc" }}>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tracking #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Dropoff</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-sm font-semibold" style={{ color: "#1a3a8f" }}>
                    {order.trackingNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{order.customer.name}</p>
                    <p className="text-gray-400 text-xs">{order.customer.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{order.pickup.address}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{order.dropoff.address}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-400 font-medium">No orders yet</p>
              <p className="text-gray-300 text-sm">Create your first order to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}