import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Smartphone, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { SoftSkillsAuthLayout } from "@/components/SoftSkillsAuthLayout";

export default function ExamAuth() {
    const navigate = useNavigate();
    const { loginCandidate, logout, isAuthenticated } = useAuth();
    const { t } = useTranslation();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            logout().catch((error) => {
                console.error("Failed to clear session on auth page:", error);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            navigate("/training/start");
        } catch (error: any) {
            toast.error(error.message || t("examAuth.loginFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SoftSkillsAuthLayout
            portalLabel={t("examAuth.trainingPortal")}
            headline="Sit your SoftSkills assessment"
            description="Sign in with the credentials from your candidate registration to begin computer-based testing."
            highlights={[
                t("examAuth.stableInternet"),
                t("examAuth.useLaptop"),
                t("examAuth.waitForAdmin"),
            ]}
        >
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#7e9571] mb-3">
                {t("examAuth.cbt")}
            </p>
            <h2 className="text-3xl font-display font-semibold text-[#183d34] tracking-tight mb-2">
                {t("examAuth.candidateLogin")}
            </h2>
            <p className="text-[#64736d] mb-8 text-sm leading-relaxed">
                {t("examAuth.enterCredentials")}
            </p>

            <div className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-[#405438]">{t("examAuth.mobilePlaceholder")}</Label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487]" />
                        <Input
                            placeholder={t("examAuth.mobilePlaceholder")}
                            className="pl-10 h-12"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            type="tel"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[#405438]">{t("examAuth.passwordPlaceholder")}</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487] z-10" />
                        <PasswordInput
                            placeholder={t("examAuth.passwordPlaceholder")}
                            className="pl-10 h-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <Button
                    onClick={handleLogin}
                    className="w-full h-12 rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white font-medium shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t("examAuth.loginToExam")}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
                <p className="text-center text-xs text-[#6d8474]">{t("examAuth.agreeToRules")}</p>
            </div>
        </SoftSkillsAuthLayout>
    );
}
