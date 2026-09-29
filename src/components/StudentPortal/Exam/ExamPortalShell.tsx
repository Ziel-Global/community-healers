import { SoftSkillsBrand } from "@/components/SoftSkillsBrand";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ExamPortalShellProps = {
  children: React.ReactNode;
  subtitle?: string;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  showLogout?: boolean;
  /** Center content vertically (status screens). */
  centered?: boolean;
  className?: string;
  contentClassName?: string;
};

/** SoftSkills chrome for Training / Exam portal. */
export function ExamPortalShell({
  children,
  subtitle = "Training Portal",
  onLogout,
  isLoggingOut,
  showLogout = true,
  centered = false,
  className,
  contentClassName,
}: ExamPortalShellProps) {
  return (
    <div className={cn("min-h-screen bg-[#f5f8f2] flex flex-col relative", className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(215,248,140,0.18)_0%,transparent_48%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(ellipse_at_50%_100%,rgba(22,76,62,0.04)_0%,transparent_70%)]"
        aria-hidden
      />
      <header className="relative z-10 border-b border-[#e7eee9] bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <SoftSkillsBrand compact alwaysShowText subtitle={subtitle} />
          {showLogout && onLogout && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="gap-1.5 border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3] rounded-[9px]"
            >
              {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          )}
        </div>
      </header>
      <div
        className={cn(
          "relative z-10 flex-1",
          centered && "flex items-center justify-center p-4 sm:p-6",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

type ExamStatusCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "warning";
};

export function ExamStatusCard({
  icon: Icon,
  title,
  description,
  children,
  tone = "neutral",
}: ExamStatusCardProps) {
  const tones = {
    neutral: {
      iconWell: "bg-[#e8f0ea] text-[#164c3e]",
      border: "border-[#d5e0d4]",
      accent: "bg-[#164c3e]",
    },
    success: {
      iconWell: "bg-[#eef6df] text-[#426f36]",
      border: "border-[#c9dbc0]",
      accent: "bg-[#d7f88c]",
    },
    danger: {
      iconWell: "bg-red-50 text-red-700",
      border: "border-red-200",
      accent: "bg-red-500",
    },
    warning: {
      iconWell: "bg-[#fff8ee] text-[#9a7b3c]",
      border: "border-amber-200/80",
      accent: "bg-amber-400",
    },
  }[tone];

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-[22px] border bg-white text-center",
        "shadow-[0_16px_48px_rgba(22,76,62,0.08)] overflow-hidden animate-in fade-in zoom-in-95 duration-300",
        tones.border
      )}
    >
      <div className={cn("h-1 w-full", tones.accent)} />
      <div className="p-6 sm:p-8 space-y-5">
        <div
          className={cn(
            "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center",
            tones.iconWell
          )}
        >
          <Icon className="w-8 h-8" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#183d34] tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-[#6d8474] leading-relaxed">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ExamInfoPanel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] bg-[#f4f7f3] border border-[#e7eee9] p-4 text-left space-y-2",
        className
      )}
    >
      {title && <p className="text-sm font-semibold text-[#183d34]">{title}</p>}
      <div className="text-xs sm:text-sm text-[#6d8474] leading-relaxed">{children}</div>
    </div>
  );
}
