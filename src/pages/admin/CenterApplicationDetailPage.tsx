import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Building2, MapPin, Phone, IdCard, Users, UserCheck,
    CheckCircle2, XCircle, Clock, Loader2, HelpCircle,
} from "lucide-react";
import { useCenterApplicationDetail } from "@/hooks/queries/useCenterApplicationQueries";
import { EvidenceThumbnail } from "@/components/SuperAdminPortal/CenterApplications/EvidenceThumbnail";
import { AssignInspectorDialog } from "@/components/SuperAdminPortal/CenterApplications/AssignInspectorDialog";
import { RejectApplicationDialog } from "@/components/SuperAdminPortal/CenterApplications/RejectApplicationDialog";
import { ApproveApplicationDialog } from "@/components/SuperAdminPortal/CenterApplications/ApproveApplicationDialog";
import { APPLICATION_STATUS_META } from "@/components/SuperAdminPortal/CenterApplications/statusMeta";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

function formatDateTime(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function CenterApplicationDetailPage() {
    const { applicationId = "" } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useCenterApplicationDetail(applicationId);

    const [assignTarget, setAssignTarget] = useState<CenterApplicationSummary | null>(null);
    const [rejectTarget, setRejectTarget] = useState<CenterApplicationSummary | null>(null);
    const [approveTarget, setApproveTarget] = useState<CenterApplicationSummary | null>(null);

    if (isLoading) {
        return (
            <DashboardLayout title="Loading..." portalType="admin" navItems={superAdminNavItems}>
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout title="Not found" portalType="admin" navItems={superAdminNavItems}>
                <p className="text-sm text-muted-foreground">This application could not be found.</p>
            </DashboardLayout>
        );
    }

    const { application, checklistResults } = data;

    return (
        <DashboardLayout
            title={application.centerName || "Center Application"}
            subtitle={application.address || undefined}
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-4xl mx-auto space-y-5 pb-12">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => navigate("/admin/applications")}>
                        <ArrowLeft className="w-4 h-4" /> Back to board
                    </Button>
                    <Badge variant={APPLICATION_STATUS_META[application.status]?.badgeVariant ?? "outline"} className="gap-1.5 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${APPLICATION_STATUS_META[application.status]?.dot ?? "bg-slate-400"}`} />
                        {APPLICATION_STATUS_META[application.status]?.label ?? application.status}
                    </Badge>
                </div>

                {/* Application info */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" /> Application Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <IdCard className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">CNIC:</span> {application.cnic}
                        </div>
                        <div className="flex items-center gap-2">
                            <IdCard className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">License:</span> {application.licenseNumber}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">City:</span> {application.city?.name ?? "—"}
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Phone:</span> {application.phone ?? "—"}
                        </div>
                        <div className="sm:col-span-2 text-muted-foreground">{application.address}</div>
                    </CardContent>
                </Card>

                {/* Staff */}
                {application.staff.length > 0 && (
                    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" /> Staff ({application.staff.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {application.staff.map((member) => (
                                <div key={member.id} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-secondary/30">
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">CNIC {member.cnic}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[11px]">{member.category}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Inspector */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-primary" /> Inspection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {application.inspector ? (
                            <>
                                <p>
                                    <span className="text-muted-foreground">Inspector:</span>{" "}
                                    {[application.inspector.firstName, application.inspector.lastName].filter(Boolean).join(" ")} ({application.inspector.email})
                                </p>
                                <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                    <Clock className="w-3.5 h-3.5" /> Assigned {formatDateTime(application.inspectionAssignedAt)}
                                </p>
                                {application.inspectionCompletedAt && (
                                    <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Inspection completed {formatDateTime(application.inspectionCompletedAt)}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground">No inspector assigned yet.</p>
                        )}

                        {application.status === "INSPECTION_PENDING" && (
                            <Button size="sm" className="gradient-primary text-white gap-2 mt-1" onClick={() => setAssignTarget(application)}>
                                <UserCheck className="w-4 h-4" /> Assign Inspector
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Checklist results — everything the inspector submitted */}
                {checklistResults.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
                            Inspection Checklist
                        </h3>
                        {checklistResults.map((result) => (
                            <Card key={result.id} className="border-border/40">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{result.checklistItem.label}</CardTitle>
                                        {result.passed === null ? (
                                            <Badge variant="outline" className="gap-1 text-[11px]">
                                                <HelpCircle className="w-3 h-3" /> Not marked
                                            </Badge>
                                        ) : (
                                            <Badge variant={result.passed ? "success" : "destructive"} className="gap-1 text-[11px]">
                                                {result.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {result.passed ? "Passed" : "Failed"}
                                            </Badge>
                                        )}
                                    </div>
                                    {result.checklistItem.description && (
                                        <p className="text-xs text-muted-foreground">{result.checklistItem.description}</p>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {result.notes && (
                                        <p className="text-sm bg-secondary/30 rounded-lg p-2.5">{result.notes}</p>
                                    )}
                                    {result.evidence.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {result.evidence.map((evidence) => (
                                                <EvidenceThumbnail key={evidence.id} evidenceId={evidence.id} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No evidence photos uploaded.</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Decision */}
                {application.status === "UNDER_REVIEW" && (
                    <div className="flex gap-2 justify-end pt-2">
                        <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-2" onClick={() => setRejectTarget(application)}>
                            <XCircle className="w-4 h-4" /> Reject
                        </Button>
                        <Button className="gradient-primary text-white gap-2" onClick={() => setApproveTarget(application)}>
                            <CheckCircle2 className="w-4 h-4" /> Approve
                        </Button>
                    </div>
                )}

                {application.status === "REJECTED" && application.rejectionReason && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                        <p className="text-sm font-medium text-destructive mb-1">Rejection reason</p>
                        <p className="text-sm text-muted-foreground">{application.rejectionReason}</p>
                    </div>
                )}

                {application.status === "APPROVED" && (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-sm text-emerald-700">
                            Approved {formatDateTime(application.reviewedAt)} — the center and its admin login are now live.
                        </p>
                    </div>
                )}
            </div>

            <AssignInspectorDialog application={assignTarget} onClose={() => setAssignTarget(null)} onAssigned={() => setAssignTarget(null)} />
            <RejectApplicationDialog application={rejectTarget} onClose={() => setRejectTarget(null)} onRejected={() => setRejectTarget(null)} />
            <ApproveApplicationDialog application={approveTarget} onClose={() => setApproveTarget(null)} onApproved={() => setApproveTarget(null)} />
        </DashboardLayout>
    );
}
