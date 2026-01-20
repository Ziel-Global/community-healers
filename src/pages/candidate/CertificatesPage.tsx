import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { CertificateView } from "@/components/StudentPortal/Certificates/CertificateView";

export default function CertificatesPage() {
    return (
        <DashboardLayout
            title="My Certificates"
            subtitle="View and download your official certifications"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-5xl mx-auto">
                <CertificateView
                    isIssued={true}
                    certNumber="CP-2024-88A21"
                    issueDate="Jan 20, 2024"
                />
            </div>
        </DashboardLayout>
    );
}
