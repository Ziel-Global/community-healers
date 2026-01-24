import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft, Phone, Lock, User, Mail } from "lucide-react";

export default function CandidateAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/candidate");
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#13452c' }}>
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <span className="text-3xl alumni-sans-title text-white">Soft skill training</span>
          </div>
          
          <h1 className="text-4xl alumni-sans-title mb-4 text-white">
            Candidate Portal
          </h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-md">
            Register for certification exams, track your progress, complete CBT tests, and download your official government certificates.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { num: "1", text: "Complete registration & documents" },
              { num: "2", text: "Schedule your CBT exam" },
              { num: "3", text: "Download your certificate" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                  <span className="text-primary text-sm font-bold">{item.num}</span>
                </div>
                <span className="text-white font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 bg-white py-8 sm:py-12">
        <Link
          to="/"
          className="absolute top-4 sm:top-6 left-4 sm:left-6 lg:left-auto lg:right-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        <div className="max-w-md mx-auto w-full mt-8 sm:mt-0">
          <div className="lg:hidden flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-display font-bold">Candidate Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            {isSignUp
              ? "Register to begin your certification journey"
              : "Sign in to access your candidate dashboard"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {isSignUp && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="otp" className="text-sm">OTP Code</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 font-semibold"
              >
                Send OTP
              </button>
            </div>

            <Button type="submit" variant="forest" className="w-full h-11 sm:h-12 text-sm sm:text-base">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="mt-4 sm:mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
