import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, ArrowLeft, Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { emailLoginSchema } from "@/schemas/authSchemas";

export default function CommitteeMemberAuth() {
  const navigate = useNavigate();
  const { loginCommitteeMember, logout, isAuthenticated } = useAuth();
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
      await loginCommitteeMember(result.data);
      navigate("/committee");
      toast({ title: "Welcome back!", description: "Login successful." });
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
    <div className="fixed inset-0 bg-white flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#13452c' }}>
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <ClipboardCheck className="w-8 h-8 text-primary" />
            </div>
            <span className="text-3xl alumni-sans-title text-white">Soft skill training</span>
          </div>

          <h1 className="text-4xl alumni-sans-title mb-4 text-white">Approval Committee</h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-md">
            Review center applications assigned to your committee, schedule inspections, and record results.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 lg:px-16 bg-white">
        <div className="sticky top-0 z-10 bg-white pt-4 pb-2 flex items-center justify-between lg:justify-end">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <ClipboardCheck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-display font-bold">Committee</span>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>

        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-6 sm:py-12">
          <h2 className="text-3xl alumni-sans-title text-foreground mb-2">Sign In</h2>
          <p className="text-muted-foreground mb-8">Access applications assigned to your committee</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="committee.member@ziel.com"
                  className="pl-10 h-12 border-2 focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  className="pl-10 h-12 border-2 focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              Committee member accounts are created by the Bureau.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
