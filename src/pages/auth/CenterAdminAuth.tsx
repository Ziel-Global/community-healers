import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Hash, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { emailLoginSchema } from "@/schemas/authSchemas";
import { SoftSkillsBrand } from "@/components/SoftSkillsBrand";
import { AuthBackButton } from "@/components/AuthBackButton";

export default function CenterAdminAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { loginCenterAdmin, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      logout().catch((error) => {
        console.error("Failed to clear session on auth page:", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      toast({
        title: "Access Request Sent",
        description: "Your request has been forwarded to the Super Admin for approval.",
      });
      return;
    }

    const result = emailLoginSchema.safeParse({ email, password });
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: result.error.issues[0].message,
      });
      return;
    }

    setLoading(true);
    try {
      await loginCenterAdmin(result.data);
      navigate("/center");
      toast({
        title: "Welcome back!",
        description: "Login successful.",
      });
    } catch (error: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f5f8f2] flex overflow-hidden candidate-auth">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[#12382d]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,#28614a_0%,transparent_55%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <SoftSkillsBrand light className="mb-10" />

          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#b3d0c2] mb-4 flex items-center gap-2">
            <span className="block w-5 h-0.5 bg-[#d7f88c]" />
            Center operations
          </p>
          <h1 className="font-display text-4xl xl:text-5xl font-semibold text-white tracking-tight mb-4 leading-[1.15]">
            Run your centre with confidence
          </h1>
          <p className="text-base text-[#b0c2ac] leading-relaxed max-w-md">
            Verify candidates, oversee training day, and keep certificates and reports in one place.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "Verify candidate identity",
              "Monitor training progress",
              "Generate daily reports",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d7f88c]/15 border border-[#d7f88c]/30 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#d7f88c]" />
                </div>
                <span className="text-[#e2eae2] font-medium text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 lg:px-16 bg-white border-l border-[#e7eee9]">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur pt-4 pb-2 flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <SoftSkillsBrand compact showTagline={false} />
          </div>
          <AuthBackButton />
        </div>

        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-6 sm:py-12">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#7e9571] mb-3">
            Center admin
          </p>
          <h2 className="text-3xl font-display font-semibold text-[#183d34] tracking-tight mb-2">
            {isSignUp ? "Request Access" : "Sign In"}
          </h2>
          <p className="text-[#64736d] mb-8 text-sm leading-relaxed">
            {isSignUp
              ? "Submit your details for center admin access"
              : "Access your center administration dashboard"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#405438]">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487]" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="pl-10 h-12 rounded-[9px] border-[#dce5d9] bg-[#fafcf8] focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centerCode" className="text-[#405438]">Center Code</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487]" />
                    <Input
                      id="centerCode"
                      placeholder="e.g., LHR-001"
                      className="pl-10 h-12 rounded-[9px] border-[#dce5d9] bg-[#fafcf8] focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#405438]">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@center.com"
                  className="pl-10 h-12 rounded-[9px] border-[#dce5d9] bg-[#fafcf8] focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#405438]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487] z-10" />
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  className="pl-10 h-12 rounded-[9px] border-[#dce5d9] bg-[#fafcf8] focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base ss-cta" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Please wait...
                </>
              ) : (
                isSignUp ? "Request Access" : "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-[#f3f8ed] border border-[#dce7d6]">
            <p className="text-xs text-[#64736d] text-center leading-relaxed">
              Center admins must be approved by Super Admin before access is granted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
