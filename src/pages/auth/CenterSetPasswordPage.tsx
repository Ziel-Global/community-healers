import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { resetPasswordSchema } from "@/schemas/authSchemas";
import { getApiErrorMessage } from "@/lib/errors";
import { SoftSkillsBrand } from "@/components/SoftSkillsBrand";
import { AuthBackButton } from "@/components/AuthBackButton";

export default function CenterSetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = resetPasswordSchema.safeParse({ newPassword, confirmNewPassword });
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
      await authService.setPassword(token, result.data.newPassword);
      setDone(true);
      toast({
        title: "Password set!",
        description: "You can now sign in with your email and new password.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Couldn't set password",
        description: getApiErrorMessage(error, "The link may be invalid or expired."),
      });
    } finally {
      setLoading(false);
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
            Center approved
          </p>
          <h1 className="font-display text-4xl xl:text-5xl font-semibold text-white tracking-tight mb-4 leading-[1.15]">
            Set your password
          </h1>
          <p className="text-base text-[#b0c2ac] leading-relaxed max-w-md">
            Your center has been approved. Choose a password to access your admin dashboard.
          </p>
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
          {!token ? (
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-display font-semibold text-[#183d34]">Invalid Link</h2>
              <p className="text-[#64736d]">
                This link is missing its token. Please use the link from your approval email.
              </p>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#e7f2db] border border-[#c7ddb5] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#426f36]" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-[#183d34]">Password Set!</h2>
              <p className="text-[#64736d]">
                You&apos;re all set. Sign in with your email and your new password to access your center dashboard.
              </p>
              <Button
                className="w-full h-12 ss-cta"
                onClick={() => navigate("/center/auth")}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#7e9571] mb-3">
                Center admin
              </p>
              <h2 className="text-3xl font-display font-semibold text-[#183d34] tracking-tight mb-2">
                Set Your Password
              </h2>
              <p className="text-[#64736d] mb-8 text-sm">
                Choose a password for your center admin account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-[#405438]">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487] z-10" />
                    <PasswordInput
                      id="newPassword"
                      placeholder="At least 6 characters"
                      className="pl-10 h-12 rounded-[9px] border-[#dce5d9] bg-[#fafcf8] focus:border-primary"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-[#405438]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487] z-10" />
                    <PasswordInput
                      id="confirmNewPassword"
                      placeholder="Re-enter your password"
                      className="pl-10 h-12 rounded-[9px] border-[#dce5d9] bg-[#fafcf8] focus:border-primary"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 ss-cta" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Please wait...
                    </>
                  ) : (
                    "Set Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
