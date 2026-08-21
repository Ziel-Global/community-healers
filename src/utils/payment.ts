/** Normalize bank QR payload to a browser-usable data URI. */
export function toQrImageSrc(qrCodeBase64: string | null | undefined): string | null {
  if (!qrCodeBase64) return null;

  const trimmed = qrCodeBase64.trim();
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  return `data:image/png;base64,${trimmed}`;
}

export function formatPaymentAmount(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return amount.toLocaleString("en-PK");
}

export function formatPaymentDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getSecondsUntilExpiry(expiresAt: string | Date | null | undefined): number | null {
  if (!expiresAt) return null;
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return null;
  return Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000));
}

export function formatExpiryCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
