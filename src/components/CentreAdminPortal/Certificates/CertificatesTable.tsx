import { useMemo, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Search, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCenterCertificates } from "@/hooks/queries/useCenterAdminQueries";
import { centerAdminService, type CenterCertificate } from "@/services/centerAdminService";
import { CertificatePreviewCard } from "@/components/Certificates/CertificatePreviewCard";

const headCell = "text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function CertificatesTable() {
    const { data: certificates = [], isLoading, error } = useCenterCertificates();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<CenterCertificate | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return certificates;
        return certificates.filter(
            (cert) =>
                (cert.candidateName ?? "").toLowerCase().includes(term) ||
                (cert.cnic ?? "").toLowerCase().includes(term) ||
                cert.certificateNumber.toLowerCase().includes(term),
        );
    }, [certificates, search]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-16">
                <p className="text-sm text-destructive">Failed to load certificates.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search by candidate, CNIC, or certificate #..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <Award className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No certificates issued yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Certificates for your center's candidates will appear here once issued by the Ministry
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/40 bg-gradient-to-r from-secondary/40 to-secondary/10 hover:bg-gradient-to-r hover:from-secondary/40 hover:to-secondary/10">
                                    <TableHead className={headCell}>Candidate</TableHead>
                                    <TableHead className={cn(headCell, "hidden md:table-cell")}>CNIC</TableHead>
                                    <TableHead className={cn(headCell, "hidden lg:table-cell")}>Certificate #</TableHead>
                                    <TableHead className={headCell}>Score</TableHead>
                                    <TableHead className={headCell}>Issued</TableHead>
                                    <TableHead className={cn(headCell, "text-right")}>View</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((cert) => (
                                    <TableRow
                                        key={cert.id}
                                        className="cursor-pointer border-b border-border/30 transition-colors hover:bg-secondary/30"
                                        onClick={() => setSelected(cert)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Award className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <span className="font-semibold text-sm text-foreground truncate max-w-[180px]">
                                                    {cert.candidateName || "Unknown Candidate"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">
                                            {cert.cnic || "—"}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                                            {cert.certificateNumber}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="success" className="text-[11px]">{Number(cert.score).toFixed(2)}%</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{formatDate(cert.issuedDate)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selected?.candidateName || "Certificate"}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <CertificatePreviewCard
                            certNumber={selected.certificateNumber}
                            issuedDate={selected.issuedDate}
                            score={selected.score}
                            fetchPdf={() => centerAdminService.getCertificatePdfBlob(selected.candidateId)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
