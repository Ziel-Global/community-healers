import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  BookOpen,
  Languages,
  MonitorSmartphone,
  Volume2,
  VolumeX,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutosaveAnswer, useSubmitExam } from "@/hooks/queries/useCandidateQueries";
import { getExamOnOtherDeviceMessage, isExamOnOtherDeviceError } from "@/utils/examSession";
import { getApiErrorMessage } from "@/lib/errors";
import { ExamStatusCard, ExamInfoPanel } from "@/components/StudentPortal/Exam/ExamPortalShell";

interface Question {
  id: string;
  questionText: string;
  questionTextUrdu?: string;
  options: {
    id: string;
    optionNumber: number;
    optionText: string;
    optionTextUrdu?: string;
  }[];
}

interface CBTInterfaceProps {
  questions?: Question[];
  onComplete?: () => void;
  durationMinutes?: number;
  /** Absolute server-anchored deadline (ISO string) — source of truth for the timer. */
  examEndTime?: string | null;
  /** Previously autosaved answers, keyed by questionId -> selectedOptionNumber. */
  initialAnswers?: Record<string, number>;
}

type AnswerRecord = Record<number, { questionId: string; optionId: string; optionNumber: number }>;

function computeTimeLeft(examEndTime: string | null | undefined, fallbackMinutes: number): number {
  if (examEndTime) {
    const ms = new Date(examEndTime).getTime() - Date.now();
    return Math.max(0, Math.round(ms / 1000));
  }
  return fallbackMinutes * 60;
}

function buildInitialAnswers(questions: Question[], saved?: Record<string, number>): AnswerRecord {
  if (!saved) return {};
  const result: AnswerRecord = {};
  questions.forEach((question, index) => {
    const selectedOptionNumber = saved[question.id];
    if (selectedOptionNumber === undefined) return;
    const option = question.options.find((o) => o.optionNumber === selectedOptionNumber);
    if (option) {
      result[index] = {
        questionId: question.id,
        optionId: option.id,
        optionNumber: option.optionNumber,
      };
    }
  });
  return result;
}

