import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { WizardStepProps } from "../CandidateWizard";
import { PersonalInfoForm } from "../Profile/PersonalInfoForm";
import { DocumentUpload } from "../Profile/DocumentUpload";
import { EducationDeclaration } from "../Profile/EducationDeclaration";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileCheck, Loader2, AlertCircle } from "lucide-react";
import { useCandidateMe, useDocumentValidation, useUpdateCandidateMe } from "@/hooks/queries/useCandidateQueries";
import { useToast } from "@/hooks/use-toast";
import { PERSONAL_INFO_ERROR_CODES, personalInfoSchema } from "@/schemas/registrationSchemas";
import { getApiErrorMessage } from "@/lib/errors";

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
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const { data: candidateData } = useCandidateMe();
  const [hasSixteenYears, setHasSixteenYears] = useState(false);
  const {
    data: documentValidation,
    isLoading: isValidatingDocs,
    refetch: refetchDocumentValidation,
  } = useDocumentValidation();
  const updateCandidateMeMutation = useUpdateCandidateMe();

  const isLoading = updateCandidateMeMutation.isPending;
  const canProceedToPayment = !!documentValidation?.canProceedToPayment;
  const missingDocuments = canProceedToPayment ? [] : (documentValidation?.missingDocuments || []);
  // Mirrors the old `docsValidated` flag: true once the first validation
  // response (success or failure) has settled.
  const docsValidated = !isValidatingDocs;

  // Lifted state for PersonalInfoForm
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fatherName: "",
    cnic: "",
    dob: "",
    phone: "",
    city: "",
    address: "",
  });

  // Seed the controlled form from the candidate's saved profile once it
  // loads — guarded to run only the first time. Without the guard, this
  // effect re-fires on every /candidates/me refetch, including the ones
  // DocumentUpload's mutation triggers after each file upload, silently
  // overwriting whatever the user had typed but not yet submitted here.
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
      // `cityId` isn't part of the CandidateMe shape (city comes back as
      // `{ id, name }`) — preserved as-is from the pre-migration behavior,
      // where this always resolved to "" via the same implicit-any lookup.
      city: (candidateData as unknown as { cityId?: string }).cityId || "",
      address: candidateData.address || "",
    });
  }, [candidateData]);

  const formatMissingDocLabel = (doc: string) => {
    const labelKey = `registration.missingDoc.${doc}`;
    const translated = t(labelKey);
    if (translated !== labelKey) return translated;
    const formatted = doc.replace(/([A-Z])/g, ' $1').trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const handlePersonalInfoUpdate = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // 1. Validate Personal Info Fields FIRST (fatherName, cnic, dob, city, address)
      const validation = personalInfoSchema.safeParse(personalInfo);

      if (!validation.success) {
        const newErrors: Record<string, boolean> = {};
        const codeByField: Record<string, string> = {};
        for (const issue of validation.error.issues) {
          const field = String(issue.path[0]);
          newErrors[field] = true;
          codeByField[field] = issue.message; // stable error code, not display text
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
        } else if (
          codeByField.dob === PERSONAL_INFO_ERROR_CODES.DOB_TOO_YOUNG
        ) {
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
            city: t('personalInfo.city'),
            address: t('personalInfo.address')
          };
          const missingFieldLabels = Object.keys(newErrors)
            .filter(field => codeByField[field] === PERSONAL_INFO_ERROR_CODES.REQUIRED || codeByField[field] === PERSONAL_INFO_ERROR_CODES.DOB_INVALID)
            .map(field => labelMap[field] || field);
          toast({
            title: t('registration.fieldsRequired'),
            description: `${t('registration.followingFieldsRequired')}: ${missingFieldLabels.join(", ")}`,
            variant: "destructive",
          });
        }

        // Scroll to top to show missing fields
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Clear form errors if validation passed
      setFormErrors({});

      // 2. Validate documents SECOND — re-fetch so we check against the
      // latest state, not a possibly-stale cached value.
      const { data: validationData } = await refetchDocumentValidation();

      if (!validationData?.canProceedToPayment) {
        const missing = validationData?.missingDocuments || missingDocuments;

        toast({
          title: t('registration.documentsMissing'),
          description: `${t('registration.identityRequirementHint')}${
            missing.length ? ` (${missing.map(formatMissingDocLabel).join(', ')})` : ''
          }`,
          variant: "destructive",
        });
        return;
      }

      // 3. If they've declared a 14-year degree, the transcript is required
      // (not optional like it is for the normal exam path) — this is the
      // whole basis of their application before we route them off the
      // payment/scheduling flow entirely.
      const degreeDoc = candidateData?.documents?.find((d) => d.type === 'degreeTranscript');
      if (hasSixteenYears && !degreeDoc?.fileUrl) {
        toast({
          title: t('education.transcriptRequiredTitle'),
          description: t('education.transcriptRequiredDesc'),
          variant: "destructive",
        });
        return;
      }

      // Construct payload directly from the controlled state
      const profilePayload = {
        fatherName: personalInfo.fatherName,
        cnic: personalInfo.cnic,
        dob: personalInfo.dob,
        address: personalInfo.address,
        city: personalInfo.city,
        has16YearsEducation: hasSixteenYears,
        certificationPath: hasSixteenYears ? 'DEGREE' : 'EXAM',
      };

      await updateCandidateMeMutation.mutateAsync(profilePayload);

      toast({
        title: t('registration.registrationSaved'),
        description: t('registration.registrationSavedDesc'),
      });

      onNext();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: t('registration.error'),
        description: getApiErrorMessage(error, t('registration.failedToSave')),
        variant: "destructive",
      });
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
        <EducationDeclaration candidateData={candidateData} onToggle={setHasSixteenYears} />
      </div>

      {/* Missing Documents Alert */}
      {docsValidated && !canProceedToPayment && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-2">{t('registration.missingDocumentsTitle')}</h3>
              <p className="text-sm text-destructive/90 mb-3">
                {t('registration.identityRequirementHint')}
              </p>
              {missingDocuments.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive/80">
                  {missingDocuments.map((doc) => (
                    <li key={doc}>{formatMissingDocLabel(doc)}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border/60">
        <div className="text-sm text-muted-foreground">
          {hasSixteenYears ? t('registration.stepInfoDegree') : t('registration.stepInfo')}
        </div>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="group"
          disabled={isLoading || (docsValidated && !canProceedToPayment)}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('registration.saving')}
            </>
          ) : (
            <>
              {hasSixteenYears ? t('registration.submitForReview') : t('registration.continueToPayment')}
              <ChevronRight className="w-4 h-4 ms-2 rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
