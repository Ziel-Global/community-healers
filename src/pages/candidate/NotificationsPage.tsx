import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { InAppAlerts } from "@/components/StudentPortal/Notifications/InAppAlerts";

export default function NotificationsPage() {
    return (
        <DashboardLayout
            title="Notifications"
            subtitle="Stay updated with your application status"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-3xl mx-auto">
                <InAppAlerts />
            </div>
        </DashboardLayout>
    );
}
