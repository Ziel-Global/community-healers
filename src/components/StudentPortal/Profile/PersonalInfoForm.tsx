import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Phone, MapPin, CreditCard, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfo {
    fullName: string;
    fatherName: string;
    cnic: string;
    dob: string;
    phone: string;
    city: string;
}

export function PersonalInfoForm() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<PersonalInfo>({
        fullName: "",
        fatherName: "",
        cnic: "",
        dob: "",
        phone: "03001234567",
        city: "",
    });

    // Load saved data from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("candidatePersonalInfo");
        if (saved) {
            setFormData(JSON.parse(saved));
        }
    }, []);

    const handleSave = () => {
        // Validate required fields
        if (!formData.fullName || !formData.fatherName || !formData.cnic || !formData.dob || !formData.city) {
            toast({
                title: "Incomplete Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        
        // Simulate API call
        setTimeout(() => {
            // Save to localStorage
            localStorage.setItem("candidatePersonalInfo", JSON.stringify(formData));
            
            setIsSaving(false);
            toast({
                title: "Information Saved",
                description: "Your personal information has been saved successfully.",
            });
        }, 1000);
    };

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Enter your official details as per CNIC</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Candidate Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input 
                                id="fullName" 
                                placeholder="Muhammad Ahmed" 
                                className="pl-10"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fatherName">Father's Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input 
                                id="fatherName" 
                                placeholder="Aslam Khan" 
                                className="pl-10"
                                value={formData.fatherName}
                                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
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
                                onValueChange={(value) => setFormData({ ...formData, city: value })}
                            >
                                <SelectTrigger id="city" className="pl-10">
                                    <SelectValue placeholder="Select your city" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lahore">Lahore</SelectItem>
                                    <SelectItem value="karachi">Karachi</SelectItem>
                                    <SelectItem value="islamabad">Islamabad</SelectItem>
                                    <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                                    <SelectItem value="faisalabad">Faisalabad</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                    <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gradient-primary text-white px-8 gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Save & Continue
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
