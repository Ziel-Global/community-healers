import { DashboardLayout } from "@/components/DashboardLayout";
import { CenterStats } from "@/components/CentreAdminPortal/Dashboard/CenterStats";
import { CenterInfoCard } from "@/components/CentreAdminPortal/Dashboard/CenterInfoCard";
import { CandidateSearch } from "@/components/CentreAdminPortal/Candidates/CandidateSearch";
import { CandidateTable } from "@/components/CentreAdminPortal/Candidates/CandidateTable";
import { CandidateActionCard } from "@/components/CentreAdminPortal/Candidates/CandidateActionCard";
import { ExamMonitoringGrid } from "@/components/CentreAdminPortal/Monitoring/ExamMonitoringGrid";
import { DailyResultsView } from "@/components/CentreAdminPortal/Results/DailyResultsView";
import { HistoricalReports } from "@/components/CentreAdminPortal/Reports/HistoricalReports";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Monitor,
  BarChart3,
  FileText,
  Settings
} from "lucide-react";

export const centerNavItems = [
  {
    label: "Dashboard",
    href: "/center",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Candidates",
    href: "/center/candidates",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Verification",
    href: "/center/verification",
    icon: <UserCheck className="w-4 h-4" />,
  },
  {
    label: "Exam Monitoring",
    href: "/center/monitoring",
    icon: <Monitor className="w-4 h-4" />,
  },
  {
    label: "Results",
    href: "/center/results",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    label: "Reports",
    href: "/center/reports",
    icon: <FileText className="w-4 h-4" />,
  },
];

export default function CenterAdminPortal() {
  return (
    <DashboardLayout
      title="Center Admin Portal"
      subtitle="Operational Control Dashboard"
      portalType="center"
      navItems={centerNavItems}
    >
      <div className="space-y-8 max-w-[1600px] mx-auto">
        {/* Center Info Section */}
        <CenterInfoCard
          name="Lahore Training Center #3"
          id="LHR-003"
          location="Model Town, Lahore"
          adminName="M. Siddique"
        />

        {/* Quick Stats Grid */}
        <CenterStats />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Candidate Table Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-foreground">Today's Candidate Queue</h3>
              <p className="text-sm text-muted-foreground">Jan 20, 2024</p>
            </div>
            <CandidateSearch />
            <CandidateTable />
          </div>

          {/* Quick Verification & Monitoring Side Panel */}
          <div className="space-y-8">
            <h3 className="text-xl font-display font-bold text-foreground">Quick Verification</h3>
            <CandidateActionCard />

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                Shift Status
              </h4>
              <p className="text-sm text-muted-foreground mb-4">You are currently managing the Morning Shift (09:00 AM - 01:00 PM).</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-md bg-white text-[10px] font-bold border border-border/40 uppercase">Room 1: Active</span>
                <span className="px-2 py-1 rounded-md bg-white text-[10px] font-bold border border-border/40 uppercase">Room 2: Idle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Monitoring Section */}
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-display font-bold text-foreground">Live Exam Monitoring</h3>
          <ExamMonitoringGrid />
        </div>

        {/* Results & Reports Preview */}
        <div className="grid md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-foreground">Daily Results Breakdown</h3>
            <DailyResultsView />
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-foreground">Historical Performance</h3>
            <HistoricalReports />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
