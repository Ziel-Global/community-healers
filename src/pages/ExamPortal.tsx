import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CBTInterface } from "@/components/StudentPortal/Exam/CBTInterface";
import { Button } from "@/components/ui/button";
import { parseISO, format } from "date-fns";
import {
  LogOut,
  Loader2,
  AlertCircle,
  Ban,
  CheckCircle,
  FileText,
  Clock,
  MonitorSmartphone,
  ShieldAlert,
} from "lucide-react";
import { useExamStatus, useExamQuestions } from "@/hooks/queries/useCandidateQueries";
import { authService } from "@/services/authService";
import { CandidateStatus, ExamScheduledResponse } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { getExamOnOtherDeviceMessage, isExamOnOtherDeviceError } from "@/utils/examSession";
import { getApiErrorMessage, getApiErrorCode } from "@/lib/errors";
import { useToast } from "@/hooks/use-toast";
import { LivenessGateDialog } from "@/components/StudentPortal/Exam/LivenessGateDialog";
import { VerifyLivenessResult } from "@/services/candidateService";
import {
  ExamPortalShell,
  ExamStatusCard,
  ExamInfoPanel,
} from "@/components/StudentPortal/Exam/ExamPortalShell";

const LIVENESS_REQUIRED_ERROR = "LIVENESS_VERIFICATION_REQUIRED";
const EXAM_NOT_RELEASED_ERROR = "EXAM_NOT_RELEASED";
const EXAM_LOCKED_ERROR = "EXAM_NOT_YET_UNLOCKED";

