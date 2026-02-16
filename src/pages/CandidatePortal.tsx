import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { CandidateWizard } from "@/components/StudentPortal/CandidateWizard";
import { ProfileView } from "@/components/StudentPortal/ProfileView";
import { RegistrationCompleteScreen } from "@/components/StudentPortal/RegistrationCompleteScreen";
import { RegistrationStep } from "@/components/StudentPortal/Steps/RegistrationStep";
import { PaymentStep } from "@/components/StudentPortal/Steps/PaymentStep";
import { SchedulingStep } from "@/components/StudentPortal/Steps/SchedulingStep";
import { Button } from "@/components/ui/button";
import { User, FileText, Shield, LogOut } from "lucide-react";
import { parseISO } from "date-fns";
import { api } from "@/services/api";
import { CertificateCard } from "@/components/StudentPortal/CertificateCard";

export default function CandidatePortal() {
  const { logout, examScheduleInfo, checkExamSchedule } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "application">("application");
  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [scheduledExamDate, setScheduledExamDate] = useState<Date | undefined>(undefined);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await api.get('/candidates/me');
        const data = response.data.data;
        if (data?.certificate) {
          setCertificate(data.certificate);
        }
      } catch (error) {
        console.error('Failed to fetch candidate data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateData();
  }, []);

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

  const handleWizardComplete = async () => {
    setIsRegistrationComplete(true);
    // Fetch the actual confirmed exam schedule from the backend
    await checkExamSchedule();
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

    if (loading) {
      return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    }

    // 0. If certificate exists, show Certificate Card (Highest Priority)
    if (certificate) {
      return (
        <div className="max-w-3xl mx-auto">
          <CertificateCard certificate={certificate} />
        </div>
      );
    }

    const { candidateStatus, examScheduled } = examScheduleInfo || {};

    // 1. If exam is submitted (and no certificate yet), show success message
    if (candidateStatus === "SUBMITTED") {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
              Exam Submitted Successfully
            </h2>
            <p className="text-emerald-700 dark:text-emerald-300 mb-6">
              You have successfully completed your exam. Your results are being processed.
            </p>
            <Button onClick={() => setActiveTab("profile")} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100">
              View Profile
            </Button>
          </div>
        </div>
      );
    }

    // 2. If status is ABSENT or REJECTED, allow re-registration (show wizard)
    // implicitly handled by falling through to the wizard return at the end if we don't return early here.

    // 3. Success Screen (Registration Complete) - Highest priority immediately after scheduling
    // This shows the confetti and the central success message
    if (isRegistrationComplete && !certificate && candidateStatus !== "SUBMITTED" && candidateStatus !== "ABSENT" && candidateStatus !== "REJECTED") {
      const examDateStr = examScheduleInfo?.examDate;
      const displayDate = examDateStr ? parseISO(examDateStr) : (scheduledExamDate || new Date());

      return (
        <RegistrationCompleteScreen
          examDate={displayDate}
          centerName={examScheduleInfo?.centerName || "Your Assigned Center"}
          centerId={examScheduleInfo?.centerName?.split(' ').map(w => w[0]).join('') || "CENTER"}
          onGoToProfile={() => {
            setIsRegistrationComplete(false); // Clear the local success state when moving away
            setActiveTab("profile");
          }}
        />
      );
    }

    // 4. "Already Scheduled" View - Shown after user has moved off the success screen
    if (examScheduled && candidateStatus !== "ABSENT" && candidateStatus !== "REJECTED") {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Exam Already Scheduled
            </h2>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              Your exam has been scheduled. View your profile for exam details.
            </p>
            <Button onClick={() => setActiveTab("profile")} variant="default">
              Go to Profile
            </Button>
          </div>
        </div>
      );
    }

    // Otherwise show the registration wizard (handles ABSENT/REJECTED or new users)
    return (
      <CandidateWizard
        steps={wizardSteps}
        initialStep={currentWizardStep}
        onStepChange={setCurrentWizardStep}
        onComplete={handleWizardComplete}
      />
    );
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint which clears cookies and logs the logout event
      await logout();
      // Redirect to candidate auth page after successful logout
      navigate("/candidate/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect even if logout fails to ensure user is logged out locally
      navigate("/candidate/auth");
    }
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

