import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, ArrowLeft, Mail, Lock, KeyRound, Building, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function MinistryAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { loginMinistry } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      toast({
        title: "Access Request Sent",
        description: "Your official request has been logged.",
      });
      return;
    }

    setLoading(true);
    try {
      await loginMinistry({ email, password });
      navigate("/ministry");
      toast({
        title: "Welcome back!",
        description: "Secure login successful.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#13452c' }}>
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <Landmark className="w-8 h-8 text-primary" />
            </div>
            <span className="text-3xl alumni-sans-title text-white">Soft skill training</span>
          </div>

          <h1 className="text-4xl alumni-sans-title mb-4 text-white">
            Ministry Portal
          </h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-md">
            Government certificate authority portal for reviewing exam results, approving certifications, and issuing official certificates.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: "🏛️", text: "Review candidates by center" },
              { icon: "📜", text: "Bulk certificate issuance" },
              { icon: "📊", text: "National certification statistics" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                  <span className="text-sm">{item.icon}</span>
                </div>
                <span className="text-white font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 bg-white">
        <Link
          to="/"
          className="absolute top-6 left-6 lg:left-auto lg:right-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto w-full">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Landmark className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl alumni-sans-title">Ministry Portal</span>
          </div>

          <h2 className="text-3xl alumni-sans-title text-foreground mb-2">
            {isSignUp ? "Request Ministry Access" : "Official Login"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? "Submit credentials for ministry portal access"
              : "Sign in to access the certificate authority"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="department"
                    placeholder="e.g., Ministry of Education"
                    className="pl-10 h-12 border-2 focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Official Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="official@ministry.gov.pk"
                  className="pl-10 h-12 border-2 focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-md text-primary hover:text-primary/80 alumni-sans-subtitle"
                  >
                    Reset password
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-12 border-2 focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="forest" className="w-full h-12 text-lg alumni-sans-subtitle">
              {isSignUp ? "Submit Request" : "Secure Login"}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              🏛️ Official Government Portal • All activities are monitored and logged for security compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
