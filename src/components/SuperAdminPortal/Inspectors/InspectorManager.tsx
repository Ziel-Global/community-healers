import { useMemo, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, Mail, Phone, Plus, Search, UserRound } from "lucide-react";
import { useInspectors, useCenterApplications } from "@/hooks/queries/useCenterApplicationQueries";
import { CreateInspectorDialog } from "../CenterApplications/CreateInspectorDialog";
import { InspectorDetailDialog } from "./InspectorDetailDialog";
import { initials } from "../CenterApplications/statusMeta";
import type { CenterApplicationInspector } from "@/services/centerApplicationService";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const headCell = "text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

export function InspectorManager() {
    const { data: inspectors = [], isLoading } = useInspectors();
    const { data: applications = [] } = useCenterApplications();
    const [search, setSearch] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedInspector, setSelectedInspector] = useState<CenterApplicationInspector | null>(null);

    const statsByInspectorId = useMemo(() => {
        const map = new Map<string, { active: number; total: number }>();
        for (const application of applications) {
            if (!application.inspectorId) continue;
            const entry = map.get(application.inspectorId) ?? { active: 0, total: 0 };
            entry.total += 1;
            if (application.status === "INSPECTION_IN_PROGRESS") entry.active += 1;
            map.set(application.inspectorId, entry);
        }
        return map;
    }, [applications]);

    const filteredInspectors = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return inspectors;
        return inspectors.filter((inspector) => {
            const name = [inspector.firstName, inspector.lastName].filter(Boolean).join(" ").toLowerCase();
            return name.includes(term) || inspector.email.toLowerCase().includes(term);
        });
    }, [inspectors, search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search inspectors by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                    />
                </div>
                <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="gradient-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg gap-2 w-full md:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    New Inspector
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading inspectors...</p>
                    </div>
                </div>
            ) : filteredInspectors.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <UserRound className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                            {inspectors.length === 0 ? "No inspectors yet" : "No inspectors match your search"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {inspectors.length === 0 && 'Click "New Inspector" to create one'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/40 bg-gradient-to-r from-secondary/40 to-secondary/10 hover:bg-gradient-to-r hover:from-secondary/40 hover:to-secondary/10">
                                    <TableHead className={headCell}>Inspector</TableHead>
                                    <TableHead className={headCell}>Status</TableHead>
                                    <TableHead className={`${headCell} hidden md:table-cell`}>Phone</TableHead>
                                    <TableHead className={`${headCell} text-center`}>Active Inspections</TableHead>
                                    <TableHead className={`${headCell} hidden sm:table-cell`}>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInspectors.map((inspector) => {
                                    const name = [inspector.firstName, inspector.lastName].filter(Boolean).join(" ") || inspector.email;
                                    const stats = statsByInspectorId.get(inspector.id) ?? { active: 0, total: 0 };

                                    return (
                                        <TableRow
                                            key={inspector.id}
                                            className="cursor-pointer border-b border-border/30 transition-colors hover:bg-secondary/30"
                                            onClick={() => setSelectedInspector(inspector)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-lg gradient-primary text-white flex items-center justify-center shrink-0 text-xs font-bold">
                                                        {initials(inspector.firstName, inspector.lastName, inspector.email)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                                            <Mail className="w-3 h-3 shrink-0" /> {inspector.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={inspector.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                                                    {inspector.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                {inspector.phoneNumber ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5" /> {inspector.phoneNumber}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                                    <ClipboardCheck className="w-3.5 h-3.5 text-primary" /> {stats.active}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                                {formatDate(inspector.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <CreateInspectorDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} onCreated={() => setShowCreateDialog(false)} />
            <InspectorDetailDialog inspector={selectedInspector} onClose={() => setSelectedInspector(null)} />
        </div>
    );
}
