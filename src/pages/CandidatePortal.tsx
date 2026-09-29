import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { CandidateWizard } from "@/components/StudentPortal/CandidateWizard";
import { ProfileView } from "@/components/StudentPortal/ProfileView";
import { RegistrationCompleteScreen } from "@/components/StudentPortal/RegistrationCompleteScreen";
import { RegistrationStep } from "@/components/StudentPortal/Steps/RegistrationStep";
import { PaymentStep } from "@/components/StudentPortal/Steps/PaymentStep";
import { SchedulingStep } from "@/components/StudentPortal/Steps/SchedulingStep";
import { Button } from "@/components/ui/button";
import { User, FileText, Shield, LogOut, Loader2 } from "lucide-react";
import { parseISO } from "date-fns";
import { useCandidateMe } from "@/hooks/queries/useCandidateQueries";
import { CertificateCard } from "@/components/StudentPortal/CertificateCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DegreeStatusScreen } from "@/components/StudentPortal/DegreeStatusScreen";
import { SoftSkillsBrand } from "@/components/SoftSkillsBrand";

export default function CandidatePortal() {
  const { t, i18n } = useTranslation();
  const { logout, examScheduleInfo, checkExamSchedule } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as "profile" | "application") || "application";
  const currentWizardStep = parseInt(searchParams.get("step") || "0", 10);

  const setActiveTab = (tab: "profile" | "application") => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", tab);
      return newParams;
    });
  };

  const setCurrentWizardStep = (step: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("step", step.toString());
      return newParams;
    });
  };
  const { data: candidateData, isLoading: loading, refetch: refetchCandidateMe } = useCandidateMe();
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [scheduledExamDate, setScheduledExamDate] = useState<Date | undefined>(undefined);
  const [requiresRepayment, setRequiresRepayment] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const certificate = candidateData?.certificate ?? null;
  const isPaid = !!candidateData?.payment?.isPaid;
  const isDegreePath = candidateData?.certificationPath === 'DEGREE';
  const degreeDoc = candidateData?.documents?.find((d) => d.type === 'degreeTranscript');
  const degreeDocStatus = degreeDoc?.reviewStatus;

  useEffect(() => {
    if (candidateData?.requiresRepayment) {
      setRequiresRepayment(true);
    }
  }, [candidateData?.requiresRepayment]);

  useEffect(() => {
    // RTL Cleanup on unmount
    return () => {
      if (i18n.language === 'ur') {
        i18n.changeLanguage('en');
      }
    };
  }, []);

  useEffect(() => {
    if (examScheduleInfo?.requiresRepayment) {
      setRequiresRepayment(true);
    }
  }, [examScheduleInfo?.requiresRepayment]);

  const wizardSteps = isDegreePath
    ? [
        {
          id: 1,
          title: t('wizard.registration'),
          description: t('wizard.completeProfile'),
          component: RegistrationStep,
        },
      ]
    : requiresRepayment
    ? [
        {
          id: 2,
          title: t('wizard.payment'),
          description: t('wizard.payPKR'),
          component: PaymentStep,
        },
        {
          id: 3,
          title: t('wizard.scheduleExam'),
          description: t('wizard.pickExamDate'),
          component: SchedulingStep,
        },
      ]
    : isPaid
      ? [
          {
            id: 3,
            title: t('wizard.scheduleExam'),
            description: t('wizard.pickExamDate'),
            component: SchedulingStep,
          },
        ]
      : [
          {
            id: 1,
            title: t('wizard.registration'),
            description: t('wizard.completeProfile'),
            component: RegistrationStep,
          },
          {
            id: 2,
            title: t('wizard.payment'),
            description: t('wizard.payPKR'),
            component: PaymentStep,
          },
          {
            id: 3,
            title: t('wizard.scheduleExam'),
            description: t('wizard.pickExamDate'),
            component: SchedulingStep,
          },
        ];

  const handleWizardComplete = async () => {
    setRequiresRepayment(false);
    // Load the real schedule first so the success screen never flashes the 9:00 AM fallback
    await Promise.all([checkExamSchedule(), refetchCandidateMe()]);
    setIsRegistrationComplete(true);
  };

  const handleRequiresRepayment = () => {
    setRequiresRepayment(true);
    setIsRegistrationComplete(false);
    setCurrentWizardStep(0);
  };

  const renderContent = () => {
    if (activeTab === "profile") {
      return (
        <ProfileView
          isRegistrationComplete={isRegistrationComplete || isPaid}
          scheduledExamDate={scheduledExamDate}
        />
      );
    }

    if (loading) {
      return <div className="p-8 text-center text-muted-foreground">{t('candidatePortal.loading')}</div>;
    }

    // 0. If certificate exists, show Certificate Card (Highest Priority)
    if (certificate) {
      return (
        <div className="max-w-3xl mx-auto">
          <CertificateCard certificate={certificate} />
        </div>
      );
    }

    // 0.5. Degree path: once they've submitted a transcript, this takes over
    // entirely — no exam session ever exists for this candidate, so none of
    // the exam-based branches below apply.
    if (isDegreePath && degreeDocStatus && degreeDocStatus !== 'PENDING') {
      return (
        <DegreeStatusScreen
          status={degreeDocStatus as 'UPLOADED' | 'APPROVED' | 'REJECTED'}
          reviewNote={degreeDoc?.reviewNote}
          onSwitchedToExam={() => {
            setIsRegistrationComplete(false);
            setCurrentWizardStep(0);
          }}
        />
      );
    }

    const { candidateStatus, examScheduled } = examScheduleInfo || {};

    // 1. If exam is submitted (and no certificate yet), show success message
    if (candidateStatus === "SUBMITTED") {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="ss-status-success p-8 text-center">
            <div className="w-16 h-16 bg-[#e7f2db] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#c7ddb5]">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-[#183d34] mb-2">
              {t('candidatePortal.examSubmittedTitle')}
            </h2>
            <p className="text-[#64736d] mb-6">
              {t('candidatePortal.examSubmittedDesc')}
            </p>
            <Button onClick={() => setActiveTab("profile")} variant="outline">
              {t('candidatePortal.viewProfile')}
            </Button>
          </div>
        </div>
      );
    }

    // 2. Second miss: must repay before booking again
    if (requiresRepayment) {
      return (
        <CandidateWizard
          steps={wizardSteps}
          initialStep={currentWizardStep}
          onStepChange={setCurrentWizardStep}
          onComplete={handleWizardComplete}
          isRepayment
          onRequiresRepayment={handleRequiresRepayment}
        />
      );
    }

    // 3. Success Screen (Registration Complete) - Highest priority immediately after scheduling
    if (isRegistrationComplete && !certificate && candidateStatus !== "SUBMITTED" && candidateStatus !== "ABSENT" && candidateStatus !== "REJECTED") {
      const examDateStr = examScheduleInfo?.examDate;
      const displayDate = examDateStr ? parseISO(examDateStr) : (scheduledExamDate || new Date());

      return (
        <RegistrationCompleteScreen
          examDate={displayDate}
          centerName={examScheduleInfo?.centerName || t('candidatePortal.yourAssignedCenter')}
          centerId={examScheduleInfo?.centerName?.split(' ').map(w => w[0]).join('') || "CENTER"}
          centerPhone={examScheduleInfo?.centerPhone}
          examStartTime={examScheduleInfo?.examStartTime}
          arriveByTime={examScheduleInfo?.arriveByTime}
          verificationMessage={examScheduleInfo?.verificationMessage}
          wasAutoRescheduled={examScheduleInfo?.wasAutoRescheduled}
          onGoToProfile={() => {
            setIsRegistrationComplete(false);
            setActiveTab("profile");
          }}
        />
      );
    }

    // 4. "Already Scheduled" View - Shown after user has moved off the success screen
    if (examScheduled && candidateStatus !== "ABSENT" && candidateStatus !== "REJECTED") {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="ss-status-info p-8 text-center">
            <h2 className="text-2xl font-display font-semibold text-[#183d34] mb-2">
              {examScheduleInfo?.wasAutoRescheduled
                ? t('candidatePortal.autoRescheduledTitle')
                : t('candidatePortal.examAlreadyScheduled')}
            </h2>
            <p className="text-[#64736d] mb-4">
              {examScheduleInfo?.wasAutoRescheduled
                ? t('candidatePortal.autoRescheduledDesc')
                : t('candidatePortal.examAlreadyScheduledDesc')}
            </p>
            <Button onClick={() => setActiveTab("profile")} variant="default">
              {t('candidatePortal.goToProfile')}
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
        onRequiresRepayment={handleRequiresRepayment}
      />
    );
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/candidate/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/candidate/auth");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f2] candidate-portal" data-portal="candidate">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 ss-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("application");
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("tab", "application");
                  next.delete("step");
                  return next;
                });
              }}
              className="text-start hover:opacity-90 transition-opacity"
            >
              <SoftSkillsBrand compact className="sm:gap-3" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 p-1 rounded-[11px] bg-[#f4f7f3] border border-[#e2e9e1]">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("profile")}
                  className={`px-2 sm:px-3 rounded-[7px] ${
                    activeTab === "profile" ? "" : "text-[#658075] hover:text-foreground"
                  }`}
                >
                  <User className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('nav.profile')}</span>
                </Button>
                <Button
                  variant={activeTab === "application" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("application")}
                  className={`px-2 sm:px-3 rounded-[7px] ${
                    activeTab === "application" ? "" : "text-[#658075] hover:text-foreground"
                  }`}
                >
                  <FileText className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('nav.application')}</span>
                </Button>
              </div>

              <LanguageSwitcher />

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="gap-1 sm:gap-2 border-[#e2e9e1] text-[#64736d] hover:bg-[#f4f7f3] hover:text-[#183d34] px-2 sm:px-3"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin rtl:-scale-x-100" />
                ) : (
                  <LogOut className="w-4 h-4 rtl:-scale-x-100" />
                )}
                <span className="hidden sm:inline">
                  {isLoggingOut ? t('nav.loggingOut', 'Logging out...') : t('nav.logout')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-5 sm:py-10 px-3 sm:px-6">
        {renderContent()}
      </div>
    </div>
  );
}
