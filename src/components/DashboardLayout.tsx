import { cn } from "@/lib/utils";
import { Shield, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  portalType: "candidate" | "center" | "admin" | "ministry";
  navItems: NavItem[];
}

const portalColors = {
  candidate: "from-primary to-royal-600",
  center: "from-emerald-500 to-teal-500",
  admin: "from-violet-500 to-purple-500",
  ministry: "from-primary to-royal-700",
};

const portalLabels = {
  candidate: "Candidate",
  center: "Center Admin",
  admin: "Super Admin",
  ministry: "Ministry",
};

export function DashboardLayout({
  children,
  title,
  subtitle,
  portalType,
  navItems,
}: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div
              className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                portalColors[portalType]
              )}
            >
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-sm">Soft skill training</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {portalLabels[portalType]}
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="min-w-0">
              <h1 className={cn(
                "font-display font-semibold text-foreground truncate",
                (portalType === "admin" || portalType === "center") ? "text-lg sm:text-2xl alumni-sans-title" : "text-base sm:text-lg"
              )}>{title}</h1>
              {subtitle && (
                <p className={cn(
                  "text-muted-foreground truncate",
                  (portalType === "admin" || portalType === "center") ? "text-xs sm:text-sm alumni-sans-subtitle" : "text-[10px] sm:text-xs"
                )}>{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-success/10 border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] sm:text-xs font-medium text-success hidden sm:block">
                Online
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">{children}</main>
      </div>

      {/* Mobile close button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-card border border-border lg:hidden shadow-lg"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      )}
    </div>
  );
}
