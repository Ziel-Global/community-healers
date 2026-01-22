import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, ShieldCheck, Info } from "lucide-react";

interface CenterAssignmentProps {
    centerName: string;
    centerId: string;
    location: string;
    isLocked?: boolean;
}

export function CenterAssignmentStatus({ centerName, centerId, location, isLocked = true }: CenterAssignmentProps) {
    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">Auto-Assigned Center</span>
                </div>
                {isLocked && <Badge variant="secondary" className="gap-1.5 font-medium"><Building2 className="w-3 h-3" /> Assigned</Badge>}
            </div>
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold alumni-sans-title text-foreground">{centerName}</CardTitle>
                <CardDescription>Official training and examination center assigned based on your location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-1">
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" /> Center ID
                        </p>
                        <p className="text-lg font-bold text-foreground">#{centerId}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-1">
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Area / Zone
                        </p>
                        <p className="text-lg font-bold text-foreground">{location}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Info className="w-5 h-5 text-primary shrink-0 transition-transform hover:scale-110" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Center assignment is final and cannot be changed manually. This center will be your venue for both Urdu training videos access (if required) and the CBT certification exam.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
