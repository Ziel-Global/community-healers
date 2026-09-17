import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ExternalLink, UserCheck, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META, initials } from "./statusMeta";
import type { CenterApplicationStatus, CenterApplicationSummary } from "@/services/centerApplicationService";

interface TableViewProps {
    applications: CenterApplicationSummary[];
    cityNameById: Map<string, string>;
    committeeNameById: Map<string, string>;
    onRequestAssign: (application: CenterApplicationSummary) => void;
    onRequestReject: (application: CenterApplicationSummary) => void;
    onRequestApprove: (application: CenterApplicationSummary) => void;
}

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

const headCell = "text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

export function TableView({ applications, cityNameById, committeeNameById, onRequestAssign, onRequestReject, onRequestApprove }: TableViewProps) {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const total = applications.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    const start = (page - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, total);
    const pageItems = applications.slice(start, end);

    return (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 bg-gradient-to-r from-secondary/40 to-secondary/10 hover:bg-gradient-to-r hover:from-secondary/40 hover:to-secondary/10">
                            <TableHead className={headCell}>Center</TableHead>
                            <TableHead className={headCell}>Status</TableHead>
                            <TableHead className={cn(headCell, "hidden md:table-cell")}>City</TableHead>
                            <TableHead className={cn(headCell, "hidden lg:table-cell")}>License / CNIC</TableHead>
                            <TableHead className={cn(headCell, "hidden lg:table-cell")}>Committee</TableHead>
                            <TableHead className={cn(headCell, "hidden sm:table-cell")}>Updated</TableHead>
                            <TableHead className={cn(headCell, "text-right")}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                                    No applications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageItems.map((application) => {
                                const meta = APPLICATION_STATUS_META[application.status];
                                const cityName = application.cityId ? cityNameById.get(application.cityId) : null;
                                const committeeName = application.committeeId ? committeeNameById.get(application.committeeId) : null;

                                return (
                                    <TableRow
                                        key={application.id}
                                        className="cursor-pointer border-b border-border/30 transition-colors hover:bg-secondary/30"
                                        onClick={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.closest("button")) return;
                                            navigate(`/director-operations/applications/${application.id}`);
                                        }}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <span className="font-semibold text-sm text-foreground truncate max-w-[180px]" title={application.centerName ?? undefined}>
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
                                        <TableCell className="hidden lg:table-cell">
                                            {committeeName ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-5 h-5 rounded-full gradient-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                                        {initials(committeeName.split(" ")[0], committeeName.split(" ")[1] ?? null, committeeName)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{committeeName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/50 italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                                            {formatDate(application.updatedAt)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                {application.status === "INSPECTION_PENDING" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1.5 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => onRequestAssign(application)}
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5" /> Assign
                                                    </Button>
                                                )}
                                                {application.status === "UNDER_REVIEW" && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600"
                                                            title="Approve"
                                                            onClick={() => onRequestApprove(application)}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            title="Reject"
                                                            onClick={() => onRequestReject(application)}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                                    title="Open"
                                                    onClick={() => navigate(`/director-operations/applications/${application.id}`)}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 bg-secondary/10 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Rows per page:</span>
                    <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
                        <SelectTrigger className="h-8 w-[70px] rounded-lg border-border/60 bg-card text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-xs font-medium">{total === 0 ? "0 results" : `${start + 1}-${end} of ${total}`}</div>

                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
