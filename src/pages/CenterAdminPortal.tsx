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
  // {
  //   label: "Verification",
  //   href: "/center/verification",
  //   icon: <UserCheck className="w-4 h-4" />,
  // },
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

        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-lg sm:text-2xl font-bold text-foreground alumni-sans-title">Today's Candidate Queue</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Jan 20, 2024</p>
          </div>
          <CandidateSearch />
          <CandidateTable />
        </div>

      </div>
    </DashboardLayout>
  );
}
