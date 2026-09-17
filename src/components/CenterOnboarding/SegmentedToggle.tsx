import { cn } from "@/lib/utils";

interface SegmentedOption<T extends string | boolean> {
    value: T;
    label: string;
}

interface SegmentedToggleProps<T extends string | boolean> {
    options: SegmentedOption<T>[];
    value: T | null;
    onChange: (value: T) => void;
}

export function SegmentedToggle<T extends string | boolean>({ options, value, onChange }: SegmentedToggleProps<T>) {
    return (
        <div className="inline-flex rounded-xl border border-border/60 bg-secondary/30 p-1 gap-1">
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "h-9 px-4 rounded-lg text-sm font-medium transition-all",
                            isActive
                                ? "gradient-primary text-white shadow-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

/** A labeled row wrapping a Yes/No SegmentedToggle — the common case (building systems, JV question, etc). */
export function YesNoRow({
    label,
    description,
    value,
    onChange,
}: {
    label: string;
    description?: string;
    value: boolean | null;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-card">
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
            <SegmentedToggle
                options={[
                    { value: true, label: "Yes" },
                    { value: false, label: "No" },
                ]}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
