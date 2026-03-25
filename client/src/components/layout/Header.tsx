import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LogOut, ChevronDown, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/vehicles": "Vehicles",
  "/vehicles/new": "Add Vehicle",
  "/customers": "Customers",
  "/sales": "Sales",
  "/appointments": "Appointments",
  "/reports": "Reports",
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];
  // /vehicles/:id/edit
  if (/^\/vehicles\/\d+\/edit$/.test(pathname)) return "Edit Vehicle";
  // /vehicles/:id
  if (/^\/vehicles\/\d+$/.test(pathname)) return "Vehicle Details";
  return "Dashboard";
}

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title = getPageTitle(location.pathname);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Left – page title (add left padding on mobile for hamburger) */}
      <h1 className="pl-10 text-lg font-semibold text-foreground md:pl-0">
        {title}
      </h1>

      {/* Right – user menu */}
      {user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-xs font-semibold">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <Badge variant="secondary" className="hidden text-[10px] md:flex">
              {user.role.replace("_", " ")}
            </Badge>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-background py-1 shadow-lg">
              <div className="border-b px-3 py-2">
                <p className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10",
                )}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
