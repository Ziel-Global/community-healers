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

export default function TrainingInstructorAuth() {
  const navigate = useNavigate();
  const { loginTrainingInstructor, logout, isAuthenticated } = useAuth();
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
      await loginTrainingInstructor(result.data);
      navigate("/training-instructor");
      toast({ title: "Welcome back!", description: "Login successful." });
    } catch (error: unknown) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials.",
      });
    }
  };

  return (
    <SoftSkillsAuthLayout
      portalLabel="Training Instructor"
      headline="Deliver the SoftSkills course"
      description="Play training videos for candidates at your center, one lesson at a time, in order."
      highlights={[
        "Unlock lessons in sequence",
        "Track course completion",
        "Guide candidates through SoftSkills",
      ]}
    >
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#7e9571] mb-3">
        Training Instructor
      </p>
      <h2 className="text-3xl font-display font-semibold text-[#183d34] tracking-tight mb-2">
        Sign In
      </h2>
      <p className="text-[#64736d] mb-8 text-sm leading-relaxed">
        Access the training instructor portal
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#405438]">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a9487]" />
            <Input
              id="email"
              type="email"
              placeholder="instructor@ziel.com"
              className="pl-10 h-12"
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
              className="pl-10 h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
          disabled={loading}
        >
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
    </SoftSkillsAuthLayout>
  );
}
