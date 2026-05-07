import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getAllLocations, getOrders } from "../api";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const LAGOS_CENTER = [6.5244, 3.3792];

export default function LiveMap() {
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const [locRes, ordersRes] = await Promise.all([
        getAllLocations(),
        getOrders(),
      ]);
      setLocations(locRes.data);
      setOrders(ordersRes.data.orders);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching map data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getOrderForRider = (riderId) => {
    return orders.find(
      (o) => o.assignedRider &&
        (o.assignedRider._id === riderId || o.assignedRider === riderId)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-3"
            style={{ borderTopColor: "#1a3a8f" }} />
          <p className="text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a3a8f" }}>Live Map</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time trike locations across Lagos</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 stripe-card px-4 py-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#16a34a" }} />
            <span className="text-sm font-medium text-gray-600">
              {locations.length} active rider{locations.length !== 1 ? "s" : ""}
            </span>
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchData}
            className="text-white text-sm px-4 py-2 rounded-xl font-medium transition hover:opacity-90"
            style={{ backgroundColor: "#1a3a8f" }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="stripe-card overflow-hidden mb-6" style={{ height: "500px" }}>
        <MapContainer
          center={LAGOS_CENTER}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc) => {
            const order = getOrderForRider(loc.riderId);
            return (
              <Marker key={loc.riderId} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="text-sm p-1">
                    <p className="font-bold mb-1" style={{ color: "#1a3a8f" }}>⚡ Active Trike</p>
                    <p className="text-gray-600">Rider: {loc.riderId?.slice(-6)}</p>
                    {order && (
                      <>
                        <p className="text-gray-600">Order: {order.trackingNumber}</p>
                        <p className="text-gray-600">To: {order.dropoff.address}</p>
                      </>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(loc.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Active Riders List */}
      <div className="stripe-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: "#1a3a8f" }}>Active Riders</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {locations.length} on map
          </span>
        </div>
        {locations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🗺</p>
            <p className="text-gray-400 font-medium">No active riders on the map</p>
            <p className="text-gray-300 text-sm mt-1">Update a rider location to see them here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {locations.map((loc) => {
              const order = getOrderForRider(loc.riderId);
              return (
                <div key={loc.riderId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: "#f0b429" }}>
                      ⚡
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Rider {loc.riderId?.slice(-6)}</p>
                      <p className="text-xs text-gray-400">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {order ? (
                      <>
                        <p className="text-sm font-semibold" style={{ color: "#1a3a8f" }}>{order.trackingNumber}</p>
                        <p className="text-xs text-gray-400">{order.dropoff.address}</p>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">No active order</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}