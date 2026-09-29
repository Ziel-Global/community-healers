import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import type { CommitteeApplication } from "@/services/committeeMemberService";

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

const headCell =
    "h-11 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6d8474] bg-[#f4f7f3]";

interface AssignmentsTableProps {
    applications: CommitteeApplication[];
}

export function AssignmentsTable({ applications }: AssignmentsTableProps) {
    const navigate = useNavigate();

    return (
        <div className="rounded-[20px] border border-[#d5e0d4] bg-white overflow-hidden shadow-[0_12px_40px_rgba(22,76,62,0.06)]">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-[#e7eee9] hover:bg-[#f4f7f3]">
                            <TableHead className={headCell}>Center</TableHead>
                            <TableHead className={cn(headCell, "hidden md:table-cell")}>Address</TableHead>
                            <TableHead className={headCell}>Status</TableHead>
                            <TableHead className={cn(headCell, "hidden sm:table-cell")}>Date</TableHead>
                            <TableHead className={cn(headCell, "hidden lg:table-cell")}>License / CNIC</TableHead>
                            <TableHead className={cn(headCell, "w-12 text-right")}>
                                <span className="sr-only">Open</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((application) => {
                            const meta = APPLICATION_STATUS_META[application.status as keyof typeof APPLICATION_STATUS_META];
                            const dateLabel =
                                application.status === "SCHEDULED"
                                    ? formatDate(application.scheduledInspectionDate)
                                    : formatDate(application.inspectionAssignedAt);

                            return (
                                <TableRow
                                    key={application.id}
                                    className="border-b border-[#e7eee9] last:border-0 cursor-pointer transition-colors hover:bg-[#f8faf7]"
                                    onClick={() => navigate(`/committee/applications/${application.id}`)}
                                >
                                    <TableCell className="px-4 py-3.5">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-[10px] bg-[#e8f0ea] flex items-center justify-center shrink-0">
                                                <Building2 className="w-4 h-4 text-[#164c3e]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#183d34] truncate">
                                                    {application.centerName || "Unnamed Center"}
                                                </p>
                                                <p className="text-[11px] text-[#93a087] md:hidden truncate mt-0.5 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    {application.address || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 hidden md:table-cell max-w-[240px]">
                                        <p className="text-sm text-[#6d8474] truncate">
                                            {application.address || "—"}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5">
                                        <span
                                            className={cn(
                                                "inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border whitespace-nowrap",
                                                meta?.chipClassName
                                            )}
                                        >
                                            {meta?.label ?? application.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 hidden sm:table-cell">
                                        <p className="text-sm font-medium text-[#183d34] tabular-nums whitespace-nowrap">
                                            {dateLabel}
                                        </p>
                                        <p className="text-[10px] text-[#93a087] mt-0.5">
                                            {application.status === "SCHEDULED" ? "Inspection" : "Assigned"}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 hidden lg:table-cell">
                                        <p className="text-xs font-mono text-[#6d8474]">{application.licenseNumber}</p>
                                        <p className="text-[11px] font-mono text-[#93a087] mt-0.5">{application.cnic}</p>
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-right">
                                        <ChevronRight className="w-4 h-4 text-[#c9d6c8] inline-block" />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            <div className="px-4 py-3 border-t border-[#e7eee9] bg-[#f8faf7] flex items-center justify-between gap-3">
                <p className="text-xs text-[#6d8474]">
                    Showing <span className="font-semibold text-[#183d34]">{applications.length}</span> assignment
                    {applications.length === 1 ? "" : "s"}
                </p>
            </div>
        </div>
    );
}
