import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ClipboardList, Loader2, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import { useChairmanApplications } from "@/hooks/queries/useCommitteeChairmanQueries";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";
import { committeeChairmanNavItems } from "../CommitteeChairmanPortal";

type ApplicationFilter = "all" | "pending" | "approved";

function sortApplications(applications: CenterApplicationSummary[]) {
  return [...applications].sort((a, b) => {
    const aPending = a.status === "PENDING_CHAIRMAN_REVIEW" ? 0 : 1;
    const bPending = b.status === "PENDING_CHAIRMAN_REVIEW" ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function emptyMessage(filter: ApplicationFilter): string {
  if (filter === "pending") return "No applications awaiting your review";
  if (filter === "approved") return "No approved applications yet";
  return "No applications yet";
}

export default function CommitteeChairmanApplicationsPage() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useChairmanApplications();
  const [filter, setFilter] = useState<ApplicationFilter>("all");
  const appliedDefaultFilter = useRef(false);

  const awaitingCount = applications.filter((a) => a.status === "PENDING_CHAIRMAN_REVIEW").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;

  useEffect(() => {
    if (isLoading || appliedDefaultFilter.current) return;
    appliedDefaultFilter.current = true;
    setFilter(awaitingCount > 0 ? "pending" : "all");
  }, [isLoading, awaitingCount]);

  const displayed = useMemo(() => {
    let list = applications;
    if (filter === "pending") {
      list = applications.filter((a) => a.status === "PENDING_CHAIRMAN_REVIEW");
    } else if (filter === "approved") {
      list = applications.filter((a) => a.status === "APPROVED");
    }
    return sortApplications(list);
  }, [applications, filter]);

  return (
    <DashboardLayout
      title="Applications"
      subtitle={awaitingCount > 0 ? `${awaitingCount} awaiting your review` : "Center applications for your committee"}
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {!isLoading && applications.length > 0 && (
          <Tabs value={filter} onValueChange={(value) => setFilter(value as ApplicationFilter)}>
            <TabsList className="bg-secondary/50 h-10 p-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-3 sm:px-4">
                All ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm px-3 sm:px-4">
                Pending ({awaitingCount})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs sm:text-sm px-3 sm:px-4">
                Approved ({approvedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
            <ClipboardList className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{emptyMessage(filter)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.map((application) => {
              const meta = APPLICATION_STATUS_META[application.status];
              const isAwaiting = application.status === "PENDING_CHAIRMAN_REVIEW";
              return (
                <Card
                  key={application.id}
                  className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm cursor-pointer hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                  onClick={() => navigate(`/committee-chairman/applications/${application.id}`)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {application.centerName || "Untitled center"}
                          </h3>
                          {application.address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 line-clamp-2">
                              <MapPin className="w-3 h-3 shrink-0" /> {application.address}
                            </p>
                          )}
                        </div>
                      </div>
                      {isAwaiting && (
                        <Badge variant="default" className="shrink-0 text-[10px]">Action needed</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <Badge variant={meta?.badgeVariant ?? "outline"} className="gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta?.dot ?? "bg-slate-400"}`} />
                        {meta?.label ?? application.status}
                      </Badge>
                      <span className="text-muted-foreground">Updated {formatDate(application.updatedAt)}</span>
                    </div>
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
