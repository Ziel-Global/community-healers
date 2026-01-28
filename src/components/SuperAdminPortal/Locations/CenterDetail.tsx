import { useState } from "react";
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
    Clock
} from "lucide-react";

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

const registeredStudents = [
    { 
        date: "January 20, 2026",
        students: [
            { id: "CND-1245", name: "Muhammad Ahmed", phone: "0300-1234567", status: "Confirmed", time: "09:00 AM" },
            { id: "CND-1246", name: "Aisha Khan", phone: "0321-9876543", status: "Confirmed", time: "09:00 AM" },
            { id: "CND-1247", name: "Ali Hassan", phone: "0333-5551234", status: "Pending", time: "10:00 AM" },
        ]
    },
    { 
        date: "January 21, 2026",
        students: [
            { id: "CND-1248", name: "Fatima Noor", phone: "0345-7778888", status: "Confirmed", time: "09:00 AM" },
            { id: "CND-1249", name: "Usman Malik", phone: "0301-4445555", status: "Confirmed", time: "09:00 AM" },
            { id: "CND-1250", name: "Sara Iqbal", phone: "0322-6667777", status: "Confirmed", time: "11:00 AM" },
            { id: "CND-1251", name: "Bilal Ahmed", phone: "0334-8889999", status: "Pending", time: "11:00 AM" },
        ]
    },
    { 
        date: "January 22, 2026",
        students: [
            { id: "CND-1252", name: "Zainab Ali", phone: "0346-1112222", status: "Confirmed", time: "09:00 AM" },
            { id: "CND-1253", name: "Hassan Raza", phone: "0302-3334444", status: "Confirmed", time: "10:00 AM" },
        ]
    },
];

export function CenterDetail({ center, onBack }: CenterDetailProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [open, setOpen] = useState(false);

    // Filter students by selected date
    const filteredStudents = registeredStudents.filter(dayData => {
        const dataDate = new Date(dayData.date);
        return dataDate.toDateString() === selectedDate.toDateString();
    });

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
                        <h2 className="text-2xl alumni-sans-title text-foreground">{center.name}</h2>
                        <Badge variant={center.status === "Active" ? "success" : "secondary"}>
                            {center.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Center ID: {center.id}</p>
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
                                    <p className="text-sm font-medium">{center.location}</p>
                                    {center.address && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {center.address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Daily Capacity</p>
                                    <p className="text-sm font-medium">{center.capacity} candidates</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Activity className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Average Attendance</p>
                                    <p className="text-sm font-medium">{center.attendance}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Contact Person</p>
                                    <p className="text-sm font-medium">{center.contactPerson || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Phone Number</p>
                                    <p className="text-sm font-medium">{center.phone || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Email Address</p>
                                    <p className="text-sm font-medium">{center.email || `${center.id.toLowerCase()}@certifypro.gov.pk`}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Established</p>
                                    <p className="text-sm font-medium">{center.established || "Not specified"}</p>
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
                    value="1,247" 
                    icon={Users} 
                    desc="+12.3% this month" 
                />
                <StatCard 
                    title="Total Candidates Appeared" 
                    value="1,089" 
                    icon={Activity} 
                    desc="87.3% attendance rate" 
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
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((dayData, index) => (
                            <div key={index} className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <h3 className="font-bold text-foreground">{dayData.date}</h3>
                                    <Badge variant="outline" className="ml-auto">
                                        {dayData.students.length} students
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    {dayData.students.map((student) => (
                                        <div 
                                            key={student.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/30 hover:bg-card/60 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{student.name}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                        <span className="font-mono">{student.id}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {student.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">{student.time}</span>
                                                </div>
                                                <Badge 
                                                    variant={student.status === "Confirmed" ? "success" : "secondary"}
                                                    className="px-3 py-1"
                                                >
                                                    {student.status === "Confirmed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                    {student.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
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
