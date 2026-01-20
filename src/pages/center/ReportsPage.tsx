import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { HistoricalReports } from "@/components/CentreAdminPortal/Reports/HistoricalReports";

export default function ReportsPage() {
    return (
        <DashboardLayout
            title="Historical Reports"
            subtitle="Access and download past performance data"
            portalType="center"
            navItems={centerNavItems}
        >
            <div className="max-w-5xl mx-auto">
                <HistoricalReports />
            </div>
        </DashboardLayout>
    );
}
