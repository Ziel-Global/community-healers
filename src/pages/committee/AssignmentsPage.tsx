import { useMemo, useState } from "react";
import { ClipboardList, Loader2, Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { SoftSelect } from "@/components/ui/soft-select";
import { committeeNavItems } from "../CommitteeMemberPortal";
import { useAssignedApplications } from "@/hooks/queries/useCommitteeMemberQueries";
import { InspectionCard } from "@/components/CommitteeMemberPortal/InspectionCard";
import { AssignmentsTable } from "@/components/CommitteeMemberPortal/AssignmentsTable";
import {
    AssignmentsViewToggle,
    type AssignmentsView,
} from "@/components/CommitteeMemberPortal/AssignmentsViewToggle";

type FilterValue = "all" | "INSPECTION_IN_PROGRESS" | "SCHEDULED";

const FILTER_OPTIONS = [
    { value: "all", label: "All active" },
    { value: "INSPECTION_IN_PROGRESS", label: "Needs preparation" },
    { value: "SCHEDULED", label: "Scheduled" },
];

export default function AssignmentsPage() {
    const { data: applications = [], isLoading } = useAssignedApplications();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterValue>("all");
    const [view, setView] = useState<AssignmentsView>("table");

    const assignments = useMemo(() => {
        const active = applications.filter(
            (a) => a.status === "INSPECTION_IN_PROGRESS" || a.status === "SCHEDULED"
        );

        const statusFiltered =
            filter === "all" ? active : active.filter((a) => a.status === filter);

        const term = search.trim().toLowerCase();
        const filtered = !term
            ? statusFiltered
            : statusFiltered.filter(
                  (a) =>
                      (a.centerName ?? "").toLowerCase().includes(term) ||
                      (a.address ?? "").toLowerCase().includes(term) ||
                      a.licenseNumber.toLowerCase().includes(term) ||
                      a.cnic.toLowerCase().includes(term)
              );

        return [...filtered].sort((a, b) => {
            const aDate = a.scheduledInspectionDate ?? a.inspectionAssignedAt ?? a.updatedAt;
            const bDate = b.scheduledInspectionDate ?? b.inspectionAssignedAt ?? b.updatedAt;
            return new Date(aDate).getTime() - new Date(bDate).getTime();
        });
    }, [applications, filter, search]);

    return (
        <DashboardLayout
            title="Assignments"
            subtitle="Centers currently on your committee's plate"
            portalType="committee"
            navItems={committeeNavItems}
        >
            <div className="max-w-[1600px] mx-auto space-y-5 pb-12">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93a087] group-focus-within:text-[#164c3e] transition-colors" />
                            <Input
                                placeholder="Search by center, address, license…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>
                        <SoftSelect
                            size="lg"
                            className="sm:w-[200px]"
                            value={filter}
                            onValueChange={(v) => setFilter(v as FilterValue)}
                            options={FILTER_OPTIONS}
                        />
                    </div>
                    <AssignmentsViewToggle view={view} onChange={setView} />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-16 rounded-[20px] border border-dashed border-[#c9d6c8] bg-white">
                        <ClipboardList className="w-12 h-12 text-[#c9d6c8] mx-auto mb-3" />
                        <p className="text-[#183d34] font-medium">No matching assignments</p>
                        <p className="text-xs text-[#6d8474] mt-1">
                            {search || filter !== "all"
                                ? "Try clearing search or filters"
                                : "New work from the Bureau will appear here"}
                        </p>
                    </div>
                ) : view === "table" ? (
                    <AssignmentsTable applications={assignments} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {assignments.map((app) => (
                            <InspectionCard key={app.id} application={app} variant="tile" />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
