import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-royal group-hover:shadow-lg transition-shadow duration-300">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-lg font-display font-bold text-foreground leading-tight">
              Soft skill training
            </span>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-medium hidden sm:block">
              Examination Portal
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] sm:text-xs font-medium text-success">
              Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
