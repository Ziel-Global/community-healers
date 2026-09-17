import { useRef } from "react";
import { Users, Plus, Trash2, Loader2, ArrowRight, ArrowLeft, FileCheck, Paperclip, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StaffCategory } from "@/services/centerOnboardingService";

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
    { value: "INSTRUCTOR", label: "Instructor" },
    { value: "STAFF", label: "Staff" },
    { value: "MAINTENANCE", label: "Maintenance" },
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

    const updateRow = (index: number, patch: Partial<StaffFormRow>) => {
        onRowsChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const addRow = () => {
        onRowsChange([...rows, { name: "", cnic: "", category: "STAFF", qualification: "" }]);
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
                            <p className="text-sm text-muted-foreground">Instructor, Staff and Maintenance CNICs are all required.</p>
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

                            <Input
                                placeholder="Qualification (e.g. MBA, Certified Trainer)"
                                value={row.qualification}
                                onChange={(e) => updateRow(index, { qualification: e.target.value })}
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
