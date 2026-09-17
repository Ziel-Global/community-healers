import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ApplicationsView = "kanban" | "table";

interface ViewToggleProps {
    view: ApplicationsView;
    onChange: (view: ApplicationsView) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
    return (
        <div className="inline-flex rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-1 shadow-sm shrink-0">
            <button
                type="button"
                onClick={() => onChange("kanban")}
                aria-pressed={view === "kanban"}
                className={cn(
                    "flex items-center gap-2 h-9 rounded-lg px-3 text-sm font-medium transition-all",
                    view === "kanban"
                        ? "gradient-primary text-white shadow-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
            >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Board</span>
            </button>
            <button
                type="button"
                onClick={() => onChange("table")}
                aria-pressed={view === "table"}
                className={cn(
                    "flex items-center gap-2 h-9 rounded-lg px-3 text-sm font-medium transition-all",
                    view === "table"
                        ? "gradient-primary text-white shadow-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
            >
                <Table2 className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
            </button>
        </div>
    );
}
