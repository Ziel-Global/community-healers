import { DashboardLayout } from "@/components/DashboardLayout";
import { ExamRulesForm } from "@/components/SuperAdminPortal/Configuration/ExamRulesForm";
import { CenterManager } from "@/components/SuperAdminPortal/Locations/CenterManager";
import { AdminAccountList } from "@/components/SuperAdminPortal/Users/AdminAccountList";
import { QuestionEditor } from "@/components/SuperAdminPortal/QuestionBank/QuestionEditor";
import { SystemAuditLogs } from "@/components/SuperAdminPortal/Audit/SystemAuditLogs";
import {
  Shield,
  Settings2,
  MapPin,
  Users,
  HelpCircle,
  BookOpen,
  History,
  Activity,
  Globe,
  Database,
  BarChart3
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const superAdminNavItems = [
  {
    label: "Global Dashboard",
    href: "/admin",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    label: "Exam Config",
    href: "/admin/config",
    icon: <Settings2 className="w-4 h-4" />,
  },
  {
    label: "Centers & Locations",
    href: "/admin/centers",
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    label: "Admin Management",
    href: "/admin/users",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Question Bank",
    href: "/admin/questions",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  {
    label: "Training Academy",
    href: "/admin/content",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit",
    icon: <History className="w-4 h-4" />,
  },
];

const StatCard = ({ title, value, icon: Icon, desc }: any) => (
  <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden border-b-4 border-b-primary shadow-sm hover:translate-y-[-2px] transition-all">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{title}</p>
          <h3 className="text-2xl font-display font-bold text-foreground">{value}</h3>
          <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
            <Activity className="w-3 h-3" /> {desc}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function SuperAdminPortal() {
  return (
    <DashboardLayout
      title="Super Admin Portal"
      subtitle="System-Wide Governance & Configuration"
      portalType="admin"
      navItems={superAdminNavItems}
    >
      <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
        {/* Global Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Registrations" value="12,405" icon={Users} desc="+4.2% this month" />
          <StatCard title="Active Centers" value="42" icon={MapPin} desc="Across 12 regions" />
          <StatCard title="Question Bank" value="850" icon={Database} desc="Vetted & categorized" />
          <StatCard title="Compliance Rate" value="98.2%" icon={Shield} desc="Audit criteria met" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Primary Configuration & Management Feed */}
          <div className="lg:col-span-8 space-y-10">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  Policy & Rules
                </h2>
              </div>
              <ExamRulesForm />
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Infrastructure Control
              </h2>
              <CenterManager />
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Content Mastery
              </h2>
              <QuestionEditor />
            </section>
          </div>

          {/* Secondary Oversight & Admin Monitoring */}
          <div className="lg:col-span-4 space-y-10">
            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                System Heartbeat
              </h2>
              <SystemAuditLogs />
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Admin Oversight
              </h2>
              <AdminAccountList />
            </section>

            <div className="p-6 rounded-2xl gradient-primary text-black shadow-royal space-y-4">
              <h3 className="font-display font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System-Wide Report
              </h3>
              <p className="text-sm font-medium leading-relaxed opacity-80">
                Generate a consolidated system performance report for the Ministry review. Includes registration trends, pass rates, and center utilization.
              </p>
              <Button className="w-full bg-black text-white hover:bg-black/80 font-bold h-11 rounded-xl">
                Export Ministry Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
