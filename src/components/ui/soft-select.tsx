import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SoftSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SoftSelectProps = {
  value?: string;
  /** Pass empty string / undefined to show the placeholder. */
  onValueChange: (value: string) => void;
  options: SoftSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Trigger height — default 40px, lg is 44px (forms). */
  size?: "default" | "lg";
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  id?: string;
  name?: string;
};

/**
 * SoftSkills dropdown — greyish border trigger + matching menu panel.
 * Prefer this over wiring Select primitives by hand for simple option lists.
 */
export function SoftSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  disabled,
  size = "default",
  className,
  triggerClassName,
  contentClassName,
  id,
  name,
}: SoftSelectProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
    >
      <SelectTrigger
        id={id}
        className={cn(size === "lg" && "h-11", className, triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn("max-h-60", contentClassName)}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
