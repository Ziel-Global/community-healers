import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CBTInterface } from "@/components/StudentPortal/Exam/CBTInterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, FileText, Shield, LogOut, CheckCircle, Loader2, AlertCircle, XCircle } from "lucide-react";

export default function ExamPortal() {
    const navigate = useNavigate();
    const [examState, setExamState] = useState<"waiting" | "ready" | "countdown" | "in-progress" | "completed">("waiting");
    const [countdown, setCountdown] = useState(3);
    const [examResult, setExamResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

    // Simulate center admin starting the exam after 5 seconds (demo)
    useEffect(() => {
        if (examState === "waiting") {
            const timer = setTimeout(() => {
                setExamState("ready");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [examState]);

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

    const handleStartExam = () => {
        setExamState("countdown");
    };

    const handleExamComplete = () => {
        // Simulate exam result (in real app, this would come from the CBT interface)
        const score = Math.floor(Math.random() * 8) + 12; // Random score between 12-20
        const total = 20;
        const passed = score >= 12; // 60% passing
        setExamResult({ score, total, passed });
        setExamState("completed");
    };

    const handleLogout = () => {
        navigate("/exam/auth");
    };

    // Waiting for exam to start
    if (examState === "waiting") {
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
                                    <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Examination Portal</h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
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
                                <CardTitle className="text-xl sm:text-2xl font-display">Exam Not Started Yet</CardTitle>
                                <CardDescription className="mt-2">
                                    Please wait for the center administrator to initiate the examination
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Waiting for exam to begin...</span>
                            </div>

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

    // Countdown screen
    if (examState === "countdown") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-xl">
                        <span className="text-6xl font-bold text-primary-foreground">{countdown}</span>
                    </div>
                    <p className="text-xl text-muted-foreground">Exam starting in...</p>
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
                                    <p className="text-xs text-muted-foreground">Examination in Progress</p>
                                </div>
                                <div className="sm:hidden">
                                    <h1 className="alumni-sans-title text-sm text-foreground">CBT Exam</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto p-4 sm:p-6">
                    <CBTInterface onComplete={handleExamComplete} />
                </main>
            </div>
        );
    }

    // Exam completed - show results
    if (examState === "completed" && examResult) {
        const percentage = Math.round((examResult.score / examResult.total) * 100);
        
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-border/40 shadow-royal">
                    <CardHeader className="text-center space-y-4">
                        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                            examResult.passed ? "bg-primary/20" : "bg-destructive/20"
                        }`}>
                            {examResult.passed ? (
                                <CheckCircle className="w-12 h-12 text-primary" />
                            ) : (
                                <XCircle className="w-12 h-12 text-destructive" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-display">
                                {examResult.passed ? "Congratulations!" : "Exam Completed"}
                            </CardTitle>
                            <CardDescription className="mt-2">
                                {examResult.passed 
                                    ? "You have successfully passed the examination" 
                                    : "Unfortunately, you did not meet the passing criteria"}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Score Display */}
                        <div className="text-center py-6 bg-secondary/30 rounded-xl">
                            <p className="text-5xl sm:text-6xl font-bold text-foreground">{percentage}%</p>
                            <p className="text-muted-foreground mt-2">
                                {examResult.score} out of {examResult.total} correct
                            </p>
                        </div>

                        {/* Result Details */}
                        <div className="bg-card border border-border/40 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className={`font-semibold ${examResult.passed ? "text-primary" : "text-destructive"}`}>
                                    {examResult.passed ? "PASSED" : "FAILED"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Passing Score</span>
                                <span className="font-medium">60% (12/20)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Your Score</span>
                                <span className="font-medium">{percentage}% ({examResult.score}/{examResult.total})</span>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-secondary/20 rounded-lg p-4">
                            <p className="text-sm font-medium text-foreground mb-2">Next Steps:</p>
                            {examResult.passed ? (
                                <p className="text-xs text-muted-foreground">
                                    Your result has been submitted for ministry review. Certificate will be issued after approval. Check your Candidate Portal for updates.
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    You can reschedule your exam through the Candidate Portal. No additional fee is required for reattempt.
                                </p>
                            )}
                        </div>

                        <Button onClick={handleLogout} className="w-full" variant="outline">
                            <LogOut className="w-4 h-4 mr-2" />
                            Exit Examination Portal
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Ready state - show exam info and start button
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
                                <h1 className="alumni-sans-title text-lg sm:text-xl text-foreground">Examination Portal</h1>
                                <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Testing</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
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
                            <span className="text-sm font-semibold uppercase tracking-wider">Exam Ready</span>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl">Welcome, Candidate</CardTitle>
                        <CardDescription>
                            The center administrator has started the examination. You may begin when ready.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Exam Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <FileText className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Questions</p>
                                    <p className="font-semibold">20 MCQs</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <Clock className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Duration</p>
                                    <p className="font-semibold">20 Minutes</p>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground">Examination Rules:</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>Once started, the exam cannot be paused or restarted</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>The timer will start immediately after clicking "Begin Exam"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>Answers are auto-saved as you progress through questions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>Do not refresh or close the browser during the exam</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span>The exam will auto-submit when the timer reaches zero</span>
                                </li>
                            </ul>
                        </div>

                        {/* Start Button */}
                        <div className="pt-4">
                            <Button 
                                onClick={handleStartExam} 
                                className="w-full h-12 sm:h-14 text-base sm:text-lg gradient-primary text-white font-semibold"
                            >
                                Begin Examination
                            </Button>
                            <p className="text-center text-xs text-muted-foreground mt-3">
                                By clicking above, you confirm that you have read and understood the rules
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
