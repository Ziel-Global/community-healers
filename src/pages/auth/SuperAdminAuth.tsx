import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, Mail, Lock, KeyRound } from "lucide-react";

export default function SuperAdminAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-accent-foreground" />
            </div>
            <span className="text-2xl font-display font-bold">CertifyPro</span>
          </div>
          
          <h1 className="text-4xl font-display font-bold mb-4">
            Super Admin Portal
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Full system control for center management, question banks, training content, and platform oversight.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-sm font-bold">⚡</span>
              </div>
              <span className="text-white/80">Manage all training centers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-sm font-bold">⚡</span>
              </div>
              <span className="text-white/80">Configure question banks & exams</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-sm font-bold">⚡</span>
              </div>
              <span className="text-white/80">System-wide analytics & reports</span>
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
            <div className="w-12 h-12 rounded-xl bg-charcoal-900 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold">Super Admin</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            {isSignUp ? "Admin Setup" : "Secure Login"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? "Initialize your super admin credentials"
              : "Access the system administration panel"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="superadmin@certifypro.gov"
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
                <Label htmlFor="2fa">Two-Factor Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="2fa"
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="pl-10 h-12"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 bg-charcoal-900 text-white hover:bg-charcoal-800 font-semibold text-base">
              {isSignUp ? "Initialize Admin" : "Secure Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            {isSignUp ? "Already initialized?" : "First time setup?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-foreground font-semibold hover:text-accent transition-colors"
            >
              {isSignUp ? "Sign In" : "Setup Admin"}
            </button>
          </p>

          <div className="mt-8 p-4 rounded-lg bg-muted border border-border">
            <p className="text-xs text-muted-foreground text-center">
              🔒 This is a secure administrative portal. All access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}