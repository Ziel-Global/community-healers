import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft, Mail, Lock, User, Hash, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CenterAdminAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { loginCenterAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      toast({
        title: "Access Request Sent",
        description: "Your request has been forwarded to the Super Admin for approval.",
      });
      return;
    }

    setLoading(true);
    try {
      await loginCenterAdmin({ email, password });
      navigate("/center");
      toast({
        title: "Welcome back!",
        description: "Login successful.",
      });
      // Loader persists until navigation completes
    } catch (error: any) {
      setLoading(false); // Stop loading on error
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#13452c' }}>
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <span className="text-3xl alumni-sans-title text-white">Soft skill training</span>
          </div>

          <h1 className="text-4xl alumni-sans-title mb-4 text-white">
            Center Admin
          </h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-md">
            Manage your training center operations, verify candidates, and oversee examinations.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: "👤", text: "Verify candidate identity" },
              { icon: "📋", text: "Monitor exam progress" },
              { icon: "📊", text: "Generate daily reports" },
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
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl alumni-sans-title">Center Admin</span>
          </div>

          <h2 className="text-3xl alumni-sans-title text-foreground mb-2">
            {isSignUp ? "Request Access" : "Sign In"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? "Submit your details for center admin access"
              : "Access your center administration dashboard"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="pl-10 h-12 border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centerCode">Center Code</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="centerCode"
                      placeholder="e.g., LHR-001"
                      className="pl-10 h-12 border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@center.com"
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
                    className="text-base text-primary hover:text-primary/80 alumni-sans-subtitle"
                  >
                    Forgot password?
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

            <Button type="submit" variant="forest" className="w-full h-12 text-lg alumni-sans-subtitle" disabled={loading}>
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

          <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              🏢 Center admins must be approved by Super Admin before access is granted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
