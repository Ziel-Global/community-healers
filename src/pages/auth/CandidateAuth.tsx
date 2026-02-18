import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, ArrowLeft, Phone, Lock, User, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/i18n";

export default function CandidateAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { loginCandidate, signup, verifyCandidate, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Force English and LTR immediately when component loads
  useEffect(() => {
    // Set language to English synchronously
    i18n.changeLanguage('en');
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';

    // Auto logout when navigating back to auth page
    if (isAuthenticated) {
      logout();
    }
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password.length < 6) {
          toast({
            variant: "destructive",
            title: "Password too short",
            description: "Password must be at least 6 characters long.",
          });
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({
            variant: "destructive",
            title: "Passwords don't match",
            description: "Please make sure your passwords match.",
          });
          setLoading(false);
          return;
        }
        // Register
        await signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        });
        setShowOtpModal(true);
        setLoading(false); // Stop loading to show OTP modal
        toast({
          title: "Registration Successful",
          description: "An OTP has been sent to your phone.",
        });
      } else {
        // Login
        await loginCandidate({
          phoneNumber: formData.phoneNumber,
          password: formData.password
        });
        navigate("/candidate");
        toast({
          title: "Welcome back!",
          description: "Login successful.",
        });
        // Loader persists until navigation completes
      }
    } catch (error: any) {
      setLoading(false); // Stop loading on error
      toast({
        variant: "destructive",
        title: isSignUp ? "Registration Failed" : "Login Failed",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(6 - pastedData.length).fill("")).slice(0, 6);
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      otpRefs.current[nextEmptyIndex]?.focus();
    } else {
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;

    setLoading(true);
    try {
      await verifyCandidate({
        phoneNumber: formData.phoneNumber,
        otp: otpValue
      });
      setShowOtpModal(false);
      navigate("/candidate");
      toast({
        title: "Verification Successful",
        description: "You are now logged in.",
      });
      // Loader persists until navigation completes
    } catch (error: any) {
      setLoading(false); // Stop loading on error
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid OTP code. Please try again.",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex overflow-hidden">
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
            Your gateway to professional soft skills certification. Complete your journey from registration to certification.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { num: "1", text: "Complete your registration" },
              { num: "2", text: "Pay training fee" },
              { num: "3", text: "Schedule your training date" },
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
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-16 bg-white overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white pt-4 pb-2 flex items-center justify-between lg:justify-end">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-display font-bold">Candidate Portal</span>
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

          <h2 className="text-3xl sm:text-4xl alumni-sans-title text-foreground mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            {isSignUp
              ? "Register to start your training journey"
              : "Sign in to access your candidate portal"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="03001234567"
                  className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      className={`pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base ${formData.password && formData.password.length < 6 ? "border-destructive focus:border-destructive" : ""
                        }`}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {formData.password && formData.password.length < 6 && (
                    <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {!isSignUp && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-9 sm:pl-10 h-11 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" variant="forest" className="w-full h-11 sm:h-12 text-base sm:text-lg alumni-sans-subtitle" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Please wait...
                </>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-4 sm:mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl alumni-sans-title">Verify Your Account</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to your phone number.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOtpSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <Label className="text-sm">Verification Code</Label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 focus:border-primary"
                    maxLength={1}
                    required
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 font-medium w-full text-center"
              >
                Resend OTP
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button type="submit" variant="forest" className="flex-1 h-11 alumni-sans-subtitle" disabled={loading}>
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
