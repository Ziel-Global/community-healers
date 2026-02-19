import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { TrainingVideoList } from "@/components/StudentPortal/Training/TrainingVideoList";

export default function TrainingPage() {
    return (
        <DashboardLayout
            title="Training Academy"
            subtitle="Complete your mandatory training modules"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-4xl mx-auto training-portal" data-portal="training">
                <TrainingVideoList />
            </div>
        </DashboardLayout>
    );
}
