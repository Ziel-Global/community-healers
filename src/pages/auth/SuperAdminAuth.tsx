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
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Branding with Neon */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-display font-bold text-charcoal-900">CertifyPro</span>
          </div>
          
          <h1 className="text-4xl font-display font-bold mb-4 text-charcoal-900">
            Super Admin
          </h1>
          <p className="text-lg text-charcoal-800 leading-relaxed max-w-md">
            Complete system administration access. Manage centers, question banks, training content, and all platform operations.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: "🏢", text: "Manage training centers" },
              { icon: "📝", text: "Configure question banks" },
              { icon: "🎥", text: "Upload training content" },
              { icon: "👥", text: "Control user access" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                  <span className="text-sm">{item.icon}</span>
                </div>
                <span className="text-charcoal-800 font-medium">{item.text}</span>
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
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">Super Admin</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            {isSignUp ? "Admin Setup" : "Secure Login"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? "Configure your super admin credentials"
              : "Access the system administration portal"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@certifypro.gov"
                  className="pl-10 h-12 border-2 focus:border-primary"
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
                    className="text-sm text-primary hover:text-primary/80 font-semibold"
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
                    className="pl-10 h-12 border-2 focus:border-primary"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" variant="forest" className="w-full h-12 text-base">
              {isSignUp ? "Complete Setup" : "Secure Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            {isSignUp ? "Already configured?" : "First time setup?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              {isSignUp ? "Sign In" : "Admin Setup"}
            </button>
          </p>

          <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              🔒 This is a secure portal. All access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
