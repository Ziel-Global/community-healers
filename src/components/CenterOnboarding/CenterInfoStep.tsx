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

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">{children}</p>
    );
}

export function CenterInfoStep({ value, onChange, onLocationChange, onSubmit, onBack, loading }: CenterInfoStepProps) {
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

                <div className="px-6 sm:px-8 py-6 sm:py-7 space-y-7">
                    <section className="space-y-3.5">
                        <SectionLabel>Contact details</SectionLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="centerName" className="text-[#183d34]">Center Name</Label>
                                <Input
                                    id="centerName"
                                    className="h-11"
                                    value={value.centerName}
                                    onChange={(e) => onChange({ centerName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="centerPhone" className="flex items-center gap-1.5 text-[#183d34]">
                                    <Phone className="w-3.5 h-3.5 text-[#6d8474]" /> Center Phone Number
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-[#183d34]">Address</Label>
                            <Input
                                id="address"
                                className="h-11"
                                value={value.address}
                                onChange={(e) => onChange({ address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-1.5 text-[#183d34]">
                                <Mail className="w-3.5 h-3.5 text-[#6d8474]" /> Center Email
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
                    </section>

                    <section className="space-y-3.5">
                        <SectionLabel>Map location</SectionLabel>
                        <LocationPicker latitude={value.latitude} longitude={value.longitude} onLocationChange={onLocationChange} />
                    </section>

                    <section className="space-y-3.5">
                        <SectionLabel>Joint venture</SectionLabel>
                        <YesNoRow
                            label="Is this a Joint Venture?"
                            description="Two or more license holders operating this center together."
                            value={value.isJointVenture}
                            onChange={(v) => onChange({ isJointVenture: v })}
                        />
                        {value.isJointVenture && (
                            <div className="space-y-2 p-4 rounded-xl border border-[#c9d6c8] bg-[#f4f7f3]">
                                <Label htmlFor="jvLicense" className="flex items-center gap-1.5 text-[#183d34]">
                                    <ShieldQuestion className="w-3.5 h-3.5 text-[#164c3e]" /> Joint Venture License Number
                                </Label>
                                <Input
                                    id="jvLicense"
                                    className="h-11"
                                    value={value.jointVentureLicenseNumber}
                                    onChange={(e) => onChange({ jointVentureLicenseNumber: e.target.value })}
                                    placeholder="Enter the Joint Venture license number"
                                />
                                <p className="text-xs text-[#6d8474]">
                                    We'll check this isn't already registered to another center.
                                </p>
                            </div>
                        )}
                    </section>
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
