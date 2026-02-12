import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar as CalendarIcon, Filter, Loader2 } from "lucide-react";
import { centerAdminService } from "@/services/centerAdminService";

export function HistoricalReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await centerAdminService.getReports();
                setReports(data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="p-4 border-b border-border/40 bg-secondary/20 flex justify-between items-center">
                <h4 className="text-lg alumni-sans-title text-foreground uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Past Reports
                </h4>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    <Filter className="w-3 h-3" /> Filter
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/40 border-b border-border/40">
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exam Date</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Candidates</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Pass Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <p className="text-sm">Loading reports...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : reports.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                    No reports found.
                                </td>
                            </tr>
                        ) : (
                            reports.map((r, index) => (
                                <tr key={index} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-lg alumni-sans-subtitle text-foreground">
                                            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                            {formatDate(r.examDate)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <p className="text-sm font-medium text-foreground">{r.candidates}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className="text-sm font-bold text-emerald-600">{r.passRate}%</p>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
