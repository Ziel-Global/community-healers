import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Smartphone, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginScreen() {
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = () => {
        if (phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setStep("otp");
            toast.success("OTP sent to your mobile number");
        }, 1500);
    };

    const handleVerifyOtp = () => {
        if (otp.length < 6) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Login successful!");
            // Redirect logic here
        }, 1500);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-border/40 shadow-royal backdrop-blur-sm bg-card/95">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                        <Shield className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-display font-bold">Candidate Portal</CardTitle>
                        <CardDescription>
                            {step === "phone"
                                ? "Enter your mobile number to get started"
                                : "Verify the 6-digit code sent to your mobile"}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === "phone" ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Mobile Number (e.g. 03001234567)"
                                        className="pl-10 h-12"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        type="tel"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSendOtp}
                                className="w-full h-12 gradient-primary text-white font-medium"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Send OTP"}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={setOtp}
                                >
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot index={0} className="h-12 w-12 text-lg border-border/60" />
                                        <InputOTPSlot index={1} className="h-12 w-12 text-lg border-border/60" />
                                        <InputOTPSlot index={2} className="h-12 w-12 text-lg border-border/60" />
                                        <InputOTPSlot index={3} className="h-12 w-12 text-lg border-border/60" />
                                        <InputOTPSlot index={4} className="h-12 w-12 text-lg border-border/60" />
                                        <InputOTPSlot index={5} className="h-12 w-12 text-lg border-border/60" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    onClick={handleVerifyOtp}
                                    className="w-full h-12 gradient-primary text-white font-medium"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify & Continue"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setStep("phone")}
                                    disabled={loading}
                                >
                                    Change Phone Number
                                </Button>
                            </div>
                        </div>
                    )}

                    <p className="text-center text-xs text-muted-foreground">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
