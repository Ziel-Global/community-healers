import { useMemo } from "react";
import { ClipboardList, LayoutDashboard, Building2, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCenterApplications } from "@/hooks/queries/useDirectorOperationsCenterApplicationQueries";
import { useCommitteeForDirectorOperations } from "@/hooks/queries/useCommitteeQueries";
import { useCities } from "@/hooks/queries/useReferenceQueries";
import { KANBAN_STATUSES } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import { PipelineStrip } from "@/components/DirectorOperationsPortal/Dashboard/PipelineStrip";
import { AttentionQueue } from "@/components/DirectorOperationsPortal/Dashboard/AttentionQueue";
import { UpcomingInspections } from "@/components/DirectorOperationsPortal/Dashboard/UpcomingInspections";
import { ApprovalTrend } from "@/components/DirectorOperationsPortal/Dashboard/ApprovalTrend";
import { BureauKpis } from "@/components/DirectorOperationsPortal/Dashboard/BureauKpis";

export const directorOperationsNavItems = [
  { label: "Dashboard", href: "/bureau", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Center Applications", href: "/bureau/applications", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Centers", href: "/bureau/centers", icon: <Building2 className="w-4 h-4" /> },
];

const ACTIVE_STATUSES = new Set([
  "INSPECTION_PENDING",
  "PENDING_CHAIRMAN_REVIEW",
  "INSPECTION_IN_PROGRESS",
  "SCHEDULED",
  "UNDER_REVIEW",
]);

export default function DirectorOperationsPortal() {
  const { data: applications = [], isLoading } = useCenterApplications();
  const { data: committee } = useCommitteeForDirectorOperations();
  const { data: cities = [] } = useCities();

  const cityNameById = useMemo(() => new Map(cities.map((c) => [c.id, c.name])), [cities]);

  const pipelineApplications = useMemo(
    () => applications.filter((app) => KANBAN_STATUSES.includes(app.status)),
    [applications],
  );

  const countByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const status of KANBAN_STATUSES) map.set(status, 0);
    for (const application of pipelineApplications) {
      map.set(application.status, (map.get(application.status) ?? 0) + 1);
    }
    return map;
  }, [pipelineApplications]);

  const approved = countByStatus.get("APPROVED") ?? 0;
  const rejected = countByStatus.get("REJECTED") ?? 0;
  const active = pipelineApplications.filter((app) => ACTIVE_STATUSES.has(app.status)).length;

  return (
    <DashboardLayout
      title="Bureau"
      subtitle="Center application pipeline at a glance"
      portalType="director-operations"
      navItems={directorOperationsNavItems}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <PipelineStrip countByStatus={countByStatus} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AttentionQueue applications={pipelineApplications} cityNameById={cityNameById} />
              <UpcomingInspections applications={pipelineApplications} cityNameById={cityNameById} />
            </div>

            <ApprovalTrend applications={pipelineApplications} />

            <BureauKpis
              total={pipelineApplications.length}
              active={active}
              approved={approved}
              rejected={rejected}
              committeeMembers={committee?.members.length ?? 0}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
