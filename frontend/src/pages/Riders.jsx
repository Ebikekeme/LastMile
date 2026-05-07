import { useState, useEffect } from "react";
import { getRiders, getTrikes } from "../api";

const AvailabilityBadge = ({ isAvailable }) => (
  <span
    className="px-3 py-1 rounded-full text-xs font-medium"
    style={
      isAvailable
        ? { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }
        : { backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
    }
  >
    {isAvailable ? "✓ Available" : "On Delivery"}
  </span>
);

const TrikeStatusBadge = ({ status }) => {
  const styles = {
    available: { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
    "in-use": { backgroundColor: "#eff6ff", color: "#1a3a8f", border: "1px solid #bfdbfe" },
    maintenance: { backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  };
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium" style={styles[status]}>
      {status}
    </span>
  );
};

export default function Riders() {
  const [riders, setRiders] = useState([]);
  const [trikes, setTrikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("riders");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ridersRes, trikesRes] = await Promise.all([getRiders(), getTrikes()]);
        setRiders(ridersRes.data);
        setTrikes(trikesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-3"
            style={{ borderTopColor: "#1a3a8f" }} />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: "#1a3a8f" }}>Riders & Fleet</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your riders and electric trike fleet</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Riders", value: riders.length, icon: "👤" },
          { label: "Available Riders", value: riders.filter(r => r.isAvailable).length, icon: "✅" },
          { label: "Total Trikes", value: trikes.length, icon: "⚡" },
          { label: "Available Trikes", value: trikes.filter(t => t.status === "available").length, icon: "🛺" },
        ].map((stat) => (
          <div key={stat.label} className="stripe-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "#1a3a8f" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "riders", label: `Riders (${riders.length})` },
          { id: "trikes", label: `Trikes (${trikes.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            style={
              activeTab === tab.id
                ? { backgroundColor: "#1a3a8f", color: "white" }
                : { backgroundColor: "white", color: "#6b7280", border: "1px solid #e5e7eb" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Riders Table */}
      {activeTab === "riders" && (
        <div className="stripe-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f7f8fc" }}>
                  {["Rider", "Phone", "Zone", "Rating", "Deliveries", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {riders.map((rider) => (
                  <tr key={rider._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: "#1a3a8f" }}>
                          {rider.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{rider.name}</p>
                          <p className="text-xs text-gray-400">{rider.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{rider.phone}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: "#eff6ff", color: "#1a3a8f" }}>
                        {rider.zone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: "#f0b429" }}>★</span>{" "}
                      <span className="font-medium text-gray-700">{rider.rating.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{rider.totalDeliveries}</td>
                    <td className="px-6 py-4"><AvailabilityBadge isAvailable={rider.isAvailable} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trikes Table */}
      {activeTab === "trikes" && (
        <div className="stripe-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f7f8fc" }}>
                  {["Trike", "Plate Number", "Zone", "Battery", "Total Trips", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trikes.map((trike) => (
                  <tr key={trike._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: "#f0b429" }}>
                          ⚡
                        </div>
                        <p className="font-mono font-semibold" style={{ color: "#1a3a8f" }}>{trike.trikeId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{trike.plateNumber}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: "#eff6ff", color: "#1a3a8f" }}>
                        {trike.zone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${trike.batteryLevel}%`,
                              backgroundColor: trike.batteryLevel > 50 ? "#16a34a" : trike.batteryLevel > 20 ? "#f0b429" : "#dc2626"
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{trike.batteryLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{trike.totalTrips}</td>
                    <td className="px-6 py-4"><TrikeStatusBadge status={trike.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}