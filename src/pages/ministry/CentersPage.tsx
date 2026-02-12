import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ministryNavItems } from "../MinistryPortal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Activity, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "sonner";

interface Center {
    id: string;
    name: string;
    cityId: string;
    city: {
        id: string;
        name: string;
    };
    address: string;
    capacity: number;
    status: string;
    focalPersonUserId: string;
    primaryAdminUserId: string;
    createdAt: string;
    updatedAt: string;
}

export default function CenterOversightPage() {
    const [centers, setCenters] = useState<Center[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCenters = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/ministry/centers');
                const centersData: Center[] = response.data.data.data;
                setCenters(centersData);
            } catch (error) {
                console.error("Failed to fetch centers:", error);
                toast.error("Failed to load centers");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCenters();
    }, []);

    const filteredCenters = centers.filter(center => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            center.name.toLowerCase().includes(query) ||
            center.id.toLowerCase().includes(query) ||
            center.city.name.toLowerCase().includes(query)
        );
    });

    return (
        <DashboardLayout
            title="Center Oversight"
            subtitle="Read-only monitoring of training center performance and metrics"
            portalType="ministry"
            navItems={ministryNavItems}
        >
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search centers by name or code..."
                            className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">Loading centers...</p>
                    </div>
                ) : filteredCenters.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {searchQuery ? "No centers found matching your search" : "No centers available"}
                        </p>
                        {searchQuery && (
                            <Button
                                variant="link"
                                className="mt-2"
                                onClick={() => setSearchQuery("")}
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCenters.map((center) => (
                            <Card key={center.id} className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm group hover:border-primary/40 transition-all">
                                <CardContent className="p-0">
                                    <div className="p-5 border-b border-border/40 flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Building2 className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="alumni-sans-title text-lg text-foreground leading-tight">{center.name}</h4>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3 h-3" /> {center.city.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                                                    {center.address}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={center.status === 'ACTIVE' ? 'success' : 'secondary'}
                                            className="shrink-0"
                                        >
                                            {center.status}
                                        </Badge>
                                    </div>
                                    <div className="p-5 grid grid-cols-2 gap-4 bg-secondary/20">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Capacity</p>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-primary" />
                                                <span className="font-bold text-sm">{center.capacity}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Status</p>
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="font-bold text-sm text-emerald-600">{center.status === 'ACTIVE' ? 'Operational' : center.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
