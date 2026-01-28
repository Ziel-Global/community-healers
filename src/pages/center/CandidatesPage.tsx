import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { CandidateSearch } from "@/components/CentreAdminPortal/Candidates/CandidateSearch";
import { CandidateTable } from "@/components/CentreAdminPortal/Candidates/CandidateTable";

export default function CandidatesPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
                        {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <CandidateSearch selectedDate={selectedDate} onDateChange={(date) => date && setSelectedDate(date)} />
                <CandidateTable />
            </div>
        </DashboardLayout>
    );
}
