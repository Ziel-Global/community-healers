import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { AcademyManager } from "@/components/SuperAdminPortal/Content/AcademyManager";

export default function AcademyPage() {
    return (
        <DashboardLayout
            title="Training Academy"
            subtitle="Manage curriculum and Urdu training videos"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-5xl mx-auto">
                <AcademyManager />
            </div>
        </DashboardLayout>
    );
}
