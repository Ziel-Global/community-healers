import { useMemo, useState } from "react";
import { Search, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCenterApplications } from "@/hooks/queries/useDirectorOperationsCenterApplicationQueries";
import { useCommitteeForDirectorOperations } from "@/hooks/queries/useCommitteeQueries";
import { useCities } from "@/hooks/queries/useReferenceQueries";
import { KanbanBoard } from "./KanbanBoard";
import { TableView } from "./TableView";
import { ViewToggle, type ApplicationsView } from "./ViewToggle";
import { AssignCommitteeDialog } from "./AssignCommitteeDialog";
import { RejectApplicationDialog } from "./RejectApplicationDialog";
import { ApproveApplicationDialog } from "./ApproveApplicationDialog";
import { KANBAN_STATUSES } from "./statusMeta";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

export function CenterApplicationsBoard() {
    const { data: applications = [], isLoading, error } = useCenterApplications();
    const { data: cities = [] } = useCities();
    const { data: committee } = useCommitteeForDirectorOperations();

    const [view, setView] = useState<ApplicationsView>("kanban");
    const [search, setSearch] = useState("");

    const [assignTarget, setAssignTarget] = useState<CenterApplicationSummary | null>(null);
    const [rejectTarget, setRejectTarget] = useState<CenterApplicationSummary | null>(null);
    const [approveTarget, setApproveTarget] = useState<CenterApplicationSummary | null>(null);

    const cityNameById = useMemo(() => new Map(cities.map((c) => [c.id, c.name])), [cities]);
    // There's exactly one committee — a 1-entry map keeps the card/column components unchanged.
    const committeeNameById = useMemo(
        () => (committee ? new Map([[committee.id, committee.name]]) : new Map<string, string>()),
        [committee]
    );

    const kanbanStatusSet = useMemo(() => new Set(KANBAN_STATUSES), []);

    const filteredApplications = useMemo(() => {
        const submitted = applications.filter((a) => kanbanStatusSet.has(a.status));
        const term = search.trim().toLowerCase();
        if (!term) return submitted;

        return submitted.filter((application) => {
            const cityName = application.cityId ? cityNameById.get(application.cityId) ?? "" : "";
            return (
                (application.centerName ?? "").toLowerCase().includes(term) ||
                application.cnic.toLowerCase().includes(term) ||
                application.licenseNumber.toLowerCase().includes(term) ||
                cityName.toLowerCase().includes(term)
            );
        });
    }, [applications, search, kanbanStatusSet, cityNameById]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-16">
                <p className="text-sm text-destructive">Failed to load center applications.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by center, city, CNIC or license..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                    />
                </div>
                <ViewToggle view={view} onChange={setView} />
            </div>

            {filteredApplications.length === 0 && applications.filter((a) => kanbanStatusSet.has(a.status)).length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <ClipboardList className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No submitted applications yet</p>
                        <p className="text-xs text-muted-foreground mt-1">New submissions will appear here once applicants finish onboarding</p>
                    </div>
                </div>
            ) : view === "kanban" ? (
                <KanbanBoard
                    applications={filteredApplications}
                    cityNameById={cityNameById}
                    committeeNameById={committeeNameById}
                    onRequestAssign={setAssignTarget}
                    onRequestReject={setRejectTarget}
                    onRequestApprove={setApproveTarget}
                />
            ) : (
                <TableView
                    applications={filteredApplications}
                    cityNameById={cityNameById}
                    committeeNameById={committeeNameById}
                    onRequestAssign={setAssignTarget}
                    onRequestReject={setRejectTarget}
                    onRequestApprove={setApproveTarget}
                />
            )}

            <AssignCommitteeDialog application={assignTarget} onClose={() => setAssignTarget(null)} onAssigned={() => setAssignTarget(null)} />
            <RejectApplicationDialog application={rejectTarget} onClose={() => setRejectTarget(null)} onRejected={() => setRejectTarget(null)} />
            <ApproveApplicationDialog application={approveTarget} onClose={() => setApproveTarget(null)} onApproved={() => setApproveTarget(null)} />
        </div>
    );
}
