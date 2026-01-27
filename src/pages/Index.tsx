import { Header } from "@/components/Header";
import { PortalCard } from "@/components/PortalCard";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Clock,
  Award,
  Users,
  BookOpen,
} from "lucide-react";

const portals = [
  {
    title: "Candidate Portal",
    description:
      "Register, schedule exams, complete training, and track your certification progress.",
    icon: GraduationCap,
    href: "/candidate/auth",
    stats: [
      { label: "Active Candidates", value: "12,450" },
      { label: "Registered Today", value: "89" },
    ],
  },
  {
    title: "Examination Portal",
    description:
      "Login with your candidate credentials to take your scheduled CBT examination.",
    icon: BookOpen,
    href: "/exam/auth",
    stats: [
      { label: "Exams Today", value: "342" },
      { label: "Pass Rate", value: "78%" },
    ],
  },
  {
    title: "Center Admin",
    description:
      "Manage exam day operations, verify candidate identity, and monitor examination progress.",
    icon: Building2,
    href: "/center/auth",
    stats: [
      { label: "Centers Active", value: "86" },
      { label: "Verified Today", value: "1,204" },
    ],
  },
  {
    title: "Super Admin",
    description:
      "Configure centers, manage question banks, upload training content, and oversee system operations.",
    icon: ShieldCheck,
    href: "/admin/auth",
    stats: [
      { label: "Total Questions", value: "5,000+" },
      { label: "Training Videos", value: "50" },
    ],
  },
  {
    title: "Ministry Portal",
    description:
      "Review exam results, approve certifications, and issue official government certificates.",
    icon: Landmark,
    href: "/ministry/auth",
    stats: [
      { label: "Certificates Issued", value: "45,230" },
      { label: "Pending Review", value: "892" },
    ],
  },
];

const features = [
  {
    icon: CheckCircle2,
    title: "Automated Center Assignment",
    description: "Fair and equal distribution of candidates across training centers",
  },
  {
    icon: Clock,
    title: "Secure CBT Exams",
    description: "20 randomized questions with 20-minute time limit",
  },
  {
    icon: Award,
    title: "Digital Certificates",
    description: "Government-issued certificates with unique verification codes",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description: "Dedicated dashboards for candidates, centers, admins, and ministry",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden gradient-hero">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">
                Government Certified Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl alumni-sans-title text-foreground mb-4 sm:mb-6 leading-tight px-2">
              Digital Certification &{" "}
              <span className="text-gradient">Examination</span> Platform
            </h1>

            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              End-to-end digital solution managing candidate journeys from
              registration to government certificate issuance, with secure CBT
              exams and full compliance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Button variant="forest" size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-12 sm:mb-20">
            {[
              { value: "45,000+", label: "Certificates Issued" },
              { value: "86", label: "Training Centers" },
              { value: "99.9%", label: "System Uptime" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-3 sm:p-5 rounded-xl bg-card border border-border/60 shadow-sm hover:shadow-royal transition-all duration-300"
              >
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gradient">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-12 sm:mb-20">
            {portals.map((portal) => (
              <PortalCard key={portal.title} {...portal} />
            ))}
          </div>

          {/* Features Section */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl alumni-sans-title text-center text-foreground mb-3 sm:mb-4">
              Platform Features
            </h2>
            <p className="text-center text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
              Built with enterprise-grade security and reliability to manage your entire certification workflow.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-royal transition-all duration-300 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="alumni-sans-subtitle font-semibold text-base sm:text-lg text-foreground mb-1.5 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 sm:py-8 px-4 sm:px-6">
        <div className="container mx-auto flex flex-col items-center gap-4 text-center sm:text-left sm:flex-row sm:justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2024 Soft skill training. All rights reserved. Government Certified Platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              Privacy Policy
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              Terms of Service
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
