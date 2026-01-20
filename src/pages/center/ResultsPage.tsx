import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { DailyResultsView } from "@/components/CentreAdminPortal/Results/DailyResultsView";

export default function ResultsPage() {
    return (
        <DashboardLayout
            title="Exam Results"
            subtitle="View daily result summaries and pass rates"
            portalType="center"
            navItems={centerNavItems}
        >
            <div className="max-w-4xl mx-auto">
                <DailyResultsView />
            </div>
        </DashboardLayout>
    );
}
