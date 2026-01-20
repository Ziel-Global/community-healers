import { DashboardLayout } from "@/components/DashboardLayout";
import { ministryNavItems } from "../MinistryPortal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Activity, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const centers = [
    { id: "LHR-003", name: "Lahore Training Center #3", location: "Lahore", candidates: 1240, passRate: "82%", status: "Active" },
    { id: "KHI-012", name: "Karachi Industrial Hub #1", location: "Karachi", candidates: 2150, passRate: "78%", status: "Active" },
    { id: "MUL-005", name: "Multan Regional Center", location: "Multan", candidates: 890, passRate: "85%", status: "Active" },
    { id: "ISL-001", name: "Islamabad Sector F-7", location: "Islamabad", candidates: 560, passRate: "90%", status: "Active" },
];

export default function CenterOversightPage() {
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
                        />
                    </div>
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-border/60 bg-white shadow-sm gap-2">
                        <Filter className="w-4 h-4" />
                        Regional View
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {centers.map((center) => (
                        <Card key={center.id} className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm group hover:border-primary/40 transition-all">
                            <CardContent className="p-0">
                                <div className="p-5 border-b border-border/40 flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-foreground leading-tight">{center.name}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {center.location} • ID: {center.id}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="success">
                                        {center.status}
                                    </Badge>
                                </div>
                                <div className="p-5 grid grid-cols-2 gap-4 bg-secondary/20">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Lifetime Candidates</p>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            <span className="font-bold text-sm">{center.candidates}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Success Rate</p>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="font-bold text-sm">{center.passRate}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
