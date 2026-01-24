import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Shield, Building2, Mail, ExternalLink, ShieldCheck } from "lucide-react";

interface Admin {
    id: string;
    name: string;
    email: string;
    centers: string[];
    role: string;
}

const initialAdmins: Admin[] = [
    { id: "ADV-001", name: "M. Siddique", email: "siddique@center3.gov.pk", centers: ["LHR-003", "LHR-005"], role: "Center Admin" },
    { id: "ADV-002", name: "Amna Ali", email: "amna@karachihub.gov.pk", centers: ["KHI-012"], role: "Center Admin" },
    { id: "ADV-003", name: "Zubair Ahmed", email: "z.ahmed@isl.gov.pk", centers: ["ISL-001"], role: "Regional Lead" },
];

export function AdminAccountList() {
    const [admins, setAdmins] = useState<Admin[]>(initialAdmins);

    // Listen for new admin additions from localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const savedAdmins = localStorage.getItem("centerAdmins");
            if (savedAdmins) {
                const parsedAdmins = JSON.parse(savedAdmins);
                setAdmins([...initialAdmins, ...parsedAdmins]);
            }
        };

        // Initial load
        handleStorageChange();

        // Listen for custom event
        window.addEventListener("adminAdded", handleStorageChange);
        
        return () => {
            window.removeEventListener("adminAdded", handleStorageChange);
        };
    }, []);

    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/40 border-b border-border/40">
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Administrator</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Assigned Centers</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Access Level</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed text-right">Actions</th>
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
                                                {admin.role === "Regional Lead" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {admin.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {admin.centers.map(c => (
                                            <Badge key={c} variant="outline" className="bg-white/50 text-[10px] font-mono border-border/60">
                                                {c}
                                            </Badge>
                                        ))}
                                        <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-primary hover:bg-primary/10">
                                            Manage
                                        </Button>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge variant="secondary" className="px-2 py-0 text-[10px] uppercase font-bold tracking-tighter">
                                        {admin.role}
                                    </Badge>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/40">
                                            <UserCog className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/40">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
