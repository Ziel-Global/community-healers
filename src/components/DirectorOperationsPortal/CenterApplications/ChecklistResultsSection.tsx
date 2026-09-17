import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, HelpCircle, ClipboardList, Building2, GraduationCap } from "lucide-react";
import { EvidenceThumbnail } from "@/components/EvidenceThumbnail";
import type { ChecklistResultDetail, ChecklistCategory } from "@/services/centerApplicationService";

const CATEGORY_ORDER: ChecklistCategory[] = ["OPERATIONS_COMPLIANCE", "BUILDING_FACILITIES", "STAFF_TRAINERS"];
const CATEGORY_META: Record<ChecklistCategory, { label: string; icon: typeof ClipboardList }> = {
    OPERATIONS_COMPLIANCE: { label: "Operations & Compliance", icon: ClipboardList },
    BUILDING_FACILITIES: { label: "Building & Facilities", icon: Building2 },
    STAFF_TRAINERS: { label: "Staff & Trainers", icon: GraduationCap },
};

function isResultComplete(result: ChecklistResultDetail): boolean {
    return result.checklistItem.requiresPhoto ? result.evidence.length > 0 : result.passed === true;
}

/** Read-only view of everything the committee submitted, grouped into the same 3 sections they inspect against. */
export function ChecklistResultsSection({
    checklistResults,
    getEvidenceBlob,
}: {
    checklistResults: ChecklistResultDetail[];
    getEvidenceBlob: (evidenceId: string) => Promise<Blob>;
}) {
    if (checklistResults.length === 0) return null;

    const grouped = CATEGORY_ORDER.map((category) => ({
        category,
        results: checklistResults.filter((r) => r.checklistItem.category === category),
    })).filter((g) => g.results.length > 0);

    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
                Inspection Checklist
            </h3>
            {grouped.map(({ category, results }) => {
                const meta = CATEGORY_META[category];
                const Icon = meta.icon;
                const completeCount = results.filter(isResultComplete).length;

                return (
                    <div key={category} className="space-y-2.5">
                        <div className="flex items-center gap-2 px-1">
                            <Icon className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-bold text-foreground/80 uppercase tracking-wide">{meta.label}</h4>
                            <span className="text-[11px] text-muted-foreground font-semibold bg-secondary/70 rounded-full min-w-[36px] text-center px-1.5 py-0.5">
                                {completeCount}/{results.length}
                            </span>
                        </div>

                        {results.map((result) =>
                            result.checklistItem.requiresPhoto ? (
                                <Card key={result.id} className="border-border/40">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{result.checklistItem.label}</CardTitle>
                                            {result.evidence.length > 0 ? (
                                                <Badge variant="success" className="gap-1 text-[11px]">
                                                    <CheckCircle2 className="w-3 h-3" /> Documented
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="gap-1 text-[11px]">
                                                    <HelpCircle className="w-3 h-3" /> No photo yet
                                                </Badge>
                                            )}
                                        </div>
                                        {result.checklistItem.description && (
                                            <p className="text-xs text-muted-foreground">{result.checklistItem.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {result.evidence.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {result.evidence.map((evidence) => (
                                                    <EvidenceThumbnail
                                                        key={evidence.id}
                                                        evidenceId={evidence.id}
                                                        fetchBlob={getEvidenceBlob}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">No evidence photos uploaded.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <div
                                    key={result.id}
                                    className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-border/40 bg-card"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground">{result.checklistItem.label}</p>
                                        {result.checklistItem.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5">{result.checklistItem.description}</p>
                                        )}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            result.passed === true
                                                ? "gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shrink-0"
                                                : "gap-1.5 shrink-0"
                                        }
                                    >
                                        {result.passed === true ? <CheckCircle2 className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                                        {result.passed === true ? "Checked" : "Not checked"}
                                    </Badge>
                                </div>
                            ),
                        )}
                    </div>
                );
            })}
        </div>
    );
}