export function CBTInterface({
  questions: propQuestions,
  onComplete,
  durationMinutes = 20,
  examEndTime,
  initialAnswers,
}: CBTInterfaceProps) {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(examEndTime, durationMinutes));
  const [answers, setAnswers] = useState<AnswerRecord>(() =>
    buildInitialAnswers(propQuestions ?? [], initialAnswers)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [otherDeviceBlock, setOtherDeviceBlock] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRequestId = useRef(0);
  const isUrdu = language === "ur";
  const autosaveAnswerMutation = useAutosaveAnswer();
  const submitExamMutation = useSubmitExam();
  const isSubmitting = submitExamMutation.isPending;

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      if (examEndTime) {
        setTimeLeft(computeTimeLeft(examEndTime, durationMinutes));
      } else {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, examEndTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const stopQuestionAudio = () => {
    speechRequestId.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const questions = propQuestions ?? [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleQuestionAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio playback is not supported by this browser.");
      return;
    }

    if (isSpeaking) {
      stopQuestionAudio();
      return;
    }

    const question = questions[currentQuestion];
    const useUrduAudio = isUrdu && Boolean(question.questionTextUrdu);
    const text = useUrduAudio ? question.questionTextUrdu! : question.questionText;
    const requestId = speechRequestId.current + 1;
    speechRequestId.current = requestId;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = useUrduAudio ? "ur-PK" : "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => {
      if (speechRequestId.current === requestId) setIsSpeaking(false);
    };
    utterance.onerror = () => {
      if (speechRequestId.current === requestId) setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    stopQuestionAudio();
  }, [currentQuestion, language]);

  useEffect(
    () => () => {
      speechRequestId.current += 1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    []
  );

  const selectAnswer = (option: Question["options"][number]) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: {
        questionId: question.id,
        optionId: option.id,
        optionNumber: option.optionNumber,
      },
    }));
    autosaveAnswerMutation.mutate({
      questionId: question.id,
      selectedOptionNumber: option.optionNumber,
    });
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.values(answers).map((answer) => ({
      questionId: answer.questionId,
      selectedOptionNumber: answer.optionNumber,
    }));

    submitExamMutation.mutate(formattedAnswers, {
      onSuccess: () => {
        setIsSubmitted(true);
        onComplete?.();
      },
      onError: (error: unknown) => {
        if (isExamOnOtherDeviceError(error)) {
          setOtherDeviceBlock(getExamOnOtherDeviceMessage(error));
          return;
        }
        alert(getApiErrorMessage(error, "Failed to submit exam. Please try again or contact support."));
      },
    });
  };

  if (totalQuestions === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ExamStatusCard
          icon={AlertTriangle}
          title="No Test Questions Available"
          description="We couldn't load any questions for this test. Please contact your exam center for assistance."
          tone="danger"
        >
          <Button
            onClick={() => navigate("/training/auth")}
            variant="outline"
            className="w-full h-11 rounded-[10px] border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
          >
            Back to Login
          </Button>
        </ExamStatusCard>
      </div>
    );
  }

  if (otherDeviceBlock) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ExamStatusCard
          icon={MonitorSmartphone}
          title="Exam Open on Another Device"
          description={otherDeviceBlock}
          tone="warning"
        >
          <ExamInfoPanel>
            Continue and submit on the original device. This session cannot submit the exam.
          </ExamInfoPanel>
          <Button
            onClick={() => navigate("/training/auth")}
            variant="outline"
            className="w-full h-11 rounded-[10px] border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
          >
            Back to Login
          </Button>
        </ExamStatusCard>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ExamStatusCard
          icon={CheckCircle}
          title="Exam Submitted Successfully"
          description="You will be notified about the result via the Candidate Portal."
          tone="success"
        >
          <Button
            onClick={() => navigate("/training/auth")}
            className="w-full h-11 rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white font-medium shadow-[0_8px_20px_rgba(22,76,62,0.18)]"
          >
            Return to Login
          </Button>
        </ExamStatusCard>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full border-4 border-[#c9d6c8] border-t-[#164c3e] animate-spin mx-auto" />
          <div>
            <h3 className="font-display font-semibold text-xl text-[#183d34]">Submitting Your Test…</h3>
            <p className="text-sm text-[#6d8474] mt-1">Please wait while we process your answers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress + timer bar */}
      <div className="sticky top-[4.5rem] z-20 bg-white/95 backdrop-blur-md p-4 rounded-[16px] border border-[#e7eee9] shadow-[0_8px_24px_rgba(22,76,62,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.12em]">
            <span className="text-[#164c3e]">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className="text-[#6d8474]">
              {answeredCount}/{totalQuestions} Answered · {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-[#e8f0ea] [&>div]:bg-[#164c3e]" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "ur" : "en")}
            className="gap-1.5 px-3 border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3] rounded-[9px] font-medium"
          >
            <Languages className="w-4 h-4" />
            <span className="text-xs sm:text-sm">{isUrdu ? "EN" : "اردو"}</span>
          </Button>
          <div
            className={cn(
              "px-5 py-2.5 rounded-[12px] border flex items-center gap-2.5 transition-colors",
              timeLeft < 300
                ? "bg-red-50 border-red-200 text-red-700 animate-pulse"
                : "bg-[#f4f7f3] border-[#e7eee9] text-[#183d34]"
            )}
          >
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-mono font-bold tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] min-h-[400px] flex flex-col overflow-hidden">
            <div className="border-b border-[#e7eee9] bg-[#f8faf7] px-5 sm:px-7 py-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e8f0ea] flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[#164c3e]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#6d8474]">
                    Question {currentQuestion + 1}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuestionAudio}
                  className="gap-2 shrink-0 border-[#c9d6c8] text-[#183d34] hover:bg-white rounded-[9px]"
                  aria-label={isSpeaking ? "Stop question audio" : "Read question aloud"}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isSpeaking ? "Stop audio" : "Listen"}</span>
                </Button>
              </div>
              <h2
                className={cn(
                  "text-xl sm:text-2xl font-display font-semibold text-[#183d34] leading-relaxed",
                  isUrdu ? "text-right font-urdu" : ""
                )}
                dir={isUrdu ? "rtl" : "ltr"}
              >
                {isUrdu && questions[currentQuestion].questionTextUrdu
                  ? questions[currentQuestion].questionTextUrdu
                  : questions[currentQuestion].questionText}
              </h2>
            </div>

            <div className="flex-1 p-4 sm:p-7">
              <RadioGroup
                value={answers[currentQuestion]?.optionId || ""}
                onValueChange={(optionId) => {
                  const selectedOption = questions[currentQuestion].options.find(
                    (opt) => opt.id === optionId
                  );
                  if (selectedOption) selectAnswer(selectedOption);
                }}
                className="space-y-3"
              >
                {questions[currentQuestion].options.map((option) => {
                  const selected = answers[currentQuestion]?.optionId === option.id;
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center p-4 rounded-[14px] border-2 transition-all cursor-pointer",
                        isUrdu ? "flex-row-reverse space-x-reverse space-x-3" : "gap-3",
                        selected
                          ? "border-[#164c3e] bg-[#e8f0ea] shadow-[0_4px_12px_rgba(22,76,62,0.08)]"
                          : "border-[#e7eee9] bg-[#f8faf7] hover:border-[#c9d6c8] hover:bg-white"
                      )}
                      dir={isUrdu ? "rtl" : "ltr"}
                      onClick={() => selectAnswer(option)}
                    >
                      <RadioGroupItem value={option.id} id={`option-${option.id}`} className="sr-only" />
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selected ? "border-[#164c3e] bg-[#164c3e]" : "border-[#c9d6c8]"
                        )}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-[#d7f88c]" />}
                      </div>
                      <Label
                        htmlFor={`option-${option.id}`}
                        className={cn(
                          "flex-1 font-medium cursor-pointer text-base text-[#183d34]",
                          isUrdu && "text-right font-urdu"
                        )}
                      >
                        {isUrdu && option.optionTextUrdu ? option.optionTextUrdu : option.optionText}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="p-4 sm:px-7 sm:py-5 border-t border-[#e7eee9] flex justify-between bg-[#f8faf7]">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="gap-2 border-[#c9d6c8] text-[#183d34] hover:bg-white rounded-[9px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
                disabled={currentQuestion === totalQuestions - 1}
                className="gap-2 bg-[#164c3e] hover:bg-[#12382d] text-white rounded-[9px]"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-[14px] bg-red-50/80 border border-red-100 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              Do not refresh the page or navigate away. Your progress might be lost, and the exam could
              be auto-submitted.
            </p>
          </div>
        </div>

        {/* Navigator */}
        <div className="space-y-4">
          <div className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] lg:sticky lg:top-36 overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-[#e7eee9]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d8474]">
                Question Navigator
              </p>
              <p className="text-xs text-[#6d8474] mt-1">
                {answeredCount} of {totalQuestions} answered
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-5 gap-2 mb-5">
                {Array.from({ length: totalQuestions }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestion(idx)}
                    className={cn(
                      "h-9 w-full rounded-[9px] text-xs font-bold transition-all border",
                      currentQuestion === idx
                        ? "bg-[#164c3e] text-white border-[#164c3e] shadow-[0_4px_12px_rgba(22,76,62,0.25)] scale-105 z-10"
                        : answers[idx]
                          ? "bg-[#eef6df] text-[#426f36] border-[#d5e8c4]"
                          : "bg-[#f4f7f3] text-[#6d8474] border-[#e7eee9] hover:border-[#c9d6c8]"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full font-semibold gap-2 h-11 rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white shadow-[0_8px_20px_rgba(22,76,62,0.2)]"
                disabled={answeredCount < totalQuestions}
              >
                <Send className="w-4 h-4" /> Submit Exam
              </Button>
              {answeredCount < totalQuestions && (
                <p className="text-xs text-center text-[#6d8474] mt-2">Answer all questions to submit</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
