import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, ClipboardList, History, LayoutDashboard, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAssignedApplications } from "@/hooks/queries/useCommitteeMemberQueries";
import { CommitteeStats } from "@/components/CommitteeMemberPortal/CommitteeStats";
import { InspectionCard } from "@/components/CommitteeMemberPortal/InspectionCard";
import { AssignmentNotifications } from "@/components/CommitteeMemberPortal/AssignmentNotifications";

export const committeeNavItems = [
  { label: "Dashboard", href: "/committee", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Assignments", href: "/committee/assignments", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Inspection History", href: "/committee/history", icon: <History className="w-4 h-4" /> },
];

export default function CommitteeMemberPortal() {
  const { data: applications = [], isLoading } = useAssignedApplications();
  const activeApplications = applications
    .filter((a) => a.status === "INSPECTION_IN_PROGRESS" || a.status === "SCHEDULED")
    .sort((a, b) => {
      const aDate = a.scheduledInspectionDate ?? a.inspectionAssignedAt ?? a.updatedAt;
      const bDate = b.scheduledInspectionDate ?? b.inspectionAssignedAt ?? b.updatedAt;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    })
    .slice(0, 3);

  const activeCount = applications.filter(
    (a) => a.status === "INSPECTION_IN_PROGRESS" || a.status === "SCHEDULED"
  ).length;

  return (
    <DashboardLayout
      title="Committee Dashboard"
      subtitle="Applications assigned to your committee"
      portalType="committee"
      navItems={committeeNavItems}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <CommitteeStats applications={applications} />

            <AssignmentNotifications applications={applications} limit={4} />

            <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
              <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-[#e7eee9] flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">Workload</p>
                  <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">
                    Active inspections ({activeCount})
                  </h2>
                </div>
                <Link
                  to="/committee/assignments"
                  className="text-xs font-semibold text-[#164c3e] hover:underline inline-flex items-center gap-1 shrink-0 pt-1"
                >
                  Open assignments <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 sm:p-5">
                {activeApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardCheck className="w-12 h-12 text-[#c9d6c8] mx-auto mb-3" />
                    <p className="text-[#183d34] font-medium">No active inspections right now</p>
                    <p className="text-xs text-[#6d8474] mt-1">
                      New assignments from the Bureau will show up here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {activeApplications.map((app) => (
                      <InspectionCard key={app.id} application={app} variant="tile" />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
