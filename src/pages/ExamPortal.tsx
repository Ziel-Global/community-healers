import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CBTInterface } from "@/components/StudentPortal/Exam/CBTInterface";
import { Button } from "@/components/ui/button";
import { parseISO, format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LogOut, Loader2, AlertCircle, Ban, CheckCircle, FileText, Clock, MonitorSmartphone, ShieldAlert } from "lucide-react";
import { useExamStatus, useExamQuestions } from "@/hooks/queries/useCandidateQueries";
import { authService } from "@/services/authService";
import { CandidateStatus, ExamScheduledResponse } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { getExamOnOtherDeviceMessage, isExamOnOtherDeviceError } from "@/utils/examSession";
import { getApiErrorMessage } from "@/lib/errors";
import { useToast } from "@/hooks/use-toast";
import { LivenessGateDialog } from "@/components/StudentPortal/Exam/LivenessGateDialog";
import { VerifyLivenessResult } from "@/services/candidateService";

const LIVENESS_REQUIRED_ERROR = "LIVENESS_VERIFICATION_REQUIRED";

export default function ExamPortal() {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { logout } = useAuth();
    const [examState, setExamState] = useState<"loading" | "pending" | "verified" | "rejected" | "absent" | "submitted" | "countdown" | "in-progress" | "other-device" | "questions-error" | "liveness-blocked">("loading");
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
    // `refetch()` takes no arguments, so whether this fetch should drop
    // straight into "in-progress" (resume) or go through the countdown
    // screen (fresh start) is tracked out-of-band here and read back when
    // the questions query settles.
    const isResumeRef = useRef(false);

    const beginExam = (options?: { isResume?: boolean }) => {
        isResumeRef.current = options?.isResume ?? false;
        setQuestionsErrorMessage(null);
        questionsQuery.refetch();
    };

    // "Begin Examination" click — skip straight to the exam if liveness was
    // already passed for this sitting (e.g. gate already cleared once this
    // page load), otherwise show the face-verification gate first.
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
            description: `${result.attemptsRemaining} attempt${result.attemptsRemaining === 1 ? "" : "s"} remaining. Click "Begin Examination" to retry.`,
        });
    };

    // React to the candidate-status query resolving — drives the initial
    // exam-state transition exactly like the old fetchCandidateStatus did.
    useEffect(() => {
        if (!statusQuery.isSuccess || !statusQuery.data) return;
        const statusData = statusQuery.data;
        console.log("Candidate status response:", statusData);

        switch (statusData.candidateStatus) {
            case CandidateStatus.VERIFIED:
                if (statusData.examInProgress) {
                    // Candidate already started the exam (e.g. before a refresh) —
                    // resume silently instead of showing "Begin Examination" again.
                    // Liveness was already required to reach this point, so no
                    // re-check needed on resume.
                    console.log("Status: VERIFIED, exam already in progress — resuming");
                    beginExam({ isResume: true });
                } else if (statusData.livenessBlocked) {
                    console.log("Status: VERIFIED, but liveness blocked");
                    setExamState("liveness-blocked");
                } else {
                    console.log("Status: VERIFIED");
                    setExamState("verified");
                }
                break;
            case CandidateStatus.PENDING:
                console.log("Status: PENDING");
                setExamState("pending");
                break;
            case CandidateStatus.REJECTED:
                console.log("Status: REJECTED");
                setExamState("rejected");
                break;
            case CandidateStatus.ABSENT:
                console.log("Status: ABSENT");
                setExamState("absent");
                break;
            case CandidateStatus.SUBMITTED:
                console.log("Status: SUBMITTED");
                setExamState("submitted");
                break;
            default:
                console.log("Status: Unknown, defaulting to PENDING");
                setExamState("pending");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusQuery.isSuccess, statusQuery.data]);

    useEffect(() => {
        if (!statusQuery.isError) return;
        const err = statusQuery.error;
        console.error("Failed to fetch candidate status:", err);
        setError(getApiErrorMessage(err, "Failed to load exam status"));
        setExamState("pending");
    }, [statusQuery.isError, statusQuery.error]);

    // Also fetch full scheduled exam details for duration/question count —
    // a secondary, best-effort fetch: failures are swallowed and never
    // block the primary status-driven state machine above.
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

    // RTL cleanup on unmount
    useEffect(() => {
        return () => {
            if (i18n.language === 'ur') {
                i18n.changeLanguage('en');
            }
        };
    }, []);

    // Countdown before exam starts
    useEffect(() => {
        if (examState === "countdown" && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (examState === "countdown" && countdown === 0) {
            setExamState("in-progress");
        }
    }, [examState, countdown]);

    // React to the on-demand exam-questions query settling (fired by
    // beginExam(), either from the "Begin Examination"/"Try Again" click or
    // the auto-resume path above).
    useEffect(() => {
        if (!questionsQuery.isSuccess || !questionsQuery.data) return;
        const data = questionsQuery.data;
        setExamEndTime(data.timer?.examEndTime ?? null);
        setDraftAnswers(data.draftAnswers && typeof data.draftAnswers === "object" ? data.draftAnswers : {});
        // Resuming an already-started exam (e.g. after a refresh) drops
        // straight back into the test — the countdown/rules screen is
        // only for a genuinely fresh start.
        setExamState(isResumeRef.current ? "in-progress" : "countdown");
    }, [questionsQuery.isSuccess, questionsQuery.data]);

    useEffect(() => {
        if (!questionsQuery.isError) return;
        const err = questionsQuery.error;
        console.error("Failed to fetch questions:", err);
        if (isExamOnOtherDeviceError(err)) {
            setOtherDeviceMessage(getExamOnOtherDeviceMessage(err));
            setExamState("other-device");
            return;
        }
        // Safety net: the proactive livenessVerified check above should
        // normally prevent this, but if it ever slips through (stale state,
        // race condition), open the gate instead of showing a raw error.
        if (getApiErrorMessage(err, "").includes(LIVENESS_REQUIRED_ERROR)) {
            setExamState("verified");
            setShowLivenessDialog(true);
            return;
        }
        // All attempts exhausted with no usable questions.
        setQuestionsErrorMessage(
            "We couldn't load your test questions after several attempts. This is usually temporary — please check your internet connection and try again. If the problem continues, contact your exam center for help."
        );
        setExamState("questions-error");
    }, [questionsQuery.isError, questionsQuery.error]);

    const handleExamComplete = () => {
        // Exam submission is handled by CBTInterface
        // No need to show results here
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            // Reset language to English before leaving
            if (i18n.language === 'ur') {
                i18n.changeLanguage('en');
            }
            await logout();
            navigate("/training/auth");
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/training/auth");
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Loading state
    if (examState === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading training details...</p>
                </div>
            </div>
        );
    }

    // Pending state - waiting for center admin verification
    if (examState === "pending") {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                {/* Header */}
                <header className="border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Training Portal</h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-1 sm:gap-2">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Waiting Content */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border/40 shadow-royal text-center">
                        <CardHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-xl sm:text-2xl font-display">Test Not Started Yet</CardTitle>
                                <CardDescription className="mt-2">
                                    Please wait for the center administrator to initiate the test
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground text-center">
                                Waiting for test to begin...
                            </p>

                            <div className="bg-secondary/30 rounded-lg p-4 text-left space-y-2">
                                <p className="text-xs sm:text-sm font-medium text-foreground">While you wait:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• Ensure your device is charged</li>
                                    <li>• Check your internet connection</li>
                                    <li>• Keep your ID ready for verification</li>
                                    <li>• Do not refresh or close this page</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Rejected state - center admin rejected the candidate
    if (examState === "rejected") {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Examination Portal</h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-1 sm:gap-2">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </Button>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-destructive/40 shadow-royal text-center">
                        <CardHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                                <Ban className="w-8 h-8 text-destructive" />
                            </div>
                            <div>
                                <CardTitle className="text-xl sm:text-2xl font-display text-destructive">Application Rejected</CardTitle>
                                <CardDescription className="mt-2">
                                    Your application has been rejected by the center administrator
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-destructive/10 rounded-lg p-4 text-left">
                                <p className="text-sm text-foreground font-medium mb-2">What happens next?</p>
                                <p className="text-xs text-muted-foreground">
                                    Please contact your examination center for more details about the rejection reason.
                                    You may need to reapply through the candidate portal.
                                </p>
                            </div>
                            <Button onClick={handleLogout} variant="outline" disabled={isLoggingOut} className="w-full">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                                {isLoggingOut ? "Logging out..." : "Return to Portal"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Liveness blocked - 2 failed face-verification attempts at exam start
    if (examState === "liveness-blocked") {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Examination Portal</h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-1 sm:gap-2">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </Button>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-destructive/40 shadow-royal text-center">
                        <CardHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                                <ShieldAlert className="w-8 h-8 text-destructive" />
                            </div>
                            <div>
                                <CardTitle className="text-xl sm:text-2xl font-display text-destructive">Face Verification Failed</CardTitle>
                                <CardDescription className="mt-2">
                                    Your face could not be verified after two attempts. Exam access has been blocked.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-destructive/10 rounded-lg p-4 text-left">
                                <p className="text-sm text-foreground font-medium mb-2">What happens next?</p>
                                <p className="text-xs text-muted-foreground">
                                    Please contact your center administrator to resolve this before attempting the exam again.
                                </p>
                            </div>
                            <Button onClick={handleLogout} variant="outline" disabled={isLoggingOut} className="w-full">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                                {isLoggingOut ? "Logging out..." : "Return to Portal"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Absent state - candidate was marked absent
    if (examState === "absent") {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Training Portal</h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-1 sm:gap-2">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </Button>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-orange-500/40 shadow-royal text-center">
                        <CardHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl sm:text-2xl font-display text-orange-600">Training Missed</CardTitle>
                                <CardDescription className="mt-2">
                                    You were marked absent for the scheduled training
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 text-left">
                                <p className="text-sm text-foreground font-medium mb-2">What happens next?</p>
                                <p className="text-xs text-muted-foreground">
                                    You missed the scheduled training. Don't worry - you will be allotted another training date soon.
                                    Please check your candidate portal for updates on the rescheduled training.
                                </p>
                            </div>
                            <div className="bg-secondary/30 rounded-lg p-4 text-left">
                                <p className="text-xs font-medium text-foreground mb-2">Important:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• No additional fees required for rescheduling</li>
                                    <li>• Check your email for notifications</li>
                                    <li>• Contact support if you need assistance</li>
                                </ul>
                            </div>
                            <Button onClick={handleLogout} variant="outline" disabled={isLoggingOut} className="w-full">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                                {isLoggingOut ? "Logging out..." : "Return to Portal"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Submitted state - candidate has already submitted the exam
    if (examState === "submitted") {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Training Portal</h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-1 sm:gap-2">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </Button>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-primary/40 shadow-royal text-center">
                        <CardHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl sm:text-2xl font-display">Test Already Submitted</CardTitle>
                                <CardDescription className="mt-2">
                                    You have already submitted your test
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-primary/5 rounded-lg p-4 text-left border border-primary/20">
                                <p className="text-sm text-foreground font-medium mb-2">Next Steps:</p>
                                <p className="text-xs text-muted-foreground">
                                    Please visit the Candidate Portal to check your test results and certificate status.
                                    You will be notified once your results have been reviewed by the ministry.
                                </p>
                            </div>
                            <Button onClick={handleLogout} variant="outline" disabled={isLoggingOut} className="w-full">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                                {isLoggingOut ? "Logging out..." : "Return to Portal"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Countdown screen
    if (examState === "countdown") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-xl">
                        <span className="text-6xl font-bold text-primary-foreground">{countdown}</span>
                    </div>
                    <p className="text-xl text-muted-foreground">Test starting in...</p>
                </div>
            </div>
        );
    }

    // Exam locked to another device
    if (examState === "other-device") {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Training Portal</h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-1 sm:gap-2">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-amber-500/30 shadow-royal text-center">
                        <CardHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <MonitorSmartphone className="w-8 h-8 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl sm:text-2xl font-display">Exam Open on Another Device</CardTitle>
                                <CardDescription className="mt-2">
                                    {otherDeviceMessage || "Exam already in progress on another device. Please continue on the original device."}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground text-left bg-secondary/40 rounded-lg p-4">
                                This exam cannot be started or continued here. Return to the device where you first began the exam.
                            </p>
                            <Button variant="outline" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Back to Login
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Questions failed to load after retries
    if (examState === "questions-error") {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Training Portal</h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-1 sm:gap-2">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-destructive/40 shadow-royal text-center">
                        <CardHeader className="space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-destructive" />
                            </div>
                            <div>
                                <CardTitle className="text-xl sm:text-2xl font-display text-destructive">Unable to Load Test Questions</CardTitle>
                                <CardDescription className="mt-2">
                                    {questionsErrorMessage || "We couldn't load your test questions. Please try again."}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={() => beginExam()}
                                disabled={isFetchingQuestions}
                                className="w-full gradient-primary text-white font-semibold"
                            >
                                {isFetchingQuestions ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {isFetchingQuestions ? "Retrying..." : "Try Again"}
                            </Button>
                            <Button onClick={handleLogout} variant="outline" disabled={isLoggingOut} className="w-full">
                                {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                                {isLoggingOut ? "Logging out..." : "Back to Login"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Exam in progress
    if (examState === "in-progress") {
        return (
            <div className="min-h-screen bg-background">
                {/* Exam Header */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="alumni-sans-title text-xl text-foreground">Soft Skill Training CBT</h1>
                                    <p className="text-xs text-muted-foreground">Training in Progress</p>
                                </div>
                                <div className="sm:hidden">
                                    <h1 className="alumni-sans-title text-sm text-foreground">CBT Training</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto p-4 sm:p-6">
                    <CBTInterface
                        questions={questions}
                        onComplete={handleExamComplete}
                        durationMinutes={scheduledExam?.durationMinutes || 20}
                        examEndTime={examEndTime}
                        initialAnswers={draftAnswers}
                    />
                </main>
            </div>
        );
    }

    // Verified state - candidate can begin exam
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Training Portal</h1>
                                <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-1 sm:gap-2">
                            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
                {/* Welcome Card */}
                <Card className="border-border/40 shadow-md border-l-4 border-l-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Verified - Ready to Begin</span>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl">Welcome, Candidate</CardTitle>
                        <CardDescription>
                            You have been verified by the center administrator. You may begin your test when ready.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Exam Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <FileText className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Questions</p>
                                    <p className="font-semibold">{scheduledExam?.numberOfQuestions || 20} MCQs</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <Clock className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Duration</p>
                                    <p className="font-semibold">{scheduledExam?.durationMinutes || 20} Minutes</p>
                                </div>
                            </div>
                        </div>

                        {candidateStatus && (
                            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                                <p className="text-sm font-medium text-foreground mb-1">Training Date</p>
                                <p className="text-lg font-semibold text-primary">
                                    {(() => {
                                        if (!candidateStatus?.examDate) return 'N/A';
                                        try {
                                            const parsed = parseISO(candidateStatus.examDate);
                                            if (isNaN(parsed.getTime())) return candidateStatus.examDate;
                                            return format(parsed, 'EEEE, MMMM d, yyyy');
                                        } catch (e) {
                                            return candidateStatus.examDate;
                                        }
                                    })()}
                                </p>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground">Training Rules:</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>Once started, the training cannot be paused or restarted</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>The timer will start immediately after clicking "Begin Test"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>Answers are auto-saved as you progress through questions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>Do not refresh or close the browser during the test</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>The test will auto-submit when the timer reaches zero</span>
                                </li>
                            </ul>
                        </div>

                        {/* Start Button */}
                        <div className="pt-4">
                            <Button
                                onClick={handleBeginExamClick}
                                disabled={isFetchingQuestions}
                                className="w-full h-12 sm:h-14 text-base sm:text-lg gradient-primary text-white font-semibold"
                            >
                                {isFetchingQuestions ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                                {isFetchingQuestions ? "Loading Questions..." : "Begin Examination"}
                            </Button>
                            <p className="text-center text-xs text-muted-foreground mt-3">
                                By clicking above, you confirm that you have read and understood the rules
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <LivenessGateDialog
                open={showLivenessDialog}
                onOpenChange={setShowLivenessDialog}
                onResult={handleLivenessResult}
            />
        </div>
    );
}
