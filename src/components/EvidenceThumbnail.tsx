import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon, Loader2 } from "lucide-react";

interface EvidenceThumbnailProps {
    evidenceId: string;
    /** Bound to whichever role's API the caller has access to (Director of Operations or Super Admin's read-only mirror). */
    fetchBlob: (evidenceId: string) => Promise<Blob>;
}

/** Fetches one evidence photo as a blob (cookie auth needs X-Requested-With, which <img src> can't send) and renders it as a clickable thumbnail. */
export function EvidenceThumbnail({ evidenceId, fetchBlob }: EvidenceThumbnailProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let objectUrl: string | null = null;

        fetchBlob(evidenceId)
            .then((blob) => {
                if (cancelled) return;
                objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evidenceId]);

    if (failed) {
        return (
            <div className="w-20 h-20 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-destructive/50" />
            </div>
        );
    }

    if (!blobUrl) {
        return (
            <div className="w-20 h-20 rounded-lg border border-border/40 bg-secondary/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-20 h-20 rounded-lg border border-border/40 overflow-hidden hover:border-primary/40 transition-colors"
            >
                <img src={blobUrl} alt="Inspection evidence" className="w-full h-full object-cover" />
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <img src={blobUrl} alt="Inspection evidence" className="w-full h-auto rounded-lg" />
                </DialogContent>
            </Dialog>
        </>
    );
}
