import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface PortalCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  accentColor?: string;
  stats?: { label: string; value: string }[];
}

export function PortalCard({
  title,
  description,
  icon: Icon,
  href,
  stats,
}: PortalCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group relative flex flex-col p-6 rounded-2xl",
        "bg-card border border-border/60",
        "hover:border-primary/30 hover:shadow-royal",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5" />
      </div>

      {/* Icon */}
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-royal group-hover:shadow-lg transition-all duration-300">
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1">
        <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="relative mt-6 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-2xl font-bold text-gradient">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Arrow indicator */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </div>
    </Link>
  );
}
