import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DashboardLayout } from "@/components/DashboardLayout";
import { directorOperationsNavItems } from "../DirectorOperationsPortal";
import {
  useBureauFormFields,
  useCreateFormField,
  useUpdateFormField,
  useDeleteFormField,
  useReorderFormFields,
} from "@/hooks/queries/useFormBuilderQueries";
import type { FormFieldDefinition, FormFieldType, FormKey } from "@/types/formBuilder";
import type { ChecklistCategory } from "@/types/checklistAdmin";
import { getApiErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Lock,
  Plus,
  Trash2,
  GripVertical,
  ClipboardList,
  Building2,
  ClipboardCheck,
  FileStack,
  EyeOff,
  Eye,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InspectionChecklistBuilder,
  INSPECTION_CATEGORIES,
} from "@/components/FormBuilder/InspectionChecklistBuilder";

type FormFamily = "CENTER_APPLICATION" | "INSPECTION";

const FORM_FAMILIES: {
  value: FormFamily;
  label: string;
  description: string;
  icon: typeof FileStack;
}[] = [
  {
    value: "CENTER_APPLICATION",
    label: "Center Application",
    description: "Fields applicants fill when applying to become a center",
    icon: FileStack,
  },
  {
    value: "INSPECTION",
    label: "Inspection Form",
    description: "One shared checklist: applicants see it as prerequisites before applying, committee members fill it on-site",
    icon: ClipboardCheck,
  },
];

const APPLICATION_CATEGORIES: {
  value: FormKey;
  label: string;
  title: string;
  hint: string;
  icon: typeof ClipboardList;
}[] = [
  {
    value: "CENTER_INFO",
    label: "Center Info",
    title: "Center Personal Information",
    hint: "This is the form applicants fill in. Drag fields to change their order.",
    icon: ClipboardList,
  },
  {
    value: "BUILDING_DETAILS",
    label: "Building Details",
    title: "Building Verification",
    hint: "This is the form applicants fill in. Drag fields to change their order.",
    icon: Building2,
  },
];

const FIELD_TYPE_LABEL: Record<FormFieldType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  BOOLEAN: "Yes / No",
  SELECT: "Dropdown",
  DATE: "Date",
};

function previewPlaceholder(field: FormFieldDefinition): string {
  if (field.kind === "CUSTOM") {
    switch (field.fieldType) {
      case "NUMBER":
        return "e.g. 10";
      case "DATE":
        return "Select a date";
      case "SELECT":
        return "Select…";
      case "BOOLEAN":
        return "Yes / No";
      default:
        return "Applicant answer";
    }
  }
  switch (field.fieldKey) {
    case "centerPhone":
      return "e.g. 021-1234567";
    case "email":
      return "center@example.com";
    case "buildingArea":
      return "e.g. 2500";
    case "buildingCapacity":
      return "e.g. 50";
    case "location":
      return "Map pin — applicants pick a location";
    case "buildingOwnership":
      return "Owned / Rented / Shared";
    default:
      return "Applicant answer";
  }
}

function FieldPreviewControl({ field }: { field: FormFieldDefinition }) {
  const placeholder = previewPlaceholder(field);

  if (
    field.fieldType === "BOOLEAN" ||
    field.fieldKey === "receptionAvailable" ||
    field.fieldKey === "requiredSystemsAvailable" ||
    field.fieldKey === "camerasAvailable"
  ) {
    return (
      <div className="h-11 px-3 rounded-md border border-[#c9d6c8] bg-[#f8faf7] flex items-center gap-3 text-sm text-[#6d8474]">
        <span className="inline-flex h-5 w-9 rounded-full bg-[#e7eee9]" />
        Yes / No
      </div>
    );
  }

  if (field.fieldType === "SELECT" || field.fieldKey === "buildingOwnership") {
    return (
      <div className="h-11 px-3 rounded-md border border-[#c9d6c8] bg-[#f8faf7] flex items-center justify-between text-sm text-[#6d8474]">
        <span>{placeholder}</span>
        <span className="text-xs">▾</span>
      </div>
    );
  }

  if (field.fieldKey === "location") {
    return (
      <div className="h-28 rounded-md border border-dashed border-[#c9d6c8] bg-[#f8faf7] flex items-center justify-center text-sm text-[#6d8474]">
        Map location picker
      </div>
    );
  }

  if (field.fieldKey === "camerasInfo") {
    return (
      <div className="min-h-[88px] rounded-md border border-[#c9d6c8] bg-[#f8faf7] px-3 py-2.5 text-sm text-[#6d8474]">
        Free-text details…
      </div>
    );
  }

  return (
    <Input
      disabled
      className="h-11 bg-[#f8faf7] border-[#c9d6c8] disabled:opacity-100 disabled:cursor-default"
      placeholder={placeholder}
    />
  );
}

