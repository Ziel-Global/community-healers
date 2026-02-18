import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Building2,
    MapPin,
    Users,
    Activity,
    ArrowLeft,
    Phone,
    Mail,
    User,
    Calendar,
    CheckCircle2,
    Clock,
    Loader2
} from "lucide-react";
import { superAdminService } from "@/services/superAdminService";
import { useToast } from "@/hooks/use-toast";

interface CenterDetailProps {
    center: {
        id: string;
        name: string;
        location: string;
        capacity: number;
        status: string;
        attendance: string;
        address?: string;
        contactPerson?: string;
        phone?: string;
        email?: string;
        established?: string;
    };
    onBack: () => void;
}

const StatCard = ({ title, value, icon: Icon, desc }: any) => (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden border-b-4 border-b-primary shadow-sm hover:translate-y-[-2px] transition-all">
        <CardContent className="p-5">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground font-sans tabular-nums">{value}</h3>
                    <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {desc}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export function CenterDetail({ center, onBack }: CenterDetailProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [open, setOpen] = useState(false);
    const [centerDetails, setCenterDetails] = useState<any>(null);
    const [registeredData, setRegisteredData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCandidatesLoading, setIsCandidatesLoading] = useState(false);
    const { toast } = useToast();

    // Fetch center details and registered candidates
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const details = await superAdminService.getCenterDetails(center.id);
                setCenterDetails(details);
            } catch (error: any) {
                console.error('Failed to fetch center details:', error);
                toast({
                    title: "Error",
                    description: "Failed to load center details. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (center.id) {
            fetchData();
        }
    }, [center.id, toast]);

    // Fetch candidates when date changes
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setIsCandidatesLoading(true);
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const data = await superAdminService.getCenterRegisteredCandidates(center.id, dateStr);
                setRegisteredData(data);
            } catch (error: any) {
                console.error('Failed to fetch registered candidates:', error);
                toast({
                    title: "Error",
                    description: "Failed to load registered candidates for the selected date.",
                    variant: "destructive",
                });
            } finally {
                setIsCandidatesLoading(false);
            }
        };

        if (center.id && selectedDate) {
            fetchCandidates();
        }
    }, [center.id, selectedDate, toast]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onBack}
                        className="rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h2 className="text-2xl alumni-sans-title text-foreground">{center.name}</h2>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading center details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!centerDetails) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onBack}
                        className="rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h2 className="text-2xl alumni-sans-title text-foreground">{center.name}</h2>
                    </div>
                </div>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Failed to load center details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onBack}
                    className="rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl alumni-sans-title text-foreground">{centerDetails.name}</h2>
                        <Badge variant={centerDetails.status === "ACTIVE" ? "success" : "secondary"}>
                            {centerDetails.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Center ID: {centerDetails.id}</p>
                </div>
            </div>

            {/* Center Information Card */}
            <Card className="border-border/40 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-display flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Center Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Location</p>
                                    <p className="text-sm font-medium">{centerDetails.city?.name || 'N/A'}</p>
                                    {centerDetails.address && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {centerDetails.address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Daily Capacity</p>
                                    <p className="text-sm font-medium">{centerDetails.capacity} candidates</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Established</p>
                                    <p className="text-sm font-medium">
                                        {centerDetails.createdAt
                                            ? new Date(centerDetails.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Primary Admin</p>
                                    <p className="text-sm font-medium">
                                        {centerDetails.primaryAdmin
                                            ? `${centerDetails.primaryAdmin.firstName} ${centerDetails.primaryAdmin.lastName}`
                                            : "Not assigned"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Email Address</p>
                                    <p className="text-sm font-medium">
                                        {centerDetails.primaryAdmin?.email || "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                    title="Total Registrations"
                    value={centerDetails.totalCandidates || 0}
                    icon={Users}
                    desc="Overall registered candidates"
                />
                <StatCard
                    title="Total Candidates Appeared"
                    value={centerDetails.appearedCandidates || 0}
                    icon={Activity}
                    desc={`${centerDetails.totalCandidates > 0
                        ? ((centerDetails.appearedCandidates / centerDetails.totalCandidates) * 100).toFixed(1)
                        : 0}% overall attendance rate`}
                />
            </div>

            {/* Registered Students List */}
            <Card className="border-border/40 shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-display">Registered Students</CardTitle>
                            <CardDescription>Students scheduled to appear at this center</CardDescription>
                        </div>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-10 px-4 rounded-xl border-border/60 gap-2 hover:bg-white transition-all bg-white/50 text-sm justify-start text-left font-normal w-full sm:w-[240px]",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {selectedDate ? format(selectedDate, "MMM dd, yyyy") : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 pointer-events-auto" align="end" sideOffset={4}>
                                <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(date);
                                            setOpen(false);
                                        }
                                    }}
                                    disabled={false}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isCandidatesLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Updating candidate list...</p>
                        </div>
                    ) : registeredData?.registeredCandidates?.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                <Calendar className="w-4 h-4 text-primary" />
                                <h3 className="font-bold text-foreground">{format(selectedDate, "MMMM dd, yyyy")}</h3>
                                <Badge variant="outline" className="ml-auto">
                                    {registeredData.registeredCandidates.length} students
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                {registeredData.registeredCandidates.map((student: any) => (
                                    <div
                                        key={student.userId}
                                        className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/30 hover:bg-card/60 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{student.firstName} {student.lastName}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                    <span className="font-mono">{student.cnic}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {student.phoneNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">
                                                    {new Date(student.examStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <Badge
                                                variant={student.candidateStatus === "SUBMITTED" ? "success" : "secondary"}
                                                className="px-3 py-1"
                                            >
                                                {student.candidateStatus === "SUBMITTED" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                {student.candidateStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground font-medium">No students registered for this date</p>
                            <p className="text-xs text-muted-foreground mt-1">Select a different date to view registered students</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
