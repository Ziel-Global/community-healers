import { DashboardLayout } from "@/components/DashboardLayout";
import { directorOperationsNavItems } from "../DirectorOperationsPortal";
import { CenterApplicationsBoard } from "@/components/DirectorOperationsPortal/CenterApplications/CenterApplicationsBoard";

export default function CenterApplicationsPage() {
    return (
        <DashboardLayout
            title="Center Applications"
            subtitle="Review submissions, assign committees, and approve or reject centers"
            portalType="director-operations"
            navItems={directorOperationsNavItems}
        >
            <CenterApplicationsBoard />
        </DashboardLayout>
    );
}
