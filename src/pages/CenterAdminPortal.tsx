import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Settings,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/center",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Today's Candidates",
    href: "/center/candidates",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Exam Schedule",
    href: "/center/schedule",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    label: "Verification",
    href: "/center/verification",
    icon: <ClipboardCheck className="w-4 h-4" />,
  },
  {
    label: "Reports",
    href: "/center/reports",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    label: "Settings",
    href: "/center/settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

const todaysCandidates = [
  {
    id: "CND-001",
    name: "Muhammad Ahmed",
    cnic: "35201-1234567-1",
    time: "10:00 AM",
    status: "verified",
  },
  {
    id: "CND-002",
    name: "Fatima Khan",
    cnic: "35201-7654321-2",
    time: "10:00 AM",
    status: "verified",
  },
  {
    id: "CND-003",
    name: "Ali Hassan",
    cnic: "35201-9876543-3",
    time: "10:00 AM",
    status: "pending",
  },
  {
    id: "CND-004",
    name: "Ayesha Malik",
    cnic: "35201-1357924-4",
    time: "11:00 AM",
    status: "pending",
  },
  {
    id: "CND-005",
    name: "Usman Tariq",
    cnic: "35201-2468135-5",
    time: "11:00 AM",
    status: "pending",
  },
];

export default function CenterAdminPortal() {
  return (
    <DashboardLayout
      title="Center Dashboard"
      subtitle="Lahore Training Center #3"
      portalType="center"
      navItems={navItems}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Today's Candidates"
          value="42"
          icon={Users}
          change="+8 from yesterday"
          changeType="positive"
        />
        <StatCard
          title="Verified"
          value="28"
          icon={CheckCircle2}
          change="66.7% verified"
          changeType="positive"
        />
        <StatCard
          title="Exams in Progress"
          value="12"
          icon={Clock}
          change="Currently active"
          changeType="neutral"
        />
        <StatCard
          title="Completed Today"
          value="16"
          icon={UserCheck}
          change="14 passed, 2 failed"
          changeType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Candidates Table */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-card/60 backdrop-blur border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Today's Candidates
            </h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Candidate
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    CNIC
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Time
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {todaysCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {candidate.id}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {candidate.cnic}
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {candidate.time}
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          candidate.status === "verified"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          candidate.status === "verified"
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-warning/20 text-warning border-warning/30"
                        }
                      >
                        {candidate.status === "verified"
                          ? "Verified"
                          : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      {candidate.status === "pending" ? (
                        <Button variant="gradient" size="sm">
                          Verify
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exam Progress */}
        <div className="p-6 rounded-xl bg-card/60 backdrop-blur border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Exam Progress
          </h3>

          <div className="space-y-4">
            {[
              { name: "Muhammad Ahmed", progress: 75, timeLeft: "5:00" },
              { name: "Fatima Khan", progress: 45, timeLeft: "11:00" },
              { name: "Zain Abbas", progress: 90, timeLeft: "2:00" },
            ].map((exam, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    {exam.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {exam.timeLeft} left
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${exam.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {exam.progress}% complete
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Today's Results
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-success/10 text-center">
                <CheckCircle2 className="w-4 h-4 text-success mx-auto mb-1" />
                <p className="text-lg font-bold text-success">14</p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 text-center">
                <XCircle className="w-4 h-4 text-destructive mx-auto mb-1" />
                <p className="text-lg font-bold text-destructive">2</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
