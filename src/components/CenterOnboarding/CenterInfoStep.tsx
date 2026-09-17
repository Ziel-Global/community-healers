import { Building2, Loader2, Phone, Mail, ArrowLeft, CheckCircle2, ShieldQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationPicker } from "@/components/LocationPicker";
import { YesNoRow } from "./SegmentedToggle";

export interface CenterInfoFormState {
    centerName: string;
    address: string;
    centerPhone: string;
    email: string;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    isJointVenture: boolean;
    jointVentureLicenseNumber: string;
}

interface CenterInfoStepProps {
    value: CenterInfoFormState;
    onChange: (patch: Partial<CenterInfoFormState>) => void;
    onLocationChange: (lat: number, lng: number, geocodedAddress: string | null, detectedCity: string | null) => void;
    onSubmit: () => void;
    onBack: () => void;
    loading: boolean;
}

export function CenterInfoStep({ value, onChange, onLocationChange, onSubmit, onBack, loading }: CenterInfoStepProps) {
    return (
        <Card className="border-border/40 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Center Personal Information</h2>
                        <p className="text-sm text-muted-foreground">Final step — how the ministry and candidates will find you.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="centerName">Center Name</Label>
                        <Input id="centerName" value={value.centerName} onChange={(e) => onChange({ centerName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="centerPhone" className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Center Phone Number
                        </Label>
                        <Input
                            id="centerPhone"
                            inputMode="tel"
                            placeholder="e.g. 021-1234567"
                            value={value.centerPhone}
                            onChange={(e) => onChange({ centerPhone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={value.address} onChange={(e) => onChange({ address: e.target.value })} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Center Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@yourcenter.com"
                        value={value.email}
                        onChange={(e) => onChange({ email: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                        Once approved, we'll email this address a link to set your center admin password.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Location</Label>
                    <LocationPicker latitude={value.latitude} longitude={value.longitude} onLocationChange={onLocationChange} />
                </div>

                <div className="space-y-3">
                    <YesNoRow
                        label="Is this a Joint Venture?"
                        description="Two or more license holders operating this center together."
                        value={value.isJointVenture}
                        onChange={(v) => onChange({ isJointVenture: v })}
                    />
                    {value.isJointVenture && (
                        <div className="space-y-2 p-4 rounded-xl border border-primary/20 bg-primary/5">
                            <Label htmlFor="jvLicense" className="flex items-center gap-1.5">
                                <ShieldQuestion className="w-3.5 h-3.5 text-primary" /> Joint Venture License Number
                            </Label>
                            <Input
                                id="jvLicense"
                                value={value.jointVentureLicenseNumber}
                                onChange={(e) => onChange({ jointVentureLicenseNumber: e.target.value })}
                                placeholder="Enter the Joint Venture license number"
                            />
                            <p className="text-xs text-muted-foreground">
                                We'll check this isn't already registered to another center.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={onBack} className="gap-2 sm:w-auto">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button onClick={onSubmit} disabled={loading} className="flex-1 gradient-primary text-white gap-2 h-11">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Submit Application
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
