import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { PersonalInfoForm } from "@/components/StudentPortal/Profile/PersonalInfoForm";
import { DocumentUpload } from "@/components/StudentPortal/Profile/DocumentUpload";
import { EducationDeclaration } from "@/components/StudentPortal/Profile/EducationDeclaration";

export default function ProfilePage() {
    return (
        <DashboardLayout
            title="My Profile"
            subtitle="Manage your personal information and documents"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-5xl mx-auto space-y-8">
                <PersonalInfoForm />
                <EducationDeclaration />
                <DocumentUpload />
            </div>
        </DashboardLayout>
    );
}
