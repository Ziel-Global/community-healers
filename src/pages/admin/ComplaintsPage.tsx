import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { ComplaintsAdminTable } from "@/components/SuperAdminPortal/Complaints/ComplaintsAdminTable";

export default function ComplaintsPage() {
    return (
        <DashboardLayout
            title="Complaints"
            subtitle="Candidate-filed complaints across the platform"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-4xl mx-auto">
                <ComplaintsAdminTable />
            </div>
        </DashboardLayout>
    );
}
