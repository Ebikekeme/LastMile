import { useState } from "react";
import { login } from "../api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f7f8fc" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12" style={{ backgroundColor: "#1a3a8f" }}>
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: "#f0b429" }} className="w-10 h-10 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">⚡</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">LastMile</h1>
            <p className="text-blue-300 text-xs">Logistics Platform</p>
          </div>
        </div>

        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Deliver smarter,<br />
            <span style={{ color: "#f0b429" }}>faster,</span> together.
          </h2>
          <p className="text-blue-200 text-lg">
            Manage your electric cargo trike fleet with real-time tracking and intelligent dispatch.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Riders", value: "5" },
            { label: "Trikes", value: "5" },
            { label: "Zones", value: "5" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4" style={{ backgroundColor: "#122970" }}>
              <p className="text-2xl font-bold" style={{ color: "#f0b429" }}>{stat.value}</p>
              <p className="text-blue-300 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div style={{ backgroundColor: "#1a3a8f" }} className="w-10 h-10 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">⚡</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#1a3a8f" }}>LastMile</h1>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: "#1a3a8f" }}>Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your dashboard</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a3a8f" }}>
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                style={{ "--tw-ring-color": "#1a3a8f" }}
                placeholder="admin@lastmile.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a3a8f" }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: "#1a3a8f" }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              LastMile Logistics Platform · Electric Cargo Trike Delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}