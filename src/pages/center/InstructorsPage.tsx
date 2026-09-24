import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, UserRound, Mail, CalendarDays } from "lucide-react";
import { useCenterDetails } from "@/hooks/queries/useCenterAdminQueries";
import { useTrainingInstructorsList } from "@/hooks/queries/useTrainingInstructorsQueries";
import { CreateInstructorDialog } from "@/components/CentreAdminPortal/Instructors/CreateInstructorDialog";

export default function InstructorsPage() {
  const { data: centerData, isLoading: isCenterLoading } = useCenterDetails();
  const centerId = centerData?.id ?? null;

  const { data: instructors, isLoading: isInstructorsLoading } = useTrainingInstructorsList(centerId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isLoading = isCenterLoading || isInstructorsLoading;

  return (
    <DashboardLayout
      title="Training Instructors"
      subtitle="Instructors who play the training course for your candidates"
      portalType="center"
      navItems={centerNavItems}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {instructors?.length ?? 0} instructor{instructors?.length === 1 ? "" : "s"} at this center
          </p>
          <Button className="gap-2" disabled={!centerId} onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Instructor
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading instructors…
          </div>
        ) : !centerId ? (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            No centre is linked to this admin account.
          </div>
        ) : instructors && instructors.length > 0 ? (
          <div className="grid gap-3">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="border-border/40 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <UserRound className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">
                      {instructor.firstName} {instructor.lastName || ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {instructor.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Added {new Date(instructor.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border/60 bg-secondary/20 flex flex-col items-center justify-center text-center py-12 gap-3">
            <UserRound className="w-10 h-10 text-primary/40" />
            <div>
              <p className="font-bold text-foreground">No instructors yet</p>
              <p className="text-sm text-muted-foreground">Add one so they can log in and play the course for candidates.</p>
            </div>
          </div>
        )}
      </div>

      {centerId && (
        <CreateInstructorDialog
          centerId={centerId}
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => setIsCreateOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
