/** Normalize API times ("09:00:00", "09:00", ISO) to HH:mm for <input type="time"> */
export function toTimeInputValue(time?: string | null, fallback = "09:00"): string {
  if (!time) return fallback;
  if (time.includes("T")) {
    const d = new Date(time);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
  }
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

/** Format a time string for display (e.g. "09:00:00" → "9:00 AM") */
export function formatTimeLabel(
  time?: string | null,
  options?: { fallback?: string; datePart?: string }
): string {
  const fallback = options?.fallback ?? "—";
  if (!time) return fallback;

  if (/\b(AM|PM)\b/i.test(time)) return time;

  try {
    if (time.includes("T")) {
      const d = new Date(time);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      }
    }

    const hm = toTimeInputValue(time, "");
    if (!hm) return fallback;

    const datePart = (options?.datePart || new Date().toISOString()).split("T")[0];
    const d = new Date(`${datePart}T${hm}:00`);
    if (isNaN(d.getTime())) return time;
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return time;
  }
}

const PKT_OFFSET_MINUTES = 5 * 60;

function shiftHHMM(hhmm: string, deltaMinutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (((h * 60 + m + deltaMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Center training-hours ("HH:MM") are stored and computed server-side as
 * literal UTC wall-clock time — the server has no Pakistan-timezone
 * awareness, so "09:00" in the database has always actually meant 9 AM UTC
 * (2 PM PKT) when the backend builds real exam-start timestamps from it.
 * These convert only for display/input on the center-admin settings page,
 * so an admin can type and read genuine Pakistan hours while the stored
 * value (and everything the backend does with it) stays exactly as before.
 */
export function utcHHMMToPkt(hhmm: string): string {
  return shiftHHMM(hhmm, PKT_OFFSET_MINUTES);
}

export function pktHHMMToUtc(hhmm: string): string {
  return shiftHHMM(hhmm, -PKT_OFFSET_MINUTES);
}

export function isRepaymentRequiredMessage(message?: string): boolean {
  if (!message) return false;
  return /pay.*(again|exam fee)|repay|fee again|must pay/i.test(message);
}
