import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-royal group-hover:shadow-lg transition-shadow duration-300">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-xl alumni-sans-title text-foreground leading-tight">
              Soft skill training
            </span>
            <span className="text-[8px] sm:text-sm alumni-sans-subtitle text-muted-foreground uppercase tracking-wider font-medium hidden sm:block">
              Training Portal
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
