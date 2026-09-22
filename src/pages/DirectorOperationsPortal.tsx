import { useMemo } from "react";
import { Briefcase, ClipboardList, Users, Loader2, LayoutDashboard, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCenterApplications } from "@/hooks/queries/useDirectorOperationsCenterApplicationQueries";
import { useCommitteeForDirectorOperations } from "@/hooks/queries/useCommitteeQueries";
import { APPLICATION_STATUS_META, KANBAN_STATUSES } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";

export const directorOperationsNavItems = [
  { label: "Dashboard", href: "/bureau", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Center Applications", href: "/bureau/applications", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Centers", href: "/bureau/centers", icon: <Building2 className="w-4 h-4" /> },
];

export default function DirectorOperationsPortal() {
  const { data: applications = [], isLoading } = useCenterApplications();
  const { data: committee } = useCommitteeForDirectorOperations();

  const countByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const status of KANBAN_STATUSES) map.set(status, 0);
    for (const application of applications) {
      if (map.has(application.status)) map.set(application.status, (map.get(application.status) ?? 0) + 1);
    }
    return map;
  }, [applications]);

  return (
    <DashboardLayout
      title="Bureau"
      subtitle="Center application pipeline at a glance"
      portalType="director-operations"
      navItems={directorOperationsNavItems}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {KANBAN_STATUSES.map((status) => {
                const meta = APPLICATION_STATUS_META[status];
                return (
                    <Card key={status} className="relative overflow-hidden border-y border-r border-l-[3px] border-l-primary border-y-border/40 border-r-border/40 bg-primary/[0.02]">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-20 bg-primary" />
                        <CardContent className="relative p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider">{meta.label}</p>
                            </div>
                            <p className="text-3xl font-sans font-bold text-foreground tabular-nums">{countByStatus.get(status) ?? 0}</p>
                        </CardContent>
                    </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border/40 bg-card">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground tabular-nums">{applications.length}</p>
                            <p className="text-xs text-muted-foreground">Total applications</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-card">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground tabular-nums">{committee?.members.length ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Approval Committee members</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
