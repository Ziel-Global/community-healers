import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { directorOperationsNavItems } from "../DirectorOperationsPortal";
import {
    useBureauFormFields,
    useCreateFormField,
    useUpdateFormField,
    useDeleteFormField,
    useReorderFormFields,
} from "@/hooks/queries/useFormBuilderQueries";
import type { FormFieldDefinition, FormFieldType } from "@/types/formBuilder";
import { getApiErrorMessage } from "@/lib/errors";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, Lock, Plus, Trash2, GripVertical } from "lucide-react";

const FORM_KEY = "CENTER_INFO" as const;

const FIELD_TYPE_LABEL: Record<FormFieldType, string> = {
    TEXT: "Text",
    NUMBER: "Number",
    BOOLEAN: "Yes / No",
    SELECT: "Dropdown",
    DATE: "Date",
};

function AddFieldDialog() {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState("");
    const [fieldType, setFieldType] = useState<FormFieldType>("TEXT");
    const [required, setRequired] = useState(false);
    const [optionsText, setOptionsText] = useState("");
    const createField = useCreateFormField(FORM_KEY);

    const reset = () => {
        setLabel("");
        setFieldType("TEXT");
        setRequired(false);
        setOptionsText("");
    };

    const handleSubmit = () => {
        if (!label.trim()) {
            toast.error("Give the field a label");
            return;
        }
        const options = fieldType === "SELECT"
            ? optionsText.split(",").map((o) => o.trim()).filter(Boolean)
            : undefined;
        if (fieldType === "SELECT" && (!options || options.length === 0)) {
            toast.error("A dropdown field needs at least one option");
            return;
        }

        createField.mutate(
            { label: label.trim(), fieldType, required, options },
            {
                onSuccess: () => {
                    toast.success("Field added");
                    reset();
                    setOpen(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error, "Failed to add field")),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Add Field
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a field to Center Info</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="field-label">Label</Label>
                        <Input id="field-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Fire extinguisher count" />
                    </div>
                    <div className="space-y-2">
                        <Label>Field type</Label>
                        <Select value={fieldType} onValueChange={(v) => setFieldType(v as FormFieldType)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(FIELD_TYPE_LABEL).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {fieldType === "SELECT" && (
                        <div className="space-y-2">
                            <Label htmlFor="field-options">Options (comma-separated)</Label>
                            <Input
                                id="field-options"
                                value={optionsText}
                                onChange={(e) => setOptionsText(e.target.value)}
                                placeholder="e.g. Owned, Rented, Shared"
                            />
                        </div>
                    )}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="field-required">Required</Label>
                        <Switch id="field-required" checked={required} onCheckedChange={setRequired} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={createField.isPending}>
                        {createField.isPending ? "Adding…" : "Add Field"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FieldRow({
    field,
    isFirst,
    isLast,
    onMove,
}: {
    field: FormFieldDefinition;
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: "up" | "down") => void;
}) {
    const updateField = useUpdateFormField(FORM_KEY);
    const deleteField = useDeleteFormField(FORM_KEY);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleToggle = (patch: { required?: boolean; visible?: boolean }) => {
        updateField.mutate(
            { id: field.id, payload: patch },
            { onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update field")) },
        );
    };

    const handleDelete = () => {
        deleteField.mutate(field.id, {
            onSuccess: () => toast.success("Field removed"),
            onError: (error) => toast.error(getApiErrorMessage(error, "Failed to remove field")),
        });
        setConfirmDelete(false);
    };

    return (
        <div className="p-4 flex items-center gap-3">
            <div className="flex flex-col shrink-0">
                <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => onMove("up")}
                    className="disabled:opacity-20 text-muted-foreground hover:text-foreground"
                    aria-label="Move up"
                >
                    <ChevronUp className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    disabled={isLast}
                    onClick={() => onMove("down")}
                    className="disabled:opacity-20 text-muted-foreground hover:text-foreground"
                    aria-label="Move down"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{field.label}</span>
                    {field.locked && (
                        <Badge variant="outline" className="gap-1 text-[10px] uppercase font-bold">
                            <Lock className="w-3 h-3" /> System field
                        </Badge>
                    )}
                    {field.kind === "NATIVE" && !field.locked && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">Built-in</Badge>
                    )}
                    {field.kind === "CUSTOM" && (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                            {field.fieldType ? FIELD_TYPE_LABEL[field.fieldType] : "Custom"}
                        </Badge>
                    )}
                </div>
                {field.kind === "CUSTOM" && field.options && (
                    <p className="text-xs text-muted-foreground mt-1">Options: {field.options.join(", ")}</p>
                )}
            </div>

            <div className="flex items-center gap-5 shrink-0">
                <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Required</Label>
                    <Switch
                        checked={field.required}
                        disabled={field.locked}
                        onCheckedChange={(checked) => handleToggle({ required: checked })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Visible</Label>
                    <Switch
                        checked={field.visible}
                        disabled={field.locked}
                        onCheckedChange={(checked) => handleToggle({ visible: checked })}
                    />
                </div>
                {field.kind === "CUSTOM" && (
                    <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove "{field.label}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This field will no longer appear on the Center Info form. Any answers already submitted for it are kept on existing applications.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}

export default function FormBuilderPage() {
    const { data: fields, isLoading } = useBureauFormFields(FORM_KEY);
    const reorderFields = useReorderFormFields(FORM_KEY);

    const sorted = [...(fields ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

    const handleMove = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sorted.length) return;
        const reordered = [...sorted];
        [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
        reorderFields.mutate(
            reordered.map((f) => f.id),
            { onError: (error) => toast.error(getApiErrorMessage(error, "Failed to reorder fields")) },
        );
    };

    return (
        <DashboardLayout
            title="Form Builder"
            subtitle="Center Info — add, hide, require, and reorder fields on the applicant's form"
            portalType="director-operations"
            navItems={directorOperationsNavItems}
        >
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex justify-end">
                    <AddFieldDialog />
                </div>

                <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-0 divide-y divide-border/30">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-4 flex items-center gap-4">
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            ))
                        ) : (
                            sorted.map((field, index) => (
                                <FieldRow
                                    key={field.id}
                                    field={field}
                                    isFirst={index === 0}
                                    isLast={index === sorted.length - 1}
                                    onMove={(direction) => handleMove(index, direction)}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
