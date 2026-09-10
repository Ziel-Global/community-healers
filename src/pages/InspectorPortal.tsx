import { ClipboardCheck } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAssignedApplications } from "@/hooks/queries/useInspectorQueries";
import { Loader2 } from "lucide-react";

export const inspectorNavItems = [
  { label: "Assigned Inspections", href: "/inspector", icon: <ClipboardCheck className="w-4 h-4" /> },
];

const STATUS_LABELS: Record<string, string> = {
  INSPECTION_IN_PROGRESS: "In Progress",
  UNDER_REVIEW: "Submitted — Under Review",
};

export default function InspectorPortal() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useAssignedApplications();

  return (
    <DashboardLayout
      title="Assigned Inspections"
      subtitle="Center applications assigned to you for physical inspection"
      portalType="inspector"
      navItems={inspectorNavItems}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No applications assigned to you yet</p>
          </div>
        ) : (
          applications.map((app) => (
            <Card
              key={app.id}
              className="border-border/40 hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => navigate(`/inspector/applications/${app.id}`)}
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{app.centerName || "Unnamed Center"}</h3>
                  <p className="text-sm text-muted-foreground">{app.address}</p>
                </div>
                <Badge variant={app.status === "UNDER_REVIEW" ? "secondary" : "outline"}>
                  {STATUS_LABELS[app.status] || app.status}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
