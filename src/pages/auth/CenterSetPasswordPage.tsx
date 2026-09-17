import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { resetPasswordSchema } from "@/schemas/authSchemas";
import { getApiErrorMessage } from "@/lib/errors";

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
    <div className="fixed inset-0 bg-white flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: "#13452c" }}>
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <span className="text-3xl alumni-sans-title text-white">Soft skill training</span>
          </div>

          <h1 className="text-4xl alumni-sans-title mb-4 text-white">Center Admin</h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-md">
            Your center has been approved. Set a password to access your admin dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 lg:px-16 bg-white">
        <div className="sticky top-0 z-10 bg-white pt-4 pb-2 flex items-center justify-between lg:justify-end">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-display font-bold">Center Admin</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>

        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-6 sm:py-12">
          {!token ? (
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-2xl alumni-sans-title text-foreground">Invalid Link</h2>
              <p className="text-muted-foreground">
                This link is missing its token. Please use the link from your approval email.
              </p>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl alumni-sans-title text-foreground">Password Set!</h2>
              <p className="text-muted-foreground">
                You're all set. Sign in with your email and your new password to access your center dashboard.
              </p>
              <Button
                variant="forest"
                className="w-full h-12 text-lg alumni-sans-subtitle"
                onClick={() => navigate("/center/auth")}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl alumni-sans-title text-foreground mb-2">Set Your Password</h2>
              <p className="text-muted-foreground mb-8">
                Choose a password for your center admin account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <PasswordInput
                      id="newPassword"
                      placeholder="At least 6 characters"
                      className="pl-10 h-12 border-2 focus:border-primary"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <PasswordInput
                      id="confirmNewPassword"
                      placeholder="Re-enter your password"
                      className="pl-10 h-12 border-2 focus:border-primary"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="forest" className="w-full h-12 text-lg alumni-sans-subtitle" disabled={loading}>
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
