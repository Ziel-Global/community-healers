import { cn } from "@/lib/utils";

type SoftSkillsBrandProps = {
  className?: string;
  compact?: boolean;
  light?: boolean;
  /** Landing tagline under the wordmark. Ignored when `subtitle` is set. */
  showTagline?: boolean;
  /** Portal role label (e.g. Center Admin). Replaces the default tagline. */
  subtitle?: string;
  /** Keep the wordmark visible on all breakpoints (sidebar). Default hides below `sm`. */
  alwaysShowText?: boolean;
};

export function SoftSkillsBrand({
  className,
  compact = false,
  light = false,
  showTagline = true,
  subtitle,
  alwaysShowText = false,
}: SoftSkillsBrandProps) {
  const label = subtitle ?? (showTagline ? "Ready for what's next" : null);

  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <div
        className={cn(
          "relative flex items-end justify-center gap-[3px] shrink-0",
          "bg-[#174c3e] shadow-[0_8px_20px_#174c3e2e]",
          compact
            ? "w-10 h-11 p-2.5 rounded-[11px] -rotate-[4deg]"
            : "w-[42px] h-[45px] p-[11px] rounded-[10px] -rotate-[4deg] ss-brand-mark"
        )}
        aria-hidden
      >
        <span
          className={cn(
            "rounded-[2px] bg-[#dcf5aa]",
            compact ? "w-[4px] h-2.5" : "w-[5px] h-[11px]"
          )}
        />
        <span
          className={cn(
            "rounded-[2px] bg-[#dcf5aa]",
            compact ? "w-[4px] h-3.5" : "w-[5px] h-[18px]"
          )}
        />
        <span
          className={cn(
            "rounded-[2px] bg-[#d7f88c]",
            compact ? "w-[4px] h-5" : "w-[5px] h-[25px]"
          )}
        />
      </div>

      <div
        className={cn(
          "portal-brand flex-col justify-center min-w-0",
          alwaysShowText ? "flex" : "hidden sm:flex"
        )}
      >
        <span
          className={cn(
            "ss-brand-title portal-brand-title leading-none",
            compact ? "text-[1.15rem]" : "text-2xl",
            light && "text-white"
          )}
        >
          Soft
          <span
            className={cn(
              "font-semibold",
              light ? "text-[#d7f88c]" : "text-[#328260]"
            )}
          >
            Skills
          </span>
        </span>
        {label && (
          <span
            className={cn(
              "portal-brand-subtitle mt-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] leading-none",
              light ? "text-[#b3d0c2]" : "text-[#6d8474]"
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
