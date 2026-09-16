import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { CenterApplicationsBoard } from "@/components/SuperAdminPortal/CenterApplications/CenterApplicationsBoard";

export default function CenterApplicationsPage() {
    return (
        <DashboardLayout
            title="Center Applications"
            subtitle="Review submissions, assign inspectors, and approve or reject centers"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <CenterApplicationsBoard />
        </DashboardLayout>
    );
}
