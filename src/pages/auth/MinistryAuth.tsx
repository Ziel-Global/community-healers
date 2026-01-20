import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, ArrowLeft, Mail, Lock, KeyRound, Building } from "lucide-react";

export default function MinistryAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/ministry");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E2E800' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
              <Landmark className="w-8 h-8 text-accent-foreground" />
            </div>
            <span className="text-2xl font-display font-bold">CertifyPro</span>
          </div>
          
          <h1 className="text-4xl font-display font-bold mb-4">
            Ministry Portal
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Government certificate authority portal for reviewing exam results, approving certifications, and issuing official certificates.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-sm font-bold">🏛️</span>
              </div>
              <span className="text-white/80">Review candidates by center</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-sm font-bold">📜</span>
              </div>
              <span className="text-white/80">Bulk certificate issuance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-sm font-bold">📊</span>
              </div>
              <span className="text-white/80">National certification statistics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16">
        <Link
          to="/"
          className="absolute top-6 left-6 lg:left-auto lg:right-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto w-full">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold">Ministry Portal</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
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
                    className="pl-10 h-12"
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
                  className="pl-10 h-12"
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
                    className="text-sm text-accent hover:text-lime-dark font-medium"
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
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="2fa">Security Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="2fa"
                    type="text"
                    placeholder="Enter 6-digit security code"
                    className="pl-10 h-12"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 bg-accent text-accent-foreground hover:bg-lime-dark font-semibold text-base">
              {isSignUp ? "Submit Request" : "Secure Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            {isSignUp ? "Already have access?" : "Need access?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-foreground font-semibold hover:text-accent transition-colors"
            >
              {isSignUp ? "Sign In" : "Request Access"}
            </button>
          </p>

          <div className="mt-8 p-4 rounded-lg bg-muted border border-border">
            <p className="text-xs text-muted-foreground text-center">
              🏛️ Official Government Portal • All activities are monitored and logged for security compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}