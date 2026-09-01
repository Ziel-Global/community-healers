import { DashboardLayout } from "@/components/DashboardLayout";
import { ministryNavItems } from "../MinistryPortal";
import { DegreeReviewTable } from "@/components/MinistryPortal/DegreeReview/DegreeReviewTable";

export default function DegreeReviewPage() {
    return (
        <DashboardLayout
            title="Degree Certification Review"
            subtitle="Review 14-year education transcripts submitted in place of the exam"
            portalType="ministry"
            navItems={ministryNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <DegreeReviewTable />
            </div>
        </DashboardLayout>
    );
}
