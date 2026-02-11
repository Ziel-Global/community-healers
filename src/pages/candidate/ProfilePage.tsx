import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { PersonalInfoForm } from "@/components/StudentPortal/Profile/PersonalInfoForm";
import { DocumentUpload } from "@/components/StudentPortal/Profile/DocumentUpload";
import { EducationDeclaration } from "@/components/StudentPortal/Profile/EducationDeclaration";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
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

    if (loading) {
        return (
            <DashboardLayout
                title="My Profile"
                subtitle="Manage your personal information and documents"
                portalType="candidate"
                navItems={candidateNavItems}
            >
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="My Profile"
            subtitle="Manage your personal information and documents"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-5xl mx-auto space-y-8">
                <PersonalInfoForm candidateData={candidateData} />
                <EducationDeclaration candidateData={candidateData} />
                <DocumentUpload candidateData={candidateData} />
            </div>
        </DashboardLayout>
    );
}
