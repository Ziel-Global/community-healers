/**
 * Static documents from /public/documents — the only URLs used for document preview.
 * Never hit the backend /uploads path for viewing.
 */
export const SAMPLE_DOCUMENT_URLS: Record<string, string> = {
  photo: "/documents/cnic.jpg",
  passport: "/documents/passport.jpeg",
  visa: "/documents/usa-visa.jpg",
  cnicFront: "/documents/cnic.jpg",
  cnicBack: "/documents/cnic-back.jpeg",
};

export function getSampleDocumentUrl(type?: string | null): string | null {
  if (!type) return null;
  return SAMPLE_DOCUMENT_URLS[type] || null;
}

/** Document preview URL — frontend static files only. */
export function getDocumentPreviewUrl(type?: string | null): string | null {
  return getSampleDocumentUrl(type);
}
