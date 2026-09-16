import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { InspectorManager } from "@/components/SuperAdminPortal/Inspectors/InspectorManager";

export default function InspectorsPage() {
    return (
        <DashboardLayout
            title="Inspectors"
            subtitle="Manage field inspectors who carry out center inspections"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <InspectorManager />
            </div>
        </DashboardLayout>
    );
}
