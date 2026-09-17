import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { PersonalInfoForm } from "@/components/StudentPortal/Profile/PersonalInfoForm";
import { DocumentUpload } from "@/components/StudentPortal/Profile/DocumentUpload";
import { EducationDeclaration } from "@/components/StudentPortal/Profile/EducationDeclaration";
import { Button } from "@/components/ui/button";
import { useCandidateMe, useUpdateCandidateMe } from "@/hooks/queries/useCandidateQueries";
import { useToast } from "@/hooks/use-toast";
import { PERSONAL_INFO_ERROR_CODES, personalInfoSchema } from "@/schemas/registrationSchemas";
import { getApiErrorMessage } from "@/lib/errors";
import { Loader2, Save } from "lucide-react";

interface PersonalInfo {
    fatherName: string;
    cnic: string;
    dob: string;
    phone: string;
    province: string;
    district: string;
    tehsil: string;
    address: string;
}

const emptyPersonalInfo: PersonalInfo = {
    fatherName: "",
    cnic: "",
    dob: "",
    phone: "",
    province: "",
    district: "",
    tehsil: "",
    address: "",
};

export default function ProfilePage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { data: candidateData, isLoading: loading } = useCandidateMe();
    const updateCandidateMeMutation = useUpdateCandidateMe();

    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(emptyPersonalInfo);
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

    // Same hydrate-once guard as RegistrationStep: without it, this effect
    // re-fires on every /candidates/me refetch (e.g. after a document
    // upload) and silently overwrites whatever the candidate had typed but
    // not yet saved.
    const hasHydratedRef = useRef(false);
    useEffect(() => {
        if (!candidateData || hasHydratedRef.current) return;
        hasHydratedRef.current = true;
        const dob = candidateData.dob ? new Date(candidateData.dob).toISOString().split('T')[0] : "";
        setPersonalInfo({
            fatherName: candidateData.fatherName || "",
            cnic: candidateData.cnic || "",
            dob,
            phone: candidateData.user?.phoneNumber || "",
            province: candidateData.province?.id || "",
            district: candidateData.district?.id || "",
            tehsil: candidateData.tehsil?.id || "",
            address: candidateData.address || "",
        });
    }, [candidateData]);

    const handlePersonalInfoUpdate = (field: keyof PersonalInfo, value: string) => {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const validation = personalInfoSchema.safeParse(personalInfo);

        if (!validation.success) {
            const newErrors: Record<string, boolean> = {};
            const codeByField: Record<string, string> = {};
            for (const issue of validation.error.issues) {
                const field = String(issue.path[0]);
                newErrors[field] = true;
                codeByField[field] = issue.message;
            }
            setFormErrors(newErrors);

            if (
                codeByField.cnic === PERSONAL_INFO_ERROR_CODES.CNIC_LENGTH ||
                codeByField.cnic === PERSONAL_INFO_ERROR_CODES.CNIC_FORMAT
            ) {
                toast({
                    title: t('registration.invalidCnic') || "Invalid CNIC",
                    description: t('registration.invalidCnicDesc') || "CNIC must be exactly 13 digits long without dashes.",
                    variant: "destructive",
                });
            } else if (codeByField.dob === PERSONAL_INFO_ERROR_CODES.DOB_TOO_YOUNG) {
                toast({
                    title: t('registration.ageRequirementTitle'),
                    description: t('registration.ageRequirementDesc'),
                    variant: "destructive",
                });
            } else {
                const labelMap: Record<string, string> = {
                    fatherName: t('personalInfo.fatherName'),
                    cnic: t('personalInfo.cnic'),
                    dob: t('personalInfo.dob'),
                    province: t('personalInfo.province'),
                    district: t('personalInfo.district'),
                    tehsil: t('personalInfo.tehsil'),
                    address: t('personalInfo.address'),
                };
                const missingFieldLabels = Object.keys(newErrors)
                    .filter((field) => codeByField[field] === PERSONAL_INFO_ERROR_CODES.REQUIRED || codeByField[field] === PERSONAL_INFO_ERROR_CODES.DOB_INVALID)
                    .map((field) => labelMap[field] || field);
                toast({
                    title: t('registration.fieldsRequired'),
                    description: `${t('registration.followingFieldsRequired')}: ${missingFieldLabels.join(", ")}`,
                    variant: "destructive",
                });
            }

            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setFormErrors({});

        try {
            await updateCandidateMeMutation.mutateAsync({
                fatherName: personalInfo.fatherName,
                cnic: personalInfo.cnic,
                dob: personalInfo.dob,
                address: personalInfo.address,
                province: personalInfo.province,
                district: personalInfo.district,
                tehsil: personalInfo.tehsil,
            });

            toast({
                title: t('registration.registrationSaved'),
                description: t('registration.registrationSavedDesc'),
            });
        } catch (error) {
            console.error("Profile update error:", error);
            toast({
                title: t('registration.error'),
                description: getApiErrorMessage(error, t('registration.failedToSave')),
                variant: "destructive",
            });
        }
    };

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
                <PersonalInfoForm
                    data={personalInfo}
                    onUpdate={handlePersonalInfoUpdate}
                    errors={formErrors}
                />
                <EducationDeclaration candidateData={candidateData} />
                <DocumentUpload candidateData={candidateData} />

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        size="lg"
                        disabled={updateCandidateMeMutation.isPending}
                    >
                        {updateCandidateMeMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('registration.saving')}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {t('common.save') || "Save Changes"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
