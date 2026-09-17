import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Activity, Search, MoreHorizontal, Pencil, Radius } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CenterDetail } from "./CenterDetail";
import { City, SuperAdminCenter } from "@/types/superAdmin";
import { useSuperAdminCenters, useUpdateCityLocation } from "@/hooks/queries/useSuperAdminQueries";
import { useCities } from "@/hooks/queries/useReferenceQueries";
import { getApiErrorMessage } from "@/lib/errors";

/**
 * Centers and cities are now created automatically by the center onboarding
 * approval pipeline (committee approval → Center + admin login), not by hand
 * here — this stays read/manage-only: browse centers, drill into details, and
 * adjust an existing city's zone location/radius.
 */
export function CenterManager() {
    const { toast } = useToast();
    const { data: centers = [], isLoading: isLoadingCenters, error: centersError } = useSuperAdminCenters();
    const { data: cities = [], isLoading: isLoadingCities, error: citiesError } = useCities();
    const updateCityLocationMutation = useUpdateCityLocation();
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<SuperAdminCenter | null>(null);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [locationForm, setLocationForm] = useState({ latitude: "", longitude: "", radiusKm: "" });
    const isSubmittingLocation = updateCityLocationMutation.isPending;

    // Surface query errors (e.g. session expiry) the same way the manual fetches used to.
    useEffect(() => {
        const error = centersError || citiesError;
        if (!error) return;

        console.error("Failed to load centers/cities", error);

        const message = getApiErrorMessage(error);
        if (message?.includes('jwt expired') || message?.includes('401')) {
            toast({
                title: "Session Expired",
                description: "Your session has expired. Please log in again.",
                variant: "destructive",
            });

            // Clear auth and redirect to login
            localStorage.removeItem('user');
            window.location.href = '/auth/super-admin';
        }
    }, [centersError, citiesError, toast]);

    // If a center is selected, show detail view
    if (selectedCenter) {
        return <CenterDetail center={selectedCenter} onBack={() => setSelectedCenter(null)} />;
    }

    const openLocationDialog = (city: City) => {
        setEditingCity(city);
        setLocationForm({
            latitude: city.latitude != null ? String(city.latitude) : "",
            longitude: city.longitude != null ? String(city.longitude) : "",
            radiusKm: city.radiusKm != null ? String(city.radiusKm) : "",
        });
        setIsLocationDialogOpen(true);
    };

    const handleLocationSubmit = async () => {
        if (!editingCity) return;

        const { latitude, longitude, radiusKm } = locationForm;

        // Coordinates travel together — a city with only one set can't be
        // distance-matched against anything, so require both or neither.
        if ((latitude.trim() === "") !== (longitude.trim() === "")) {
            toast({
                title: "Incomplete Coordinates",
                description: "Enter both latitude and longitude, or leave both blank.",
                variant: "destructive",
            });
            return;
        }

        const payload: { latitude?: number; longitude?: number; radiusKm?: number } = {};

        if (latitude.trim() !== "") {
            const lat = Number(latitude);
            if (Number.isNaN(lat) || lat < -90 || lat > 90) {
                toast({ title: "Invalid Latitude", description: "Latitude must be a number between -90 and 90.", variant: "destructive" });
                return;
            }
            payload.latitude = lat;
        }

        if (longitude.trim() !== "") {
            const lng = Number(longitude);
            if (Number.isNaN(lng) || lng < -180 || lng > 180) {
                toast({ title: "Invalid Longitude", description: "Longitude must be a number between -180 and 180.", variant: "destructive" });
                return;
            }
            payload.longitude = lng;
        }

        if (radiusKm.trim() !== "") {
            const radius = Number(radiusKm);
            if (!Number.isInteger(radius) || radius < 1 || radius > 1000) {
                toast({ title: "Invalid Radius", description: "Radius must be a whole number between 1 and 1000 km.", variant: "destructive" });
                return;
            }
            payload.radiusKm = radius;
        }

        updateCityLocationMutation.mutate(
            { cityId: editingCity.id, payload },
            {
                onSuccess: () => {
                    toast({
                        title: "City Location Updated",
                        description: `${editingCity.name}'s zone settings have been saved.`,
                    });
                    setIsLocationDialogOpen(false);
                    setEditingCity(null);
                },
                onError: (error) => {
                    toast({
                        title: "Failed to Update City Location",
                        description: getApiErrorMessage(error, "An error occurred while updating the city's location."),
                        variant: "destructive",
                    });
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search centers by name or code..."
                    className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                />
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Cities ({cities.length})
                </p>
                {isLoadingCities ? (
                    <p className="text-xs text-muted-foreground">Loading cities...</p>
                ) : cities.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No cities yet.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {cities.map((city) => {
                            const hasCoordinates = city.latitude != null && city.longitude != null;
                            return (
                                <Badge
                                    key={city.id}
                                    variant="outline"
                                    className="gap-1.5 h-8 pl-3 pr-1.5 bg-card/60 border-border/60 text-sm font-normal"
                                >
                                    <MapPin className="w-3 h-3 text-primary" />
                                    {city.name}
                                    {hasCoordinates && (
                                        <Radius
                                            className="w-3 h-3 text-emerald-500"
                                            aria-label={`Zone radius set (${city.radiusKm ?? "default"} km)`}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => openLocationDialog(city)}
                                        className="h-5 w-5 rounded-md flex items-center justify-center hover:bg-primary/10 transition-colors"
                                        title="Edit zone location & radius"
                                    >
                                        <Pencil className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                )}
            </div>

            {isLoadingCenters ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading centers...</p>
                    </div>
                </div>
            ) : centers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No centers found</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {centers.map((center) => (
                        <Card key={center.id} className="border-border/40 overflow-hidden group hover:border-primary/40 transition-all bg-card/60 backdrop-blur-sm">
                            <CardContent className="p-0">
                                <div className="p-5 border-b border-border/40 flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="alumni-sans-title text-lg text-foreground leading-tight">{center.name}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {center.location} • ID: {center.id}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={center.status === "Active" ? "success" : "secondary"}>
                                        {center.status}
                                    </Badge>
                                </div>
                                <div className="p-5 grid grid-cols-3 gap-4 bg-secondary/20">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Daily Capacity</p>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            <span className="font-bold text-sm">{center.capacity}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Avg Attendance</p>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="font-bold text-sm">{center.attendance}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-lg"
                                            onClick={() => setSelectedCenter(center)}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit City Location Dialog — sets the coordinates/radius that drive zone-based centre matching */}
            <Dialog
                open={isLocationDialogOpen}
                onOpenChange={(open) => {
                    setIsLocationDialogOpen(open);
                    if (!open) setEditingCity(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Radius className="w-6 h-6 text-primary" />
                            Zone Location — {editingCity?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Candidates in this city are matched to training centers within the radius below.
                            Leave coordinates blank to keep this city matched by exact city only (no zone).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cityLatitude">Latitude</Label>
                                <Input
                                    id="cityLatitude"
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 31.5204"
                                    value={locationForm.latitude}
                                    onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cityLongitude">Longitude</Label>
                                <Input
                                    id="cityLongitude"
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 74.3587"
                                    value={locationForm.longitude}
                                    onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cityRadiusKm">Zone Radius (km)</Label>
                            <div className="relative">
                                <Radius className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="cityRadiusKm"
                                    type="number"
                                    min="1"
                                    max="1000"
                                    placeholder="Leave blank to use the global default (100 km)"
                                    className="pl-10"
                                    value={locationForm.radiusKm}
                                    onChange={(e) => setLocationForm({ ...locationForm, radiusKm: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <p className="text-xs text-blue-700">
                                Centers within this radius of {editingCity?.name ?? "this city"} — in any city that
                                also has coordinates set — become available to candidates registered here, in
                                addition to centers in their own city.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsLocationDialogOpen(false)}
                            disabled={isSubmittingLocation}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleLocationSubmit}
                            disabled={isSubmittingLocation}
                            className="gradient-primary text-white gap-2 flex-1"
                        >
                            {isSubmittingLocation ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Pencil className="w-4 h-4" />
                                    Save Location
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
