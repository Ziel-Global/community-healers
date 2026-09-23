import { useMemo, useState } from "react";
import { Award, ClipboardList, ClipboardCheck, Gavel, Loader2, PlayCircle, TrendingUp, Users, XCircle, FileStack } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useChairmanApplications } from "@/hooks/queries/useCommitteeChairmanQueries";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";
import type { LucideIcon } from "lucide-react";

type TimeFilter = "days" | "months" | "years";

const chartConfig = {
  value: {
    label: "Confirmed centers",
    color: "hsl(var(--primary))",
  },
};

function localKey(date: Date, period: TimeFilter) {
  if (period === "days") return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (period === "months") return `${date.getFullYear()}-${date.getMonth()}`;
  return `${date.getFullYear()}`;
}

function confirmedCenterTrend(applications: CenterApplicationSummary[], period: TimeFilter) {
  const approvedDates = applications
    .filter((application) => application.status === "APPROVED")
    .map((application) => new Date(application.reviewedAt || application.updatedAt))
    .filter((date) => !Number.isNaN(date.getTime()));

  const now = new Date();
  const buckets: { label: string; key: string }[] = [];

  if (period === "days") {
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      buckets.push({
        key: localKey(day, period),
        label: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      });
    }
  } else if (period === "months") {
    for (let i = 11; i >= 0; i -= 1) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: localKey(month, period),
        label: month.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      });
    }
  } else {
    for (let i = 4; i >= 0; i -= 1) {
      const year = now.getFullYear() - i;
      buckets.push({ key: `${year}`, label: `${year}` });
    }
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: approvedDates.filter((date) => localKey(date, period) === bucket.key).length,
  }));
}

function growthLabel(points: { value: number }[]) {
  const latest = points.at(-1)?.value ?? 0;
  const previous = points.at(-2)?.value ?? 0;
  if (previous === 0) return `${latest === 0 ? "0" : "+100"}% growth`;
  const growth = Math.round(((latest - previous) / previous) * 100);
  return `${growth >= 0 ? "+" : ""}${growth}% growth`;
}

export const committeeChairmanNavItems = [
  { label: "Dashboard", href: "/committee-chairman", icon: <Gavel className="w-4 h-4" /> },
  { label: "Applications", href: "/committee-chairman/applications", icon: <FileStack className="w-4 h-4" /> },
  { label: "Inspection reports", href: "/committee-chairman/inspection-reports", icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: "Members", href: "/committee-chairman/members", icon: <Users className="w-4 h-4" /> },
];

function Stat({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
}) {
  return (
    <Card className="relative overflow-hidden border-border/40 bg-card group hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] transition-all duration-200">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-60 bg-primary/20" />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 bg-primary")}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-sans font-bold text-foreground tabular-nums leading-none">{value}</p>
        </div>
        <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function CommitteeChairmanPortal() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("months");
  const { data: applications = [], isLoading } = useChairmanApplications();
  const trend = useMemo(
    () => confirmedCenterTrend(applications, timeFilter),
    [applications, timeFilter],
  );
  const awaitingReview = applications.filter((application) => application.status === "PENDING_CHAIRMAN_REVIEW").length;
  const withCommittee = applications.filter(
    (application) => application.status === "INSPECTION_IN_PROGRESS" || application.status === "SCHEDULED",
  ).length;
  const approved = applications.filter((application) => application.status === "APPROVED").length;
  const rejected = applications.filter((application) => application.status === "REJECTED").length;

  return (
    <DashboardLayout
      title="Committee Chairman"
      subtitle="Review applications before the committee inspects"
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              title="Awaiting review"
              value={awaitingReview}
              icon={ClipboardList}
              description="Applications waiting for you to forward or return"
            />
            <Stat
              title="With committee"
              value={withCommittee}
              icon={PlayCircle}
              description="Forwarded — inspection scheduled or in progress"
            />
            <Stat
              title="Approved"
              value={approved}
              icon={Award}
              description="Applications approved"
            />
            <Stat
              title="Rejected"
              value={rejected}
              icon={XCircle}
              description="Applications rejected"
            />
          </div>

          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-2 sm:pb-6">
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl alumni-sans-title">Confirmed centers</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Centers approved over time</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold text-xs sm:text-sm">{growthLabel(trend)}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
                    {(["days", "months", "years"] as const).map((period) => (
                      <Button
                        key={period}
                        variant="ghost"
                        size="sm"
                        onClick={() => setTimeFilter(period)}
                        className={cn(
                          "h-7 sm:h-8 px-2 sm:px-3 rounded-md text-[10px] sm:text-xs font-semibold capitalize",
                          timeFilter === period ? "bg-white shadow-sm" : "hover:bg-white/50",
                        )}
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 min-h-[250px] sm:min-h-[400px] flex flex-col items-center justify-center">
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConfirmedCenters" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#colorConfirmedCenters)"
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
