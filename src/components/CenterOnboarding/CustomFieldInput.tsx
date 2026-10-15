import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { FormFieldDefinition } from "@/types/formBuilder";

/** Bureau-added field — one generic input per FormFieldType. Shared by every onboarding step that reads from the form builder. */
export function CustomFieldInput({
    field,
    value,
    onChange,
}: {
    field: FormFieldDefinition;
    value: string | number | boolean | undefined;
    onChange: (value: string | number | boolean) => void;
}) {
    switch (field.fieldType) {
        case "NUMBER":
            return (
                <Input
                    id={field.id}
                    type="number"
                    className="h-11"
                    value={typeof value === "number" ? value : ""}
                    onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
                />
            );
        case "BOOLEAN":
            return (
                <div className="flex items-center gap-2 h-11">
                    <Switch checked={value === true} onCheckedChange={(checked) => onChange(checked)} />
                </div>
            );
        case "SELECT":
            return (
                <select
                    id={field.id}
                    className="h-11 w-full rounded-md border border-[#c9d6c8] bg-white px-3 text-sm"
                    value={typeof value === "string" ? value : ""}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="" disabled>Select…</option>
                    {(field.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        case "DATE":
            return (
                <Input
                    id={field.id}
                    type="date"
                    className="h-11"
                    value={typeof value === "string" ? value : ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case "TEXT":
        default:
            return (
                <Input
                    id={field.id}
                    className="h-11"
                    value={typeof value === "string" ? value : ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
    }
}
