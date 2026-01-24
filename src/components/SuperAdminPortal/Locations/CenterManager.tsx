import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Activity, Plus, Search, MoreHorizontal, Phone, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CenterDetail } from "./CenterDetail";

interface Center {
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
}

const initialCenters: Center[] = [
    { id: "LHR-003", name: "Lahore Training Center #3", location: "Lahore", capacity: 150, status: "Active", attendance: "92%" },
    { id: "KHI-012", name: "Karachi Industrial Hub #1", location: "Karachi", capacity: 200, status: "Active", attendance: "78%" },
    { id: "ISL-001", name: "Islamabad Sector F-7", location: "Islamabad", capacity: 80, status: "Inactive", attendance: "0%" },
    { id: "MUL-005", name: "Multan Regional Center", location: "Multan", capacity: 120, status: "Active", attendance: "85%" },
];

export function CenterManager() {
    const { toast } = useToast();
    const [centers, setCenters] = useState<Center[]>(() => {
        // Load centers from localStorage on initial mount
        const saved = localStorage.getItem("trainingCenters");
        if (saved) {
            return JSON.parse(saved);
        }
        return initialCenters;
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        address: "",
        capacity: "",
        contactPerson: "",
        phone: "",
        email: "",
        status: "Active",
        adminName: "",
        adminEmail: "",
        adminPhone: "",
    });

    // If a center is selected, show detail view
    if (selectedCenter) {
        return <CenterDetail center={selectedCenter} onBack={() => setSelectedCenter(null)} />;
    }

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.name || !formData.location || !formData.address || !formData.capacity || 
            !formData.contactPerson || !formData.phone || !formData.email || 
            !formData.adminName || !formData.adminEmail || !formData.adminPhone) {
            toast({
                title: "Incomplete Information",
                description: "Please fill in all required fields including center admin details.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            // Generate center ID
            const cityPrefix = formData.location.substring(0, 3).toUpperCase();
            const centerId = `${cityPrefix}-${String(centers.length + 1).padStart(3, '0')}`;

            // Create new center
            const currentDate = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const newCenter: Center = {
                id: centerId,
                name: formData.name,
                location: formData.location,
                capacity: parseInt(formData.capacity),
                status: formData.status,
                attendance: "0%",
                address: formData.address,
                contactPerson: formData.contactPerson,
                phone: formData.phone,
                email: formData.email,
                established: currentDate,
            };

            // Add to centers list
            const updatedCenters = [...centers, newCenter];
            setCenters(updatedCenters);
            
            // Save to localStorage
            localStorage.setItem("trainingCenters", JSON.stringify(updatedCenters));

            // Generate admin ID and add to admin list
            const existingAdmins = JSON.parse(localStorage.getItem("centerAdmins") || "[]");
            const adminId = `ADV-${String(existingAdmins.length + 4).padStart(3, '0')}`;
            
            const newAdmin = {
                id: adminId,
                name: formData.adminName,
                email: formData.adminEmail,
                centers: [centerId],
                role: "Center Admin",
            };

            const updatedAdmins = [...existingAdmins, newAdmin];
            localStorage.setItem("centerAdmins", JSON.stringify(updatedAdmins));
            
            // Dispatch custom event to notify AdminAccountList
            window.dispatchEvent(new Event("adminAdded"));

            setIsSubmitting(false);
            setIsDialogOpen(false);

            // Reset form
            setFormData({
                name: "",
                location: "",
                address: "",
                capacity: "",
                contactPerson: "",
                phone: "",
                email: "",
                status: "Active",
                adminName: "",
                adminEmail: "",
                adminPhone: "",
            });

            toast({
                title: "Center Established",
                description: `${formData.name} has been successfully added with admin ${formData.adminName}.`,
            });
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search centers by name or code..."
                        className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                    />
                </div>
                <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="gradient-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Establish New Center
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centers.map((center) => (
                    <Card key={center.id} className="border-border/40 overflow-hidden group hover:border-primary/40 transition-all bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-0">
                            <div className="p-5 border-b border-border/40 flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="alumni-sans-title text-lg text-foreground leading-tight">{center.name}</h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" /> {center.location} • ID: {center.id}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={center.status === "Active" ? "success" : "secondary"}>
                                    {center.status}
                                </Badge>
                            </div>
                            <div className="p-5 grid grid-cols-3 gap-4 bg-secondary/20">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Daily Capacity</p>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        <span className="font-bold text-sm">{center.capacity}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Avg Attendance</p>
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="font-bold text-sm">{center.attendance}</span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-end">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0 rounded-lg"
                                        onClick={() => setSelectedCenter(center)}
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add New Center Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-primary" />
                            Establish New Training Center
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the details below to register a new training center in the system.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        {/* Center Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Center Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="centerName">Center Name *</Label>
                                    <Input
                                        id="centerName"
                                        placeholder="e.g., Lahore Training Center #4"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">City / Location *</Label>
                                    <Select
                                        value={formData.location}
                                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                                    >
                                        <SelectTrigger id="location">
                                            <SelectValue placeholder="Select city" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Lahore">Lahore</SelectItem>
                                            <SelectItem value="Karachi">Karachi</SelectItem>
                                            <SelectItem value="Islamabad">Islamabad</SelectItem>
                                            <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                                            <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                                            <SelectItem value="Multan">Multan</SelectItem>
                                            <SelectItem value="Peshawar">Peshawar</SelectItem>
                                            <SelectItem value="Quetta">Quetta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Full Address *</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Enter complete address with landmarks"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Daily Capacity *</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="capacity"
                                            type="number"
                                            placeholder="e.g., 150"
                                            className="pl-10"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="contactPerson"
                                        placeholder="e.g., Muhammad Ahmed"
                                        className="pl-10"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            placeholder="03001234567"
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="center@example.com"
                                            className="pl-10"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Admin Information */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Center Admin Account</h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="adminName">Admin Full Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="adminName"
                                        placeholder="e.g., Aisha Khan"
                                        className="pl-10"
                                        value={formData.adminName}
                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adminEmail">Admin Email Address *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminEmail"
                                            type="email"
                                            placeholder="admin@center.gov.pk"
                                            className="pl-10"
                                            value={formData.adminEmail}
                                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminPhone">Admin Phone Number *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminPhone"
                                            placeholder="03001234567"
                                            className="pl-10"
                                            value={formData.adminPhone}
                                            onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <p className="text-xs text-blue-700">
                                    This admin will be automatically added to the Admin Management list with access to this center.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gradient-primary text-white gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Publish Center
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
