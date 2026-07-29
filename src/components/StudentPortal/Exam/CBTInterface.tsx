import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, BookOpen, Languages, MonitorSmartphone, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { getExamOnOtherDeviceMessage, isExamOnOtherDeviceError } from "@/utils/examSession";

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

export function CBTInterface({ questions: propQuestions, onComplete, durationMinutes = 20, examEndTime, initialAnswers }: CBTInterfaceProps) {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    // Anchored to the server's examEndTime rather than a fixed countdown, so a
    // refresh recomputes the true remaining time instead of restarting it.
    const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(examEndTime, durationMinutes));
    // Store answers as { questionIndex: { questionId, optionId, optionNumber } }
    const [answers, setAnswers] = useState<AnswerRecord>(() => buildInitialAnswers(propQuestions ?? [], initialAnswers));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [otherDeviceBlock, setOtherDeviceBlock] = useState<string | null>(null);
    const [language, setLanguage] = useState<"en" | "ur">("en");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechRequestId = useRef(0);
    const isUrdu = language === "ur";

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
    const progress = (answeredCount / totalQuestions) * 100;

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

    // Stop narration when the candidate moves to another question, changes
    // language, or leaves the exam screen.
    useEffect(() => {
        stopQuestionAudio();
    }, [currentQuestion, language]);

    useEffect(() => () => {
        speechRequestId.current += 1;
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

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

        // Autosave so the answer survives a refresh; a failure here is silent
        // and non-blocking — the final submit is still the source of truth.
        api.patch('/candidates/me/exam/answer', {
            questionId: question.id,
            selectedOptionNumber: option.optionNumber,
        }).catch((err) => {
            console.error("Failed to autosave answer:", err);
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Transform answers to API format
            const formattedAnswers = Object.values(answers).map(answer => ({
                questionId: answer.questionId,
                selectedOptionNumber: answer.optionNumber
            }));

            console.log("Submitting exam with answers:", formattedAnswers);

            const response = await api.post('/candidates/me/exam/submit', {
                answers: formattedAnswers
            });

            console.log("Exam submission response:", response.data);

            setIsSubmitting(false);
            setIsSubmitted(true);

            // Call onComplete if provided
            if (onComplete) {
                onComplete();
            }
        } catch (error: any) {
            console.error("Failed to submit exam:", error);
            setIsSubmitting(false);
            if (isExamOnOtherDeviceError(error)) {
                setOtherDeviceBlock(getExamOnOtherDeviceMessage(error));
                return;
            }
            alert(error.response?.data?.message || "Failed to submit exam. Please try again or contact support.");
        }
    };

    if (totalQuestions === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full border-destructive/40 shadow-lg text-center">
                    <CardContent className="p-8 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10 text-destructive" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-2xl text-foreground mb-2">
                                No Test Questions Available
                            </h3>
                            <p className="text-muted-foreground">
                                We couldn't load any questions for this test. Please contact your exam center for assistance.
                            </p>
                        </div>
                        <Button onClick={() => navigate("/training/auth")} variant="outline" className="w-full font-bold">
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (otherDeviceBlock) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full border-amber-500/30 shadow-lg text-center">
                    <CardContent className="p-8 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                            <MonitorSmartphone className="w-10 h-10 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-2xl text-foreground mb-2">
                                Exam Open on Another Device
                            </h3>
                            <p className="text-muted-foreground">{otherDeviceBlock}</p>
                            <p className="text-sm text-muted-foreground mt-3">
                                Continue and submit on the original device. This session cannot submit the exam.
                            </p>
                        </div>
                        <Button onClick={() => navigate("/training/auth")} variant="outline" className="w-full font-bold">
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full border-border/40 shadow-lg text-center">
                    <CardContent className="p-8 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Send className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-2xl text-foreground mb-2">Exam Submitted Successfully</h3>
                            <p className="text-muted-foreground">You will be notified about the result via Candidate Portal.</p>
                        </div>
                        <Button onClick={() => navigate("/training/auth")} className="w-full font-bold gap-2">
                            Return to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
                    <div>
                        <h3 className="font-display font-bold text-xl text-foreground">Submitting Your Test...</h3>
                        <p className="text-sm text-muted-foreground mt-1">Please wait while we process your answers</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Progress and Timer */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md p-4 rounded-2xl border border-border/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-primary">Question {currentQuestion + 1} of {totalQuestions}</span>
                        <span className="text-muted-foreground">{answeredCount}/{totalQuestions} Answered • {Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
                <div className="flex items-center gap-3">
                    {/* Language Toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLanguage(language === "en" ? "ur" : "en")}
                        className="gap-1.5 px-3 border-border/60 hover:bg-secondary/60 font-medium"
                    >
                        <Languages className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">{isUrdu ? 'EN' : 'اردو'}</span>
                    </Button>
                    <div className={cn(
                        "px-6 py-3 rounded-xl border flex items-center gap-3 transition-colors",
                        timeLeft < 300 ? "bg-destructive/10 border-destructive/20 text-destructive animate-pulse" : "bg-card border-border/60"
                    )}>
                        <Clock className="w-5 h-5" />
                        <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Main Question Area */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-border/40 shadow-md min-h-[400px] flex flex-col">
                        <CardHeader className="border-b border-border/20 bg-secondary/10">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground">Question {currentQuestion + 1}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleQuestionAudio}
                                    className="gap-2 shrink-0"
                                    aria-label={isSpeaking ? "Stop question audio" : "Read question aloud"}
                                >
                                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{isSpeaking ? "Stop audio" : "Listen"}</span>
                                </Button>
                            </div>
                            <CardTitle className={cn(
                                "text-xl sm:text-2xl leading-relaxed",
                                isUrdu ? "text-right font-urdu" : "alumni-sans-title"
                            )} dir={isUrdu ? "rtl" : "ltr"}>
                                {isUrdu && questions[currentQuestion].questionTextUrdu
                                    ? questions[currentQuestion].questionTextUrdu
                                    : questions[currentQuestion].questionText}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 sm:p-8">
                            <RadioGroup
                                value={answers[currentQuestion]?.optionId || ""}
                                onValueChange={(optionId) => {
                                    const selectedOption = questions[currentQuestion].options.find(opt => opt.id === optionId);
                                    if (selectedOption) {
                                        selectAnswer(selectedOption);
                                    }
                                }}
                                className="space-y-4"
                            >
                                {questions[currentQuestion].options.map((option) => (
                                    <div
                                        key={option.id}
                                        className={cn(
                                            "flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer",
                                            isUrdu ? "flex-row-reverse space-x-reverse space-x-3" : "space-x-3",
                                            answers[currentQuestion]?.optionId === option.id
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                : "border-transparent bg-secondary/20 hover:bg-secondary/40 hover:border-border/60"
                                        )}
                                        dir={isUrdu ? "rtl" : "ltr"}
                                        onClick={() => selectAnswer(option)}
                                    >
                                        <RadioGroupItem value={option.id} id={`option-${option.id}`} className="sr-only" />
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                            answers[currentQuestion]?.optionId === option.id ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
                                        )}>
                                            {answers[currentQuestion]?.optionId === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <Label htmlFor={`option-${option.id}`} className={cn(
                                            "flex-1 font-medium cursor-pointer text-base",
                                            isUrdu && "text-right font-urdu"
                                        )}>
                                            {isUrdu && option.optionTextUrdu
                                                ? option.optionTextUrdu
                                                : option.optionText}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                        <div className="p-4 sm:p-6 border-t border-border/20 flex justify-between bg-secondary/5">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
                            </Button>
                            <Button
                                onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
                                disabled={currentQuestion === totalQuestions - 1}
                                className="gap-2"
                            >
                                <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-xs font-medium">Do not refresh the page or navigate away. Your progress might be lost, and the exam could be auto-submitted.</p>
                    </div>
                </div>

                {/* Question Navigation Sidebar */}
                <div className="space-y-4">
                    <Card className="border-border/40 shadow-sm lg:sticky lg:top-32">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Question Navigator</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{answeredCount} of {totalQuestions} answered</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {Array.from({ length: totalQuestions }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={cn(
                                            "h-9 w-full rounded-lg text-xs font-bold transition-all border",
                                            currentQuestion === idx
                                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-110 z-10"
                                                : answers[idx]
                                                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                                                    : "bg-secondary text-muted-foreground border-border/60 hover:border-primary/40"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                            <Button
                                onClick={handleSubmit}
                                className="w-full font-bold gap-2 shadow-lg"
                                disabled={answeredCount < totalQuestions}
                            >
                                <Send className="w-4 h-4" /> Submit Exam
                            </Button>
                            {answeredCount < totalQuestions && (
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    Answer all questions to submit
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
