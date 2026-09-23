import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistResultsSection } from "@/components/DirectorOperationsPortal/CenterApplications/ChecklistResultsSection";
import { useInspectionReports } from "@/hooks/queries/useCommitteeChairmanQueries";
import { committeeChairmanService } from "@/services/committeeChairmanService";
import { committeeChairmanNavItems } from "../../CommitteeChairmanPortal";

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function InspectionReportsMemberPage() {
  const { applicationId = "", memberUserId = "" } = useParams();
  const navigate = useNavigate();
  const { data: reports, isLoading } = useInspectionReports(applicationId);

  const member = useMemo(
    () => reports?.members.find((m) => m.memberUserId === memberUserId),
    [reports, memberUserId],
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." portalType="committee-chairman" navItems={committeeChairmanNavItems}>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!member || !member.submitted) {
    return (
      <DashboardLayout title="Member report" portalType="committee-chairman" navItems={committeeChairmanNavItems}>
        <p className="text-sm text-muted-foreground">This member has not submitted a report yet.</p>
        <Button
          variant="ghost"
          className="mt-4 gap-2"
          onClick={() => navigate(`/committee-chairman/inspection-reports/${applicationId}`)}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </DashboardLayout>
    );
  }

  const checklistResults = member.checklistResults ?? [];

  return (
    <DashboardLayout
      title={member.memberName}
      subtitle="Submitted inspection report"
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-3xl mx-auto space-y-5 pb-12">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 -ml-2"
          onClick={() => navigate(`/committee-chairman/inspection-reports/${applicationId}`)}
        >
          <ArrowLeft className="w-4 h-4" /> Back to center
        </Button>

        <Card className="border-border/40">
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Submitted:</span>
              <span>{formatDateTime(member.submittedAt)}</span>
              {member.recommendation && (
                <Badge variant={member.recommendation === "APPROVE" ? "default" : "destructive"}>
                  Recommends {member.recommendation}
                </Badge>
              )}
            </div>
            {member.notes && (
              <p className="text-muted-foreground whitespace-pre-wrap border-t border-border/40 pt-2 mt-2">{member.notes}</p>
            )}
          </CardContent>
        </Card>

        {checklistResults.length > 0 ? (
          <ChecklistResultsSection
            checklistResults={checklistResults}
            getEvidenceBlob={committeeChairmanService.getEvidenceBlob}
          />
        ) : (
          <p className="text-sm text-muted-foreground px-1">
            Checklist detail is not included in the summary response. Recommendation and notes are shown above.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
