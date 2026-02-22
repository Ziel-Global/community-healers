import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { CenterManager } from "@/components/SuperAdminPortal/Locations/CenterManager";

export default function CentersPage() {
    return (
        <DashboardLayout
            title="Infrastructure Control"
            subtitle="Manage regions and training centers"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <CenterManager />
            </div>
        </DashboardLayout>
    );
}
