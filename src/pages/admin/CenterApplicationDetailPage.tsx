import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Building2, MapPin, Phone, IdCard, Users, UserCheck,
    CheckCircle2, Clock, Loader2, CalendarClock, FileText,
} from "lucide-react";
import { useCenterApplicationDetail } from "@/hooks/queries/useSuperAdminCenterApplicationQueries";
import { superAdminCenterApplicationService } from "@/services/centerApplicationService";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import { CommitteeAttendanceCard } from "@/components/DirectorOperationsPortal/CenterApplications/CommitteeAttendanceCard";
import { ChecklistResultsSection } from "@/components/DirectorOperationsPortal/CenterApplications/ChecklistResultsSection";
import { CommentThread } from "@/components/CommentThread";

function formatDateTime(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatDate(iso: string | null): string {
    if (!iso) return "Not scheduled";
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function CenterApplicationDetailPage() {
    const { applicationId = "" } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useCenterApplicationDetail(applicationId);

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

    const { application, checklistResults, attendance } = data;

    return (
        <DashboardLayout
            title={application.centerName || "Center Application"}
            subtitle="View only"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-4xl mx-auto space-y-5 pb-12">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => navigate("/admin/applications")}>
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Badge variant={APPLICATION_STATUS_META[application.status]?.badgeVariant ?? "outline"} className="gap-1.5 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${APPLICATION_STATUS_META[application.status]?.dot ?? "bg-slate-400"}`} />
                        {APPLICATION_STATUS_META[application.status]?.label ?? application.status}
                    </Badge>
                </div>

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
                            <span className="text-muted-foreground">Center Phone:</span> {application.centerPhone ?? "—"}
                        </div>
                        <div className="sm:col-span-2 text-muted-foreground">{application.address}</div>
                    </CardContent>
                </Card>

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
                                    <div className="min-w-0">
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">CNIC {member.cnic}{member.qualification ? ` · ${member.qualification}` : ""}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {member.documentObjectKey && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                title="View supporting document"
                                                onClick={async () => {
                                                    const blob = await superAdminCenterApplicationService.getStaffDocumentBlob(member.id);
                                                    window.open(URL.createObjectURL(blob), "_blank");
                                                }}
                                            >
                                                <FileText className="w-3.5 h-3.5 text-primary" />
                                            </Button>
                                        )}
                                        <Badge variant="outline" className="text-[11px]">{member.category}</Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-primary" /> Inspection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {application.committee ? (
                            <>
                                <p><span className="text-muted-foreground">Committee:</span> {application.committee.name}</p>
                                <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                    <Clock className="w-3.5 h-3.5" /> Assigned {formatDateTime(application.inspectionAssignedAt)}
                                </p>
                                <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                    <CalendarClock className="w-3.5 h-3.5" /> Scheduled inspection: {formatDate(application.scheduledInspectionDate)}
                                </p>
                                {application.inspectionCompletedAt && (
                                    <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Inspection completed {formatDateTime(application.inspectionCompletedAt)}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground">No committee assigned yet.</p>
                        )}
                    </CardContent>
                </Card>

                {application.committee && <CommitteeAttendanceCard attendance={attendance} />}

                <ChecklistResultsSection
                    checklistResults={checklistResults}
                    getEvidenceBlob={superAdminCenterApplicationService.getEvidenceBlob}
                />

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

                <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-5">
                        <CommentThread applicationId={applicationId} canPost={false} />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
