import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AssignmentsView = "cards" | "table";

interface AssignmentsViewToggleProps {
    view: AssignmentsView;
    onChange: (view: AssignmentsView) => void;
}

export function AssignmentsViewToggle({ view, onChange }: AssignmentsViewToggleProps) {
    return (
        <div className="inline-flex rounded-[10px] border border-[#c9d6c8] bg-[#f4f7f3] p-1 gap-1 shrink-0">
            <button
                type="button"
                onClick={() => onChange("cards")}
                aria-pressed={view === "cards"}
                className={cn(
                    "flex items-center gap-2 h-9 rounded-lg px-3 text-sm font-medium transition-all",
                    view === "cards"
                        ? "bg-[#164c3e] text-white shadow-[0_4px_12px_rgba(22,76,62,0.22)]"
                        : "text-[#6d8474] hover:text-[#183d34] hover:bg-white/70"
                )}
            >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
            </button>
            <button
                type="button"
                onClick={() => onChange("table")}
                aria-pressed={view === "table"}
                className={cn(
                    "flex items-center gap-2 h-9 rounded-lg px-3 text-sm font-medium transition-all",
                    view === "table"
                        ? "bg-[#164c3e] text-white shadow-[0_4px_12px_rgba(22,76,62,0.22)]"
                        : "text-[#6d8474] hover:text-[#183d34] hover:bg-white/70"
                )}
            >
                <Table2 className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
            </button>
        </div>
    );
}
