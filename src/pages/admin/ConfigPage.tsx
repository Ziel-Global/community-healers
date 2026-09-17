import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { ExamRulesForm } from "@/components/SuperAdminPortal/Configuration/ExamRulesForm";
import { CertificateTemplateForm } from "@/components/SuperAdminPortal/Configuration/CertificateTemplateForm";

export default function ConfigPage() {
    return (
        <DashboardLayout
            title="Global Configuration"
            subtitle="Manage system-wide training rules and policies"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                <ExamRulesForm />
                <CertificateTemplateForm />
            </div>
        </DashboardLayout>
    );
}
