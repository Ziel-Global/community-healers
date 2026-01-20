import { DashboardLayout } from "@/components/DashboardLayout";
import { ministryNavItems } from "../MinistryPortal";
import { VerifiableRegistry } from "@/components/MinistryPortal/Registry/VerifiableRegistry";

export default function RegistryPage() {
    return (
        <DashboardLayout
            title="Official Certification Registry"
            subtitle="Verifiable and immutable database of all issued certificates"
            portalType="ministry"
            navItems={ministryNavItems}
        >
            <div className="max-w-5xl mx-auto">
                <VerifiableRegistry />
            </div>
        </DashboardLayout>
    );
}
