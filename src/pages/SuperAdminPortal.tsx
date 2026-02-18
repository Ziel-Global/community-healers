import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { superAdminService } from "@/services/superAdminService";
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
  TrendingUp,
  Loader2
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
    label: "Training Config",
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

const chartConfig = {
  value: {
    label: "Candidates",
    color: "hsl(var(--primary))",
  },
};

export default function SuperAdminPortal() {
  const [timeFilter, setTimeFilter] = useState<"days" | "months" | "years">("months");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: superAdminService.getDashboardStats,
  });

  const { data: trendData, isLoading: isTrendLoading } = useQuery({
    queryKey: ["exam-participation-trend", timeFilter],
    queryFn: () => superAdminService.getExamParticipationTrend(timeFilter),
  });

  const getGrowthText = () => {
    if (isTrendLoading || !trendData) return "Loading...";
    return `${trendData.growthPercentage >= 0 ? '+' : ''}${trendData.growthPercentage}% growth`;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Candidates"
            value={isLoading ? "..." : stats?.totalCandidates?.toLocaleString() || "0"}
            icon={Users}
            desc="+4.2% this month"
          />
          <StatCard
            title="Active Centers"
            value={isLoading ? "..." : stats?.activeCenters?.toLocaleString() || "0"}
            icon={MapPin}
            desc="Across 12 regions"
          />
          <StatCard
            title="Total Questions"
            value={isLoading ? "..." : stats?.totalQuestions?.toLocaleString() || "0"}
            icon={Database}
            desc="Vetted & categorized"
          />
        </div>

        {/* Exam Candidates Trend Graph */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2 sm:pb-6">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl alumni-sans-title">Training Participation Trend</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Number of candidates appearing in training over time</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold text-xs sm:text-sm">{getGrowthText()}</span>
                </div>
                <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTimeFilter("days")}
                    className={cn(
                      "h-7 sm:h-8 px-2 sm:px-3 rounded-md text-[10px] sm:text-xs font-semibold",
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
                      "h-7 sm:h-8 px-2 sm:px-3 rounded-md text-[10px] sm:text-xs font-semibold",
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
                      "h-7 sm:h-8 px-2 sm:px-3 rounded-md text-[10px] sm:text-xs font-semibold",
                      timeFilter === "years" ? "bg-white shadow-sm" : "hover:bg-white/50"
                    )}
                  >
                    Years
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 min-h-[250px] sm:min-h-[400px] flex flex-col items-center justify-center">
            {isTrendLoading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Fetching participation trend...</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData?.data || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="label"
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
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorCandidates)"
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>


      </div>
    </DashboardLayout>
  );
}
