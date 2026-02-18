import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, BookOpen, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

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
}

export function CBTInterface({ questions: propQuestions, onComplete, durationMinutes = 20 }: CBTInterfaceProps) {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // duration in seconds
    // Store answers as { questionIndex: { questionId, optionId, optionNumber } }
    const [answers, setAnswers] = useState<Record<number, { questionId: string; optionId: string; optionNumber: number }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [language, setLanguage] = useState<"en" | "ur">("en");
    const isUrdu = language === "ur";

    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Use provided questions or fallback to default questions
    const questions = propQuestions && propQuestions.length > 0 ? propQuestions : [
        {
            id: "1",
            questionText: "What is the primary procedure for emergency equipment shutdown?",
            options: [
                { id: "1-1", optionNumber: 1, optionText: "Press Emergency Stop" },
                { id: "1-2", optionNumber: 2, optionText: "Wait for supervisor" },
                { id: "1-3", optionNumber: 3, optionText: "Unplug power" },
                { id: "1-4", optionNumber: 4, optionText: "Check manual first" },
            ],
        },
        {
            id: "2",
            questionText: "How often should safety goggles be inspected?",
            options: [
                { id: "2-1", optionNumber: 1, optionText: "Monthly" },
                { id: "2-2", optionNumber: 2, optionText: "Weekly" },
                { id: "2-3", optionNumber: 3, optionText: "Before every use" },
                { id: "2-4", optionNumber: 4, optionText: "Annually" },
            ],
        },
        {
            id: "3",
            questionText: "Which of the following is a proper lifting technique?",
            options: [
                { id: "3-1", optionNumber: 1, optionText: "Bend at waist" },
                { id: "3-2", optionNumber: 2, optionText: "Bend knees and keep back straight" },
                { id: "3-3", optionNumber: 3, optionText: "Use back muscles" },
                { id: "3-4", optionNumber: 4, optionText: "Twist while lifting" },
            ],
        },
        {
            id: "4",
            questionText: "What does PPE stand for?",
            options: [
                { id: "4-1", optionNumber: 1, optionText: "Personal Protection Equipment" },
                { id: "4-2", optionNumber: 2, optionText: "Professional Practice Environment" },
                { id: "4-3", optionNumber: 3, optionText: "Personal Protective Equipment" },
                { id: "4-4", optionNumber: 4, optionText: "Primary Prevention Equipment" },
            ],
        },
        {
            id: "5",
            questionText: "What is the first step in a risk assessment?",
            options: [
                { id: "5-1", optionNumber: 1, optionText: "Implement controls" },
                { id: "5-2", optionNumber: 2, optionText: "Identify hazards" },
                { id: "5-3", optionNumber: 3, optionText: "Review incidents" },
                { id: "5-4", optionNumber: 4, optionText: "Train staff" },
            ],
        },
        {
            id: "6",
            questionText: "How long should you wash your hands in a healthcare setting?",
            options: [
                { id: "6-1", optionNumber: 1, optionText: "10 seconds" },
                { id: "6-2", optionNumber: 2, optionText: "20 seconds" },
                { id: "6-3", optionNumber: 3, optionText: "30 seconds" },
                { id: "6-4", optionNumber: 4, optionText: "1 minute" },
            ],
        },
        {
            id: "7",
            questionText: "What color is typically used for fire safety signs?",
            options: [
                { id: "7-1", optionNumber: 1, optionText: "Blue" },
                { id: "7-2", optionNumber: 2, optionText: "Green" },
                { id: "7-3", optionNumber: 3, optionText: "Red" },
                { id: "7-4", optionNumber: 4, optionText: "Yellow" },
            ],
        },
        {
            id: "8",
            questionText: "At what temperature should a refrigerator be maintained?",
            options: [
                { id: "8-1", optionNumber: 1, optionText: "Below 5°C" },
                { id: "8-2", optionNumber: 2, optionText: "Below 10°C" },
                { id: "8-3", optionNumber: 3, optionText: "Below 15°C" },
                { id: "8-4", optionNumber: 4, optionText: "Below 20°C" },
            ],
        },
        {
            id: "9",
            questionText: "What does SOP stand for?",
            options: [
                { id: "9-1", optionNumber: 1, optionText: "Standard Operating Procedure" },
                { id: "9-2", optionNumber: 2, optionText: "Safety Operation Plan" },
                { id: "9-3", optionNumber: 3, optionText: "Standard Organization Protocol" },
                { id: "9-4", optionNumber: 4, optionText: "Systematic Operational Process" },
            ],
        },
        {
            id: "10",
            questionText: "How often should fire drills be conducted?",
            options: [
                { id: "10-1", optionNumber: 1, optionText: "Monthly" },
                { id: "10-2", optionNumber: 2, optionText: "Quarterly" },
                { id: "10-3", optionNumber: 3, optionText: "Bi-annually" },
                { id: "10-4", optionNumber: 4, optionText: "Annually" },
            ],
        },
        {
            id: "11",
            questionText: "What is the maximum safe lifting weight without assistance?",
            options: [
                { id: "11-1", optionNumber: 1, optionText: "10 kg" },
                { id: "11-2", optionNumber: 2, optionText: "15 kg" },
                { id: "11-3", optionNumber: 3, optionText: "20 kg" },
                { id: "11-4", optionNumber: 4, optionText: "25 kg" },
            ],
        },
        {
            id: "12",
            questionText: "Which document outlines workplace safety requirements?",
            options: [
                { id: "12-1", optionNumber: 1, optionText: "Employee handbook" },
                { id: "12-2", optionNumber: 2, optionText: "Health and Safety Policy" },
                { id: "12-3", optionNumber: 3, optionText: "Job description" },
                { id: "12-4", optionNumber: 4, optionText: "Training manual" },
            ],
        },
        {
            id: "13",
            questionText: "What should you do if you witness an unsafe act?",
            options: [
                { id: "13-1", optionNumber: 1, optionText: "Ignore it" },
                { id: "13-2", optionNumber: 2, optionText: "Report it immediately" },
                { id: "13-3", optionNumber: 3, optionText: "Wait for someone else to report" },
                { id: "13-4", optionNumber: 4, optionText: "Document it later" },
            ],
        },
        {
            id: "14",
            questionText: "What is the proper way to store chemicals?",
            options: [
                { id: "14-1", optionNumber: 1, optionText: "Alphabetically" },
                { id: "14-2", optionNumber: 2, optionText: "By purchase date" },
                { id: "14-3", optionNumber: 3, optionText: "By compatibility" },
                { id: "14-4", optionNumber: 4, optionText: "By size" },
            ],
        },
        {
            id: "15",
            questionText: "How many fire extinguisher types are there?",
            options: [
                { id: "15-1", optionNumber: 1, optionText: "3" },
                { id: "15-2", optionNumber: 2, optionText: "4" },
                { id: "15-3", optionNumber: 3, optionText: "5" },
                { id: "15-4", optionNumber: 4, optionText: "6" },
            ],
        },
        {
            id: "16",
            questionText: "What does MSDS stand for?",
            options: [
                { id: "16-1", optionNumber: 1, optionText: "Material Safety Data Sheet" },
                { id: "16-2", optionNumber: 2, optionText: "Medical Safety Data System" },
                { id: "16-3", optionNumber: 3, optionText: "Minimum Safety Design Standard" },
                { id: "16-4", optionNumber: 4, optionText: "Manual Safety Detection System" },
            ],
        },
        {
            id: "17",
            questionText: "What is the recommended distance from a fire exit?",
            options: [
                { id: "17-1", optionNumber: 1, optionText: "15 meters" },
                { id: "17-2", optionNumber: 2, optionText: "30 meters" },
                { id: "17-3", optionNumber: 3, optionText: "45 meters" },
                { id: "17-4", optionNumber: 4, optionText: "60 meters" },
            ],
        },
        {
            id: "18",
            questionText: "Which of these is NOT a type of workplace hazard?",
            options: [
                { id: "18-1", optionNumber: 1, optionText: "Physical" },
                { id: "18-2", optionNumber: 2, optionText: "Chemical" },
                { id: "18-3", optionNumber: 3, optionText: "Financial" },
                { id: "18-4", optionNumber: 4, optionText: "Biological" },
            ],
        },
        {
            id: "19",
            questionText: "What is the first aid priority in an emergency?",
            options: [
                { id: "19-1", optionNumber: 1, optionText: "Call for help" },
                { id: "19-2", optionNumber: 2, optionText: "Check for danger" },
                { id: "19-3", optionNumber: 3, optionText: "Start CPR" },
                { id: "19-4", optionNumber: 4, optionText: "Apply bandages" },
            ],
        },
        {
            id: "20",
            questionText: "How often should electrical equipment be tested?",
            options: [
                { id: "20-1", optionNumber: 1, optionText: "Monthly" },
                { id: "20-2", optionNumber: 2, optionText: "Every 3 months" },
                { id: "20-3", optionNumber: 3, optionText: "Every 6 months" },
                { id: "20-4", optionNumber: 4, optionText: "Annually" },
            ],
        },
    ];

    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / totalQuestions) * 100;

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
            alert("Failed to submit exam. Please try again or contact support.");
        }
    };

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
                        <h3 className="font-display font-bold text-xl text-foreground">Submitting Your Exam...</h3>
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
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-muted-foreground">Question {currentQuestion + 1}</span>
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
                                        setAnswers({
                                            ...answers,
                                            [currentQuestion]: {
                                                questionId: questions[currentQuestion].id,
                                                optionId: selectedOption.id,
                                                optionNumber: selectedOption.optionNumber
                                            }
                                        });
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
                                        onClick={() => {
                                            setAnswers({
                                                ...answers,
                                                [currentQuestion]: {
                                                    questionId: questions[currentQuestion].id,
                                                    optionId: option.id,
                                                    optionNumber: option.optionNumber
                                                }
                                            });
                                        }}
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
