import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { ExamRulesForm } from "@/components/SuperAdminPortal/Configuration/ExamRulesForm";

export default function ConfigPage() {
    return (
        <DashboardLayout
            title="Global Configuration"
            subtitle="Manage system-wide training rules and policies"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-4xl mx-auto">
                <ExamRulesForm />
            </div>
        </DashboardLayout>
    );
}
