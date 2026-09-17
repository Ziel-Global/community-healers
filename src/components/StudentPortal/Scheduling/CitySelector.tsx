import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building2, Loader2, AlertCircle } from "lucide-react";
import { useEligibleCities } from "@/hooks/queries/useCandidateQueries";
import { cn } from "@/lib/utils";

interface CitySelectorProps {
    /** yyyy-MM-dd */
    examDate: string;
    selectedCityId: string | undefined;
    onSelectCity: (cityId: string) => void;
}

/**
 * Shown once a date is picked. The candidate chooses a CITY here, never a
 * center directly — booking auto-assigns the best-available center within
 * whichever city they pick. A failed or still-loading preview renders
 * nothing rather than blocking the step; the parent gates "Schedule" on a
 * selection existing, so an empty preview just means nothing is selectable
 * yet, not a broken flow.
 */
export function CitySelector({ examDate, selectedCityId, onSelectCity }: CitySelectorProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useEligibleCities(examDate);

    if (isLoading) {
        return (
            <Card className="border-border/40 shadow-sm">
                <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('scheduling.loadingCities')}
                </CardContent>
            </Card>
        );
    }

    if (isError || !data) {
        return (
            <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
                <CardContent className="p-4 flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {t('scheduling.failedToLoadCities')}
                </CardContent>
            </Card>
        );
    }

    const { cities, zoneMatched, widened } = data;

    if (cities.length === 0) {
        return (
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
                <CardContent className="p-4 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {t('scheduling.noCitiesForDate')}
                </CardContent>
            </Card>
        );
    }

    const description = widened
        ? t('scheduling.selectCityWidenedDesc')
        : zoneMatched
            ? t('scheduling.selectCityZoneDesc')
            : t('scheduling.selectCityDesc');

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/40 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-2xl font-bold alumni-sans-title">
                            {t('scheduling.selectCity')}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
                {cities.map((city) => {
                    const isSelected = city.cityId === selectedCityId;
                    const isFull = city.availableSlots <= 0;
                    return (
                        <button
                            key={city.cityId}
                            type="button"
                            disabled={isFull}
                            onClick={() => onSelectCity(city.cityId)}
                            aria-pressed={isSelected}
                            className={cn(
                                "w-full text-left rtl:text-right p-4 rounded-lg border transition-colors",
                                isSelected ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/40",
                                isFull && "opacity-50 cursor-not-allowed",
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm sm:text-base text-foreground truncate flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                        {city.cityName}
                                    </p>
                                    {city.distanceKm != null && city.distanceKm > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">{city.distanceKm} km away</p>
                                    )}
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
                                        : t('scheduling.slotsAvailable', { count: city.availableSlots })}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </CardContent>
        </Card>
    );
}
