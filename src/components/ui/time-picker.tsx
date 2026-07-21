import { useEffect, useRef, useState } from "react";
import { Clock, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimeLabel, toTimeInputValue } from "@/utils/time";

interface TimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const ITEM_H = 36;
const VISIBLE_ROWS = 4;
const COL_H = ITEM_H * VISIBLE_ROWS;

function parseToParts(value: string) {
  const hm = toTimeInputValue(value, "09:00");
  const [hStr, mStr] = hm.split(":");
  let hour24 = parseInt(hStr, 10);
  let minute = parseInt(mStr, 10);
  if (isNaN(hour24)) hour24 = 9;
  if (isNaN(minute)) minute = 0;

  minute = Math.round(minute / 5) * 5;
  if (minute === 60) {
    minute = 0;
    hour24 = (hour24 + 1) % 24;
  }

  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;

  return { hour12, minute, period };
}

function toValue24(hour12: number, minute: number, period: "AM" | "PM"): string {
  let hour24 = hour12 % 12;
  if (period === "PM") hour24 += 12;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function ColumnOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
      style={{ height: ITEM_H }}
      className={cn(
        "flex w-full shrink-0 items-center justify-center rounded-md text-[13px] font-semibold tabular-nums transition-colors duration-150",
        "hover:bg-primary/10 hover:text-primary",
        selected
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/80"
      )}
    >
      {label}
    </button>
  );
}

/** Scroll only when the picker opens — never jump when the user taps an option */
function ScrollColumn({
  children,
  selectedKey,
  open,
}: {
  children: React.ReactNode;
  selectedKey: string | number;
  open: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);

  useEffect(() => {
    if (!open) {
      didInitialScroll.current = false;
      return;
    }
    if (didInitialScroll.current) return;

    const root = ref.current;
    if (!root) return;
    const el = root.querySelector("[data-selected='true']") as HTMLElement | null;
    if (!el) return;

    didInitialScroll.current = true;
    const top = el.offsetTop;
    const bottom = top + ITEM_H;
    const viewTop = root.scrollTop;
    const viewBottom = viewTop + root.clientHeight;

    if (top < viewTop) {
      root.scrollTop = top;
    } else if (bottom > viewBottom) {
      root.scrollTop = bottom - root.clientHeight;
    }
  }, [open, selectedKey]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Same continuous scroll, just a bit slower (~55% speed)
      root.scrollTop += e.deltaY * 0.55;
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "w-14 overflow-y-auto overscroll-contain",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      )}
      style={{ height: COL_H }}
    >
      <div className="flex flex-col px-1">{children}</div>
    </div>
  );
}

export function TimePicker({ id, value, onChange, disabled, className }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const parts = parseToParts(value);
  const [hour12, setHour12] = useState(parts.hour12);
  const [minute, setMinute] = useState(parts.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(parts.period);

  useEffect(() => {
    if (!open) {
      const next = parseToParts(value);
      setHour12(next.hour12);
      setMinute(next.minute);
      setPeriod(next.period);
    }
  }, [value, open]);

  const apply = (h: number, m: number, p: "AM" | "PM") => {
    onChange(toValue24(h, m, p));
  };

  const display = formatTimeLabel(value, { fallback: "—" });

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-between rounded-xl border-border/60 bg-background/80 px-3.5 font-semibold",
            "hover:bg-background hover:border-primary/40 hover:shadow-sm",
            "focus-visible:ring-primary/30 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
            "disabled:opacity-50",
            className
          )}
        >
          <span className="flex items-center gap-2 text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </span>
            <span className="text-sm tracking-tight">{display}</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {open ? "Close" : "Change"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[260px] rounded-xl border-border/50 bg-card p-0 shadow-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border/40 px-3 py-2.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Select time
          </p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
            {formatTimeLabel(toValue24(hour12, minute, period))}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 px-2.5 py-2.5">
          <ScrollColumn selectedKey={hour12} open={open}>
            {HOURS_12.map((h) => (
              <div key={h} data-selected={h === hour12 ? "true" : undefined} style={{ height: ITEM_H }}>
                <ColumnOption
                  label={String(h).padStart(2, "0")}
                  selected={h === hour12}
                  onSelect={() => {
                    setHour12(h);
                    apply(h, minute, period);
                  }}
                />
              </div>
            ))}
          </ScrollColumn>

          <span className="text-sm font-light text-muted-foreground/50">:</span>

          <ScrollColumn selectedKey={minute} open={open}>
            {MINUTES.map((m) => (
              <div key={m} data-selected={m === minute ? "true" : undefined} style={{ height: ITEM_H }}>
                <ColumnOption
                  label={String(m).padStart(2, "0")}
                  selected={m === minute}
                  onSelect={() => {
                    setMinute(m);
                    apply(hour12, m, period);
                  }}
                />
              </div>
            ))}
          </ScrollColumn>

          <div className="ml-1 flex w-[58px] flex-col gap-1.5 self-center">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  apply(hour12, minute, p);
                }}
                className={cn(
                  "h-9 rounded-lg text-xs font-bold tracking-wide transition-colors duration-150",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/80 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 px-3 py-2">
          <p className="text-[10px] text-muted-foreground">5‑min steps</p>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 rounded-md px-3 text-xs"
            onClick={() => setOpen(false)}
          >
            <Check className="h-3 w-3" />
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
