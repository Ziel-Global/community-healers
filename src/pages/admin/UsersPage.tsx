import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { AdminAccountList } from "@/components/SuperAdminPortal/Users/AdminAccountList";

export default function UsersPage() {
    return (
        <DashboardLayout
            title="Administrator Management"
            subtitle="Manage center admins and their assigned facilities"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <AdminAccountList />
            </div>
        </DashboardLayout>
    );
}
