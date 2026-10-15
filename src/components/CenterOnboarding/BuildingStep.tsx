import { Building2, Loader2, Ruler, Users, Camera, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedToggle, YesNoRow } from "./SegmentedToggle";
import { CustomFieldInput } from "./CustomFieldInput";
import type { BuildingOwnership } from "@/services/centerOnboardingService";
import type { FormFieldDefinition } from "@/types/formBuilder";

export interface BuildingFormState {
    buildingArea: string;
    buildingCapacity: string;
    buildingOwnership: BuildingOwnership | null;
    receptionAvailable: boolean | null;
    requiredSystemsAvailable: boolean | null;
    camerasAvailable: boolean | null;
    camerasInfo: string;
}

export type CustomFieldValues = Record<string, string | number | boolean>;

interface BuildingStepProps {
    value: BuildingFormState;
    onChange: (patch: Partial<BuildingFormState>) => void;
    fields: FormFieldDefinition[];
    customValues: CustomFieldValues;
    onCustomChange: (fieldId: string, value: string | number | boolean) => void;
    onSubmit: () => void;
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

export function BuildingStep({ value, onChange, fields, customValues, onCustomChange, onSubmit, loading }: BuildingStepProps) {
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
                            <h2 className="text-lg font-semibold text-[#183d34] tracking-tight">Building Verification</h2>
                            <p className="text-sm text-[#6d8474] mt-0.5">Tell us about the physical premises.</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 sm:px-8 py-6 sm:py-7 space-y-3.5">
                    <SectionLabel>Premises</SectionLabel>
                    {sortedFields.map((field) => {
                        if (field.kind === "NATIVE") {
                            switch (field.fieldKey) {
                                case "buildingArea":
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor="buildingArea" className="flex items-center gap-1.5 text-[#183d34]">
                                                <Ruler className="w-3.5 h-3.5 text-[#6d8474]" /> {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <Input
                                                id="buildingArea"
                                                type="number"
                                                min="0"
                                                className="h-11"
                                                placeholder="e.g. 2500"
                                                value={value.buildingArea}
                                                onChange={(e) => onChange({ buildingArea: e.target.value })}
                                            />
                                        </div>
                                    );
                                case "buildingCapacity":
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor="buildingCapacity" className="flex items-center gap-1.5 text-[#183d34]">
                                                <Users className="w-3.5 h-3.5 text-[#6d8474]" /> {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <Input
                                                id="buildingCapacity"
                                                type="number"
                                                min="0"
                                                className="h-11"
                                                placeholder="e.g. 50"
                                                value={value.buildingCapacity}
                                                onChange={(e) => onChange({ buildingCapacity: e.target.value })}
                                            />
                                        </div>
                                    );
                                case "buildingOwnership":
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <Label className="text-[#183d34]">
                                                {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <SegmentedToggle
                                                fullWidth
                                                options={[
                                                    { value: "RENTED" as BuildingOwnership, label: "Rented" },
                                                    { value: "OWNED" as BuildingOwnership, label: "Owned" },
                                                ]}
                                                value={value.buildingOwnership}
                                                onChange={(v) => onChange({ buildingOwnership: v })}
                                            />
                                        </div>
                                    );
                                case "receptionAvailable":
                                    return (
                                        <YesNoRow
                                            key={field.id}
                                            label={`${field.label}${field.required ? " *" : ""}`}
                                            description="Is there a functioning reception area?"
                                            value={value.receptionAvailable}
                                            onChange={(v) => onChange({ receptionAvailable: v })}
                                        />
                                    );
                                case "requiredSystemsAvailable":
                                    return (
                                        <YesNoRow
                                            key={field.id}
                                            label={`${field.label}${field.required ? " *" : ""}`}
                                            description="Are required utility/safety systems in place (power, water, fire safety, etc.)?"
                                            value={value.requiredSystemsAvailable}
                                            onChange={(v) => onChange({ requiredSystemsAvailable: v })}
                                        />
                                    );
                                case "camerasAvailable":
                                    return (
                                        <YesNoRow
                                            key={field.id}
                                            label={`${field.label}${field.required ? " *" : ""}`}
                                            description="Is the premises covered by CCTV?"
                                            value={value.camerasAvailable}
                                            onChange={(v) => onChange({ camerasAvailable: v })}
                                        />
                                    );
                                case "camerasInfo":
                                    if (!value.camerasAvailable) return null;
                                    return (
                                        <div key={field.id} className="space-y-2 pt-1">
                                            <Label htmlFor="camerasInfo" className="flex items-center gap-1.5 text-[#183d34]">
                                                <Camera className="w-3.5 h-3.5 text-[#6d8474]" /> {field.label}<RequiredMark required={field.required} />
                                            </Label>
                                            <Textarea
                                                id="camerasInfo"
                                                placeholder="e.g. 4 cameras covering entrance, reception and classrooms"
                                                value={value.camerasInfo}
                                                onChange={(e) => onChange({ camerasInfo: e.target.value })}
                                                rows={3}
                                            />
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

                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-1">
                    <Button
                        onClick={onSubmit}
                        disabled={loading}
                        className="w-full bg-[#164c3e] hover:bg-[#12382d] text-white gap-2 h-11 rounded-[10px] shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
