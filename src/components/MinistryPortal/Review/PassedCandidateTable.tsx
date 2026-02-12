import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Award, User, Calendar, ExternalLink, CheckCircle2, X, Phone, Mail, MapPin, FileText, Download, UserCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Document {
    id: string;
    candidateId: string;
    type: string;
    fileUrl: string;
    reviewStatus: string;
    createdAt: string;
    updatedAt: string;
}

interface Center {
    id: string;
    name: string;
    cityId: string;
    city: {
        id: string;
        name: string;
    };
    address: string;
    capacity: number;
    status: string;
}

interface ApiCandidate {
    userId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        status: string;
        role: string;
    };
    cnic: string;
    fatherName: string;
    dob: string;
    cityId: string;
    city: {
        id: string;
        name: string;
    };
    address: string;
    has16YearsEducation: boolean;
    certificateIssued: boolean;
    createdAt: string;
    updatedAt: string;
    documents?: Document[];
    obtainedScore: number;
    totalScore: number;
    scorePercentage: string;
    examTime: string;
}

interface Candidate {
    id: string;
    name: string;
    cnic: string;
    score: string;
    date: string;
    center: string;
    status: string;
    phone: string;
    email: string;
    address: string;
    dob: string;
    fatherName: string;
    photo?: string;
    documents: Document[];
    certificateIssued: boolean;
}

