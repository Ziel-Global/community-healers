import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CenterStats } from "@/components/CentreAdminPortal/Dashboard/CenterStats";
import { CenterInfoCard } from "@/components/CentreAdminPortal/Dashboard/CenterInfoCard";
import { CandidateTable } from "@/components/CentreAdminPortal/Candidates/CandidateTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FileText,
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
    label: "Reports",
    href: "/center/reports",
    icon: <FileText className="w-4 h-4" />,
  },
];

export default function CenterAdminPortal() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
            <h3 className="text-lg sm:text-2xl font-bold text-foreground alumni-sans-title">Today's Candidates</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-card/40 p-3 sm:p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by name, CNIC, or Reg ID..."
                className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white/50 border-border/60 focus:border-primary/40 focus:ring-primary/20 rounded-xl text-sm sm:text-base w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 sm:h-12 px-3 sm:px-4 rounded-xl border-border/60 bg-white/50 hover:bg-white transition-all w-full sm:w-[180px] text-xs sm:text-sm">
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CandidateTable statusFilter={statusFilter} />
        </div>

      </div>
    </DashboardLayout>
  );
}
