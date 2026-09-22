import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Clock, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "./statusMeta";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

const TERMINAL_STATUSES = new Set(["APPROVED", "REJECTED"]);

function formatDate(iso: string | null): string | null {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ApplicationCardProps {
    application: CenterApplicationSummary;
    cityName: string | null;
    committeeName: string | null;
}

export function ApplicationCard({ application, cityName, committeeName }: ApplicationCardProps) {
    const navigate = useNavigate();
    const draggable = !TERMINAL_STATUSES.has(application.status);
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: application.id,
        disabled: !draggable,
    });

    const style = transform
        ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }
        : undefined;

    return (
        <Card
            ref={setNodeRef}
            style={style}
            onClick={() => navigate(`/bureau/applications/${application.id}`)}
            className="group relative overflow-hidden rounded-2xl border-border/40 bg-card shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
            <div className="absolute inset-x-0 top-0 h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate leading-tight">
                                {application.centerName || "Untitled Center"}
                            </p>
                            {cityName && (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" /> {cityName}
                                </p>
                            )}
                        </div>
                    </div>
                    {draggable && (
                        <button
                            {...attributes}
                            {...listeners}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 p-1 rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/10 cursor-grab active:cursor-grabbing touch-none transition-colors"
                            aria-label="Drag to move"
                        >
                            <GripVertical className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <p className="text-[11px] text-muted-foreground/80 font-mono truncate">
                    {application.licenseNumber} · {application.cnic}
                </p>

                {application.status === "REJECTED" && application.rejectionReason && (
                    <p className="text-[11px] text-destructive line-clamp-2 bg-destructive/5 rounded-lg px-2 py-1.5 border border-destructive/10">
                        {application.rejectionReason}
                    </p>
                )}

                <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
                    {committeeName ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                                className={cn(
                                    "shrink-0 w-5 h-5 rounded-full gradient-primary text-white text-[9px] font-bold",
                                    "flex items-center justify-center"
                                )}
                            >
                                {initials(committeeName.split(" ")[0], committeeName.split(" ")[1] ?? null, committeeName)}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">{committeeName}</span>
                        </div>
                    ) : (
                        <span className="text-[11px] text-muted-foreground/50 italic">Unassigned</span>
                    )}
                    <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {formatDate(application.updatedAt)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