function AddFieldDialog({ formKey }: { formKey: FormKey }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<FormFieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [optionsText, setOptionsText] = useState("");
  const createField = useCreateFormField(formKey);

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
    const options =
      fieldType === "SELECT"
        ? optionsText
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
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
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#164c3e] hover:bg-[#12382d] text-white rounded-[10px]">
          <Plus className="w-4 h-4" /> Add Field
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[16px] border-[#d5e0d4]">
        <DialogHeader>
          <DialogTitle className="font-display text-[#183d34]">
            Add a field to {APPLICATION_CATEGORIES.find((t) => t.value === formKey)?.label}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="field-label" className="text-[#183d34]">
              Label
            </Label>
            <Input
              id="field-label"
              className="h-11"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Fire extinguisher count"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#183d34]">Field type</Label>
            <Select value={fieldType} onValueChange={(v) => setFieldType(v as FormFieldType)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FIELD_TYPE_LABEL).map(([value, typeLabel]) => (
                  <SelectItem key={value} value={value}>
                    {typeLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fieldType === "SELECT" && (
            <div className="space-y-2">
              <Label htmlFor="field-options" className="text-[#183d34]">
                Options (comma-separated)
              </Label>
              <Input
                id="field-options"
                className="h-11"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="e.g. Owned, Rented, Shared"
              />
            </div>
          )}
          <div className="flex items-center justify-between rounded-[12px] border border-[#e7eee9] bg-[#f4f7f3] p-3">
            <Label htmlFor="field-required" className="text-[#183d34]">
              Required
            </Label>
            <Switch id="field-required" checked={required} onCheckedChange={setRequired} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-[9px] border-[#c9d6c8]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createField.isPending}
            className="rounded-[9px] bg-[#164c3e] hover:bg-[#12382d] text-white"
          >
            {createField.isPending ? "Adding…" : "Add Field"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortableFieldCard({
  field,
  formKey,
}: {
  field: FormFieldDefinition;
  formKey: FormKey;
}) {
  const updateField = useUpdateFormField(formKey);
  const deleteField = useDeleteFormField(formKey);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = (patch: { required?: boolean; visible?: boolean }) => {
    updateField.mutate(
      { id: field.id, payload: patch },
      { onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update field")) }
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-[14px] border bg-white transition-shadow",
        isDragging
          ? "border-[#164c3e] shadow-[0_16px_40px_rgba(22,76,62,0.18)] z-20 relative opacity-95"
          : "border-[#e7eee9] hover:border-[#c9d6c8]",
        !field.visible && "bg-[#f8faf7]/80 opacity-70"
      )}
    >
      <div className="flex gap-3 p-4 sm:p-5">
        <button
          type="button"
          className="mt-1 shrink-0 h-9 w-8 rounded-lg border border-[#e7eee9] bg-[#f4f7f3] text-[#6d8474] hover:text-[#183d34] hover:border-[#c9d6c8] cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
          aria-label={`Drag to reorder ${field.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <Label className="text-[#183d34] text-sm font-medium">
                {field.label}
                {field.required && <span className="text-[#b14c4c]"> *</span>}
              </Label>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {!field.visible && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#9a7b3c] bg-[#fff8ee] border border-amber-200/70 rounded-full px-2 py-0.5">
                    <EyeOff className="w-3 h-3" /> Hidden
                  </span>
                )}
                {field.locked && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#6d8474] bg-[#f4f7f3] border border-[#e7eee9] rounded-full px-2 py-0.5">
                    <Lock className="w-3 h-3" /> System
                  </span>
                )}
                {field.kind === "NATIVE" && !field.locked && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#6d8474] bg-[#f4f7f3] border border-[#e7eee9] rounded-full px-2 py-0.5">
                    Built-in
                  </span>
                )}
                {field.kind === "CUSTOM" && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#426f36] bg-[#eef6df] border border-[#d5e8c4] rounded-full px-2 py-0.5">
                    {field.fieldType ? FIELD_TYPE_LABEL[field.fieldType] : "Custom"}
                  </span>
                )}
              </div>
            </div>

            {field.kind === "CUSTOM" && (
              <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#b14c4c] hover:bg-red-50 shrink-0"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove &quot;{field.label}&quot;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This field will no longer appear on the applicant form. Answers already submitted
                      for it are kept on existing applications.
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

          <FieldPreviewControl field={field} />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            <div className="flex items-center gap-2">
              <Switch
                id={`${field.id}-required`}
                checked={field.required}
                disabled={field.locked}
                onCheckedChange={(checked) => handleToggle({ required: checked })}
              />
              <Label htmlFor={`${field.id}-required`} className="text-xs text-[#6d8474] cursor-pointer">
                Required
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`${field.id}-visible`}
                checked={field.visible}
                disabled={field.locked}
                onCheckedChange={(checked) => handleToggle({ visible: checked })}
              />
              <Label
                htmlFor={`${field.id}-visible`}
                className="text-xs text-[#6d8474] cursor-pointer inline-flex items-center gap-1"
              >
                {field.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                Show on form
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationFieldsBuilder({ formKey }: { formKey: FormKey }) {
  const { data: fields, isLoading } = useBureauFormFields(formKey);
  const reorderFields = useReorderFormFields(formKey);
  const category = APPLICATION_CATEGORIES.find((c) => c.value === formKey) ?? APPLICATION_CATEGORIES[0];
  const CategoryIcon = category.icon;

  const serverSorted = useMemo(
    () => [...(fields ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [fields]
  );
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  useEffect(() => {
    setOrderedIds(serverSorted.map((f) => f.id));
  }, [serverSorted]);

  const orderedFields = useMemo(() => {
    const byId = new Map(serverSorted.map((f) => [f.id, f]));
    return orderedIds.map((id) => byId.get(id)).filter(Boolean) as FormFieldDefinition[];
  }, [orderedIds, serverSorted]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(next);
    reorderFields.mutate(next, {
      onError: (error) => {
        setOrderedIds(serverSorted.map((f) => f.id));
        toast.error(getApiErrorMessage(error, "Failed to reorder fields"));
      },
    });
  };

  return (
    <div className="rounded-2xl border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
      <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-[#e7eee9] flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#174c3e] flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(23,76,62,0.22)]">
            <CategoryIcon className="w-5 h-5 text-[#d7f88c]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#183d34] tracking-tight">{category.title}</h2>
            <p className="text-sm text-[#6d8474] mt-0.5">{category.hint}</p>
          </div>
        </div>
        <AddFieldDialog formKey={formKey} />
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[14px] border border-[#e7eee9] p-5 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))
        ) : orderedFields.length === 0 ? (
          <p className="text-sm text-[#6d8474] text-center py-10">No fields yet. Add one to get started.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              {orderedFields.map((field) => (
                <SortableFieldCard key={field.id} field={field} formKey={formKey} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

export default function FormBuilderPage() {
  const [formFamily, setFormFamily] = useState<FormFamily>("CENTER_APPLICATION");
  const [applicationCategory, setApplicationCategory] = useState<FormKey>("CENTER_INFO");
  const [inspectionCategory, setInspectionCategory] =
    useState<ChecklistCategory>("OPERATIONS_COMPLIANCE");

  const activeFamily = FORM_FAMILIES.find((f) => f.value === formFamily) ?? FORM_FAMILIES[0];

  return (
    <DashboardLayout
      title="Form Builder"
      subtitle="Choose a form type, then a category — drag to reorder"
      portalType="director-operations"
      navItems={directorOperationsNavItems}
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Step 1 — Form type */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d8474]">
              1 · Form type
            </span>
            <ChevronRight className="w-3 h-3 text-[#c9d6c8]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c9d6c8]">
              2 · Category
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FORM_FAMILIES.map(({ value, label, description, icon: Icon }) => {
              const selected = formFamily === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormFamily(value)}
                  className={cn(
                    "text-left rounded-[16px] border p-4 transition-all",
                    selected
                      ? "border-[#164c3e] bg-white shadow-[0_10px_28px_rgba(22,76,62,0.12)] ring-1 ring-[#164c3e]/20"
                      : "border-[#e7eee9] bg-white/70 hover:border-[#c9d6c8] hover:bg-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        selected ? "bg-[#174c3e]" : "bg-[#e8f0ea]"
                      )}
                    >
                      <Icon
                        className={cn("w-5 h-5", selected ? "text-[#d7f88c]" : "text-[#164c3e]")}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#183d34]">{label}</p>
                      <p className="text-xs text-[#6d8474] mt-0.5 leading-relaxed">{description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — Category */}
        <section className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d8474] px-0.5">
            2 · {activeFamily.label} categories
          </p>

          {formFamily === "CENTER_APPLICATION" ? (
            <div className="flex flex-wrap gap-2 p-1.5 rounded-[14px] bg-[#eef2ec] border border-[#e7eee9]">
              {APPLICATION_CATEGORIES.map(({ value, label, icon: Icon }) => {
                const selected = applicationCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setApplicationCategory(value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-sm font-medium transition-all",
                      selected
                        ? "bg-white text-[#183d34] shadow-sm border border-[#d5e0d4]"
                        : "text-[#6d8474] hover:text-[#183d34]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-1.5 rounded-[14px] bg-[#eef2ec] border border-[#e7eee9]">
              {INSPECTION_CATEGORIES.map(({ value, label, icon: Icon }) => {
                const selected = inspectionCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setInspectionCategory(value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-sm font-medium transition-all",
                      selected
                        ? "bg-white text-[#183d34] shadow-sm border border-[#d5e0d4]"
                        : "text-[#6d8474] hover:text-[#183d34]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Content */}
        {formFamily === "CENTER_APPLICATION" ? (
          <ApplicationFieldsBuilder formKey={applicationCategory} />
        ) : (
          <InspectionChecklistBuilder category={inspectionCategory} />
        )}
      </div>
    </DashboardLayout>
  );
}
