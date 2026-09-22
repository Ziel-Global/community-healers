import { ClipboardCheck, History } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";
import { useAssignedApplications } from "@/hooks/queries/useCommitteeMemberQueries";
import { CommitteeStats } from "@/components/CommitteeMemberPortal/CommitteeStats";
import { InspectionCard } from "@/components/CommitteeMemberPortal/InspectionCard";
import { AssignmentNotifications } from "@/components/CommitteeMemberPortal/AssignmentNotifications";

export const committeeNavItems = [
  { label: "Dashboard", href: "/committee", icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: "Inspection History", href: "/committee/history", icon: <History className="w-4 h-4" /> },
];

export default function CommitteeMemberPortal() {
  const { data: applications = [], isLoading } = useAssignedApplications();
  const activeApplications = applications.filter((a) => a.status === "INSPECTION_IN_PROGRESS" || a.status === "SCHEDULED");

  return (
    <DashboardLayout
      title="Committee Dashboard"
      subtitle="Applications assigned to your committee"
      portalType="committee"
      navItems={committeeNavItems}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <AssignmentNotifications applications={applications} />

            <CommitteeStats applications={applications} />

            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wide">
                  Active Inspections
                </h2>
                <span className="text-[11px] text-muted-foreground font-semibold bg-secondary/70 rounded-full min-w-[20px] text-center px-1.5 py-0.5">
                  {activeApplications.length}
                </span>
              </div>
              {activeApplications.length === 0 ? (
                <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                  <ClipboardCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No active inspections right now</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    New assignments from the Bureau will show up here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeApplications.map((app) => (
                    <InspectionCard key={app.id} application={app} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
