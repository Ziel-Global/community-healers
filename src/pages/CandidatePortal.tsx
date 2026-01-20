import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BookOpen,
  Award,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/candidate",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Registration",
    href: "/candidate/registration",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: "Schedule Exam",
    href: "/candidate/schedule",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    label: "Training Videos",
    href: "/candidate/training",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    label: "Certificates",
    href: "/candidate/certificates",
    icon: <Award className="w-4 h-4" />,
  },
  {
    label: "Profile",
    href: "/candidate/profile",
    icon: <User className="w-4 h-4" />,
  },
];

export default function CandidatePortal() {
  return (
    <DashboardLayout
      title="Candidate Dashboard"
      subtitle="Welcome back, Muhammad Ahmed"
      portalType="candidate"
      navItems={navItems}
    >
      {/* Status Banner */}
      <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Exam Scheduled</p>
            <p className="text-sm text-muted-foreground">
              Your CBT exam is scheduled for January 25, 2024 at 10:00 AM
            </p>
          </div>
        </div>
        <Button variant="neon" size="sm">
          View Details
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Registration Status"
          value="Complete"
          icon={CheckCircle2}
          change="All documents verified"
          changeType="positive"
        />
        <StatCard
          title="Exam Status"
          value="Scheduled"
          icon={Calendar}
          change="Jan 25, 2024"
          changeType="neutral"
        />
        <StatCard
          title="Training Progress"
          value="75%"
          icon={BookOpen}
          change="38/50 videos watched"
          changeType="positive"
        />
        <StatCard
          title="Certificate"
          value="Pending"
          icon={Award}
          change="Complete exam first"
          changeType="neutral"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Exam Card */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border/60 shadow-sm">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Upcoming Exam
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-royal">
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    CBT Certification Exam
                  </p>
                  <p className="text-sm text-muted-foreground">
                    January 25, 2024 • 10:00 AM
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">Assigned Center</p>
                <p className="font-semibold text-foreground">
                  Lahore Training Center #3
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Duration</p>
                <p className="font-bold text-foreground">20 Minutes</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <FileText className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Questions</p>
                <p className="font-bold text-foreground">20 MCQs</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Pass Score</p>
                <p className="font-bold text-foreground">60%</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="neon" className="flex-1">
                View Exam Details
              </Button>
              <Button variant="outline">
                Reschedule
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Training Videos */}
        <div className="p-6 rounded-xl bg-card border border-border/60 shadow-sm">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Continue Training
          </h3>

          <div className="space-y-3">
            {[
              { title: "Introduction to Safety Rules", progress: 100 },
              { title: "Equipment Handling", progress: 100 },
              { title: "Emergency Procedures", progress: 45 },
              { title: "Documentation Standards", progress: 0 },
            ].map((video, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-secondary/30 border border-border/40 hover:border-primary/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    {video.title}
                  </p>
                  <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="w-full h-1.5 rounded-full bg-border">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-300"
                    style={{ width: `${video.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            View All Videos
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-6 rounded-xl bg-card border border-border/60 shadow-sm">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Update Profile", icon: User },
            { label: "View Documents", icon: FileText },
            { label: "Payment History", icon: Award },
            { label: "Contact Support", icon: AlertCircle },
          ].map((action, index) => (
            <button
              key={index}
              className="p-4 rounded-xl bg-secondary/30 border border-border/40 hover:border-primary/30 hover:bg-secondary/50 transition-all text-center group"
            >
              <action.icon className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-foreground">{action.label}</p>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
