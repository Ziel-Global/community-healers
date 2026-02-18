import { useState } from "react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { CandidateSearch } from "@/components/CentreAdminPortal/Candidates/CandidateSearch";
import { CandidateTable } from "@/components/CentreAdminPortal/Candidates/CandidateTable";

export default function CandidatesPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [statusFilter, setStatusFilter] = useState<string>("all");

    return (
        <DashboardLayout
            title="Candidate Management"
            subtitle="Search and manage candidates by date"
            portalType="center"
            navItems={centerNavItems}
        >
            <div className="space-y-6 max-w-[1600px] mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-foreground alumni-sans-title">Candidate Queue</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(selectedDate, "MMMM dd, yyyy")}
                    </p>
                </div>
                <CandidateSearch
                    selectedDate={selectedDate}
                    onDateChange={(date) => date && setSelectedDate(date)}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                />
                <CandidateTable
                    statusFilter={statusFilter}
                    examDate={format(selectedDate, "yyyy-MM-dd")}
                    canVerify={false}
                />
            </div>
        </DashboardLayout>
    );
}
