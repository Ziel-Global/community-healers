import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { SystemAuditLogs } from "@/components/SuperAdminPortal/Audit/SystemAuditLogs";

export default function AuditPage() {
    return (
        <DashboardLayout
            title="System Audit Heartbeat"
            subtitle="Overview of all global administrative and system actions"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-4xl mx-auto">
                <SystemAuditLogs />
            </div>
        </DashboardLayout>
    );
}
