import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const candidates = [
    {
        id: "REG-2024-001",
        name: "Muhammad Ahmed",
        cnic: "35201-1234567-1",
        time: "09:00 AM",
        payment: "Paid",
        status: "Verified",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    },
    {
        id: "REG-2024-002",
        name: "Fatima Noor",
        cnic: "35201-7654321-2",
        time: "09:00 AM",
        payment: "Paid",
        status: "Pending",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
    },
    {
        id: "REG-2024-003",
        name: "Ali Raza",
        cnic: "35201-1122334-3",
        time: "11:30 AM",
        payment: "Paid",
        status: "Absent",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali",
    },
    {
        id: "REG-2024-004",
        name: "Zainab Bibi",
        cnic: "35201-5566778-4",
        time: "11:30 AM",
        payment: "Unpaid",
        status: "Rejected",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab",
    },
];

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "Verified":
            return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</Badge>;
        case "Pending":
            return <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3" /> Pending</Badge>;
        case "Absent":
            return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Absent</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export function CandidateTable() {
    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/40 border-b border-border/40">
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Candidate</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">CNIC & Reg ID</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Exam Slot</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Payment</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {candidates.map((c) => (
                            <tr key={c.id} className="hover:bg-primary/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-xl bg-secondary object-cover border border-border/40" />
                                        <div>
                                            <p className="font-bold text-foreground">{c.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm font-medium text-foreground">{c.cnic}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <p className="text-sm font-medium text-foreground">{c.time}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge variant={c.payment === "Paid" ? "success" : "destructive"} className="px-2 py-0 text-[10px] uppercase font-bold tracking-tighter">
                                        {c.payment}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={c.status} />
                                </td>
                                <td className="p-4 text-right">
                                    <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all">
                                        <UserCheck className="w-4 h-4" />
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
