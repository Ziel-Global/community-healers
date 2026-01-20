import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileQuestion,
  Video,
  Settings,
  MapPin,
  TrendingUp,
  Database,
  Shield,
  Plus,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Centers",
    href: "/admin/centers",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Question Bank",
    href: "/admin/questions",
    icon: <FileQuestion className="w-4 h-4" />,
  },
  {
    label: "Training Videos",
    href: "/admin/videos",
    icon: <Video className="w-4 h-4" />,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

const centers = [
  { name: "Lahore Center #1", location: "Lahore", candidates: 156, status: "active" },
  { name: "Lahore Center #2", location: "Lahore", candidates: 142, status: "active" },
  { name: "Karachi Center #1", location: "Karachi", candidates: 189, status: "active" },
  { name: "Islamabad Center #1", location: "Islamabad", candidates: 98, status: "maintenance" },
];

export default function SuperAdminPortal() {
  return (
    <DashboardLayout
      title="Super Admin Dashboard"
      subtitle="System Administration"
      portalType="admin"
      navItems={navItems}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Centers"
          value="86"
          icon={Building2}
          change="+3 this month"
          changeType="positive"
        />
        <StatCard
          title="Active Candidates"
          value="12,450"
          icon={Users}
          change="+842 this week"
          changeType="positive"
        />
        <StatCard
          title="Question Bank"
          value="5,230"
          icon={FileQuestion}
          change="98% active"
          changeType="neutral"
        />
        <StatCard
          title="Training Videos"
          value="50"
          icon={Video}
          change="All modules complete"
          changeType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Centers Management */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Training Centers
            </h3>
            <Button variant="neon" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Center
            </Button>
          </div>

          <div className="space-y-3">
            {centers.map((center, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-secondary/30 border border-border/40 hover:border-primary/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{center.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {center.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-foreground">
                      {center.candidates}
                    </p>
                    <p className="text-xs text-muted-foreground">Candidates</p>
                  </div>
                  <Badge
                    className={
                      center.status === "active"
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-warning/10 text-warning border border-warning/20"
                    }
                  >
                    {center.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            View All Centers
          </Button>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="p-6 rounded-xl bg-card border border-border/60 shadow-sm">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              System Status
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">Database</span>
                </div>
                <Badge className="bg-success/10 text-success border border-success/20">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">Security</span>
                </div>
                <Badge className="bg-success/10 text-success border border-success/20">
                  Secured
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">API</span>
                </div>
                <Badge className="bg-success/10 text-success border border-success/20">
                  99.9% Uptime
                </Badge>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 rounded-xl bg-card border border-border/60 shadow-sm">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Recent Activity
            </h3>

            <div className="space-y-3">
              {[
                { action: "New center added", time: "2 hours ago" },
                { action: "Question bank updated", time: "4 hours ago" },
                { action: "Training video uploaded", time: "1 day ago" },
                { action: "User role modified", time: "2 days ago" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
