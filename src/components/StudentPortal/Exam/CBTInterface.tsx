import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface CBTInterfaceProps {
    onComplete?: () => void;
}

export function CBTInterface({ onComplete }: CBTInterfaceProps) {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

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

    const questions = [
        {
            id: 1,
            text: "What is the primary procedure for emergency equipment shutdown?",
            options: ["Press Emergency Stop", "Wait for supervisor", "Unplug power", "Check manual first"],
        },
        {
            id: 2,
            text: "How often should safety goggles be inspected?",
            options: ["Monthly", "Weekly", "Before every use", "Annually"],
        },
        {
            id: 3,
            text: "Which of the following is a proper lifting technique?",
            options: ["Bend at waist", "Bend knees and keep back straight", "Use back muscles", "Twist while lifting"],
        },
        {
            id: 4,
            text: "What does PPE stand for?",
            options: ["Personal Protection Equipment", "Professional Practice Environment", "Personal Protective Equipment", "Primary Prevention Equipment"],
        },
        {
            id: 5,
            text: "What is the first step in a risk assessment?",
            options: ["Implement controls", "Identify hazards", "Review incidents", "Train staff"],
        },
        {
            id: 6,
            text: "How long should you wash your hands in a healthcare setting?",
            options: ["10 seconds", "20 seconds", "30 seconds", "1 minute"],
        },
        {
            id: 7,
            text: "What color is typically used for fire safety signs?",
            options: ["Blue", "Green", "Red", "Yellow"],
        },
        {
            id: 8,
            text: "At what temperature should a refrigerator be maintained?",
            options: ["Below 5°C", "Below 10°C", "Below 15°C", "Below 20°C"],
        },
        {
            id: 9,
            text: "What does SOP stand for?",
            options: ["Standard Operating Procedure", "Safety Operation Plan", "Standard Organization Protocol", "Systematic Operational Process"],
        },
        {
            id: 10,
            text: "How often should fire drills be conducted?",
            options: ["Monthly", "Quarterly", "Bi-annually", "Annually"],
        },
        {
            id: 11,
            text: "What is the maximum safe lifting weight without assistance?",
            options: ["10 kg", "15 kg", "20 kg", "25 kg"],
        },
        {
            id: 12,
            text: "Which document outlines workplace safety requirements?",
            options: ["Employee handbook", "Health and Safety Policy", "Job description", "Training manual"],
        },
        {
            id: 13,
            text: "What should you do if you witness an unsafe act?",
            options: ["Ignore it", "Report it immediately", "Wait for someone else to report", "Document it later"],
        },
        {
            id: 14,
            text: "What is the proper way to store chemicals?",
            options: ["Alphabetically", "By purchase date", "By compatibility", "By size"],
        },
        {
            id: 15,
            text: "How many fire extinguisher types are there?",
            options: ["3", "4", "5", "6"],
        },
        {
            id: 16,
            text: "What does MSDS stand for?",
            options: ["Material Safety Data Sheet", "Medical Safety Data System", "Minimum Safety Design Standard", "Manual Safety Detection System"],
        },
        {
            id: 17,
            text: "What is the recommended distance from a fire exit?",
            options: ["15 meters", "30 meters", "45 meters", "60 meters"],
        },
        {
            id: 18,
            text: "Which of these is NOT a type of workplace hazard?",
            options: ["Physical", "Chemical", "Financial", "Biological"],
        },
        {
            id: 19,
            text: "What is the first aid priority in an emergency?",
            options: ["Call for help", "Check for danger", "Start CPR", "Apply bandages"],
        },
        {
            id: 20,
            text: "How often should electrical equipment be tested?",
            options: ["Monthly", "Every 3 months", "Every 6 months", "Annually"],
        },
    ];

    const progress = ((currentQuestion + 1) / 20) * 100;
    const answeredCount = Object.keys(answers).length;

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate submission delay
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1500);
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
                            <p className="text-muted-foreground">Your answers have been recorded. You will be notified of your results shortly.</p>
                        </div>
                        <Button onClick={() => navigate("/exam/auth")} className="w-full font-bold gap-2">
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
                        <span className="text-primary">Question {currentQuestion + 1} of 20</span>
                        <span className="text-muted-foreground">{answeredCount}/20 Answered • {Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
                <div className={cn(
                    "px-6 py-3 rounded-xl border flex items-center gap-3 transition-colors",
                    timeLeft < 300 ? "bg-destructive/10 border-destructive/20 text-destructive animate-pulse" : "bg-card border-border/60"
                )}>
                    <Clock className="w-5 h-5" />
                    <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
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
                            <CardTitle className="text-xl sm:text-2xl leading-relaxed alumni-sans-title">
                                {questions[currentQuestion].text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 sm:p-8">
                            <RadioGroup
                                value={answers[currentQuestion]}
                                onValueChange={(val) => setAnswers({ ...answers, [currentQuestion]: val })}
                                className="space-y-4"
                            >
                                {questions[currentQuestion].options.map((option, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                            answers[currentQuestion] === option
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                : "border-transparent bg-secondary/20 hover:bg-secondary/40 hover:border-border/60"
                                        )}
                                        onClick={() => setAnswers({ ...answers, [currentQuestion]: option })}
                                    >
                                        <RadioGroupItem value={option} id={`option-${idx}`} className="sr-only" />
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                            answers[currentQuestion] === option ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
                                        )}>
                                            {answers[currentQuestion] === option && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <Label htmlFor={`option-${idx}`} className="flex-1 font-medium cursor-pointer text-base">
                                            {option}
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
                                onClick={() => setCurrentQuestion(prev => Math.min(19, prev + 1))}
                                disabled={currentQuestion === 19}
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
                            <p className="text-xs text-muted-foreground mt-1">{answeredCount} of 20 answered</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {Array.from({ length: 20 }).map((_, idx) => (
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
                                disabled={answeredCount < 20}
                            >
                                <Send className="w-4 h-4" /> Submit Exam
                            </Button>
                            {answeredCount < 20 && (
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
