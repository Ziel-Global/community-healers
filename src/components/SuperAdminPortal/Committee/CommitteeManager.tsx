import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Plus, Users } from "lucide-react";
import { useCommitteeForSuperAdmin } from "@/hooks/queries/useCommitteeQueries";
import { CreateCommitteeMemberDialog } from "./CreateCommitteeMemberDialog";
import { initials } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function CommitteeManager() {
    const { data: committee, isLoading } = useCommitteeForSuperAdmin();
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">{committee?.name ?? "Approval Committee"}</h2>
                    <p className="text-sm text-muted-foreground">
                        {committee ? `${committee.members.length} member${committee.members.length === 1 ? "" : "s"}` : "Loading..."}
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="gradient-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg gap-2">
                    <Plus className="w-4 h-4" />
                    New Member
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : !committee || committee.members.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No members yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Click "New Member" to add one</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {committee.members.map((member) => {
                        const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email;
                        return (
                            <Card key={member.id} className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm">
                                <CardContent className="p-5 flex items-center justify-between gap-3">
                                    <div className="flex gap-3.5 min-w-0">
                                        <div className="w-11 h-11 rounded-xl gradient-primary text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-primary">
                                            {initials(member.firstName, member.lastName, member.email)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="alumni-sans-title text-lg text-foreground leading-tight truncate">{name}</h4>
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

            <CreateCommitteeMemberDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} onCreated={() => setShowCreateDialog(false)} />
        </div>
    );
}
