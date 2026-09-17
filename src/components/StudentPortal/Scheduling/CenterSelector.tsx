import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building2, Loader2, AlertCircle } from "lucide-react";
import { useEligibleCenters } from "@/hooks/queries/useCandidateQueries";
import { cn } from "@/lib/utils";

interface CenterSelectorProps {
    /** yyyy-MM-dd */
    examDate: string;
    selectedCenterId: string | undefined;
    onSelectCenter: (centerId: string) => void;
}

/**
 * Shown once a date is picked — previews centers available on that date
 * (within the candidate's zone, when their city has coordinates set) so
 * they can choose one before confirming. A failed or still-loading preview
 * never blocks scheduling itself: the parent step's "Schedule" action still
 * works without a selection, falling back to the backend's own
 * exact-city auto-assignment.
 */
export function CenterSelector({ examDate, selectedCenterId, onSelectCenter }: CenterSelectorProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useEligibleCenters(examDate);

    if (isLoading) {
        return (
            <Card className="border-border/40 shadow-sm">
                <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('scheduling.loadingCenters')}
                </CardContent>
            </Card>
        );
    }

    // Preview is optional infrastructure on top of scheduling, not a
    // prerequisite for it — a failed fetch here should never strand the
    // candidate. Rendering nothing lets them still hit "Schedule" and get
    // the backend's own auto-assignment.
    if (isError || !data) {
        return null;
    }

    const { centers, zoneMatched } = data;

    if (centers.length === 0) {
        return (
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
                <CardContent className="p-4 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {t('scheduling.noCentersForDate')}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/40 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-2xl font-bold alumni-sans-title">
                            {t('scheduling.selectCenter')}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            {zoneMatched ? t('scheduling.selectCenterZoneDesc') : t('scheduling.selectCenterDesc')}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
                {centers.map((center) => {
                    const isSelected = center.centerId === selectedCenterId;
                    const isFull = center.availableSlots <= 0;
                    return (
                        <button
                            key={center.centerId}
                            type="button"
                            disabled={isFull}
                            onClick={() => onSelectCenter(center.centerId)}
                            aria-pressed={isSelected}
                            className={cn(
                                "w-full text-left rtl:text-right p-4 rounded-lg border transition-colors",
                                isSelected ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/40",
                                isFull && "opacity-50 cursor-not-allowed",
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                                        {center.name}
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">
                                            {[center.address, center.cityName].filter(Boolean).join(", ")}
                                            {center.distanceKm != null && ` · ${center.distanceKm} km`}
                                        </span>
                                    </p>
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium px-2 py-1 rounded-full shrink-0 whitespace-nowrap",
                                        isFull
                                            ? "bg-destructive/10 text-destructive"
                                            : "bg-green-500/10 text-green-700 dark:text-green-400",
                                    )}
                                >
                                    {isFull
                                        ? t('scheduling.centerFull')
                                        : t('scheduling.slotsAvailable', { count: center.availableSlots })}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </CardContent>
        </Card>
    );
}
