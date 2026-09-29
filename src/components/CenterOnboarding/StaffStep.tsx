import { useEffect, useRef, useState } from "react";
import { Users, Plus, Trash2, Loader2, ArrowRight, ArrowLeft, FileCheck, Paperclip, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SoftSelect } from "@/components/ui/soft-select";
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

const HIDDEN_QUALIFICATION_VALUES = new Set(["PRIMARY", "MIDDLE", "MATRIC"]);

const isHiddenQualification = (option: StaffQualificationOption) =>
    HIDDEN_QUALIFICATION_VALUES.has(option.value) ||
    /\bgrade\s*(5|8|10)\b/i.test(option.label);

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
                if (!cancelled) {
                    const list = Array.isArray(options) ? options : [];
                    setQualifications(list.filter((option) => !isHiddenQualification(option)));
                }
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
        if (
            qualification &&
            !HIDDEN_QUALIFICATION_VALUES.has(qualification) &&
            !qualifications.some((option) => option.value === qualification)
        ) {
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
        <Card className="border border-[#d5e0d4] rounded-2xl bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
            <CardContent className="p-0">
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-[#e7eee9]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-[#174c3e] flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(23,76,62,0.22)]">
                                <Users className="w-5 h-5 text-[#d7f88c]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[#183d34] tracking-tight">Staff Information</h2>
                                <p className="text-sm text-[#6d8474] mt-0.5">Add every staff member with their role and CNIC.</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addRow}
                            className="gap-1.5 shrink-0 border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add
                        </Button>
                    </div>
                </div>

                <div className="px-6 sm:px-8 py-6 sm:py-7 space-y-3">
                    {rows.map((row, index) => (
                        <div key={index} className="p-4 rounded-xl border border-[#c9d6c8] bg-[#f8faf7] space-y-3 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-2.5">
                                <Input
                                    className="h-11"
                                    placeholder="Name"
                                    value={row.name}
                                    onChange={(e) => updateRow(index, { name: e.target.value })}
                                />
                                <Input
                                    className="h-11"
                                    placeholder="CNIC (13 digits)"
                                    inputMode="numeric"
                                    maxLength={13}
                                    value={row.cnic}
                                    onChange={(e) => updateRow(index, { cnic: e.target.value.replace(/\D/g, "") })}
                                />
                                <SoftSelect
                                    size="lg"
                                    value={row.category}
                                    onValueChange={(v) => updateRow(index, { category: v as StaffCategory })}
                                    options={STAFF_CATEGORIES}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={rows.length === 1}
                                    onClick={() => removeRow(index)}
                                    className="shrink-0 h-11 w-11"
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>

                            <SoftSelect
                                size="lg"
                                value={row.qualification || undefined}
                                onValueChange={(value) => updateRow(index, { qualification: value })}
                                disabled={qualificationsLoading}
                                placeholder="Select qualification"
                                options={optionsForRow(row.qualification)}
                            />

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

                <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            className="gap-2 sm:w-auto border-[#c9d6c8] text-[#183d34] hover:bg-[#f4f7f3]"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Button>
                        {!rosterSaved ? (
                            <Button
                                onClick={onSaveRoster}
                                disabled={saving}
                                className="flex-1 bg-[#164c3e] hover:bg-[#12382d] text-white gap-2 h-11 rounded-[10px] shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Staff Roster
                            </Button>
                        ) : (
                            <Button
                                onClick={onContinue}
                                className="flex-1 bg-[#164c3e] hover:bg-[#12382d] text-white gap-2 h-11 rounded-[10px] shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    {!rosterSaved && (
                        <p className="text-xs text-[#6d8474] text-center">
                            Save the roster to unlock document attachments, then continue.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
