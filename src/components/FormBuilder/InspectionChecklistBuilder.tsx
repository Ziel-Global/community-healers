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
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ClipboardList, Building2, Users, Plus, GripVertical, Camera, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/errors";
import { checklistAdminService } from "@/services/checklistAdminService";
import {
  checklistAdminKeys,
  useChecklistItems,
  useCreateChecklistItem,
  useUpdateChecklistItem,
} from "@/hooks/queries/useChecklistAdminQueries";
import type { AdminChecklistItem, ChecklistCategory } from "@/types/checklistAdmin";

export const INSPECTION_CATEGORIES: {
  value: ChecklistCategory;
  label: string;
  description: string;
  icon: typeof ClipboardList;
}[] = [
  {
    value: "OPERATIONS_COMPLIANCE",
    label: "Operations & Compliance",
    description: "Policies, records, and operational readiness",
    icon: ClipboardList,
  },
  {
    value: "BUILDING_FACILITIES",
    label: "Building & Facilities",
    description: "Premises, safety equipment, and infrastructure",
    icon: Building2,
  },
  {
    value: "STAFF_TRAINERS",
    label: "Staff & Trainers",
    description: "Personnel qualifications and training capacity",
    icon: Users,
  },
];

function AddChecklistItemDialog({
  category,
  categoryLabel,
}: {
  category: ChecklistCategory;
  categoryLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const createItem = useCreateChecklistItem();

  const reset = () => {
    setLabel("");
    setDescription("");
    setRequiresPhoto(false);
  };

  const handleSubmit = () => {
    if (!label.trim()) {
      toast.error("Give the item a label");
      return;
    }
    createItem.mutate(
      { label: label.trim(), description: description.trim() || undefined, category, requiresPhoto },
      {
        onSuccess: () => {
          toast.success("Checklist item added");
          reset();
          setOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Failed to add checklist item")),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-[#164c3e] hover:bg-[#12382d] text-white rounded-[9px]"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[16px] border-[#d5e0d4]">
        <DialogHeader>
          <DialogTitle className="text-[#183d34]">Add an item to {categoryLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="item-label" className="text-[#183d34]">
              Label
            </Label>
            <Input
              id="item-label"
              className="h-11"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Fire extinguisher present"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-description" className="text-[#183d34]">
              Description (optional)
            </Label>
            <Textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What the committee member should check for"
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between rounded-[12px] border border-[#e7eee9] bg-[#f4f7f3] p-3">
            <Label htmlFor="item-photo" className="text-[#183d34] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#6d8474]" /> Requires photo
            </Label>
            <Switch id="item-photo" checked={requiresPhoto} onCheckedChange={setRequiresPhoto} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-[9px] border-[#c9d6c8]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createItem.isPending}
            className="rounded-[9px] bg-[#164c3e] hover:bg-[#12382d] text-white"
          >
            {createItem.isPending ? "Adding…" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortableChecklistItemCard({ item }: { item: AdminChecklistItem }) {
  const updateItem = useUpdateChecklistItem();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleToggleActive = (active: boolean) => {
    updateItem.mutate(
      { id: item.id, payload: { active } },
      { onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update checklist item")) }
    );
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
        !item.active && "bg-[#f8faf7]/80 opacity-70"
      )}
    >
      <div className="flex gap-3 p-4">
        <button
          type="button"
          className="mt-0.5 shrink-0 h-9 w-8 rounded-lg border border-[#e7eee9] bg-[#f4f7f3] text-[#6d8474] hover:text-[#183d34] hover:border-[#c9d6c8] cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
          aria-label={`Drag to reorder ${item.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#183d34]">{item.label}</p>
              {item.description && <p className="text-xs text-[#6d8474] mt-0.5">{item.description}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {item.requiresPhoto && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#426f36] bg-[#eef6df] border border-[#d5e8c4] rounded-full px-2 py-0.5">
                  <Camera className="w-3 h-3" /> Photo
                </span>
              )}
              {!item.active && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#9a7b3c] bg-[#fff8ee] border border-amber-200/70 rounded-full px-2 py-0.5">
                  <EyeOff className="w-3 h-3" /> Hidden
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Switch checked={item.active} onCheckedChange={handleToggleActive} id={`${item.id}-active`} />
            <Label htmlFor={`${item.id}-active`} className="text-xs text-[#6d8474] cursor-pointer">
              Show on checklist
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One inspection category at a time — items for that section of the checklist.
 * Category switching lives in FormBuilderPage (form type → category).
 */
export function InspectionChecklistBuilder({ category }: { category: ChecklistCategory }) {
  const { data: allItems, isLoading } = useChecklistItems();
  const queryClient = useQueryClient();
  const meta = INSPECTION_CATEGORIES.find((c) => c.value === category) ?? INSPECTION_CATEGORIES[0];
  const Icon = meta.icon;

  const categoryItems = useMemo(
    () => (allItems ?? []).filter((item) => item.category === category),
    [allItems, category]
  );
  const serverSorted = useMemo(
    () => [...categoryItems].sort((a, b) => a.sortOrder - b.sortOrder),
    [categoryItems]
  );
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  useEffect(() => {
    setOrderedIds(serverSorted.map((i) => i.id));
  }, [serverSorted]);

  const orderedItems = useMemo(() => {
    const byId = new Map(serverSorted.map((i) => [i.id, i]));
    return orderedIds.map((id) => byId.get(id)).filter(Boolean) as AdminChecklistItem[];
  }, [orderedIds, serverSorted]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(next);

    try {
      await Promise.all(next.map((id, index) => checklistAdminService.updateItem(id, { sortOrder: index })));
      queryClient.invalidateQueries({ queryKey: checklistAdminKeys.list() });
    } catch (error) {
      setOrderedIds(serverSorted.map((i) => i.id));
      toast.error(getApiErrorMessage(error, "Failed to reorder checklist items"));
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#e7eee9] p-6 space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
      <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-[#e7eee9] flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#174c3e] flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(23,76,62,0.22)]">
            <Icon className="w-5 h-5 text-[#d7f88c]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-[#183d34] tracking-tight">{meta.label}</h2>
              <span className="text-[11px] text-[#6d8474] font-semibold bg-[#f4f7f3] border border-[#c9d6c8] rounded-full min-w-[28px] text-center px-1.5 py-0.5">
                {categoryItems.length}
              </span>
            </div>
            <p className="text-sm text-[#6d8474] mt-0.5">
              {meta.description}. Drag items to reorder.
            </p>
          </div>
        </div>
        <AddChecklistItemDialog category={category} categoryLabel={meta.label} />
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-3">
        {orderedItems.length === 0 ? (
          <p className="text-sm text-[#6d8474] text-center py-10">No items yet in this category. Add one to get started.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              {orderedItems.map((item) => (
                <SortableChecklistItemCard key={item.id} item={item} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
