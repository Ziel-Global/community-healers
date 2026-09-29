import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type AuthBackButtonProps = {
  className?: string;
  /** Fallback when there is no prior history entry (e.g. direct open). */
  fallbackTo?: string;
  label?: string;
};

/**
 * Auth chrome back control — goes to the previous page when possible,
 * otherwise falls back to `fallbackTo` (default `/`).
 */
export function AuthBackButton({
  className,
  fallbackTo = "/",
  label = "Back",
}: AuthBackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
      return;
    }
    if (window.history.length > 1 && document.referrer) {
      try {
        if (new URL(document.referrer).origin === window.location.origin) {
          navigate(-1);
          return;
        }
      } catch {
        // ignore invalid referrer
      }
    }
    navigate(fallbackTo);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        "flex items-center gap-1.5 text-[#64736d] hover:text-primary transition-colors text-sm",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
