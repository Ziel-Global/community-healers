import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { CommitteeManager } from "@/components/SuperAdminPortal/Committee/CommitteeManager";

export default function CommitteePage() {
    return (
        <DashboardLayout
            title="Approval Committee"
            subtitle="Manage who reviews and inspects center applications"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <CommitteeManager />
            </div>
        </DashboardLayout>
    );
}
