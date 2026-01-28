import { useState } from "react";
import { CandidateWizard } from "@/components/StudentPortal/CandidateWizard";
import { ProfileView } from "@/components/StudentPortal/ProfileView";
import { RegistrationCompleteScreen } from "@/components/StudentPortal/RegistrationCompleteScreen";
import { RegistrationStep } from "@/components/StudentPortal/Steps/RegistrationStep";
import { PaymentStep } from "@/components/StudentPortal/Steps/PaymentStep";
import { SchedulingStep } from "@/components/StudentPortal/Steps/SchedulingStep";
import { Button } from "@/components/ui/button";
import { User, FileText, Shield, LogOut } from "lucide-react";

export default function CandidatePortal() {
  const [activeTab, setActiveTab] = useState<"profile" | "application">("application");
  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [scheduledExamDate, setScheduledExamDate] = useState<Date | undefined>(undefined);

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
    
    // Set exam date to 2 days from now
    const examDate = new Date();
    examDate.setDate(examDate.getDate() + 2);
    
    setScheduledExamDate(examDate);
  };

  const renderContent = () => {
    if (activeTab === "profile") {
      return (
        <ProfileView 
          isRegistrationComplete={isRegistrationComplete}
          scheduledExamDate={scheduledExamDate}
        />
      );
    }

    // If registration complete, show completion screen with exam date
    if (isRegistrationComplete && scheduledExamDate) {
      return (
        <RegistrationCompleteScreen 
          examDate={scheduledExamDate}
          centerName="Lahore Training Center #3"
          centerId="LHR-003"
          onGoToProfile={() => setActiveTab("profile")}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo/Branding */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="alumni-sans-title text-xl text-foreground">Soft skill training</h1>
                <p className="alumni-sans-subtitle text-sm text-muted-foreground">Candidate Portal</p>
              </div>
            </div>

            {/* Navigation Tabs & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2 p-1 rounded-xl bg-secondary/40 border border-border/40">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("profile")}
                  className={`px-2 sm:px-3 ${activeTab === "profile" ? "shadow-md" : ""}`}
                >
                  <User className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button
                  variant={activeTab === "application" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("application")}
                  className={`px-2 sm:px-3 ${activeTab === "application" ? "shadow-md" : ""}`}
                >
                  <FileText className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Application</span>
                </Button>
              </div>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1 sm:gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive px-2 sm:px-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="py-4 sm:py-8 px-3 sm:px-6">
        {renderContent()}
      </div>
    </div>
  );
}

