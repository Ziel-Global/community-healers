import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
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
  BarChart3,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

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
  // {
  //   label: "Training Academy",
  //   href: "/admin/content",
  //   icon: <BookOpen className="w-4 h-4" />,
  // },
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
          <h3 className="text-2xl font-bold text-foreground font-sans tabular-nums">{value}</h3>
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

const dailyData = [
  { period: "Mon", candidates: 125 },
  { period: "Tue", candidates: 142 },
  { period: "Wed", candidates: 138 },
  { period: "Thu", candidates: 155 },
  { period: "Fri", candidates: 148 },
  { period: "Sat", candidates: 163 },
  { period: "Sun", candidates: 121 },
];

const monthlyData = [
  { period: "Jan", candidates: 850 },
  { period: "Feb", candidates: 920 },
  { period: "Mar", candidates: 1150 },
  { period: "Apr", candidates: 1050 },
  { period: "May", candidates: 1280 },
  { period: "Jun", candidates: 1420 },
  { period: "Jul", candidates: 1350 },
  { period: "Aug", candidates: 1580 },
  { period: "Sep", candidates: 1720 },
  { period: "Oct", candidates: 1650 },
  { period: "Nov", candidates: 1890 },
  { period: "Dec", candidates: 2100 },
];

const yearlyData = [
  { period: "2020", candidates: 4200 },
  { period: "2021", candidates: 6800 },
  { period: "2022", candidates: 9500 },
  { period: "2023", candidates: 11200 },
  { period: "2024", candidates: 14800 },
  { period: "2025", candidates: 18400 },
];

const chartConfig = {
  candidates: {
    label: "Candidates",
    color: "hsl(var(--primary))",
  },
};

export default function SuperAdminPortal() {
  const [timeFilter, setTimeFilter] = useState<"days" | "months" | "years">("months");

  const getChartData = () => {
    switch (timeFilter) {
      case "days":
        return dailyData;
      case "years":
        return yearlyData;
      default:
        return monthlyData;
    }
  };

  const getGrowthText = () => {
    switch (timeFilter) {
      case "days":
        return "+8.2% this week";
      case "years":
        return "+24.3% this year";
      default:
        return "+24.5% growth";
    }
  };

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

        {/* Exam Candidates Trend Graph */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-display">Exam Participation Trend</CardTitle>
                <CardDescription>Number of candidates appearing in exams over time</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">{getGrowthText()}</span>
                </div>
                <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTimeFilter("days")}
                    className={cn(
                      "h-8 px-3 rounded-md text-xs font-semibold",
                      timeFilter === "days" ? "bg-white shadow-sm" : "hover:bg-white/50"
                    )}
                  >
                    Days
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTimeFilter("months")}
                    className={cn(
                      "h-8 px-3 rounded-md text-xs font-semibold",
                      timeFilter === "months" ? "bg-white shadow-sm" : "hover:bg-white/50"
                    )}
                  >
                    Months
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTimeFilter("years")}
                    className={cn(
                      "h-8 px-3 rounded-md text-xs font-semibold",
                      timeFilter === "years" ? "bg-white shadow-sm" : "hover:bg-white/50"
                    )}
                  >
                    Years
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="candidates"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorCandidates)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

       
      </div>
    </DashboardLayout>
  );
}
