import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Search, ClipboardList, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCenterApplications } from "@/hooks/queries/useSuperAdminCenterApplicationQueries";
import { useCities } from "@/hooks/queries/useReferenceQueries";
import { APPLICATION_STATUS_META, KANBAN_STATUSES } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";

const headCell = "text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

/** Super Admin's view-only mirror of the Director of Operations board — no assign/approve/reject actions. */
export function CenterApplicationsReadOnlyTable() {
    const navigate = useNavigate();
    const { data: applications = [], isLoading, error } = useCenterApplications();
    const { data: cities = [] } = useCities();
    const [search, setSearch] = useState("");

    const cityNameById = useMemo(() => new Map(cities.map((c) => [c.id, c.name])), [cities]);
    const kanbanStatusSet = useMemo(() => new Set(KANBAN_STATUSES), []);

    const filtered = useMemo(() => {
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search by center, city, CNIC or license..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <ClipboardList className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No submitted applications yet</p>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/40 bg-gradient-to-r from-secondary/40 to-secondary/10 hover:bg-gradient-to-r hover:from-secondary/40 hover:to-secondary/10">
                                    <TableHead className={headCell}>Center</TableHead>
                                    <TableHead className={headCell}>Status</TableHead>
                                    <TableHead className={cn(headCell, "hidden md:table-cell")}>City</TableHead>
                                    <TableHead className={cn(headCell, "hidden lg:table-cell")}>License / CNIC</TableHead>
                                    <TableHead className={cn(headCell, "hidden sm:table-cell")}>Updated</TableHead>
                                    <TableHead className={cn(headCell, "text-right")}>View</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((application) => {
                                    const meta = APPLICATION_STATUS_META[application.status];
                                    const cityName = application.cityId ? cityNameById.get(application.cityId) : null;
                                    return (
                                        <TableRow
                                            key={application.id}
                                            className="cursor-pointer border-b border-border/30 transition-colors hover:bg-secondary/30"
                                            onClick={() => navigate(`/admin/applications/${application.id}`)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Building2 className="w-3.5 h-3.5 text-primary" />
                                                    </div>
                                                    <span className="font-semibold text-sm text-foreground truncate max-w-[180px]">
                                                        {application.centerName || "Untitled Center"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("gap-1.5 font-medium text-[11px] border", meta.chipClassName)}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                                                    {meta.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{cityName || "—"}</TableCell>
                                            <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                                                {application.licenseNumber} · {application.cnic}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                                                {formatDate(application.updatedAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
