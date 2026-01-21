import { useState } from "react";
import { CandidateWizard } from "@/components/StudentPortal/CandidateWizard";
import { ProfileView } from "@/components/StudentPortal/ProfileView";
import { ExamWaitingScreen } from "@/components/StudentPortal/ExamWaitingScreen";
import { RegistrationStep } from "@/components/StudentPortal/Steps/RegistrationStep";
import { PaymentStep } from "@/components/StudentPortal/Steps/PaymentStep";
import { SchedulingStep } from "@/components/StudentPortal/Steps/SchedulingStep";
import { ExamStep } from "@/components/StudentPortal/Steps/ExamStep";
import { CertificateStep } from "@/components/StudentPortal/Steps/CertificateStep";
import { Button } from "@/components/ui/button";
import { User, FileText, Shield, LogOut } from "lucide-react";

export default function CandidatePortal() {
  const [activeTab, setActiveTab] = useState<"profile" | "application">("application");
  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [scheduledExamDate, setScheduledExamDate] = useState<Date | undefined>(undefined);
  const [isInExam, setIsInExam] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examScore, setExamScore] = useState<number>(0);
  const [certificateNumber, setCertificateNumber] = useState<string>("");

  const wizardSteps = [
    {
      id: 1,
      title: "Registration",
      description: "Complete profile",
      component: RegistrationStep,
    },
    {
      id: 2,
      title: "Payment",
      description: "Pay PKR 3000",
      component: PaymentStep,
    },
    {
      id: 3,
      title: "Schedule Exam",
      description: "Pick exam date",
      component: SchedulingStep,
    },
  ];

  const handleWizardComplete = () => {
    setIsRegistrationComplete(true);
    
    // DEMO MODE: Exam available immediately
    const examDate = new Date();
    
    // PRODUCTION MODE: Uncomment to set exam date to future (e.g., 2 days from now)
    // const examDate = new Date();
    // examDate.setDate(examDate.getDate() + 2);
    
    setScheduledExamDate(examDate);
  };

  const handleStartExam = () => {
    setIsInExam(true);
  };

  const handleExamComplete = () => {
    setIsInExam(false);
    setExamCompleted(true);
    // Calculate score (in a real app, this would come from the exam)
    setExamScore(85);
    // Generate certificate number
    setCertificateNumber("CP-2026-88A21");
  };

  const renderContent = () => {
    if (activeTab === "profile") {
      return (
        <ProfileView 
          examCompleted={examCompleted}
          examScore={examScore}
          certificateNumber={certificateNumber}
        />
      );
    }

    // If exam is completed, show certificate
    if (examCompleted) {
      return <CertificateStep onNext={() => {}} onBack={() => {}} isFirstStep={false} isLastStep={true} />;
    }

    // If currently taking exam
    if (isInExam) {
      return (
        <div className="max-w-6xl mx-auto">
          <ExamStep 
            onNext={handleExamComplete} 
            onBack={() => setIsInExam(false)} 
            isFirstStep={false} 
            isLastStep={false} 
          />
        </div>
      );
    }

    // If registration complete, show exam waiting screen
    if (isRegistrationComplete && scheduledExamDate) {
      return (
        <ExamWaitingScreen 
          examDate={scheduledExamDate}
          onStartExam={handleStartExam}
        />
      );
    }

    // Otherwise show the registration wizard
    return (
      <CandidateWizard 
        steps={wizardSteps} 
        initialStep={currentWizardStep}
        onStepChange={setCurrentWizardStep}
        onComplete={handleWizardComplete}
      />
    );
  };

  const handleLogout = () => {
    // Add logout logic here (clear session, redirect to login, etc.)
    console.log("Logging out...");
    // In a real app: navigate to login page or call logout API
    window.location.href = "/candidate/auth";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">CertifyPro</h1>
                <p className="text-xs text-muted-foreground">Candidate Portal</p>
              </div>
            </div>

            {/* Navigation Tabs & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/40 border border-border/40">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("profile")}
                  className={activeTab === "profile" ? "shadow-md" : ""}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === "application" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("application")}
                  className={activeTab === "application" ? "shadow-md" : ""}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Application
                </Button>
              </div>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="py-8 px-6">
        {renderContent()}
      </div>
    </div>
  );
}

