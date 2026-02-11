import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Phone, MapPin, CreditCard, Calendar as CalendarIcon, Home } from "lucide-react";
import { api } from "@/services/api";
import { superAdminService } from "@/services/superAdminService";

interface PersonalInfo {
    fatherName: string;
    cnic: string;
    dob: string;
    phone: string;
    city: string;
    address: string;
}

interface PersonalInfoFormProps {
    candidateData: any;
}

export function PersonalInfoForm({ candidateData }: PersonalInfoFormProps) {
    const [formData, setFormData] = useState<PersonalInfo>({
        fatherName: "",
        cnic: "",
        dob: "",
        phone: "",
        city: "",
        address: "",
    });

    // Populate form with candidate data
    useEffect(() => {
        if (candidateData) {
            setFormData({
                fatherName: candidateData.fatherName || "",
                cnic: candidateData.cnic || "",
                dob: candidateData.dob ? new Date(candidateData.dob).toISOString().split('T')[0] : "",
                phone: candidateData.user?.phoneNumber || "",
                city: candidateData.cityId || "",
                address: candidateData.address || "",
            });
        }
    }, [candidateData]);

    // Fetch cities from API
    const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const citiesData = await superAdminService.getCities();
                setCities(Array.isArray(citiesData) ? citiesData : []);
            } catch (error) {
                console.error('Failed to fetch cities', error);
            }
        };
        fetchCities();
    }, []);

    const handleChange = (field: keyof PersonalInfo, value: string) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);

        // Sync to localStorage for wizard step compatibility
        // Only if we want to support the wizard flow which reads from here
        // We accumulate with existing localStorage data to avoid wiping other fields if any
        const saved = localStorage.getItem("candidatePersonalInfo");
        const parsed = saved ? JSON.parse(saved) : {};
        const newStorage = { ...parsed, [field]: value };
        localStorage.setItem("candidatePersonalInfo", JSON.stringify(newStorage));
    };

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="alumni-sans-title">Personal Information</CardTitle>
                        <CardDescription>Enter your official details as per CNIC</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">
                        <Label htmlFor="fatherName">Father's Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="fatherName"
                                placeholder="Aslam Khan"
                                className="pl-10"
                                value={formData.fatherName}
                                onChange={(e) => handleChange("fatherName", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cnic">CNIC Number</Label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="cnic"
                                placeholder="42201-XXXXXXX-X"
                                className="pl-10"
                                value={formData.cnic}
                                onChange={(e) => handleChange("cnic", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="dob"
                                type="date"
                                className="pl-10"
                                value={formData.dob}
                                onChange={(e) => handleChange("dob", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Contact Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                placeholder="03001234567"
                                className="pl-10"
                                disabled
                                value={formData.phone}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City / Area</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Select
                                value={formData.city}
                                onValueChange={(value) => handleChange("city", value)}
                            >
                                <SelectTrigger id="city" className="pl-10">
                                    <SelectValue placeholder="Select your city" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities.map((city) => (
                                        <SelectItem key={city.id} value={city.id}>
                                            {city.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="address"
                                placeholder="House #, Street #, Sector/Area"
                                className="pl-10"
                                value={formData.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
