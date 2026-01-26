import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Map,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/areas", icon: Map, label: "Áreas de Atuação" },
  { to: "/admin/blog", icon: FileText, label: "Blog" },
  { to: "/admin/messages", icon: MessageSquare, label: "Mensagens" },
  { to: "/admin/settings", icon: Settings, label: "Configurações" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-layout">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <a href="/" className="flex items-center gap-2">
            <img
              src="https://customer-assets.emergentagent.com/job_star-trade-intl/artifacts/7zqbrzwt_star%20trade.png"
              alt="Star Trade"
              className="h-8"
            />
          </a>
          <button
            className="lg:hidden p-1 text-slate-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors sidebar-link ${
                  isActive
                    ? "bg-[#1E3A8A]/10 text-[#1E3A8A]"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
              onClick={() => setSidebarOpen(false)}
              data-testid={`nav-${item.label.toLowerCase().replace(/ /g, "-")}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-red-600"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-600"
            onClick={() => setSidebarOpen(true)}
            data-testid="mobile-menu-toggle"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <a
            href="/"
            target="_blank"
            className="text-sm text-[#1E3A8A] hover:underline font-medium"
            data-testid="view-site-link"
          >
            Ver Site →
          </a>
        </header>

        {/* Page content */}
        <main className="p-6" data-testid="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
