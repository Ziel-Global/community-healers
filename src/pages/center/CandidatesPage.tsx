import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { CandidateSearch } from "@/components/CentreAdminPortal/Candidates/CandidateSearch";
import { CandidateTable } from "@/components/CentreAdminPortal/Candidates/CandidateTable";

export default function CandidatesPage() {
    return (
        <DashboardLayout
            title="Candidate Management"
            subtitle="Search and manage today's candidate queue"
            portalType="center"
            navItems={centerNavItems}
        >
            <div className="space-y-6 max-w-[1200px] mx-auto">
                <CandidateSearch />
                <CandidateTable />
            </div>
        </DashboardLayout>
    );
}
