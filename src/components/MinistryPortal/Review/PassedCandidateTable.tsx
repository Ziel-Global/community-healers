import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Award, User, Calendar, ExternalLink, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const candidates = [
    { id: "REG-2024-001", name: "Ahmed Khan", cnic: "42101-1234567-1", score: "85/100", date: "Jan 18, 2024", center: "LHR-003", status: "Passed" },
    { id: "REG-2024-005", name: "Sara Malik", cnic: "35201-9876543-2", score: "92/100", date: "Jan 18, 2024", center: "KHI-012", status: "Passed" },
    { id: "REG-2024-012", name: "Zain Ali", cnic: "61101-4455667-3", score: "78/100", date: "Jan 17, 2024", center: "MUL-005", status: "Passed" },
];

export function PassedCandidateTable() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex-1 w-full md:max-w-md relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by name, CNIC or Registry ID..."
                        className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="h-11 px-4 border-border/60 gap-2 bg-white/50">
                        <Filter className="w-4 h-4 text-primary" />
                        Center Filter
                    </Button>
                    <Button className="gradient-primary text-black font-bold h-11 px-6 rounded-xl shadow-lg gap-2">
                        <Award className="w-4 h-4" />
                        Bulk Issue Approval
                    </Button>
                </div>
            </div>

            <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/40 border-b border-border/40">
                                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Candidate & ID</th>
                                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Performance</th>
                                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Center Detail</th>
                                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed text-right">Issuance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {candidates.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground leading-none">{candidate.name}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">{candidate.cnic}</p>
                                                <p className="text-[10px] text-primary font-bold mt-0.5 uppercase tracking-tighter">{candidate.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1.5">
                                            <p className="text-sm font-bold text-foreground">{candidate.score}</p>
                                            <Badge variant="success" className="text-[8px] h-3.5 px-1 uppercase font-bold tracking-tight">
                                                Outcome: Passed
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                                                <Calendar className="w-3 h-3" /> {candidate.date}
                                            </p>
                                            <p className="text-xs text-foreground font-medium">{candidate.center}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 rounded-lg hover:bg-white border border-transparent hover:border-border/40 text-primary">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Review
                                            </Button>
                                            <Button size="sm" className="h-9 px-4 rounded-lg bg-black text-white hover:bg-black/80 font-bold gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Issue
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
