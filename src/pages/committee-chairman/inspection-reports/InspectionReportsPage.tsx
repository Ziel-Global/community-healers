import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, ClipboardCheck, Loader2, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import {
  AssignmentsViewToggle,
  type AssignmentsView,
} from "@/components/CommitteeMemberPortal/AssignmentsViewToggle";
import { useChairmanApplications } from "@/hooks/queries/useCommitteeChairmanQueries";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";
import { committeeChairmanNavItems } from "../../CommitteeChairmanPortal";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const headCell =
  "h-11 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6d8474] bg-[#f4f7f3]";

function InspectionReportsTable({ applications }: { applications: CenterApplicationSummary[] }) {
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
              <TableHead className={cn(headCell, "hidden sm:table-cell")}>Inspection date</TableHead>
              <TableHead className={cn(headCell, "w-12 text-right")}>
                <span className="sr-only">Open</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => {
              const meta = APPLICATION_STATUS_META[application.status];
              return (
                <TableRow
                  key={application.id}
                  className="border-b border-[#e7eee9] last:border-0 cursor-pointer transition-colors hover:bg-[#f8faf7]"
                  onClick={() => navigate(`/committee-chairman/inspection-reports/${application.id}`)}
                >
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-[10px] bg-[#e8f0ea] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-[#164c3e]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#183d34] truncate">
                          {application.centerName || "Unnamed center"}
                        </p>
                        <p className="text-[11px] text-[#93a087] md:hidden truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {application.address || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 hidden md:table-cell max-w-[260px]">
                    <p className="text-sm text-[#6d8474] truncate">{application.address || "—"}</p>
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
                      {formatDate(application.scheduledInspectionDate)}
                    </p>
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
      <div className="px-4 py-3 border-t border-[#e7eee9] bg-[#f8faf7]">
        <p className="text-xs text-[#6d8474]">
          Showing <span className="font-semibold text-[#183d34]">{applications.length}</span> center
          {applications.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

export default function InspectionReportsPage() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useChairmanApplications();
  const [view, setView] = useState<AssignmentsView>("table");

  const scheduled = useMemo(
    () =>
      [...applications]
        .filter((a) => a.status === "SCHEDULED")
        .sort((a, b) => {
          const aDate = a.scheduledInspectionDate ?? a.updatedAt;
          const bDate = b.scheduledInspectionDate ?? b.updatedAt;
          return new Date(aDate).getTime() - new Date(bDate).getTime();
        }),
    [applications],
  );

  return (
    <DashboardLayout
      title="Inspection reports"
      subtitle="Centers forwarded for on-site inspection — review member reports and decide"
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-[1600px] mx-auto space-y-5 pb-12">
        {!isLoading && scheduled.length > 0 && (
          <div className="flex justify-end">
            <AssignmentsViewToggle view={view} onChange={setView} />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : scheduled.length === 0 ? (
          <div className="text-center py-16 rounded-[20px] border border-dashed border-[#c9d6c8] bg-white">
            <ClipboardCheck className="w-12 h-12 text-[#c9d6c8] mx-auto mb-3" />
            <p className="text-[#183d34] font-medium">No scheduled inspections right now</p>
            <p className="text-xs text-[#6d8474] mt-1">
              Forward an application with a date from Applications first
            </p>
          </div>
        ) : view === "table" ? (
          <InspectionReportsTable applications={scheduled} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {scheduled.map((application) => {
              const meta = APPLICATION_STATUS_META[application.status];
              return (
                <button
                  key={application.id}
                  type="button"
                  onClick={() => navigate(`/committee-chairman/inspection-reports/${application.id}`)}
                  className={cn(
                    "group relative text-left w-full overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white",
                    "shadow-[0_10px_30px_#163a2b08] transition-all duration-300",
                    "hover:-translate-y-1 hover:shadow-[0_18px_40px_#163a2b12] hover:border-[#c9dbc0]"
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-[#164c3e]" />
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-[14px] bg-[#e8f0ea] flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-[#164c3e]" strokeWidth={1.75} />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border",
                          meta?.chipClassName
                        )}
                      >
                        {meta?.label ?? application.status}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#183d34] tracking-tight truncate">
                        {application.centerName || "Unnamed center"}
                      </h3>
                      {application.address && (
                        <p className="text-xs text-[#6d8474] flex items-center gap-1 mt-1.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0" /> {application.address}
                        </p>
                      )}
                    </div>
                    <p className="text-[11px] text-[#93a087] pt-1 border-t border-[#e7eee9]">
                      Inspection: {formatDate(application.scheduledInspectionDate)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
