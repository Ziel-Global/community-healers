import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { emailLoginSchema } from "@/schemas/authSchemas";
import { SoftSkillsAuthLayout } from "@/components/SoftSkillsAuthLayout";

export default function DirectorOperationsAuth() {
  const navigate = useNavigate();
  const { loginDirectorOperations, logout, isAuthenticated } = useAuth();
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
      await loginDirectorOperations(result.data);
      navigate("/bureau");
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
    <SoftSkillsAuthLayout
      portalLabel="Bureau"
      headline="Steer the application pipeline"
      description="Receive new centre applications, assign them to Approval Committees, and make the final call."
      highlights={[
        "Triage new applications",
        "Assign approval committees",
        "Issue final decisions",
      ]}
    >
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#7e9571] mb-3">
        Bureau
      </p>
      <h2 className="text-3xl font-display font-semibold text-[#183d34] tracking-tight mb-2">
        Sign In
      </h2>
      <p className="text-[#64736d] mb-8 text-sm leading-relaxed">
        Manage the center application pipeline
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#405438]">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487]" />
            <Input
              id="email"
              type="email"
              placeholder="director.operations@ziel.com"
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
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-8 p-4 rounded-xl bg-[#f3f8ed] border border-[#dce7d6]">
        <p className="text-xs text-[#64736d] text-center leading-relaxed">
          Bureau accounts are created by the Super Admin.
        </p>
      </div>
    </SoftSkillsAuthLayout>
  );
}
