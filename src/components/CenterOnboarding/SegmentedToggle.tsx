import { cn } from "@/lib/utils";

interface SegmentedOption<T extends string | boolean> {
    value: T;
    label: string;
}

interface SegmentedToggleProps<T extends string | boolean> {
    options: SegmentedOption<T>[];
    value: T | null;
    onChange: (value: T) => void;
    className?: string;
    fullWidth?: boolean;
}

export function SegmentedToggle<T extends string | boolean>({
    options,
    value,
    onChange,
    className,
    fullWidth = false,
}: SegmentedToggleProps<T>) {
    return (
        <div
            className={cn(
                "inline-flex rounded-[10px] border border-[#c9d6c8] bg-[#f4f7f3] p-1 gap-1",
                fullWidth && "flex w-full",
                className
            )}
        >
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                            fullWidth && "flex-1",
                            isActive
                                ? "bg-[#164c3e] text-white shadow-[0_4px_12px_rgba(22,76,62,0.22)]"
                                : "text-[#6d8474] hover:text-[#183d34] hover:bg-white/70"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-xl border border-[#c9d6c8] bg-white shadow-sm">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-[#183d34]">{label}</p>
                {description && <p className="text-xs text-[#6d8474] mt-0.5 leading-relaxed">{description}</p>}
            </div>
            <SegmentedToggle
                options={[
                    { value: true, label: "Yes" },
                    { value: false, label: "No" },
                ]}
                value={value}
                onChange={onChange}
                className="shrink-0"
            />
        </div>
    );
}
