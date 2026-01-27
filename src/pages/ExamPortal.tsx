import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CBTInterface } from "@/components/StudentPortal/Exam/CBTInterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, FileText, Shield, LogOut, CheckCircle, Loader2 } from "lucide-react";

export default function ExamPortal() {
    const navigate = useNavigate();
    const [examState, setExamState] = useState<"loading" | "ready" | "in-progress" | "completed">("loading");
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // Simulate loading and preparation
    useEffect(() => {
        const timer = setTimeout(() => {
            setExamState("ready");
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Countdown before exam starts
    useEffect(() => {
        if (showCountdown && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showCountdown && countdown === 0) {
            setExamState("in-progress");
        }
    }, [showCountdown, countdown]);

    const handleStartExam = () => {
        setShowCountdown(true);
    };

    const handleExamComplete = () => {
        setExamState("completed");
    };

    const handleLogout = () => {
        navigate("/exam/auth");
    };

    if (examState === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Preparing your examination...</p>
                </div>
            </div>
        );
    }

    if (showCountdown && countdown > 0) {
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

    if (examState === "completed") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-border/40 shadow-royal">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-display">Exam Completed!</CardTitle>
                            <CardDescription>
                                Your responses have been submitted successfully
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium text-primary">Submitted</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Result</span>
                                <span className="font-medium">Pending Review</span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Results will be available in your Candidate Portal within 24-48 hours.
                        </p>

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
                <Card className="border-border/40 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl">Welcome, Candidate</CardTitle>
                        <CardDescription>
                            You are about to begin your Soft Skill Training examination
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Exam Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <Shield className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Passing</p>
                                    <p className="font-semibold">60% Required</p>
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
