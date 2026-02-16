import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MinistryStats } from "@/components/MinistryPortal/Dashboard/MinistryStats";
import { ministryService, IssuanceTrendResponse } from "@/services/ministryService";
import {
  ShieldCheck,
  History,
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export const ministryNavItems = [
  {
    label: "Authority Hub",
    href: "/ministry",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Candidate Review",
    href: "/ministry/review",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Certificate Registry",
    href: "/ministry/registry",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    label: "Issuance Logs",
    href: "/ministry/logs",
    icon: <History className="w-4 h-4" />,
  },
  {
    label: "Center Oversight",
    href: "/ministry/centers",
    icon: <Building2 className="w-4 h-4" />,
  },
];

const chartConfig = {
  certificates: {
    label: "Certificates",
    color: "hsl(var(--primary))",
  },
};

export default function MinistryPortal() {
  const [timeFilter, setTimeFilter] = useState<"days" | "months" | "years">("months");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState<number>(0);
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      setIsLoadingTrend(true);
      try {
        const response = await ministryService.getIssuanceTrend();
        if (response && response.data) {
          // Map API data { label, value } to chart data { period, certificates }
          const mappedData = response.data.map(item => ({
            period: item.label,
            certificates: item.value
          }));
          setTrendData(mappedData);
          setGrowthPercentage(response.growthPercentage);
        }
      } catch (error) {
        console.error("Failed to fetch issuance trend:", error);
      } finally {
        setIsLoadingTrend(false);
      }
    };

    fetchTrend();
  }, [timeFilter]);

  const getGrowthText = () => {
    return `${growthPercentage >= 0 ? "+" : ""}${growthPercentage}% growth`;
  };

  return (
    <DashboardLayout
      title="Ministry Authority Portal"
      subtitle="Certification Issuance & Governance Oversight"
      portalType="ministry"
      navItems={ministryNavItems}
    >
      <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
        {/* Authority Overview Stats */}
        <MinistryStats />

        {/* Certificate Issuance Trend Graph */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2 sm:pb-6">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl alumni-sans-title">Certificate Issuance Trend</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Number of certificates issued over time</CardDescription>
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
          <CardContent className="p-2 sm:p-6">
            {isLoadingTrend ? (
              <div className="h-[250px] sm:h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCertificates" x1="0" y1="0" x2="0" y2="1">
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
                      dataKey="certificates"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorCertificates)"
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
