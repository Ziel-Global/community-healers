import { DashboardLayout } from "@/components/DashboardLayout";
import { ministryNavItems } from "../MinistryPortal";
import { MinistryIssuanceLogs } from "@/components/MinistryPortal/Audit/MinistryIssuanceLogs";

export default function LogsPage() {
    return (
        <DashboardLayout
            title="Authority Audit Logs"
            subtitle="Detailed trail of certificate approvals and authority actions"
            portalType="ministry"
            navItems={ministryNavItems}
        >
            <div className="max-w-4xl mx-auto">
                <MinistryIssuanceLogs />
            </div>
        </DashboardLayout>
    );
}
