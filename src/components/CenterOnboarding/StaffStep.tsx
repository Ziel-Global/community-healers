import { useEffect, useRef, useState } from "react";
import { Users, Plus, Trash2, Loader2, ArrowRight, ArrowLeft, FileCheck, Paperclip, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { centerOnboardingService, type StaffCategory, type StaffQualificationOption } from "@/services/centerOnboardingService";

export interface StaffFormRow {
    /** Present once this row has been persisted — needed before a document can be attached. */
    id?: string;
    name: string;
    cnic: string;
    category: StaffCategory;
    qualification: string;
    documentObjectKey?: string | null;
}

const STAFF_CATEGORIES: { value: StaffCategory; label: string }[] = [
    { value: "PRINCIPAL", label: "Principal" },
    { value: "MODERATOR", label: "Moderator" },
    { value: "TRAINER", label: "Trainer" },
    { value: "PSYCHIATRIST", label: "Psychiatrist" },
    { value: "ADMIN_SUPPORT", label: "Admin & Support Staff" },
    { value: "ACCOUNTS", label: "Accounts Staff" },
    { value: "IT_SUPPORT", label: "IT Support Staff" },
    { value: "SECURITY_OFFICER", label: "Security Officer" },
    { value: "SECURITY_GUARD", label: "Security Guard" },
    { value: "KITCHEN_STAFF", label: "Kitchen Staff" },
    { value: "CLEANING_STAFF", label: "Cleaning Staff" },
    { value: "RECEPTIONIST", label: "Receptionist" },
    { value: "MEDICAL_PRACTITIONER", label: "Male Nurse / Medical Practitioner" },
    { value: "HELPLINE_DESK", label: "Helpline Desk" },
];

interface StaffStepProps {
    rows: StaffFormRow[];
    onRowsChange: (rows: StaffFormRow[]) => void;
    onSaveRoster: () => void;
    onUploadDocument: (index: number, file: File) => void;
    onContinue: () => void;
    onBack: () => void;
    saving: boolean;
    uploadingIndex: number | null;
    /** True once `rows` matches what's actually persisted on the server (no unsaved edits). */
    rosterSaved: boolean;
}

export function StaffStep({
    rows,
    onRowsChange,
    onSaveRoster,
    onUploadDocument,
    onContinue,
    onBack,
    saving,
    uploadingIndex,
    rosterSaved,
}: StaffStepProps) {
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const [qualifications, setQualifications] = useState<StaffQualificationOption[]>([]);
    const [qualificationsLoading, setQualificationsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        centerOnboardingService
            .getStaffQualifications()
            .then((options) => {
                if (!cancelled) setQualifications(Array.isArray(options) ? options : []);
            })
            .catch((error) => {
                if (!cancelled) toast.error(getApiErrorMessage(error, "Failed to load qualifications"));
            })
            .finally(() => {
                if (!cancelled) setQualificationsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const optionsForRow = (qualification: string) => {
        if (qualification && !qualifications.some((option) => option.value === qualification)) {
            return [{ value: qualification, label: qualification }, ...qualifications];
        }
        return qualifications;
    };

    const updateRow = (index: number, patch: Partial<StaffFormRow>) => {
        onRowsChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const addRow = () => {
        onRowsChange([...rows, { name: "", cnic: "", category: "TRAINER", qualification: "" }]);
    };

    const removeRow = (index: number) => {
        onRowsChange(rows.filter((_, i) => i !== index));
    };

    return (
        <Card className="border-border/40 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Staff Information</h2>
                            <p className="text-sm text-muted-foreground">Add every staff member with their role and CNIC.</p>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5 shrink-0">
                        <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                </div>

                <div className="space-y-3">
                    {rows.map((row, index) => (
                        <div key={index} className="p-4 rounded-xl border border-border/40 bg-secondary/10 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-2">
                                <Input
                                    placeholder="Name"
                                    value={row.name}
                                    onChange={(e) => updateRow(index, { name: e.target.value })}
                                />
                                <Input
                                    placeholder="CNIC (13 digits)"
                                    inputMode="numeric"
                                    maxLength={13}
                                    value={row.cnic}
                                    onChange={(e) => updateRow(index, { cnic: e.target.value.replace(/\D/g, "") })}
                                />
                                <Select
                                    value={row.category}
                                    onValueChange={(v) => updateRow(index, { category: v as StaffCategory })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STAFF_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={rows.length === 1}
                                    onClick={() => removeRow(index)}
                                    className="shrink-0"
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>

                            <Select
                                value={row.qualification || undefined}
                                onValueChange={(value) => updateRow(index, { qualification: value })}
                                disabled={qualificationsLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select qualification" />
                                </SelectTrigger>
                                <SelectContent className="max-h-48 overflow-y-auto [&_[data-radix-select-viewport]]:max-h-44 [&_[data-radix-select-viewport]]:min-h-0 [&_[data-radix-select-viewport]]:overflow-y-scroll [&_[data-radix-select-viewport]]:[scrollbar-width:thin!important] [&_[data-radix-select-viewport]::-webkit-scrollbar]:!block [&_[data-radix-select-viewport]::-webkit-scrollbar]:w-2">
                                    {optionsForRow(row.qualification).map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {row.id && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="hidden"
                                        ref={(el) => (fileInputRefs.current[index] = el)}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = "";
                                            if (file) onUploadDocument(index, file);
                                        }}
                                    />
                                    {row.documentObjectKey ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                            <FileCheck className="w-3.5 h-3.5" /> Document attached
                                        </span>
                                    ) : null}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 gap-1.5 text-xs"
                                        disabled={uploadingIndex === index}
                                        onClick={() => fileInputRefs.current[index]?.click()}
                                    >
                                        {uploadingIndex === index ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Paperclip className="w-3 h-3" />
                                        )}
                                        {row.documentObjectKey ? "Replace document" : "Attach supporting document"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={onBack} className="gap-2 sm:w-auto">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    {!rosterSaved ? (
                        <Button onClick={onSaveRoster} disabled={saving} className="flex-1 gradient-primary text-white gap-2 h-11">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Staff Roster
                        </Button>
                    ) : (
                        <Button onClick={onContinue} className="flex-1 gradient-primary text-white gap-2 h-11">
                            Continue <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                {!rosterSaved && (
                    <p className="text-xs text-muted-foreground text-center -mt-2">
                        Save the roster to unlock document attachments, then continue.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
