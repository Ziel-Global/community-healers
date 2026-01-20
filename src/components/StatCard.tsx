import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="relative p-5 rounded-xl bg-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs mt-1",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
