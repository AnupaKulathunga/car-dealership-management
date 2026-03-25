import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Car,
  LayoutDashboard,
  Users,
  DollarSign,
  CalendarDays,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import { Button } from "../ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: UserRole[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Vehicles",
    path: "/vehicles",
    icon: Car,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: Users,
    badge: "Cycle 2",
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT],
  },
  {
    label: "Sales",
    path: "/sales",
    icon: DollarSign,
    badge: "Cycle 2",
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT],
  },
  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
    badge: "Cycle 2",
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_AGENT],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    badge: "Cycle 3",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Car className="h-7 w-7 text-accent" />
        {!collapsed && (
          <span className="text-xl font-bold text-primary">AutoDeal</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-[3px] border-accent bg-accent/10 text-accent"
                  : "border-l-[3px] border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2",
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden border-t p-3 md:block">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Logout */}
      <div className="border-t p-3">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-3.5 z-50 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 h-full w-[260px] bg-background shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen border-r bg-background transition-all duration-200 md:block",
          collapsed ? "w-[68px]" : "w-[240px]",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
