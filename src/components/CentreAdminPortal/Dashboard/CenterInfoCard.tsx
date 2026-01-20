import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, ShieldCheck, Mail } from "lucide-react";

interface CenterInfoProps {
    name: string;
    id: string;
    location: string;
    adminName: string;
}

export function CenterInfoCard({ name, id, location, adminName }: CenterInfoProps) {
    return (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden border-l-4 border-l-primary">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-royal">
                            <Building2 className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground">{name}</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] tracking-wider uppercase">
                                    ID: {id}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {location}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Verified Admin</p>
                                <p className="text-sm font-semibold text-foreground">{adminName}</p>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Center Contact</p>
                                <p className="text-sm font-semibold text-foreground">support@{id.toLowerCase()}.gov.pk</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
