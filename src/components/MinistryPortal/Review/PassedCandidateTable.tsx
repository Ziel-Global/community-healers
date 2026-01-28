import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Award, User, Calendar, ExternalLink, CheckCircle2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const candidates = [
    { id: "REG-2024-001", name: "Ahmed Khan", cnic: "42101-1234567-1", score: "85/100", date: "Jan 18, 2024", center: "LHR-003", status: "Passed" },
    { id: "REG-2024-005", name: "Sara Malik", cnic: "35201-9876543-2", score: "92/100", date: "Jan 18, 2024", center: "KHI-012", status: "Passed" },
    { id: "REG-2024-012", name: "Zain Ali", cnic: "61101-4455667-3", score: "78/100", date: "Jan 17, 2024", center: "MUL-005", status: "Passed" },
];

export function PassedCandidateTable() {
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleBulkModeToggle = () => {
        if (!isBulkMode) {
            // Enter bulk mode with all candidates selected
            setSelectedIds(candidates.map(c => c.id));
            setIsBulkMode(true);
        } else {
            // Exit bulk mode
            setSelectedIds([]);
            setIsBulkMode(false);
        }
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(candidates.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleIssueCertificates = () => {
        if (selectedIds.length === 0) {
            toast.error("No candidates selected");
            return;
        }
        toast.success(`Certificates issued for ${selectedIds.length} candidate(s)`);
        setIsBulkMode(false);
        setSelectedIds([]);
    };

    const allSelected = selectedIds.length === candidates.length;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative group w-full">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by name, CNIC or Registry ID..."
                        className="pl-10 sm:pl-12 h-10 sm:h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full">
                    <Button variant="outline" className="flex-1 sm:flex-none h-9 sm:h-11 px-3 sm:px-4 border-border/60 gap-2 bg-white/50 text-xs sm:text-lg alumni-sans-subtitle">
                        <Filter className="w-4 h-4 text-primary" />
                        <span className="hidden sm:inline">Center</span> Filter
                    </Button>
                    {!isBulkMode ? (
                        <Button 
                            onClick={handleBulkModeToggle}
                            className="flex-1 sm:flex-none gradient-primary text-black alumni-sans-subtitle h-9 sm:h-11 px-3 sm:px-6 rounded-xl shadow-lg gap-2 text-xs sm:text-lg"
                        >
                            <Award className="w-4 h-4" />
                            <span className="hidden sm:inline">Bulk Issue</span> Approval
                        </Button>
                    ) : (
                        <div className="flex gap-2 flex-1 sm:flex-none">
                            <Button 
                                variant="outline"
                                onClick={handleBulkModeToggle}
                                className="h-9 sm:h-11 px-3 sm:px-4 border-border/60 gap-2 bg-white/50 text-xs sm:text-lg"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleIssueCertificates}
                                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white alumni-sans-subtitle h-9 sm:h-11 px-3 sm:px-6 rounded-xl shadow-lg gap-2 text-xs sm:text-lg"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Issue ({selectedIds.length})
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-secondary/40 border-b border-border/40">
                                {isBulkMode && (
                                    <th className="p-3 sm:p-4 w-10">
                                        <Checkbox 
                                            checked={allSelected}
                                            onCheckedChange={handleSelectAll}
                                            className="border-muted-foreground/50"
                                        />
                                    </th>
                                )}
                                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Candidate</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Score</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed hidden sm:table-cell">Center</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {candidates.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-primary/5 transition-colors group">
                                    {isBulkMode && (
                                        <td className="p-3 sm:p-4">
                                            <Checkbox 
                                                checked={selectedIds.includes(candidate.id)}
                                                onCheckedChange={(checked) => handleCheckboxChange(candidate.id, checked as boolean)}
                                                className="border-muted-foreground/50"
                                            />
                                        </td>
                                    )}
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="alumni-sans-subtitle text-foreground leading-none text-sm sm:text-base truncate">{candidate.name}</p>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 font-mono truncate">{candidate.cnic}</p>
                                                <p className="text-[9px] sm:text-[10px] text-primary font-bold mt-0.5 uppercase tracking-tighter">{candidate.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="space-y-1.5">
                                            <p className="text-xs sm:text-sm font-bold text-foreground">{candidate.score}</p>
                                            <Badge variant="success" className="text-[7px] sm:text-[8px] h-3 sm:h-3.5 px-1 uppercase font-bold tracking-tight">
                                                Passed
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                                        <div className="space-y-1">
                                            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                                                <Calendar className="w-3 h-3" /> {candidate.date}
                                            </p>
                                            <p className="text-xs text-foreground font-medium">{candidate.center}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 text-right">
                                        <div className="flex justify-end gap-1 sm:gap-2">
                                            <Button variant="ghost" size="sm" className="h-7 sm:h-9 px-2 sm:px-3 gap-1 sm:gap-2 rounded-lg hover:bg-white border border-transparent hover:border-border/40 text-primary text-xs">
                                                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                <span className="hidden sm:inline">Review</span>
                                            </Button>
                                            {!isBulkMode && (
                                                <Button size="sm" className="h-7 sm:h-9 px-2 sm:px-4 rounded-lg bg-black text-white hover:bg-black/80 font-bold gap-1 sm:gap-2 text-xs">
                                                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    Issue
                                                </Button>
                                            )}
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
