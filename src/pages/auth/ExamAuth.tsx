import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Smartphone, Lock, ArrowRight, Loader2, BookOpen, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export default function ExamAuth() {
    const navigate = useNavigate();
    const { loginCandidate, logout, isAuthenticated } = useAuth();
    const { t } = useTranslation();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Auto logout when navigating back to auth page
    useEffect(() => {
        if (isAuthenticated) {
            logout();
        }
    }, []);

    const handleLogin = async () => {
        if (phone.length < 10) {
            toast.error(t("examAuth.validPhone"));
            return;
        }
        if (password.length < 4) {
            toast.error(t("examAuth.enterPassword"));
            return;
        }
        setLoading(true);
        try {
            await loginCandidate({ phoneNumber: phone, password });
            toast.success(t("examAuth.loginSuccess"));
            navigate("/exam/start");
        } catch (error: any) {
            toast.error(error.message || t("examAuth.loginFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm hidden sm:inline">{t("examAuth.backToHome")}</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm sm:text-xl alumni-sans-title text-foreground leading-tight">
                                {t("examAuth.trainingPortal")}
                            </span>
                            <span className="text-[8px] sm:text-xs text-muted-foreground uppercase tracking-wider hidden sm:block">
                                {t("examAuth.cbt")}
                            </span>
                        </div>
                    </div>
                    <div className="w-20 sm:w-24"></div> {/* Spacer for centering */}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-border/40 shadow-royal backdrop-blur-sm bg-card/95">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-xl sm:text-2xl font-display font-bold">{t("examAuth.candidateLogin")}</CardTitle>
                            <CardDescription className="text-sm">
                                {t("examAuth.enterCredentials")}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t("examAuth.mobilePlaceholder")}
                                        className="pl-10 h-11 sm:h-12"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        type="tel"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t("examAuth.passwordPlaceholder")}
                                        className="pl-10 h-11 sm:h-12"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        type="password"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleLogin}
                                className="w-full h-11 sm:h-12 gradient-primary text-white font-medium"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t("examAuth.loginToExam")}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>

                        <div className="bg-secondary/30 rounded-lg p-3 sm:p-4 space-y-2">
                            <p className="text-xs sm:text-sm font-medium text-foreground">{t("examAuth.beforeYouBegin")}</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• {t("examAuth.stableInternet")}</li>
                                <li>• {t("examAuth.useLaptop")}</li>
                                <li>• {t("examAuth.waitForAdmin")}</li>
                            </ul>
                        </div>

                        <p className="text-center text-xs text-muted-foreground">
                            {t("examAuth.agreeToRules")}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