export function PassedCandidateTable() {
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [centers, setCenters] = useState<Center[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<string>("");
    const [centerFilterOpen, setCenterFilterOpen] = useState(false);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [issuingCertificate, setIssuingCertificate] = useState(false);

    // Fetch centers on component mount
    useEffect(() => {
        const fetchCenters = async () => {
            setIsLoadingCenters(true);
            try {
                const response = await api.get('/ministry/centers');
                const centersData = response.data.data.data;
                setCenters(centersData);
            } catch (error) {
                console.error("Failed to fetch centers:", error);
                toast.error("Failed to load centers");
            } finally {
                setIsLoadingCenters(false);
            }
        };

        fetchCenters();
    }, []);

    // Fetch candidates when selectedCenter changes
    useEffect(() => {
        const fetchCandidates = async () => {
            setIsLoadingCandidates(true);
            try {
                // Build API URL with centerId query parameter if center is selected
                const url = selectedCenter 
                    ? `/ministry/certificates/eligible-candidates?centerId=${selectedCenter}`
                    : '/ministry/certificates/eligible-candidates';
                
                const response = await api.get(url);
                const apiCandidates: ApiCandidate[] = response.data.data.data;
                
                // Transform API data to match our Candidate interface
                const transformedCandidates: Candidate[] = apiCandidates.map((apiCandidate) => ({
                    id: apiCandidate.userId,
                    name: `${apiCandidate.user.firstName} ${apiCandidate.user.lastName}`,
                    cnic: apiCandidate.cnic,
                    score: `${apiCandidate.obtainedScore}/${apiCandidate.totalScore}`,
                    date: new Date(apiCandidate.examTime).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                    center: apiCandidate.city?.name || "N/A",
                    status: apiCandidate.certificateIssued ? "Certificate Issued" : "Passed",
                    phone: apiCandidate.user.phoneNumber,
                    email: apiCandidate.user.email,
                    address: apiCandidate.address,
                    dob: new Date(apiCandidate.dob).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    fatherName: apiCandidate.fatherName,
                    photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiCandidate.user.firstName}`,
                    documents: apiCandidate.documents || [],
                    certificateIssued: apiCandidate.certificateIssued
                }));
                
                setCandidates(transformedCandidates);
            } catch (error) {
                console.error("Failed to fetch candidates:", error);
                toast.error("Failed to load candidates");
            } finally {
                setIsLoadingCandidates(false);
            }
        };

        fetchCandidates();
    }, [selectedCenter]);

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
            setSelectedIds(filteredCandidates.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleIssueCertificates = async () => {
        if (selectedIds.length === 0) {
            toast.error("No candidates selected");
            return;
        }
        
        setIssuingCertificate(true);
        try {
            // Use bulk-issue endpoint with candidateIds
            await api.post('/ministry/certificates/bulk-issue', { 
                candidateIds: selectedIds 
            });
            
            toast.success(`Certificates issued for ${selectedIds.length} candidate(s)`);
            setIsBulkMode(false);
            setSelectedIds([]);
            
            // Refresh candidates list with current center filter
            const url = selectedCenter 
                ? `/ministry/certificates/eligible-candidates?centerId=${selectedCenter}`
                : '/ministry/certificates/eligible-candidates';
            
            const response = await api.get(url);
            const apiCandidates: ApiCandidate[] = response.data.data.data;
            const transformedCandidates: Candidate[] = apiCandidates.map((apiCandidate) => ({
                id: apiCandidate.userId,
                name: `${apiCandidate.user.firstName} ${apiCandidate.user.lastName}`,
                cnic: apiCandidate.cnic,
                score: `${apiCandidate.obtainedScore}/${apiCandidate.totalScore}`,
                date: new Date(apiCandidate.examTime).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                center: apiCandidate.city?.name || "N/A",
                status: apiCandidate.certificateIssued ? "Certificate Issued" : "Passed",
                phone: apiCandidate.user.phoneNumber,
                email: apiCandidate.user.email,
                address: apiCandidate.address,
                dob: new Date(apiCandidate.dob).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                fatherName: apiCandidate.fatherName,
                photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiCandidate.user.firstName}`,
                documents: apiCandidate.documents || [],
                certificateIssued: apiCandidate.certificateIssued
            }));
            setCandidates(transformedCandidates);
        } catch (error) {
            console.error("Failed to issue certificates:", error);
            toast.error("Failed to issue certificates");
        } finally {
            setIssuingCertificate(false);
        }
    };

    const handleIssueSingleCertificate = async (candidateId: string, candidateName: string) => {
        setIssuingCertificate(true);
        try {
            await api.post('/ministry/certificates', { candidateId });
            toast.success(`Certificate issued for ${candidateName}`);
            
            // Refresh candidates list with current center filter
            const url = selectedCenter 
                ? `/ministry/certificates/eligible-candidates?centerId=${selectedCenter}`
                : '/ministry/certificates/eligible-candidates';
            
            const response = await api.get(url);
            const apiCandidates: ApiCandidate[] = response.data.data.data;
            const transformedCandidates: Candidate[] = apiCandidates.map((apiCandidate) => ({
                id: apiCandidate.userId,
                name: `${apiCandidate.user.firstName} ${apiCandidate.user.lastName}`,
                cnic: apiCandidate.cnic,
                score: `${apiCandidate.obtainedScore}/${apiCandidate.totalScore}`,
                date: new Date(apiCandidate.examTime).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                center: apiCandidate.city?.name || "N/A",
                status: apiCandidate.certificateIssued ? "Certificate Issued" : "Passed",
                phone: apiCandidate.user.phoneNumber,
                email: apiCandidate.user.email,
                address: apiCandidate.address,
                dob: new Date(apiCandidate.dob).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                fatherName: apiCandidate.fatherName,
                photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiCandidate.user.firstName}`,
                documents: apiCandidate.documents || [],
                certificateIssued: apiCandidate.certificateIssued
            }));
            setCandidates(transformedCandidates);
            setSelectedCandidate(null);
        } catch (error) {
            console.error("Failed to issue certificate:", error);
            toast.error("Failed to issue certificate");
        } finally {
            setIssuingCertificate(false);
        }
    };

    const filteredCandidates = candidates.filter(candidate => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            candidate.name.toLowerCase().includes(query) ||
            candidate.cnic.toLowerCase().includes(query) ||
            candidate.id.toLowerCase().includes(query) ||
            candidate.email.toLowerCase().includes(query)
        );
    });
    const allSelected = filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length;

    return (
        <div className="space-y-4 sm:space-y-6">
            {isLoadingCandidates ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading candidates...</p>
                    </div>
                </div>
            ) : (
                <>
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative group w-full">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by name, CNIC or Registry ID..."
                        className="pl-10 sm:pl-12 h-10 sm:h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full">
                    <Popover open={centerFilterOpen} onOpenChange={setCenterFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex-1 sm:flex-none h-9 sm:h-11 px-3 sm:px-4 border-border/60 gap-2 bg-white/50 text-xs sm:text-lg alumni-sans-subtitle">
                                <Filter className="w-4 h-4 text-primary" />
                                <span className="hidden sm:inline">Center</span> Filter
                                {selectedCenter && (
                                    <Badge variant="secondary" className="ml-1 text-[8px]">
                                        1
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search centers..." />
                                <CommandEmpty>
                                    {isLoadingCenters ? "Loading centers..." : "No center found."}
                                </CommandEmpty>
                                <CommandGroup className="max-h-[300px] overflow-y-auto">
                                    <CommandItem
                                        onSelect={() => {
                                            setSelectedCenter("");
                                            setCenterFilterOpen(false);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded border ${!selectedCenter ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                                                {!selectedCenter && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="font-medium">All Centers</span>
                                        </div>
                                    </CommandItem>
                                    {centers.map((center) => (
                                        <CommandItem
                                            key={center.id}
                                            value={center.name}
                                            onSelect={() => {
                                                setSelectedCenter(center.id);
                                                setCenterFilterOpen(false);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded border ${selectedCenter === center.id ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                                                    {selectedCenter === center.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{center.name}</span>
                                                    <span className="text-xs text-muted-foreground">{center.city.name}</span>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {!isBulkMode ? (
                        <Button 
                            onClick={handleBulkModeToggle}
                            className="flex-1 sm:flex-none gradient-primary text-white alumni-sans-subtitle h-9 sm:h-11 px-3 sm:px-6 rounded-xl shadow-lg gap-2 text-xs sm:text-lg"
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
                                disabled={issuingCertificate}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {issuingCertificate ? "Issuing..." : `Issue (${selectedIds.length})`}
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
                            {filteredCandidates.map((candidate) => (
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
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-7 sm:h-9 px-2 sm:px-3 gap-1 sm:gap-2 rounded-lg hover:bg-white border border-transparent hover:border-border/40 text-primary text-xs"
                                                onClick={() => setSelectedCandidate(candidate)}
                                            >
                                                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                <span className="hidden sm:inline">Review</span>
                                            </Button>
                                            {!isBulkMode && (
                                                <Button 
                                                    size="sm" 
                                                    className="h-7 sm:h-9 px-2 sm:px-4 rounded-lg bg-black text-white hover:bg-black/80 font-bold gap-1 sm:gap-2 text-xs"
                                                    onClick={() => handleIssueSingleCertificate(candidate.id, candidate.name)}
                                                    disabled={issuingCertificate}
                                                >
                                                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    {issuingCertificate ? "Issuing..." : "Issue"}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-12">
                            <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">
                                {searchQuery || selectedCenter ? "No candidates found matching your filters" : "No candidates available"}
                            </p>
                            {(searchQuery || selectedCenter) && (
                                <Button
                                    variant="link"
                                    className="mt-2"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCenter("");
                                    }}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    )}
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
                                        <Badge variant="success" className="text-[9px] sm:text-[10px] uppercase font-bold">
                                            {selectedCandidate.status}
                                        </Badge>
                                        <Badge variant="outline" className="text-[9px] sm:text-[10px]">
                                            Score: {selectedCandidate.score}
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
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">Exam Date</p>
                                            <p className="text-sm font-medium">{selectedCandidate.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">Center</p>
                                            <p className="text-sm font-medium">{selectedCandidate.center}</p>
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
                                        {selectedCandidate.documents.map((doc) => {
                                            // Map API document types to readable names
                                            const docTypeNames: Record<string, string> = {
                                                photo: "Candidate Photo",
                                                cnicFront: "CNIC Front",
                                                cnicBack: "CNIC Back",
                                                passport: "Passport",
                                                degreeTranscript: "Degree/Transcript",
                                                medicalCertificate: "Medical Certificate",
                                                policeClearance: "Police Clearance",
                                                other: "Other Document"
                                            };
                                            
                                            const docName = docTypeNames[doc.type] || doc.type;
                                            const fileExt = doc.fileUrl.split('.').pop()?.toUpperCase() || 'File';
                                            const uploadDate = new Date(doc.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            });
                                            
                                            return (
                                            <div 
                                                key={doc.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-foreground truncate">{docName}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-muted-foreground">{fileExt}</span>
                                                            <span className="text-xs text-muted-foreground">•</span>
                                                            <span className="text-xs text-muted-foreground">{uploadDate}</span>
                                                            <span className="text-xs text-muted-foreground">•</span>
                                                            <Badge 
                                                                variant={doc.reviewStatus === 'APPROVED' ? 'default' : 'secondary'}
                                                                className="text-[10px] px-1.5 py-0"
                                                            >
                                                                {doc.reviewStatus}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => window.open(`http://localhost:3001${doc.fileUrl}`, '_blank')}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = `http://localhost:3001${doc.fileUrl}`;
                                                            link.download = docName;
                                                            link.click();
                                                        }}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                                    Close
                                </Button>
                                <Button 
                                    className="bg-black text-white hover:bg-black/80"
                                    onClick={() => handleIssueSingleCertificate(selectedCandidate.id, selectedCandidate.name)}
                                    disabled={issuingCertificate}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {issuingCertificate ? "Issuing..." : "Issue Certificate"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            </>
            )}
        </div>
    );
}
