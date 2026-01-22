import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, UserCheck, Eye, Phone, Mail, MapPin, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Candidate {
    id: string;
    name: string;
    cnic: string;
    time: string;
    payment: string;
    status: string;
    photo: string;
    phone?: string;
    email?: string;
    address?: string;
    dob?: string;
    fatherName?: string;
}

const candidates: Candidate[] = [
    {
        id: "REG-2024-001",
        name: "Muhammad Ahmed",
        cnic: "35201-1234567-1",
        time: "09:00 AM",
        payment: "Paid",
        status: "Verified",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
        phone: "0300-1234567",
        email: "ahmed@example.com",
        address: "Block 5, Gulberg III, Lahore",
        dob: "January 15, 1995",
        fatherName: "Muhammad Aslam",
    },
    {
        id: "REG-2024-002",
        name: "Fatima Noor",
        cnic: "35201-7654321-2",
        time: "09:00 AM",
        payment: "Paid",
        status: "Pending",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
        phone: "0321-9876543",
        email: "fatima@example.com",
        address: "Model Town, Lahore",
        dob: "March 22, 1998",
        fatherName: "Noor Ahmed",
    },
    {
        id: "REG-2024-003",
        name: "Ali Raza",
        cnic: "35201-1122334-3",
        time: "11:30 AM",
        payment: "Paid",
        status: "Absent",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali",
        phone: "0333-5551234",
        email: "ali@example.com",
        address: "Johar Town, Lahore",
        dob: "July 8, 1997",
        fatherName: "Raza Ali",
    },
    {
        id: "REG-2024-004",
        name: "Zainab Bibi",
        cnic: "35201-5566778-4",
        time: "11:30 AM",
        payment: "Unpaid",
        status: "Rejected",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab",
        phone: "0345-7778888",
        email: "zainab@example.com",
        address: "DHA Phase 5, Lahore",
        dob: "November 30, 1996",
        fatherName: "Muhammad Yousaf",
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
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleVerify = () => {
    // Navigate to verification page
    navigate("/center/verification");
    setSelectedCandidate(null);
  };
    return (
        <>
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
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-9 px-3 gap-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                                        onClick={() => setSelectedCandidate(c)}
                                    >
                                        <Eye className="w-4 h-4" />
                                        Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>

        {/* Candidate Detail Modal */}
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Candidate Details</DialogTitle>
                </DialogHeader>

                {selectedCandidate && (
                    <div className="space-y-6">
                        {/* Candidate Header */}
                        <div className="flex items-start gap-4 pb-6 border-b">
                            <img 
                                src={selectedCandidate.photo} 
                                alt={selectedCandidate.name} 
                                className="w-20 h-20 rounded-xl bg-secondary object-cover border-2 border-border/40" 
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground">{selectedCandidate.name}</h3>
                                <p className="text-sm text-muted-foreground font-mono mt-1">{selectedCandidate.id}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <StatusBadge status={selectedCandidate.status} />
                                    <Badge variant={selectedCandidate.payment === "Paid" ? "success" : "destructive"}>
                                        {selectedCandidate.payment}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Personal Information</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase">CNIC</p>
                                        <p className="text-sm font-medium">{selectedCandidate.cnic}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase">Date of Birth</p>
                                        <p className="text-sm font-medium">{selectedCandidate.dob}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <UserCheck className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase">Father's Name</p>
                                        <p className="text-sm font-medium">{selectedCandidate.fatherName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase">Exam Time</p>
                                        <p className="text-sm font-medium">{selectedCandidate.time}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase">Phone Number</p>
                                        <p className="text-sm font-medium">{selectedCandidate.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase">Email Address</p>
                                        <p className="text-sm font-medium">{selectedCandidate.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 md:col-span-2">
                                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase">Address</p>
                                        <p className="text-sm font-medium">{selectedCandidate.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                                Close
                            </Button>
                            <Button 
                              onClick={handleVerify}
                              className="gradient-primary text-white"
                            >
                                Verify Candidate
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
        </>
    );
}
