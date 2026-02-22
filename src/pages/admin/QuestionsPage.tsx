import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { QuestionEditor } from "@/components/SuperAdminPortal/QuestionBank/QuestionEditor";

export default function QuestionsPage() {
    return (
        <DashboardLayout
            title="Question Bank Mastery"
            subtitle="Manage training questions and categories"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-5xl mx-auto">
                <QuestionEditor />
            </div>
        </DashboardLayout>
    );
}
