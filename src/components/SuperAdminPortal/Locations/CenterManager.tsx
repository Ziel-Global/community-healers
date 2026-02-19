import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Activity, Plus, Search, MoreHorizontal, Phone, Mail, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CenterDetail } from "./CenterDetail";
import { superAdminService } from "@/services/superAdminService";

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

export function CenterManager() {
    const { toast } = useToast();
    const [centers, setCenters] = useState<Center[]>([]);
    const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingCity, setIsSubmittingCity] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [isLoadingCenters, setIsLoadingCenters] = useState(true);
    const [newCityName, setNewCityName] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        cityId: "",
        address: "",
        licenseNumber: "",
        capacity: "",
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminPassword: "",
        adminConfirmPassword: "",
    });

    // Fetch centers on component mount
    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const centersData = await superAdminService.getCenters();
                setCenters(centersData);
            } catch (error: any) {
                console.error("Failed to load centers", error);

                // Check if it's a 401 (token expired)
                if (error.message?.includes('jwt expired') || error.message?.includes('401')) {
                    toast({
                        title: "Session Expired",
                        description: "Your session has expired. Please log in again.",
                        variant: "destructive",
                    });

                    // Clear auth and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/super-admin';
                }
            } finally {
                setIsLoadingCenters(false);
            }
        };

        fetchCenters();
    }, [toast]);

    // Fetch cities on component mount
    const fetchCities = async () => {
        try {
            const citiesData = await superAdminService.getCities();
            setCities(citiesData);
        } catch (error: any) {
            console.error("Failed to load cities", error);

            // Check if it's a 401 (token expired)
            if (error.message?.includes('jwt expired') || error.message?.includes('401')) {
                toast({
                    title: "Session Expired",
                    description: "Your session has expired. Please log in again.",
                    variant: "destructive",
                });

                // Clear auth and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/super-admin';
            }
        }
    };

    useEffect(() => {
        fetchCities();
    }, [toast]);

    // If a center is selected, show detail view
    if (selectedCenter) {
        return <CenterDetail center={selectedCenter} onBack={() => setSelectedCenter(null)} />;
    }

    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.name || !formData.cityId || !formData.licenseNumber || !formData.address || !formData.capacity ||
            !formData.adminFirstName || !formData.adminLastName || !formData.adminEmail || !formData.adminPassword || !formData.adminConfirmPassword) {
            toast({
                title: "Incomplete Information",
                description: "Please fill in all required fields including center admin details.",
                variant: "destructive",
            });
            return;
        }

        // Validate password confirmation
        if (formData.adminPassword !== formData.adminConfirmPassword) {
            toast({
                title: "Passwords Mismatch",
                description: "Center admin password and confirmation do not match.",
                variant: "destructive",
            });
            return;
        }

        // Validate capacity
        if (parseInt(formData.capacity) < 1) {
            toast({
                title: "Invalid Capacity",
                description: "Daily capacity must be at least 1.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Call the API to create center
            await superAdminService.createCenter({
                name: formData.name,
                cityId: formData.cityId,
                licenseNumber: formData.licenseNumber,
                address: formData.address,
                capacity: parseInt(formData.capacity),
                centerAdmin: {
                    email: formData.adminEmail,
                    password: formData.adminPassword,
                    firstName: formData.adminFirstName,
                    lastName: formData.adminLastName,
                },
            });

            toast({
                title: "Center Established",
                description: `${formData.name} has been successfully created.`,
            });

            setIsDialogOpen(false);

            // Reset form
            setFormData({
                name: "",
                cityId: "",
                address: "",
                licenseNumber: "",
                capacity: "",
                adminFirstName: "",
                adminLastName: "",
                adminEmail: "",
                adminPassword: "",
                adminConfirmPassword: "",
            });

            // Refresh centers list from API
            const centersData = await superAdminService.getCenters();
            setCenters(centersData);
        } catch (error: any) {
            toast({
                title: "Failed to Create Center",
                description: error.message || "An error occurred while creating the center.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCitySubmit = async () => {
        if (!newCityName) {
            toast({
                title: "Invalid Input",
                description: "Please enter a city name.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingCity(true);

        try {
            await superAdminService.createCity(newCityName);
            toast({
                title: "City Added",
                description: `${newCityName} has been successfully added.`,
            });

            setIsCityDialogOpen(false);
            setNewCityName("");

            // Refresh cities list
            fetchCities();
        } catch (error: any) {
            toast({
                title: "Failed to Add City",
                description: error.message || "An error occurred while adding the city.",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingCity(false);
        }
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
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        onClick={() => setIsCityDialogOpen(true)}
                        variant="outline"
                        className="border-primary/20 hover:border-primary/40 h-11 px-6 rounded-xl gap-2 flex-1 md:flex-none"
                    >
                        <MapPin className="w-4 h-4 text-primary" />
                        Add New City
                    </Button>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="gradient-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg gap-2 flex-1 md:flex-none"
                    >
                        <Plus className="w-4 h-4" />
                        Establish New Center
                    </Button>
                </div>
            </div>

            {isLoadingCenters ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading centers...</p>
                    </div>
                </div>
            ) : centers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No centers found</p>
                        <p className="text-xs text-muted-foreground mt-1">Click "Establish New Center" to add one</p>
                    </div>
                </div>
            ) : (
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
            )}

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
                                    <Label htmlFor="licenseNumber">Center License Number *</Label>
                                    <Input
                                        id="licenseNumber"
                                        placeholder="e.g., LIC-2024-001"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cityId">City / Location *</Label>
                                    <Select
                                        value={formData.cityId}
                                        onValueChange={(value) => setFormData({ ...formData, cityId: value })}
                                    >
                                        <SelectTrigger id="cityId">
                                            <SelectValue placeholder="Select city" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.length > 0 ? (
                                                cities.map((city) => (
                                                    <SelectItem key={city.id} value={city.id}>
                                                        {city.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                    Loading cities...
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Daily Capacity *</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="capacity"
                                            type="number"
                                            min="1"
                                            placeholder="e.g., 150"
                                            className="pl-10"
                                            value={formData.capacity}
                                            onKeyDown={(e) => {
                                                if (['-', 'e', '.', '+'].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === "" || parseInt(value) >= 0) {
                                                    setFormData({ ...formData, capacity: value });
                                                }
                                            }}
                                        />
                                    </div>
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
                        </div>

                        {/* Center Admin Information */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Center Admin Account</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adminFirstName">Admin First Name *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminFirstName"
                                            placeholder="e.g., Shahmeer"
                                            className="pl-10"
                                            value={formData.adminFirstName}
                                            onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminLastName">Admin Last Name *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminLastName"
                                            placeholder="e.g., Fawwad"
                                            className="pl-10"
                                            value={formData.adminLastName}
                                            onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adminPassword">Admin Password *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10"
                                            value={formData.adminPassword}
                                            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminConfirmPassword">Confirm Admin Password *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminConfirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10"
                                            value={formData.adminConfirmPassword}
                                            onChange={(e) => setFormData({ ...formData, adminConfirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <p className="text-xs text-blue-700">
                                    This admin will be automatically created with access to this center.
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

            {/* Add New City Dialog */}
            <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-primary" />
                            Add New City
                        </DialogTitle>
                        <DialogDescription>
                            Enter the name of the new city to add to the system.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cityName">City Name *</Label>
                            <Input
                                id="cityName"
                                placeholder="e.g., Islamabad"
                                value={newCityName}
                                onChange={(e) => setNewCityName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsCityDialogOpen(false)}
                            disabled={isSubmittingCity}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCitySubmit}
                            disabled={isSubmittingCity}
                            className="gradient-primary text-white gap-2 flex-1"
                        >
                            {isSubmittingCity ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add City
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
