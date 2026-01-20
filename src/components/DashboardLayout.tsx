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
  candidate: "from-primary to-orange-400",
  center: "from-emerald-500 to-teal-400",
  admin: "from-violet-500 to-purple-400",
  ministry: "from-blue-500 to-cyan-400",
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
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
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
                "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                portalColors[portalType]
              )}
            >
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">CertifyPro</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {portalType} Portal
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary font-medium"
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
            <Button variant="ghost" className="w-full justify-start gap-3">
              <LogOut className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground hidden sm:block">
              System Online
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile close button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-card border border-border lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
