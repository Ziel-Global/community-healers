import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Users, Activity, Search, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CenterDetail } from "@/components/SuperAdminPortal/Locations/CenterDetail";
import { SuperAdminCenter } from "@/types/superAdmin";
import { useSuperAdminCenters } from "@/hooks/queries/useSuperAdminQueries";
import { getApiErrorMessage } from "@/lib/errors";

/**
 * Read-only mirror of Super Admin's CenterManager list — Director of Operations
 * can see every center and drill into the same detail view, but has no
 * create/edit/delete actions (those stay Super Admin-only).
 */
export function CenterList() {
    const { toast } = useToast();
    const { data: centers = [], isLoading, error } = useSuperAdminCenters();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCenter, setSelectedCenter] = useState<SuperAdminCenter | null>(null);

    useEffect(() => {
        if (!error) return;
        console.error("Failed to load centers", error);
        toast({
            title: "Error",
            description: getApiErrorMessage(error, "Failed to load centers"),
            variant: "destructive",
        });
    }, [error, toast]);

    if (selectedCenter) {
        return <CenterDetail center={selectedCenter} onBack={() => setSelectedCenter(null)} />;
    }

    const filteredCenters = centers.filter((center) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            center.name.toLowerCase().includes(query) ||
            center.id.toLowerCase().includes(query) ||
            center.location.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search centers by name or code..."
                    className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading centers...</p>
                    </div>
                </div>
            ) : filteredCenters.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                            {searchQuery ? "No centers found matching your search" : "No centers available"}
                        </p>
                        {searchQuery && (
                            <Button variant="link" className="mt-2" onClick={() => setSearchQuery("")}>
                                Clear search
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCenters.map((center) => (
                        <Card
                            key={center.id}
                            className="border-border/40 overflow-hidden group hover:border-primary/40 transition-all bg-card/60 backdrop-blur-sm cursor-pointer"
                            onClick={() => setSelectedCenter(center)}
                        >
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
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
