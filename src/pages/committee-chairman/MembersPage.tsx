import { useEffect } from "react";
import { Mail, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { initials } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import { useCommitteeForDirectorOperations } from "@/hooks/queries/useCommitteeQueries";
import { getApiErrorMessage } from "@/lib/errors";
import type { Committee, CommitteeMember } from "@/services/committeeService";
import { committeeChairmanNavItems } from "../CommitteeChairmanPortal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type ListedMember = CommitteeMember & { isChairman: boolean };

function listedMembers(committee: Committee): ListedMember[] {
  const chairmanId = committee.chairman?.id;
  return committee.members.map((member) => ({
    ...member,
    isChairman: member.role === "COMMITTEE_CHAIRMAN" || member.id === chairmanId,
  }));
}

export default function CommitteeChairmanMembersPage() {
  const { data: committee, isLoading, isError, error } = useCommitteeForDirectorOperations();
  const members = committee ? listedMembers(committee) : [];
  const loadError = isError ? getApiErrorMessage(error, "Failed to load committee members.") : null;

  useEffect(() => {
    if (loadError) toast.error(loadError);
  }, [loadError]);

  return (
    <DashboardLayout
      title="Committee Members"
      subtitle="Everyone on the approval committee"
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{committee?.name ?? "Approval Committee"}</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading..."
              : loadError
                ? "Could not load members"
                : `${members.length} member${members.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{loadError}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No members yet</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => {
              const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email;
              return (
                <Card key={member.id} className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-5 flex items-center justify-between gap-3">
                    <div className="flex gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl gradient-primary text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-primary">
                        {initials(member.firstName, member.lastName, member.email)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="alumni-sans-title text-lg text-foreground leading-tight truncate">{name}</h4>
                          {member.isChairman && (
                            <Badge variant="default" className="shrink-0">Chairman</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" /> {member.email}
                        </p>
                        {member.phoneNumber && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 shrink-0" /> {member.phoneNumber}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/70 mt-1">Joined {formatDate(member.createdAt)}</p>
                      </div>
                    </div>
                    <Badge variant={member.status === "ACTIVE" ? "success" : "secondary"} className="shrink-0">
                      {member.status}
                    </Badge>
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
