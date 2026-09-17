import { DashboardLayout } from "@/components/DashboardLayout";
import { ministryNavItems } from "../MinistryPortal";
import { PassedCandidateTable } from "@/components/MinistryPortal/Review/PassedCandidateTable";

export default function ReviewPage() {
    return (
        <DashboardLayout
            title="Certification Exceptions"
            subtitle="Candidates who passed but have no certificate — certificates are now issued automatically on a pass, so anyone listed here indicates a problem"
            portalType="ministry"
            navItems={ministryNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <PassedCandidateTable />
            </div>
        </DashboardLayout>
    );
}
