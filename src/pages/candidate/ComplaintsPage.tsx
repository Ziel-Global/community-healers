import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { ComplaintsPanel } from "@/components/StudentPortal/Complaints/ComplaintsPanel";

export default function ComplaintsPage() {
    return (
        <DashboardLayout
            title="Complaints"
            subtitle="File an issue or check the status of a complaint you've submitted"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-3xl mx-auto">
                <ComplaintsPanel />
            </div>
        </DashboardLayout>
    );
}
