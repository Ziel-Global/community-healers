import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ClipboardCheck, Loader2, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import { useChairmanApplications } from "@/hooks/queries/useCommitteeChairmanQueries";
import { committeeChairmanNavItems } from "../../CommitteeChairmanPortal";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function InspectionReportsPage() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useChairmanApplications();

  const scheduled = useMemo(
    () =>
      [...applications]
        .filter((a) => a.status === "SCHEDULED")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [applications],
  );

  return (
    <DashboardLayout
      title="Inspection reports"
      subtitle="Centers forwarded for on-site inspection — review member reports and decide"
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : scheduled.length === 0 ? (
          <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No scheduled inspections right now</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Forward an application with a date from Applications first</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {scheduled.map((application) => {
              const meta = APPLICATION_STATUS_META[application.status];
              return (
                <Card
                  key={application.id}
                  className="border-border/40 cursor-pointer hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                  onClick={() => navigate(`/committee-chairman/inspection-reports/${application.id}`)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-[11px] gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta?.dot}`} />
                        {meta?.label ?? application.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{application.centerName || "Unnamed center"}</h3>
                    {application.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {application.address}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Inspection: {formatDate(application.scheduledInspectionDate)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
