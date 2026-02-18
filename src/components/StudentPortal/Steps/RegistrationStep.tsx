import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { WizardStepProps } from "../CandidateWizard";
import { PersonalInfoForm } from "../Profile/PersonalInfoForm";
import { DocumentUpload } from "../Profile/DocumentUpload";
import { EducationDeclaration } from "../Profile/EducationDeclaration";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileCheck, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfo {
  fatherName: string;
  cnic: string;
  dob: string;
  phone: string;
  city: string;
  address: string;
}

export function RegistrationStep({ onNext, isFirstStep }: WizardStepProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [candidateData, setCandidateData] = useState<any>(null);
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  // Lifted state for PersonalInfoForm
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fatherName: "",
    cnic: "",
    dob: "",
    phone: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await api.get('/candidates/me');
        const data = response.data.data;
        setCandidateData(data);

        // Initialize personal info state from API data
        // Also check localStorage for any unsaved drafts if needed, but per request we strictly respect input/API flow
        // The user request was "what ever that we get from api that fills the input... the body should be made from that"
        // So we initialize with API data.

        const dob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : "";

        setPersonalInfo({
          fatherName: data.fatherName || "",
          cnic: data.cnic || "",
          dob: dob,
          phone: data.user?.phoneNumber || "",
          city: data.cityId || "",
          address: data.address || "",
        });

      } catch (error) {
        console.error('Failed to fetch candidate data', error);
      }
    };
    fetchCandidateData();
  }, []);

  const handlePersonalInfoUpdate = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Validate Personal Info Fields FIRST
      const requiredFields: (keyof PersonalInfo)[] = ["fatherName", "cnic", "dob", "city", "address"];
      const newErrors: Record<string, boolean> = {};
      const missingFieldLabels: string[] = [];

      requiredFields.forEach(field => {
        if (!personalInfo[field] || personalInfo[field].trim() === "") {
          newErrors[field] = true;
          // Map field keys to readable labels for the toast message
          const labelMap: Record<string, string> = {
            fatherName: t('personalInfo.fatherName'),
            cnic: t('personalInfo.cnic'),
            dob: t('personalInfo.dob'),
            city: t('personalInfo.city'),
            address: t('personalInfo.address')
          };
          missingFieldLabels.push(labelMap[field] || field);
        }
      });

      if (missingFieldLabels.length > 0) {
        setFormErrors(newErrors);
        toast({
          title: t('registration.fieldsRequired'),
          description: `${t('registration.followingFieldsRequired')}: ${missingFieldLabels.join(", ")}`,
          variant: "destructive",
        });
        // Scroll to top to show missing fields
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsLoading(false);
        return;
      }

      // Clear form errors if validation passed
      setFormErrors({});

      // 2. Validate documents SECOND
      const validationResponse = await api.get('/candidates/me/validate-documents');
      const validationData = validationResponse.data.data;

      if (!validationData.canProceedToPayment) {
        // Store missing documents for display
        setMissingDocuments(validationData.missingDocuments);

        // Show error with missing documents
        const missingDocsFormatted = validationData.missingDocuments
          .map((doc: string) => {
            // Convert camelCase to readable format
            const formatted = doc.replace(/([A-Z])/g, ' $1').trim();
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
          })
          .join(', ');

        toast({
          title: t('registration.documentsMissing'),
          description: `${t('registration.missingDocumentsDescription')} ${missingDocsFormatted}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Clear missing documents if validation passed
      setMissingDocuments([]);

      // 3. Validate Age THIRD
      if (personalInfo.dob) {
        const { differenceInYears, parseISO, isValid } = await import("date-fns");
        const birthDate = parseISO(personalInfo.dob);
        if (isValid(birthDate)) {
          const age = differenceInYears(new Date(), birthDate);
          if (age < 16) {
            toast({
              title: t('registration.ageRequirementTitle'),
              description: t('registration.ageRequirementDesc'),
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }
      }

      // Construct payload directly from the controlled state
      const profilePayload = {
        fatherName: personalInfo.fatherName,
        cnic: personalInfo.cnic,
        dob: personalInfo.dob,
        address: personalInfo.address,
        city: personalInfo.city,
        has16YearsEducation: localStorage.getItem("has16YearsEducation") === "true",
      };

      await api.put('/candidates/me', profilePayload);

      toast({
        title: t('registration.registrationSaved'),
        description: t('registration.registrationSavedDesc'),
      });

      onNext();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: t('registration.error'),
        description: error.response?.data?.message || t('registration.failedToSave'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-3xl text-foreground alumni-sans-title">
              {t('registration.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('registration.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Forms */}
      <div className="grid gap-8">
        <PersonalInfoForm
          data={personalInfo}
          onUpdate={handlePersonalInfoUpdate}
          errors={formErrors}
        />
        <DocumentUpload candidateData={candidateData} />
        <EducationDeclaration candidateData={candidateData} />
      </div>

      {/* Missing Documents Alert */}
      {missingDocuments.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-2">{t('registration.missingDocumentsTitle')}</h3>
              <p className="text-sm text-destructive/90 mb-3">
                {t('registration.missingDocumentsDescription')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-destructive/80">
                {missingDocuments.map((doc) => {
                  const formatted = doc.replace(/([A-Z])/g, ' $1').trim();
                  const displayName = formatted.charAt(0).toUpperCase() + formatted.slice(1);
                  return <li key={doc}>{displayName}</li>;
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border/60">
        <div className="text-sm text-muted-foreground">
          {t('registration.stepInfo')}
        </div>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="group"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('registration.saving')}
            </>
          ) : (
            <>
              {t('registration.continueToPayment')}
              <ChevronRight className="w-4 h-4 ms-2 rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
