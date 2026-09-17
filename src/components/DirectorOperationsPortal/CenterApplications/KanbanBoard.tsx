import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";
import { KanbanColumn } from "./KanbanColumn";
import { ApplicationCard } from "./ApplicationCard";
import { KANBAN_STATUSES } from "./statusMeta";
import type { CenterApplicationStatus, CenterApplicationSummary } from "@/services/centerApplicationService";

interface KanbanBoardProps {
    applications: CenterApplicationSummary[];
    cityNameById: Map<string, string>;
    committeeNameById: Map<string, string>;
    onRequestAssign: (application: CenterApplicationSummary) => void;
    onRequestReject: (application: CenterApplicationSummary) => void;
    onRequestApprove: (application: CenterApplicationSummary) => void;
}

export function KanbanBoard({ applications, cityNameById, committeeNameById, onRequestAssign, onRequestReject, onRequestApprove }: KanbanBoardProps) {
    const { toast } = useToast();
    const [activeApplication, setActiveApplication] = useState<CenterApplicationSummary | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const applicationsByStatus = useMemo(() => {
        const map = new Map<CenterApplicationStatus, CenterApplicationSummary[]>();
        for (const status of KANBAN_STATUSES) map.set(status, []);
        for (const application of applications) {
            map.get(application.status)?.push(application);
        }
        return map;
    }, [applications]);

    const handleDragStart = (event: DragStartEvent) => {
        const application = applications.find((a) => a.id === event.active.id);
        setActiveApplication(application ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveApplication(null);
        const { active, over } = event;
        if (!over) return;

        const application = applications.find((a) => a.id === active.id);
        if (!application) return;

        const fromStatus = application.status;
        const toStatus = over.id as CenterApplicationStatus;
        if (fromStatus === toStatus) return;

        if (toStatus === "INSPECTION_IN_PROGRESS") {
            if (fromStatus !== "INSPECTION_PENDING") {
                toast({ variant: "destructive", title: "Can't move there", description: "Only new applications can be assigned a committee." });
                return;
            }
            onRequestAssign(application);
            return;
        }

        if (toStatus === "REJECTED") {
            if (fromStatus === "APPROVED") {
                toast({ variant: "destructive", title: "Can't move there", description: "An approved application can't be rejected." });
                return;
            }
            onRequestReject(application);
            return;
        }

        if (toStatus === "APPROVED") {
            if (fromStatus !== "UNDER_REVIEW") {
                toast({ variant: "destructive", title: "Can't move there", description: "The inspection must be completed before approval." });
                return;
            }
            onRequestApprove(application);
            return;
        }

        if (toStatus === "UNDER_REVIEW") {
            toast({ title: "Moves automatically", description: "This card moves here once the committee submits their inspection." });
            return;
        }

        if (toStatus === "INSPECTION_PENDING") {
            toast({ variant: "destructive", title: "Can't move there", description: "Applications can't be moved back to New." });
        }
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
                {KANBAN_STATUSES.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        applications={applicationsByStatus.get(status) ?? []}
                        cityNameById={cityNameById}
                        committeeNameById={committeeNameById}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeApplication && (
                    <div className="rotate-2 scale-105">
                        <ApplicationCard
                            application={activeApplication}
                            cityName={activeApplication.cityId ? cityNameById.get(activeApplication.cityId) ?? null : null}
                            committeeName={activeApplication.committeeId ? committeeNameById.get(activeApplication.committeeId) ?? null : null}
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
