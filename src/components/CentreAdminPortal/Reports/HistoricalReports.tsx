import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar as CalendarIcon, Filter } from "lucide-react";

export function HistoricalReports() {
    const reports = [
        { date: "Jan 19, 2024", candidates: 50, passRate: "68%", status: "Ready" },
        { date: "Jan 18, 2024", candidates: 48, passRate: "75%", status: "Ready" },
        { date: "Jan 17, 2024", candidates: 45, passRate: "70%", status: "Ready" },
    ];

    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="p-4 border-b border-border/40 bg-secondary/20 flex justify-between items-center">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
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
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Pass Rate</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Download</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {reports.map((r) => (
                            <tr key={r.date} className="hover:bg-primary/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                                        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                        {r.date}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <p className="text-sm font-medium text-foreground">{r.candidates}</p>
                                </td>
                                <td className="p-4 text-center">
                                    <p className="text-sm font-bold text-emerald-600">{r.passRate}</p>
                                </td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
