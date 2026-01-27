import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CBTInterfaceProps {
    onComplete?: () => void;
}

export function CBTInterface({ onComplete }: CBTInterfaceProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
    const [answers, setAnswers] = useState<Record<number, string>>({});

    useEffect(() => {
        if (timeLeft <= 0) return;
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
        // Add more mock questions as needed
    ];

    const progress = ((currentQuestion + 1) / 20) * 100; // Assuming 20 questions

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with Progress and Timer */}
            <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border/40 shadow-sm flex items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-primary">Question {currentQuestion + 1} of 20</span>
                        <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2 gradient-secondary" />
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
                            <CardTitle className="text-2xl leading-relaxed alumni-sans-title">
                                {questions[currentQuestion]?.text || "Sample Question Text for the CBT Certification Exam?"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-8">
                            <RadioGroup
                                value={answers[currentQuestion]}
                                onValueChange={(val) => setAnswers({ ...answers, [currentQuestion]: val })}
                                className="space-y-4"
                            >
                                {(questions[currentQuestion]?.options || ["Option A", "Option B", "Option C", "Option D"]).map((option, idx) => (
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
                        <div className="p-6 border-t border-border/20 flex justify-between bg-secondary/5">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </Button>
                            <Button
                                onClick={() => setCurrentQuestion(prev => Math.min(19, prev + 1))}
                                disabled={currentQuestion === 19}
                                className="gap-2"
                            >
                                Next <ChevronRight className="w-4 h-4" />
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
                    <Card className="border-border/40 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Navigator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: 20 }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={cn(
                                            "h-9 w-full rounded-lg text-xs font-bold transition-all border",
                                            currentQuestion === idx
                                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-110 z-10"
                                                : answers[idx]
                                                    ? "bg-success/20 text-success border-success/30"
                                                    : "bg-secondary text-muted-foreground border-border/60 hover:border-primary/40"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                            <Button 
                                onClick={onComplete}
                                className="w-full mt-6 gradient-primary text-white font-bold gap-2 shadow-royal"
                            >
                                <Send className="w-4 h-4" /> Submit Exam
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
