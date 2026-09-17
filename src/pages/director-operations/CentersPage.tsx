import { DashboardLayout } from "@/components/DashboardLayout";
import { directorOperationsNavItems } from "../DirectorOperationsPortal";
import { CenterList } from "@/components/DirectorOperationsPortal/Centers/CenterList";

export default function CentersPage() {
    return (
        <DashboardLayout
            title="Training Centers"
            subtitle="Read-only view of every registered training center"
            portalType="director-operations"
            navItems={directorOperationsNavItems}
        >
            <div className="max-w-6xl mx-auto">
                <CenterList />
            </div>
        </DashboardLayout>
    );
}
