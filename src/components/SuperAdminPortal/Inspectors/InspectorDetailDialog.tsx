import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, CalendarDays, Building2, MapPin, ChevronRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCenterApplications } from "@/hooks/queries/useCenterApplicationQueries";
import { useCities } from "@/hooks/queries/useReferenceQueries";
import { APPLICATION_STATUS_META, initials } from "../CenterApplications/statusMeta";
import type { CenterApplicationInspector } from "@/services/centerApplicationService";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

interface InspectorDetailDialogProps {
    inspector: CenterApplicationInspector | null;
    onClose: () => void;
}

export function InspectorDetailDialog({ inspector, onClose }: InspectorDetailDialogProps) {
    const navigate = useNavigate();
    const { data: applications = [] } = useCenterApplications();
    const { data: cities = [] } = useCities();
    const cityNameById = new Map(cities.map((c) => [c.id, c.name]));

    if (!inspector) return null;

    const name = [inspector.firstName, inspector.lastName].filter(Boolean).join(" ") || inspector.email;
    const assigned = applications
        .filter((a) => a.inspectorId === inspector.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return (
        <Dialog open={!!inspector} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="sr-only">Inspector Details</DialogTitle>
                    <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center shrink-0 text-base font-bold shadow-primary">
                            {initials(inspector.firstName, inspector.lastName, inspector.email)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="alumni-sans-title text-xl text-foreground leading-tight">{name}</h3>
                                <Badge variant={inspector.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                                    {inspector.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Mail className="w-3 h-3" /> {inspector.email}
                            </p>
                            {inspector.phoneNumber && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3" /> {inspector.phoneNumber}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <CalendarDays className="w-3 h-3" /> Joined {formatDate(inspector.createdAt)}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" /> Assigned Applications ({assigned.length})
                    </p>

                    {assigned.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center bg-secondary/20 rounded-xl border border-dashed border-border/50">
                            No applications assigned yet.
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {assigned.map((application) => {
                                const meta = APPLICATION_STATUS_META[application.status];
                                const cityName = application.cityId ? cityNameById.get(application.cityId) : null;
                                return (
                                    <button
                                        key={application.id}
                                        onClick={() => {
                                            onClose();
                                            navigate(`/admin/applications/${application.id}`);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card hover:border-primary/40 hover:bg-secondary/20 transition-colors text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Building2 className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {application.centerName || "Untitled Center"}
                                            </p>
                                            {cityName && (
                                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {cityName}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className={cn("gap-1.5 text-[10px] shrink-0 border", meta.chipClassName)}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                                            {meta.label}
                                        </Badge>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
