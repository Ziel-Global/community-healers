import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Shield, Building2, Mail, ExternalLink, ShieldCheck } from "lucide-react";
import { superAdminService } from "@/services/superAdminService";
import { useToast } from "@/hooks/use-toast";

interface CenterAdmin {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    centers: Array<{
        id: string;
        name: string;
        code: string;
    }>;
    createdAt: string;
}

export function AdminAccountList() {
    const { toast } = useToast();
    const [admins, setAdmins] = useState<CenterAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch center admins on component mount
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const adminsData = await superAdminService.getCenterAdmins();
                setAdmins(adminsData);
            } catch (error: any) {
                console.error("Failed to load center admins", error);

                // Check if it's a 401 (token expired)
                if (error.message?.includes('jwt expired') || error.message?.includes('401')) {
                    toast({
                        title: "Session Expired",
                        description: "Your session has expired. Please log in again.",
                        variant: "destructive",
                    });

                    // Clear auth and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/super-admin';
                } else {
                    toast({
                        title: "Failed to Load Admins",
                        description: error.message || "An error occurred while fetching center admins.",
                        variant: "destructive",
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdmins();
    }, [toast]);

    if (isLoading) {
        return (
            <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading administrators...</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (admins.length === 0) {
        return (
            <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No administrators found</p>
                        <p className="text-xs text-muted-foreground mt-1">Create a center to automatically add an admin</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/40 border-b border-border/40">
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Administrator</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Assigned Centers</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Status</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Access Level</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-primary/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="alumni-sans-title text-lg font-semibold text-foreground flex items-center gap-1.5">
                                                {admin.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {admin.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {admin.centers.map(center => (
                                            <Badge key={center.id} variant="outline" className="bg-white/50 text-[10px] font-mono border-border/60">
                                                {center.code}
                                            </Badge>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge
                                        variant={admin.status === "ACTIVE" ? "default" : "secondary"}
                                        className="px-2 py-0 text-[10px] uppercase font-bold tracking-tighter"
                                    >
                                        {admin.status}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <Badge variant="secondary" className="px-2 py-0 text-[10px] uppercase font-bold tracking-tighter">
                                        {admin.role.replace('_', ' ')}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
