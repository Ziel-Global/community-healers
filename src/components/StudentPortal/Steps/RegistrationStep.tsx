import { WizardStepProps } from "../CandidateWizard";
import { PersonalInfoForm } from "../Profile/PersonalInfoForm";
import { DocumentUpload } from "../Profile/DocumentUpload";
import { EducationDeclaration } from "../Profile/EducationDeclaration";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileCheck } from "lucide-react";

export function RegistrationStep({ onNext, isFirstStep }: WizardStepProps) {
  const handleSubmit = () => {
    // Validation logic would go here
    onNext();
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
              Complete Your Registration
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill in your personal information, upload required documents, and declare your education
            </p>
          </div>
        </div>
      </div>

      {/* Forms */}
      <div className="grid gap-8">
        <PersonalInfoForm />
        <DocumentUpload />
        <EducationDeclaration />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border/60">
        <div className="text-sm text-muted-foreground">
          Step 1 of 4 • Registration
        </div>
        <Button onClick={handleSubmit} size="lg" className="group">
          Continue to Scheduling
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
