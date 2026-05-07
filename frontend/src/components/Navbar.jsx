export default function Navbar({ user, onLogout, currentPage, setCurrentPage }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "riders", label: "Riders", icon: "🛺" },
    { id: "map", label: "Live Map", icon: "🗺" },
  ];

  return (
    <nav style={{ backgroundColor: "#1a3a8f" }} className="text-white px-8 py-0 flex items-center justify-between shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-12">
        <div className="py-4">
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: "#f0b429" }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">LastMile </h1>
              <p className="text-xs leading-none" style={{ color: "#93aee8" }}>Logistics Platform</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`px-5 py-5 text-sm font-medium transition border-b-2 ${
                currentPage === item.id
                  ? "border-yellow-400 text-white"
                  : "border-transparent text-blue-200 hover:text-white hover:border-blue-400"
              }`}
              style={currentPage === item.id ? { borderColor: "#f0b429" } : {}}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs capitalize" style={{ color: "#93aee8" }}>{user?.role}</p>
        </div>
        <div style={{ backgroundColor: "#f0b429" }} className="w-9 h-9 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-sm px-4 py-2 rounded-lg border border-blue-400 text-blue-200 hover:text-white hover:border-white transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}