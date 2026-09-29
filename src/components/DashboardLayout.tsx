import { cn } from "@/lib/utils";
import { Shield, LogOut, Menu, X, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { SoftSkillsBrand } from "@/components/SoftSkillsBrand";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  portalType: "candidate" | "center" | "admin" | "ministry" | "committee" | "committee-chairman" | "director-operations" | "training-instructor";
  navItems: NavItem[];
  headerStatus?: { online: boolean };
}

const portalColors = {
  candidate: "from-primary to-royal-600",
  center: "bg-primary",
  admin: "from-violet-500 to-purple-500",
  ministry: "from-primary to-royal-700",
  committee: "from-amber-500 to-orange-500",
  "committee-chairman": "from-amber-600 to-yellow-600",
  "director-operations": "from-blue-500 to-indigo-600",
  "training-instructor": "from-emerald-600 to-lime-600",
};

const portalLabels = {
  candidate: "Candidate",
  center: "Center Admin",
  admin: "Super Admin",
  ministry: "Ministry",
  committee: "Approval Committee",
  "committee-chairman": "Committee Chairman",
  "director-operations": "Bureau",
  "training-instructor": "Training Instructor",
};

const SOFTSKILLS_PORTALS = new Set([
  "center",
  "admin",
  "committee",
  "committee-chairman",
  "director-operations",
]);

export function DashboardLayout({
  children,
  title,
  subtitle,
  portalType,
  navItems,
  headerStatus,
}: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isSoftSkills = SOFTSKILLS_PORTALS.has(portalType);

  const getLogoutRedirectPath = () => {
    switch (portalType) {
      case "candidate":
        return "/candidate/auth";
      case "center":
        return "/center/auth";
      case "ministry":
        return "/ministry/auth";
      case "admin":
        return "/admin/auth";
      case "committee":
        return "/committee/auth";
      case "committee-chairman":
        return "/committee-chairman/auth";
      case "director-operations":
        return "/bureau/auth";
      default:
        return "/";
    }
  };

  const getPortalHomePath = () => {
    switch (portalType) {
      case "candidate":
        return "/candidate";
      case "center":
        return "/center";
      case "ministry":
        return "/ministry";
      case "admin":
        return "/admin";
      case "committee":
        return "/committee";
      case "committee-chairman":
        return "/committee-chairman";
      case "director-operations":
        return "/bureau";
      default:
        return "/";
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate(getLogoutRedirectPath());
    } catch (error) {
      console.error("Logout failed:", error);
      navigate(getLogoutRedirectPath());
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={cn(
        "h-screen overflow-hidden",
        isSoftSkills ? "bg-[#f5f8f2] center-portal" : "bg-background"
      )}
      data-portal={isSoftSkills ? portalType : undefined}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isSoftSkills
            ? "bg-white border-r border-[#e7eee9]"
            : "bg-card border-r border-border"
        )}
      >
        <div className="p-6">
          <Link
            to={getPortalHomePath()}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 mb-8 hover:opacity-90 transition-opacity"
          >
            {isSoftSkills ? (
              <SoftSkillsBrand
                compact
                alwaysShowText
                subtitle={portalLabels[portalType]}
              />
            ) : (
              <>
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                    portalColors[portalType]
                  )}
                >
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="alumni-sans-title text-foreground text-lg">Soft skill training</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {portalLabels[portalType]}
                  </p>
                </div>
              </>
            )}
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-sm font-medium transition-all duration-200",
                    active
                      ? isSoftSkills
                        ? "bg-[#f3f8ed] text-primary border border-[#dce7d6]"
                        : "bg-primary/10 text-primary border border-primary/20"
                      : isSoftSkills
                        ? "text-[#64736d] hover:text-[#183d34] hover:bg-[#f5f8f2]"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 transition-colors",
              isSoftSkills
                ? "text-[#64736d] hover:text-[#183d34] hover:bg-[#f5f8f2]"
                : "text-destructive hover:text-destructive hover:bg-destructive/10"
            )}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64 flex flex-col h-screen">
        <header
          className={cn(
            "sticky top-0 z-30 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 flex-shrink-0",
            isSoftSkills
              ? "ss-header"
              : "bg-card/90 backdrop-blur-xl border-b border-border"
          )}
        >
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors flex-shrink-0",
                isSoftSkills ? "hover:bg-[#f4f7f3]" : "hover:bg-secondary"
              )}
            >
              <Menu className={cn("w-5 h-5", isSoftSkills ? "text-[#183d34]" : "text-foreground")} />
            </button>
            <div className="min-w-0">
              <h1
                className={cn(
                  "font-semibold truncate",
                  isSoftSkills
                    ? "text-lg sm:text-2xl font-display text-[#183d34] tracking-tight"
                    : portalType === "ministry"
                      ? "text-lg sm:text-2xl alumni-sans-title text-foreground"
                      : "text-base sm:text-lg font-display text-foreground"
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={cn(
                    "truncate",
                    isSoftSkills
                      ? "text-xs sm:text-sm text-[#64736d]"
                      : portalType === "ministry"
                        ? "text-xs sm:text-sm alumni-sans-subtitle text-muted-foreground"
                        : "text-[10px] sm:text-xs text-muted-foreground"
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border",
                headerStatus && !headerStatus.online
                  ? "bg-muted border-border"
                  : isSoftSkills
                    ? "bg-[#e7f2db] border-[#c7ddb5]"
                    : "bg-success/10 border-success/20"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  headerStatus && !headerStatus.online
                    ? "bg-muted-foreground"
                    : isSoftSkills
                      ? "bg-[#71a64b] animate-pulse"
                      : "bg-success animate-pulse"
                )}
              />
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium hidden sm:block",
                  headerStatus && !headerStatus.online
                    ? "text-muted-foreground"
                    : isSoftSkills
                      ? "text-[#426f36]"
                      : "text-success"
                )}
              >
                {headerStatus && !headerStatus.online ? "Offline" : "Online"}
              </span>
            </div>
          </div>
        </header>

        <main
          className={cn(
            "p-3 sm:p-6 flex-1 overflow-y-auto",
            isSoftSkills ? "bg-[#f5f8f2]" : "bg-background"
          )}
        >
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "fixed top-4 right-4 z-50 p-2 rounded-lg border lg:hidden shadow-lg",
            isSoftSkills ? "bg-white border-[#e7eee9]" : "bg-card border-border"
          )}
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      )}
    </div>
  );
}
