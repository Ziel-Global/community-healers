import { Building2, Loader2, Phone, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LocationPicker } from "@/components/LocationPicker";
import type { FormFieldDefinition } from "@/types/formBuilder";

export interface CenterInfoFormState {
    centerName: string;
    address: string;
    centerPhone: string;
    email: string;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
}

export type CustomFieldValues = Record<string, string | number | boolean>;

interface CenterInfoStepProps {
    value: CenterInfoFormState;
    onChange: (patch: Partial<CenterInfoFormState>) => void;
    onLocationChange: (lat: number, lng: number, geocodedAddress: string | null, detectedCity: string | null) => void;
    fields: FormFieldDefinition[];
    customValues: CustomFieldValues;
    onCustomChange: (fieldId: string, value: string | number | boolean) => void;
    onSubmit: () => void;
    onBack: () => void;
    loading: boolean;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">{children}</p>
    );
}

function RequiredMark({ required }: { required: boolean }) {
    return required ? <span className="text-[#b14c4c]"> *</span> : null;
}

/** Bureau-added field — one generic input per FormFieldType. */
function CustomFieldInput({
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

export function CenterInfoStep({
    value,
    onChange,
    onLocationChange,
    fields,
    customValues,
    onCustomChange,
    onSubmit,
    onBack,
    loading,
}: CenterInfoStepProps) {
    const sortedFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <Card className="border border-[#d5e0d4] rounded-2xl bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
            <CardContent className="p-0">
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-[#e7eee9]">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#174c3e] flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(23,76,62,0.22)]">
                            <Building2 className="w-5 h-5 text-[#d7f88c]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[#183d34] tracking-tight">Center Personal Information</h2>
                            <p className="text-sm text-[#6d8474] mt-0.5">Final step — how the ministry and candidates will find you.</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 sm:px-8 py-6 sm:py-7 space-y-5">
                    <SectionLabel>Center details</SectionLabel>
                    {sortedFields.map((field) => {
                        if (field.kind === "NATIVE") {
                            switch (field.fieldKey) {
                                case "centerName":
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor="centerName" className="text-[#183d34]">
                                                {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <Input
                                                id="centerName"
                                                className="h-11"
                                                value={value.centerName}
                                                onChange={(e) => onChange({ centerName: e.target.value })}
                                            />
                                        </div>
                                    );
                                case "centerPhone":
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor="centerPhone" className="flex items-center gap-1.5 text-[#183d34]">
                                                <Phone className="w-3.5 h-3.5 text-[#6d8474]" /> {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <Input
                                                id="centerPhone"
                                                className="h-11"
                                                inputMode="tel"
                                                placeholder="e.g. 021-1234567"
                                                value={value.centerPhone}
                                                onChange={(e) => onChange({ centerPhone: e.target.value })}
                                            />
                                        </div>
                                    );
                                case "address":
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor="address" className="text-[#183d34]">
                                                {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <Input
                                                id="address"
                                                className="h-11"
                                                value={value.address}
                                                onChange={(e) => onChange({ address: e.target.value })}
                                            />
                                        </div>
                                    );
                                case "email":
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-1.5 text-[#183d34]">
                                                <Mail className="w-3.5 h-3.5 text-[#6d8474]" /> {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className="h-11"
                                                placeholder="you@yourcenter.com"
                                                value={value.email}
                                                onChange={(e) => onChange({ email: e.target.value })}
                                            />
                                            <p className="text-xs text-[#6d8474]">
                                                Once approved, we'll email this address a link to set your center admin password.
                                            </p>
                                        </div>
                                    );
                                case "location":
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label className="text-[#183d34]">
                                                {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <LocationPicker latitude={value.latitude} longitude={value.longitude} onLocationChange={onLocationChange} />
                                        </div>
                                    );
                                default:
                                    return null;
                            }
                        }

                        return (
                            <div key={field.id} className="space-y-2">
                                <Label htmlFor={field.id} className="text-[#183d34]">
                                    {field.label}<RequiredMark required={field.required} />
                                </Label>
                                <CustomFieldInput
                                    field={field}
                                    value={customValues[field.id]}
                                    onChange={(v) => onCustomChange(field.id, v)}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            className="gap-2 sm:w-auto border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={loading}
                            className="flex-1 bg-[#164c3e] hover:bg-[#12382d] text-white gap-2 h-11 rounded-[10px] shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Submit Application
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
