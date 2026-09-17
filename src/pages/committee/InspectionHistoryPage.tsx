import { History, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { committeeNavItems } from "../CommitteeMemberPortal";
import { useAssignedApplications } from "@/hooks/queries/useCommitteeMemberQueries";
import { InspectionCard } from "@/components/CommitteeMemberPortal/InspectionCard";

const COMPLETED_STATUSES = new Set(["UNDER_REVIEW", "APPROVED", "REJECTED"]);

export default function InspectionHistoryPage() {
    const { data: applications = [], isLoading } = useAssignedApplications();
    const completed = applications
        .filter((a) => COMPLETED_STATUSES.has(a.status))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return (
        <DashboardLayout
            title="Inspection History"
            subtitle="Centers your committee has inspected, submitted, and their outcome"
            portalType="committee"
            navItems={committeeNavItems}
        >
            <div className="max-w-[1600px] mx-auto space-y-3 pb-12">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : completed.length === 0 ? (
                    <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                        <History className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground">No completed inspections yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Once you submit an inspection, it will show up here
                        </p>
                    </div>
                ) : (
                    completed.map((app) => <InspectionCard key={app.id} application={app} />)
                )}
            </div>
        </DashboardLayout>
    );
}
