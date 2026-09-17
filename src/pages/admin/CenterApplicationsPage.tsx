import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { CenterApplicationsReadOnlyTable } from "@/components/SuperAdminPortal/CenterApplicationsReadOnlyTable";

export default function CenterApplicationsPage() {
    return (
        <DashboardLayout
            title="Center Applications"
            subtitle="View-only — assignment and decisions are made by Director of Operations"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <CenterApplicationsReadOnlyTable />
        </DashboardLayout>
    );
}
