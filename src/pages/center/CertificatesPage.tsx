import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { CertificatesTable } from "@/components/CentreAdminPortal/Certificates/CertificatesTable";

export default function CertificatesPage() {
    return (
        <DashboardLayout
            title="Certificates"
            subtitle="Certificates issued to your center's candidates"
            portalType="center"
            navItems={centerNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <CertificatesTable />
            </div>
        </DashboardLayout>
    );
}
