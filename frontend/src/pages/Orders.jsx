import { useState, useEffect } from "react";
import { getOrders, createOrder, assignOrder, updateOrderStatus, deleteOrder } from "../api";

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

const emptyForm = {
  customer: { name: "", phone: "", email: "" },
  pickup: { address: "", coordinates: { lat: 6.5244, lng: 3.3792 } },
  dropoff: { address: "", coordinates: { lat: 6.5244, lng: 3.3792 } },
  package: { description: "", weight: "", fragile: false },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createOrder(form);
      setShowForm(false);
      setForm(emptyForm);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (orderId) => {
    try {
      await assignOrder({ orderId });
      fetchOrders();
      alert("Order assigned successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to assign order");
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status, note: `Status updated to ${status}` });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-3"
            style={{ borderTopColor: "#1a3a8f" }} />
          <p className="text-gray-400 text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a3a8f" }}>Orders</h2>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: showForm ? "#6b7280" : "#1a3a8f" }}
        >
          {showForm ? "✕ Cancel" : "+ New Order"}
        </button>
      </div>

      {/* Create Order Form */}
      {showForm && (
        <div className="stripe-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#f0b429" }}>
              <span className="text-white text-sm">📦</span>
            </div>
            <h3 className="font-semibold" style={{ color: "#1a3a8f" }}>Create New Order</h3>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Customer Name", key: "name", parent: "customer", type: "text", required: true },
              { label: "Customer Phone", key: "phone", parent: "customer", type: "text", required: true },
              { label: "Customer Email", key: "email", parent: "customer", type: "email", required: false },
              { label: "Package Description", key: "description", parent: "package", type: "text", required: false },
            ].map(({ label, key, parent, type, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">{label}</label>
                <input
                  type={type}
                  required={required}
                  value={form[parent][key]}
                  onChange={(e) => setForm({ ...form, [parent]: { ...form[parent], [key]: e.target.value } })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Pickup Address</label>
              <input
                type="text"
                required
                value={form.pickup.address}
                onChange={(e) => setForm({ ...form, pickup: { ...form.pickup, address: e.target.value } })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Dropoff Address</label>
              <input
                type="text"
                required
                value={form.dropoff.address}
                onChange={(e) => setForm({ ...form, dropoff: { ...form.dropoff, address: e.target.value } })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Weight (kg)</label>
              <input
                type="number"
                value={form.package.weight}
                onChange={(e) => setForm({ ...form, package: { ...form.package, weight: e.target.value } })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#1a3a8f" }}
              >
                {submitting ? "Creating..." : "Create Order →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders Table */}
      <div className="stripe-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f7f8fc" }}>
                {["Tracking #", "Customer", "Pickup", "Dropoff", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono font-semibold text-sm" style={{ color: "#1a3a8f" }}>
                    {order.trackingNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{order.customer.name}</p>
                    <p className="text-gray-400 text-xs">{order.customer.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{order.pickup.address}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{order.dropoff.address}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleAssign(order._id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
                          style={{ backgroundColor: "#eff6ff", color: "#1a3a8f" }}
                        >
                          Assign
                        </button>
                      )}
                      {order.status === "assigned" && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, "in-transit")}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
                          style={{ backgroundColor: "#f5f3ff", color: "#6d28d9" }}
                        >
                          Start Transit
                        </button>
                      )}
                      {order.status === "in-transit" && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, "delivered")}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
                          style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
                        >
                          Mark Delivered
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
                        style={{ backgroundColor: "#fef2f2", color: "#991b1b" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-400 font-medium">No orders yet</p>
              <p className="text-gray-300 text-sm mt-1">Click "New Order" to create your first delivery</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}