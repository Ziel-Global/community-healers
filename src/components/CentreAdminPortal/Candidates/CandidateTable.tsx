import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, UserCheck, Eye, Phone, Mail, MapPin, Calendar, FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { centerAdminService } from "@/services/centerAdminService";

interface Document {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    fileUrl: string;
}

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
    documents?: Document[];
}

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "Verified":
            return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</Badge>;
        case "Pending":
            return <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3" /> Pending</Badge>;
        case "Absent":
            return <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 border-blue-200"><XCircle className="w-3 h-3" /> Absent</Badge>;
        case "Rejected":
            return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

interface CandidateTableProps {
    statusFilter?: string;
    examDate?: string;
    refreshTrigger?: number;
    canVerify?: boolean;
}

export function CandidateTable({
    statusFilter = "all",
    examDate,
    refreshTrigger = 0,
    canVerify = false
}: CandidateTableProps) {
    const navigate = useNavigate();
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            setLoading(true);
            setError(null);
            try {
                // Default to today if not provided
                const targetDate = examDate || new Date().toISOString().split('T')[0];

                const data = await centerAdminService.getTodayCandidates(targetDate);

                // Data is already unwrapped by the service
                const candidatesArray = data || [];

                if (!Array.isArray(candidatesArray)) {
                    console.error("Expected array but got:", data);
                    setCandidates([]);
                } else {
                    // Map API response to Component Candidate interface
                    const mappedCandidates: Candidate[] = candidatesArray.map((item: any) => ({
                        id: item.userId || item.id || item.cnic, // Prefer userId
                        name: item.user ? `${item.user.firstName} ${item.user.lastName}` : (item.name || 'Unknown'),
                        cnic: item.cnic || 'N/A',
                        time: item.time || "09:00 AM", // Placeholder
                        payment: item.payment || "Paid", // Placeholder
                        status: item.candidateStatus ? (item.candidateStatus.charAt(0).toUpperCase() + item.candidateStatus.slice(1).toLowerCase()) : "Pending", // Normalize case
                        photo: item.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user?.firstName || item.name || 'candidate'}`,
                        phone: item.user?.phoneNumber || item.phone,
                        email: item.user?.email || item.email,
                        address: item.address,
                        dob: item.dob,
                        fatherName: item.fatherName,
                        documents: item.documents || []
                    }));
                    setCandidates(mappedCandidates);
                }
            } catch (err) {
                console.error("Failed to fetch candidates", err);
                setError("Failed to load candidates.");
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [examDate, refreshTrigger]);

    const handleVerify = () => {
        // Navigate to verification page with candidate data
        if (selectedCandidate) {
            navigate("/center/verification", { state: { candidate: selectedCandidate } });
        } else {
            navigate("/center/verification");
        }
        setSelectedCandidate(null);
    };

    // Filter candidates by status
    const filteredCandidates = statusFilter === "all"
        ? candidates
        : candidates.filter(c => c.status === statusFilter);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center p-8 text-destructive">
                {error}
            </div>
        );
    }
    return (
        <>
            <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-secondary/40 border-b border-border/40">
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Candidate</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">CNIC</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Time</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Payment</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredCandidates.map((c) => (
                                <tr key={c.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <img src={c.photo} alt={c.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary object-cover border border-border/40 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="alumni-sans-subtitle text-foreground text-base sm:text-lg truncate">{c.name}</p>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono truncate">{c.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 hidden md:table-cell">
                                        <p className="text-xs sm:text-sm font-medium text-foreground">{c.cnic}</p>
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                                            <p className="text-xs sm:text-sm font-medium text-foreground">{c.time}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                                        <Badge variant={c.payment === "Paid" ? "success" : "destructive"} className="px-1.5 sm:px-2 py-0 text-[9px] sm:text-[10px] uppercase font-bold tracking-tighter">
                                            {c.payment}
                                        </Badge>
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <StatusBadge status={c.status} />
                                    </td>
                                    <td className="p-3 sm:p-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 sm:h-9 px-2 sm:px-3 gap-1 sm:gap-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all text-xs"
                                            onClick={() => setSelectedCandidate(c)}
                                        >
                                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">Details</span>
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
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold">Candidate Details</DialogTitle>
                    </DialogHeader>

                    {selectedCandidate && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Candidate Header */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b text-center sm:text-left">
                                <img
                                    src={selectedCandidate.photo}
                                    alt={selectedCandidate.name}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-secondary object-cover border-2 border-border/40"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{selectedCandidate.name}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">{selectedCandidate.id}</p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
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

                            {/* Uploaded Documents */}
                            {selectedCandidate.documents && selectedCandidate.documents.length > 0 && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Uploaded Documents</h4>

                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedCandidate.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-muted-foreground">{doc.type}</span>
                                                            <span className="text-xs text-muted-foreground">•</span>
                                                            <span className="text-xs text-muted-foreground">{doc.uploadDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => window.open(doc.fileUrl, '_blank')}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            // Download logic
                                                            const link = document.createElement('a');
                                                            link.href = doc.fileUrl;
                                                            link.download = doc.name;
                                                            link.click();
                                                        }}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                                    Close
                                </Button>
                                {canVerify && selectedCandidate.status === "Pending" && (
                                    <Button
                                        onClick={handleVerify}
                                        className="gradient-primary text-white"
                                    >
                                        Verify Candidate
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
