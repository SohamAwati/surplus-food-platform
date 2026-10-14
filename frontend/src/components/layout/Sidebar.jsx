import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  MapPin,
  HandHeart,
  PlusCircle,
  Truck,
  Utensils,
  ClipboardList,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

const ROLE_NAVIGATIONS = {
  DONOR: [
    {
      group: "Main",
      items: [
        { label: "Overview", icon: LayoutDashboard, path: "/donor" },
      ],
    },
    {
      group: "Operations",
      items: [
        { label: "Food Listings", icon: Package, path: "/donor/listings" },
        { label: "Outlets", icon: MapPin, path: "/donor/outlets" },
        { label: "Claims & Deliveries", icon: HandHeart, path: "/donor/transactions" },
        { label: "New Listing", icon: PlusCircle, path: "/donor/listings/new" },
      ],
    },
  ],
  NGO: [
    {
      group: "Food Rescue",
      items: [
        { label: "Available Food", icon: Utensils, path: "/ngo/listings" },
        { label: "My Claims", icon: ClipboardList, path: "/ngo/claims" },
        { label: "Deliveries & Proofs", icon: Truck, path: "/ngo/transactions" },
        { label: "Needy Zones Map", icon: MapPin, path: "/ngo/needy-zones" },
      ],
    },
  ],
  VOLUNTEER: [
    {
      group: "Volunteer Rescue",
      items: [
        { label: "Available Food", icon: Utensils, path: "/volunteer/listings" },
        { label: "My Claims", icon: ClipboardList, path: "/volunteer/claims" },
        { label: "Deliveries & Proofs", icon: Truck, path: "/volunteer/transactions" },
        { label: "Needy Zones Map", icon: MapPin, path: "/volunteer/needy-zones" },
      ],
    },
  ],
  ADMIN: [
    {
      group: "System Admin",
      items: [
        { label: "Admin Control Center", icon: ShieldCheck, path: "/admin" },
      ],
    },
  ],
};

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const role = user?.role || "DONOR";
  const navSections = ROLE_NAVIGATIONS[role] || ROLE_NAVIGATIONS.DONOR;

  const displayName =
    user?.organizationName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      {/* Brand */}
      <div
        className={`flex h-[76px] items-center border-b border-white/5 ${
          collapsed ? "justify-center" : "px-5"
        }`}
      >
        <Link
          to={role === "ADMIN" ? "/admin" : role === "DONOR" ? "/donor" : `/${role.toLowerCase()}/listings`}
          className="flex items-center gap-3 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/20">
            <Leaf className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>

          {!collapsed && (
            <div>
              <p className="text-[15px] font-bold tracking-tight text-white">
                SURPLUS
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-400">
                Food Rescue • {role}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {section.group}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => {
                      if (onMobileClose) onMobileClose();
                    }}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-emerald-500/15 text-emerald-400 shadow-sm"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                        active
                          ? "text-emerald-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                      strokeWidth={1.8}
                    />

                    {!collapsed && <span>{item.label}</span>}

                    {active && (
                      <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User & Logout Area */}
      <div className="border-t border-white/5 p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
              {getInitials(displayName)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-400">
                {role}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 ${
            collapsed ? "justify-center" : ""
          }`}
          title="Sign out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {onToggle && (
          <button
            onClick={onToggle}
            className="mt-2 hidden w-full items-center justify-center rounded-lg py-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white lg:flex"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/5 bg-slate-950 transition-all duration-300 lg:block ${
          collapsed ? "w-[76px]" : "w-[250px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] transform bg-slate-950 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}