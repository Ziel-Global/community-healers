import { DashboardLayout } from "@/components/DashboardLayout";
import { ministryNavItems } from "../MinistryPortal";
import { PassedCandidateTable } from "@/components/MinistryPortal/Review/PassedCandidateTable";

export default function ReviewPage() {
    return (
        <DashboardLayout
            title="Certification Authority"
            subtitle="Review passed candidates and issue official certificates"
            portalType="ministry"
            navItems={ministryNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <PassedCandidateTable />
            </div>
        </DashboardLayout>
    );
}
