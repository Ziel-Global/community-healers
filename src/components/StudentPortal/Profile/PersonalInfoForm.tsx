import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Phone, MapPin, CreditCard, Calendar as CalendarIcon, Home, AlertCircle } from "lucide-react";
import { differenceInYears, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
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
    data: PersonalInfo;
    onUpdate: (field: keyof PersonalInfo, value: string) => void;
    errors?: Record<string, boolean>;
}

export function PersonalInfoForm({ data, onUpdate, errors = {} }: PersonalInfoFormProps) {
    const { t } = useTranslation();
    const [dobError, setDobError] = useState<string | null>(null);

    const validateAge = (dobString: string) => {
        if (!dobString) return null;

        const birthDate = parseISO(dobString);
        if (!isValid(birthDate)) return null;

        const age = differenceInYears(new Date(), birthDate);
        if (age < 16) {
            return t('personalInfo.ageWarning');
        }
        return null;
    };

    // Validate DOB whenever it changes in props
    useEffect(() => {
        if (data.dob) {
            setDobError(validateAge(data.dob));
        }
    }, [data.dob, t]);

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
        onUpdate(field, value);
    };

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="alumni-sans-title">{t('personalInfo.title')}</CardTitle>
                        <CardDescription>{t('personalInfo.description')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">
                        <Label htmlFor="fatherName">{t('personalInfo.fatherName')}</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="fatherName"
                                placeholder={t('personalInfo.fatherNamePlaceholder')}
                                className={cn("pl-10", errors.fatherName && "border-destructive focus-visible:ring-destructive")}
                                value={data.fatherName}
                                onChange={(e) => handleChange("fatherName", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cnic">{t('personalInfo.cnic')}</Label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="cnic"
                                placeholder={t('personalInfo.cnicPlaceholder')}
                                className={cn("pl-10", errors.cnic && "border-destructive focus-visible:ring-destructive")}
                                value={data.cnic}
                                onChange={(e) => handleChange("cnic", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob">{t('personalInfo.dob')}</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="dob"
                                type="date"
                                className={cn(
                                    "pl-10",
                                    (dobError || errors.dob) && "border-destructive focus-visible:ring-destructive"
                                )}
                                value={data.dob}
                                onChange={(e) => handleChange("dob", e.target.value)}
                            />
                        </div>
                        {dobError && (
                            <div className="flex items-center gap-1.5 text-destructive text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{dobError}</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">{t('personalInfo.phone')}</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                placeholder="03001234567"
                                className="pl-10"
                                disabled
                                value={data.phone}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">{t('personalInfo.city')}</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Select
                                value={data.city}
                                onValueChange={(value) => handleChange("city", value)}
                            >
                                <SelectTrigger id="city" className={cn("pl-10", errors.city && "border-destructive focus-visible:ring-destructive")}>
                                    <SelectValue placeholder={t('personalInfo.selectCity')} />
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
                        <Label htmlFor="address">{t('personalInfo.address')}</Label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="address"
                                placeholder={t('personalInfo.addressPlaceholder')}
                                className={cn("pl-10", errors.address && "border-destructive focus-visible:ring-destructive")}
                                value={data.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
