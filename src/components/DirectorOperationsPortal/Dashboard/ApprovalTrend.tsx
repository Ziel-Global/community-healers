import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

type TimeFilter = "days" | "months" | "years";

const chartConfig = {
    value: {
        label: "Approved centers",
        color: "#164c3e",
    },
};

function localKey(date: Date, period: TimeFilter) {
    if (period === "days") return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (period === "months") return `${date.getFullYear()}-${date.getMonth()}`;
    return `${date.getFullYear()}`;
}

function approvedCenterTrend(applications: CenterApplicationSummary[], period: TimeFilter) {
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

interface ApprovalTrendProps {
    applications: CenterApplicationSummary[];
}

export function ApprovalTrend({ applications }: ApprovalTrendProps) {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("months");
    const trend = useMemo(() => approvedCenterTrend(applications, timeFilter), [applications, timeFilter]);

    return (
        <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">Outcomes</p>
                    <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">Approval trend</h2>
                    <p className="text-xs text-[#6d8474] mt-1">Centers approved over time</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-[#6d8474]">
                        <TrendingUp className="w-4 h-4 text-[#426f36]" />
                        <span className="text-[#426f36] font-semibold text-xs sm:text-sm">{growthLabel(trend)}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#f4f7f3] border border-[#c9d6c8] p-1 rounded-[10px]">
                        {(["days", "months", "years"] as const).map((period) => (
                            <Button
                                key={period}
                                variant="ghost"
                                size="sm"
                                onClick={() => setTimeFilter(period)}
                                className={cn(
                                    "h-7 sm:h-8 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-semibold capitalize",
                                    timeFilter === period
                                        ? "bg-white shadow-sm text-[#183d34]"
                                        : "text-[#6d8474] hover:text-[#183d34] hover:bg-white/70"
                                )}
                            >
                                {period}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-2 sm:p-6 min-h-[240px] sm:min-h-[320px] flex flex-col items-center justify-center">
                <ChartContainer config={chartConfig} className="h-[240px] sm:h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBureauApprovals" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#164c3e" stopOpacity={0.28} />
                                    <stop offset="95%" stopColor="#164c3e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d4" opacity={0.7} />
                            <XAxis
                                dataKey="label"
                                stroke="#93a087"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#93a087"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#164c3e"
                                strokeWidth={2}
                                fill="url(#colorBureauApprovals)"
                                fillOpacity={1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </section>
    );
}
