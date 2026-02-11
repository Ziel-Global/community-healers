import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PersonalInfoForm } from "@/components/StudentPortal/Profile/PersonalInfoForm";
import { DocumentUpload } from "@/components/StudentPortal/Profile/DocumentUpload";
import { EducationDeclaration } from "@/components/StudentPortal/Profile/EducationDeclaration";
import { ProfileStatusTracker } from "@/components/StudentPortal/Profile/ProfileStatusTracker";
import { LayoutDashboard, FileText, Calendar, BookOpen, Award, User, Bell } from "lucide-react";
import { api } from "@/services/api";

export const candidateNavItems = [
    {
        label: "Dashboard",
        href: "/candidate",
        icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
        label: "Registration",
        href: "/candidate/registration",
        icon: <FileText className="w-4 h-4" />,
    },
    {
        label: "Schedule Exam",
        href: "/candidate/schedule",
        icon: <Calendar className="w-4 h-4" />,
    },
    {
        label: "Training Videos",
        href: "/candidate/training",
        icon: <BookOpen className="w-4 h-4" />,
    },
    {
        label: "Certificates",
        href: "/candidate/certificates",
        icon: <Award className="w-4 h-4" />,
    },
    {
        label: "Notifications",
        href: "/candidate/notifications",
        icon: <Bell className="w-4 h-4" />,
    },
    {
        label: "Profile",
        href: "/candidate/profile",
        icon: <User className="w-4 h-4" />,
    },
];

const steps = [
    { id: "1", label: "Personal Info", status: "complete" as const },
    { id: "2", label: "Documents", status: "current" as const },
    { id: "3", label: "Education", status: "pending" as const },
    { id: "4", label: "Fee Payment", status: "pending" as const },
];

export default function RegistrationPage() {
    const [candidateData, setCandidateData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidateData = async () => {
            try {
                const response = await api.get('/candidates/me');
                setCandidateData(response.data.data);
            } catch (error) {
                console.error('Failed to fetch candidate data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCandidateData();
    }, []);

    return (
        <DashboardLayout
            title="Candidate Registration"
            subtitle="Complete your profile to qualify for the exam"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-5xl mx-auto space-y-8">
                <ProfileStatusTracker steps={steps} percentage={45} />

                <div className="grid gap-8">
                    <PersonalInfoForm candidateData={candidateData} />
                    <DocumentUpload candidateData={candidateData} />
                    <EducationDeclaration candidateData={candidateData} />
                </div>
            </div>
        </DashboardLayout>
    );
}