export default function ExamPortal() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { logout } = useAuth();
  const [examState, setExamState] = useState<
    | "loading"
    | "pending"
    | "verified"
    | "rejected"
    | "absent"
    | "submitted"
    | "countdown"
    | "in-progress"
    | "other-device"
    | "questions-error"
    | "liveness-blocked"
    | "degree-path"
  >("loading");
  const [countdown, setCountdown] = useState(3);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scheduledExam, setScheduledExam] = useState<ExamScheduledResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otherDeviceMessage, setOtherDeviceMessage] = useState<string | null>(null);
  const [questionsErrorMessage, setQuestionsErrorMessage] = useState<string | null>(null);
  const [examEndTime, setExamEndTime] = useState<string | null>(null);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, number>>({});
  const [showLivenessDialog, setShowLivenessDialog] = useState(false);
  const { toast } = useToast();

  const statusQuery = useExamStatus();
  const questionsQuery = useExamQuestions();
  const candidateStatus = statusQuery.data ?? null;
  const questions = questionsQuery.data?.questions ?? [];
  const isFetchingQuestions = questionsQuery.isFetching;
  const isResumeRef = useRef(false);

  const beginExam = (options?: { isResume?: boolean }) => {
    isResumeRef.current = options?.isResume ?? false;
    setQuestionsErrorMessage(null);
    questionsQuery.refetch();
  };

  const handleBeginExamClick = () => {
    if (candidateStatus?.livenessVerified) {
      beginExam();
    } else {
      setShowLivenessDialog(true);
    }
  };

  const handleLivenessResult = (result: VerifyLivenessResult) => {
    if (result.passed) {
      beginExam();
      return;
    }
    if (result.blocked) {
      setExamState("liveness-blocked");
      return;
    }
    toast({
      variant: "destructive",
      title: "Face Did Not Match",
      description: `Please try again. Click "Begin Examination" to retry.`,
    });
  };

  useEffect(() => {
    if (!statusQuery.isSuccess || !statusQuery.data) return;
    const statusData = statusQuery.data;

    switch (statusData.candidateStatus) {
      case CandidateStatus.VERIFIED:
        if (statusData.examInProgress) {
          beginExam({ isResume: true });
        } else if (statusData.livenessBlocked) {
          setExamState("liveness-blocked");
        } else {
          setExamState("verified");
        }
        break;
      case CandidateStatus.PENDING:
        setExamState("pending");
        break;
      case CandidateStatus.REJECTED:
        setExamState("rejected");
        break;
      case CandidateStatus.ABSENT:
        setExamState("absent");
        break;
      case CandidateStatus.SUBMITTED:
        setExamState("submitted");
        break;
      default:
        if (statusData.certificationPath === "DEGREE") {
          setExamState("degree-path");
        } else {
          setExamState("pending");
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusQuery.isSuccess, statusQuery.data]);

  useEffect(() => {
    if (!statusQuery.isError) return;
    setError(getApiErrorMessage(statusQuery.error, "Failed to load exam status"));
    setExamState("pending");
  }, [statusQuery.isError, statusQuery.error]);

  useEffect(() => {
    if (!statusQuery.isSuccess) return;
    let cancelled = false;
    (async () => {
      try {
        const scheduledData = await authService.checkExamScheduled();
        if (!cancelled && scheduledData) {
          setScheduledExam(scheduledData);
        }
      } catch (schedErr) {
        console.error("Failed to fetch scheduled exam details:", schedErr);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusQuery.isSuccess]);

  useEffect(() => {
    return () => {
      if (i18n.language === "ur") {
        i18n.changeLanguage("en");
      }
    };
  }, []);

  useEffect(() => {
    if (examState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (examState === "countdown" && countdown === 0) {
      setExamState("in-progress");
    }
  }, [examState, countdown]);

  useEffect(() => {
    if (!questionsQuery.isSuccess || !questionsQuery.data) return;
    const data = questionsQuery.data;
    setExamEndTime(data.timer?.examEndTime ?? null);
    setDraftAnswers(data.draftAnswers && typeof data.draftAnswers === "object" ? data.draftAnswers : {});
    setExamState(isResumeRef.current ? "in-progress" : "countdown");
  }, [questionsQuery.isSuccess, questionsQuery.data]);

  useEffect(() => {
    if (!questionsQuery.isError) return;
    const err = questionsQuery.error;
    if (isExamOnOtherDeviceError(err)) {
      setOtherDeviceMessage(getExamOnOtherDeviceMessage(err));
      setExamState("other-device");
      return;
    }
    const code = getApiErrorCode(err);
    if (code === EXAM_NOT_RELEASED_ERROR || code === EXAM_LOCKED_ERROR) {
      toast({
        variant: "destructive",
        title: code === EXAM_NOT_RELEASED_ERROR ? "Test not released yet" : "Test still locked",
        description: getApiErrorMessage(err, "Your test isn't available yet."),
      });
      statusQuery.refetch();
      setExamState("verified");
      return;
    }
    if (getApiErrorMessage(err, "").includes(LIVENESS_REQUIRED_ERROR)) {
      setExamState("verified");
      setShowLivenessDialog(true);
      return;
    }
    setQuestionsErrorMessage(
      "We couldn't load your test questions after several attempts. This is usually temporary — please check your internet connection and try again. If the problem continues, contact your exam center for help."
    );
    setExamState("questions-error");
  }, [questionsQuery.isError, questionsQuery.error]);

  const handleExamComplete = () => {};

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (i18n.language === "ur") {
        i18n.changeLanguage("en");
      }
      await logout();
      navigate("/training/auth");
    } catch {
      navigate("/training/auth");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const logoutProps = {
    onLogout: handleLogout,
    isLoggingOut,
  };

  if (examState === "loading") {
    return (
      <ExamPortalShell showLogout={false} centered>
        <div className="text-center space-y-4">
          <Loader2 className="w-11 h-11 animate-spin text-[#164c3e] mx-auto" />
          <p className="text-sm text-[#6d8474]">Loading training details...</p>
        </div>
      </ExamPortalShell>
    );
  }

  if (examState === "pending") {
    return (
      <ExamPortalShell {...logoutProps} centered>
        <ExamStatusCard
          icon={AlertCircle}
          title="Test Not Started Yet"
          description="Please wait for the center administrator to initiate the test"
          tone="neutral"
        >
          <p className="text-sm text-[#6d8474]">Waiting for test to begin...</p>
          <ExamInfoPanel title="While you wait:">
            <ul className="space-y-1.5">
              <li>• Ensure your device is charged</li>
              <li>• Check your internet connection</li>
              <li>• Keep your ID ready for verification</li>
              <li>• Do not refresh or close this page</li>
            </ul>
          </ExamInfoPanel>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}
        </ExamStatusCard>
      </ExamPortalShell>
    );
  }

  if (examState === "degree-path") {
    const degreeStatus = candidateStatus?.degreeReviewStatus;
    const degreeMessage =
      degreeStatus === "REJECTED"
        ? "The Ministry could not approve your submitted transcript. Please check your Candidate Portal for details."
        : degreeStatus === "APPROVED"
          ? "Your degree transcript has been approved. Your certificate will appear on your Candidate Portal once it's issued."
          : "Your degree transcript is under Ministry review. No exam or training center visit is required for this path.";

    return (
      <ExamPortalShell {...logoutProps} centered>
        <ExamStatusCard icon={FileText} title="No Exam Required" description={degreeMessage} tone="neutral">
          <Button
            className="w-full h-11 rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white font-medium shadow-[0_8px_20px_rgba(22,76,62,0.18)]"
            onClick={() => navigate("/candidate")}
          >
            Go to Candidate Portal
          </Button>
        </ExamStatusCard>
      </ExamPortalShell>
    );
  }

  if (examState === "rejected") {
    return (
      <ExamPortalShell {...logoutProps} centered>
        <ExamStatusCard
          icon={Ban}
          title="Application Rejected"
          description="Your application has been rejected by the center administrator"
          tone="danger"
        >
          <ExamInfoPanel title="What happens next?" className="bg-red-50/80 border-red-100">
            Please contact your examination center for more details about the rejection reason. You may
            need to reapply through the candidate portal.
          </ExamInfoPanel>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
            className="w-full h-11 rounded-[10px] border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            {isLoggingOut ? "Logging out..." : "Return to Portal"}
          </Button>
        </ExamStatusCard>
      </ExamPortalShell>
    );
  }

  if (examState === "liveness-blocked") {
    return (
      <ExamPortalShell {...logoutProps} centered>
        <ExamStatusCard
          icon={ShieldAlert}
          title="Face Verification Failed"
          description="Your face could not be verified after two attempts. Exam access has been blocked."
          tone="danger"
        >
          <ExamInfoPanel title="What happens next?" className="bg-red-50/80 border-red-100">
            Please contact your center administrator to resolve this before attempting the exam again.
          </ExamInfoPanel>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
            className="w-full h-11 rounded-[10px] border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            {isLoggingOut ? "Logging out..." : "Return to Portal"}
          </Button>
        </ExamStatusCard>
      </ExamPortalShell>
    );
  }

  if (examState === "absent") {
    return (
      <ExamPortalShell {...logoutProps} centered>
        <ExamStatusCard
          icon={AlertCircle}
          title="Training Missed"
          description="You were marked absent for the scheduled training"
          tone="warning"
        >
          <ExamInfoPanel title="What happens next?" className="bg-[#fff8ee] border-amber-200/60">
            You missed the scheduled training. Don&apos;t worry — you will be allotted another training
            date soon. Please check your candidate portal for updates.
          </ExamInfoPanel>
          <ExamInfoPanel title="Important:">
            <ul className="space-y-1.5">
              <li>• No additional fees required for rescheduling</li>
              <li>• Check your email for notifications</li>
              <li>• Contact support if you need assistance</li>
            </ul>
          </ExamInfoPanel>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
            className="w-full h-11 rounded-[10px] border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            {isLoggingOut ? "Logging out..." : "Return to Portal"}
          </Button>
        </ExamStatusCard>
      </ExamPortalShell>
    );
  }

  if (examState === "submitted") {
    return (
      <ExamPortalShell {...logoutProps} centered>
        <ExamStatusCard
          icon={CheckCircle}
          title="Test Already Submitted"
          description="You have already submitted your test"
          tone="success"
        >
          <ExamInfoPanel title="Next Steps:" className="bg-[#eef6df]/70 border-[#d5e8c4]">
            Please visit the Candidate Portal to check your test results and certificate status. You
            will be notified once your results have been reviewed by the ministry.
          </ExamInfoPanel>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
            className="w-full h-11 rounded-[10px] border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3] font-medium"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            {isLoggingOut ? "Logging out..." : "Return to Portal"}
          </Button>
        </ExamStatusCard>
      </ExamPortalShell>
    );
  }

  if (examState === "countdown") {
    return (
      <ExamPortalShell showLogout={false} centered>
        <div className="relative text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-36 h-36 rounded-full bg-[#164c3e] flex items-center justify-center mx-auto shadow-[0_20px_48px_rgba(22,76,62,0.32)] ring-8 ring-[#d7f88c]/25">
            <span className="text-6xl font-display font-semibold text-white tabular-nums">{countdown}</span>
          </div>
          <div>
            <p className="text-xl font-display font-semibold text-[#183d34]">Test starting…</p>
            <p className="text-sm text-[#6d8474] mt-1">Get ready — questions load next</p>
          </div>
        </div>
      </ExamPortalShell>
    );
  }

  if (examState === "other-device") {
    return (
      <ExamPortalShell {...logoutProps} centered>
        <ExamStatusCard
          icon={MonitorSmartphone}
          title="Exam Open on Another Device"
          description={
            otherDeviceMessage ||
            "Exam already in progress on another device. Please continue on the original device."
          }
          tone="warning"
        >
          <ExamInfoPanel>
            This exam cannot be started or continued here. Return to the device where you first began
            the exam.
          </ExamInfoPanel>
          <Button
            variant="outline"
            className="w-full h-11 rounded-[10px] border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Back to Login
          </Button>
        </ExamStatusCard>
      </ExamPortalShell>
    );
  }

  if (examState === "questions-error") {
    return (
      <ExamPortalShell {...logoutProps} centered>
        <ExamStatusCard
          icon={AlertCircle}
          title="Unable to Load Test Questions"
          description={
            questionsErrorMessage || "We couldn't load your test questions. Please try again."
          }
          tone="danger"
        >
          <Button
            onClick={() => beginExam()}
            disabled={isFetchingQuestions}
            className="w-full h-11 rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white font-medium shadow-[0_8px_20px_rgba(22,76,62,0.18)]"
          >
            {isFetchingQuestions ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isFetchingQuestions ? "Retrying..." : "Try Again"}
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
            className="w-full h-11 rounded-[10px] border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            {isLoggingOut ? "Logging out..." : "Back to Login"}
          </Button>
        </ExamStatusCard>
      </ExamPortalShell>
    );
  }

  if (examState === "in-progress") {
    return (
      <ExamPortalShell showLogout={false} subtitle="Training in Progress" contentClassName="max-w-6xl mx-auto w-full p-4 sm:p-6">
        <CBTInterface
          questions={questions}
          onComplete={handleExamComplete}
          durationMinutes={scheduledExam?.durationMinutes || 20}
          examEndTime={examEndTime}
          initialAnswers={draftAnswers}
        />
      </ExamPortalShell>
    );
  }

  // Verified — ready to begin
  return (
    <ExamPortalShell {...logoutProps}>
      <main className="max-w-3xl mx-auto w-full p-4 sm:p-8">
        <div className="rounded-[22px] border border-[#d5e0d4] bg-white shadow-[0_16px_48px_rgba(22,76,62,0.08)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
          <div className="h-1 w-full bg-[#164c3e]" />
          <div className="p-6 sm:p-8 space-y-7">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef6df] border border-[#d5e8c4] px-3 py-1 mb-4">
                <CheckCircle className="w-3.5 h-3.5 text-[#426f36]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#426f36]">
                  Verified — Ready to Begin
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#183d34] tracking-tight">
                Welcome, Candidate
              </h2>
              <p className="mt-2 text-sm text-[#6d8474] leading-relaxed max-w-xl">
                You have been verified by the center administrator. You may begin your SoftSkills
                assessment when ready.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-[14px] bg-[#f4f7f3] border border-[#e7eee9]">
                <div className="w-10 h-10 rounded-xl bg-[#e8f0ea] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#164c3e]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d8474]">Questions</p>
                  <p className="font-semibold text-[#183d34]">
                    {scheduledExam?.numberOfQuestions || 20} MCQs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-[14px] bg-[#f4f7f3] border border-[#e7eee9]">
                <div className="w-10 h-10 rounded-xl bg-[#e8f0ea] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#164c3e]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d8474]">Duration</p>
                  <p className="font-semibold text-[#183d34]">
                    {scheduledExam?.durationMinutes || 20} Minutes
                  </p>
                </div>
              </div>
            </div>

            {candidateStatus?.examDate && (
              <div className="rounded-[14px] bg-[#e8f0ea] border border-[#c9d6c8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d8474] mb-1">
                  Training Date
                </p>
                <p className="text-lg font-display font-semibold text-[#164c3e]">
                  {(() => {
                    try {
                      const parsed = parseISO(candidateStatus.examDate);
                      if (isNaN(parsed.getTime())) return candidateStatus.examDate;
                      return format(parsed, "EEEE, MMMM d, yyyy");
                    } catch {
                      return candidateStatus.examDate;
                    }
                  })()}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#183d34]">Training Rules</h3>
              <ul className="space-y-2.5 text-sm text-[#6d8474]">
                {[
                  "Once started, the training cannot be paused or restarted",
                  'The timer starts immediately after clicking "Begin Test"',
                  "Answers are auto-saved as you progress through questions",
                  "Do not refresh or close the browser during the test",
                  "The test will auto-submit when the timer reaches zero",
                ].map((rule) => (
                  <li key={rule} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#164c3e] shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-1">
              {candidateStatus?.canStartExam === false ? (
                <div className="rounded-[14px] border border-amber-200/80 bg-[#fff8ee] p-5 text-center space-y-3">
                  <Clock className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-sm font-medium text-amber-900">
                    {candidateStatus.examUnlockDelayHours
                      ? `Your test unlocks ${candidateStatus.examUnlockDelayHours} hours after check-in`
                      : "Your test is unlocking"}
                    {candidateStatus.examUnlocksAt
                      ? ` — available at ${format(parseISO(candidateStatus.examUnlocksAt), "h:mm a 'on' MMM d")}.`
                      : "."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => statusQuery.refetch()}
                    disabled={statusQuery.isFetching}
                    className="border-amber-300 text-amber-900 hover:bg-amber-50 rounded-[9px]"
                  >
                    {statusQuery.isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Check Again
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleBeginExamClick}
                    disabled={isFetchingQuestions}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-[12px] bg-[#164c3e] hover:bg-[#12382d] text-white font-semibold shadow-[0_10px_28px_rgba(22,76,62,0.24)]"
                  >
                    {isFetchingQuestions ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    {isFetchingQuestions ? "Loading Questions..." : "Begin Examination"}
                  </Button>
                  <p className="text-center text-xs text-[#6d8474] mt-3">
                    By clicking above, you confirm that you have read and understood the rules
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <LivenessGateDialog
        open={showLivenessDialog}
        onOpenChange={setShowLivenessDialog}
        onResult={handleLivenessResult}
      />
    </ExamPortalShell>
  );
}
