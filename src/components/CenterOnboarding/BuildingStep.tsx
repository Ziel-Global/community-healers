import { Building2, Loader2, Ruler, Users, Camera, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedToggle, YesNoRow } from "./SegmentedToggle";
import type { BuildingOwnership } from "@/services/centerOnboardingService";

export interface BuildingFormState {
    buildingArea: string;
    buildingCapacity: string;
    buildingOwnership: BuildingOwnership | null;
    receptionAvailable: boolean | null;
    requiredSystemsAvailable: boolean | null;
    camerasAvailable: boolean | null;
    camerasInfo: string;
}

interface BuildingStepProps {
    value: BuildingFormState;
    onChange: (patch: Partial<BuildingFormState>) => void;
    onSubmit: () => void;
    loading: boolean;
}

export function BuildingStep({ value, onChange, onSubmit, loading }: BuildingStepProps) {
    return (
        <Card className="border-border/40 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Building Verification</h2>
                        <p className="text-sm text-muted-foreground">Tell us about the physical premises.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="buildingArea" className="flex items-center gap-1.5">
                            <Ruler className="w-3.5 h-3.5 text-muted-foreground" /> Building Area (sq. ft.)
                        </Label>
                        <Input
                            id="buildingArea"
                            type="number"
                            min="0"
                            placeholder="e.g. 2500"
                            value={value.buildingArea}
                            onChange={(e) => onChange({ buildingArea: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buildingCapacity" className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" /> Building Capacity
                        </Label>
                        <Input
                            id="buildingCapacity"
                            type="number"
                            min="0"
                            placeholder="e.g. 50"
                            value={value.buildingCapacity}
                            onChange={(e) => onChange({ buildingCapacity: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Building Ownership</Label>
                    <SegmentedToggle
                        options={[
                            { value: "RENTED" as BuildingOwnership, label: "Rented" },
                            { value: "OWNED" as BuildingOwnership, label: "Owned" },
                        ]}
                        value={value.buildingOwnership}
                        onChange={(v) => onChange({ buildingOwnership: v })}
                    />
                </div>

                <div className="space-y-3">
                    <YesNoRow
                        label="Reception Availability"
                        description="Is there a functioning reception area?"
                        value={value.receptionAvailable}
                        onChange={(v) => onChange({ receptionAvailable: v })}
                    />
                    <YesNoRow
                        label="Required Systems"
                        description="Are required utility/safety systems in place (power, water, fire safety, etc.)?"
                        value={value.requiredSystemsAvailable}
                        onChange={(v) => onChange({ requiredSystemsAvailable: v })}
                    />
                    <YesNoRow
                        label="Cameras / CCTV"
                        description="Is the premises covered by CCTV?"
                        value={value.camerasAvailable}
                        onChange={(v) => onChange({ camerasAvailable: v })}
                    />
                </div>

                {value.camerasAvailable && (
                    <div className="space-y-2">
                        <Label htmlFor="camerasInfo" className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-muted-foreground" /> Camera / CCTV Information
                        </Label>
                        <Textarea
                            id="camerasInfo"
                            placeholder="e.g. 4 cameras covering entrance, reception and classrooms"
                            value={value.camerasInfo}
                            onChange={(e) => onChange({ camerasInfo: e.target.value })}
                            rows={3}
                        />
                    </div>
                )}

                <Button onClick={onSubmit} disabled={loading} className="w-full gradient-primary text-white gap-2 h-11">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Continue <ArrowRight className="w-4 h-4" />
                </Button>
            </CardContent>
        </Card>
    );
}
