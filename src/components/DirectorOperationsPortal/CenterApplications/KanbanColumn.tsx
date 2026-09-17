import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ApplicationCard } from "./ApplicationCard";
import { APPLICATION_STATUS_META } from "./statusMeta";
import type { CenterApplicationStatus, CenterApplicationSummary } from "@/services/centerApplicationService";

interface KanbanColumnProps {
    status: CenterApplicationStatus;
    applications: CenterApplicationSummary[];
    cityNameById: Map<string, string>;
    committeeNameById: Map<string, string>;
}

export function KanbanColumn({ status, applications, cityNameById, committeeNameById }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const meta = APPLICATION_STATUS_META[status];

    return (
        <div className="flex flex-col min-w-[290px] w-[290px] shrink-0">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-t-2xl border border-b-0 border-border/40 bg-gradient-to-b from-card to-secondary/20">
                <span className={cn("w-2 h-2 rounded-full", meta.dot, meta.glow)} />
                <h3 className="text-sm font-bold text-foreground tracking-tight">{meta.label}</h3>
                <span className="text-[11px] text-muted-foreground font-semibold ml-auto bg-secondary/70 rounded-full min-w-[22px] text-center px-1.5 py-0.5">
                    {applications.length}
                </span>
            </div>
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 space-y-2.5 rounded-b-2xl p-2.5 pt-3 min-h-[160px] border border-t-0 transition-colors",
                    "bg-gradient-to-b from-secondary/20 to-secondary/5",
                    isOver ? "border-primary/50 bg-primary/5 ring-2 ring-primary/10 ring-inset" : "border-border/40"
                )}
            >
                {applications.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 text-center py-10">No applications</p>
                ) : (
                    applications.map((application) => (
                        <ApplicationCard
                            key={application.id}
                            application={application}
                            cityName={application.cityId ? cityNameById.get(application.cityId) ?? null : null}
                            committeeName={application.committeeId ? committeeNameById.get(application.committeeId) ?? null : null}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
