import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/LocationPicker";
import { getApiErrorMessage } from "@/lib/errors";
import {
  centerOnboardingService,
  type CenterApplication,
  type ChecklistItem,
  type City,
  type StaffCategory,
  type StaffMember,
} from "@/services/centerOnboardingService";

type Step = "prerequisites" | "verify" | "otp" | "details" | "status";

const STAFF_CATEGORIES: { value: StaffCategory; label: string }[] = [
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "STAFF", label: "Staff" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  INSPECTION_PENDING: {
    title: "Application submitted",
    body: "Your center details and staff roster have been received. A ministry inspector will be assigned to visit your premises soon.",
  },
  INSPECTION_IN_PROGRESS: {
    title: "Inspection in progress",
    body: "An inspector has been assigned to your application and is reviewing your premises. You'll be notified once this is complete.",
  },
  UNDER_REVIEW: {
    title: "Under Super Admin review",
    body: "The inspection is complete and your application is now with the Super Admin for a final decision.",
  },
  APPROVED: {
    title: "Application approved",
    body: "Your center has been approved. You can now log in as a Center Admin using your CNIC and license number from the Center Admin portal.",
  },
  REJECTED: {
    title: "Application rejected",
    body: "Unfortunately your application was not approved. You should have received an SMS with details.",
  },
};

export default function CenterOnboardingWizard() {
  const [step, setStep] = useState<Step>("prerequisites");
  const [loading, setLoading] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const [cnic, setCnic] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [application, setApplication] = useState<CenterApplication | null>(null);

  const [cities, setCities] = useState<City[]>([]);
  const [centerName, setCenterName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [cityId, setCityId] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([{ name: "", cnic: "", category: "INSTRUCTOR" }]);

  useEffect(() => {
    centerOnboardingService
      .getChecklist()
      .then(setChecklist)
      .catch((error) => toast.error(getApiErrorMessage(error, "Failed to load prerequisites")))
      .finally(() => setChecklistLoading(false));
  }, []);

  useEffect(() => {
    if (step !== "details") return;
    centerOnboardingService
      .getCities()
      .then(setCities)
      .catch((error) => toast.error(getApiErrorMessage(error, "Failed to load cities")));
  }, [step]);

  const allAcknowledged = checklist.every((item) => acknowledged[item.id]);

  const goToStepForStatus = (app: CenterApplication) => {
    setApplication(app);
    if (app.status === "DETAILS_PENDING") {
      if (app.centerName) setCenterName(app.centerName);
      if (app.address) setAddress(app.address);
      if (app.latitude != null) setLatitude(app.latitude);
      if (app.longitude != null) setLongitude(app.longitude);
      if (app.cityId) setCityId(app.cityId);
      if (app.staff && app.staff.length > 0) {
        setStaff(app.staff.map((s) => ({ name: s.name, cnic: s.cnic, category: s.category })));
      }
      setStep("details");
    } else {
      setStep("status");
    }
  };

  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{13}$/.test(cnic)) {
      toast.error("CNIC must be exactly 13 digits");
      return;
    }
    if (!/^[A-Za-z]{3}-\d+$/.test(licenseNumber)) {
      toast.error("License number must look like ABC-12345");
      return;
    }
    setLoading(true);
    try {
      const result = await centerOnboardingService.verifyLicense(cnic, licenseNumber);
      setApplicationId(result.applicationId);
      setPhone(result.phone);
      setStep("otp");
      toast.success("An OTP has been sent to your registered number");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not verify CNIC and license number"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!applicationId) return;
    try {
      await centerOnboardingService.resendOtp(applicationId);
      toast.success("OTP resent");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to resend OTP"));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) return;
    setLoading(true);
    try {
      const result = await centerOnboardingService.verifyOtp(applicationId, otp);
      setSessionToken(result.sessionToken);
      goToStepForStatus(result.application);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Incorrect OTP"));
    } finally {
      setLoading(false);
    }
  };

  const updateStaffRow = (index: number, patch: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addStaffRow = () => {
    setStaff((prev) => [...prev, { name: "", cnic: "", category: "STAFF" }]);
  };

  const removeStaffRow = (index: number) => {
    setStaff((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationChange = (lat: number, lng: number, geocodedAddress: string | null) => {
    setLatitude(lat);
    setLongitude(lng);
    // Only auto-fill from the geocoder if the applicant hasn't typed their own address yet.
    setAddress((prev) => (prev.trim() ? prev : geocodedAddress ?? prev));
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !sessionToken) return;

    if (!centerName.trim() || !address.trim() || !cityId) {
      toast.error("Please fill in center name, address, and city");
      return;
    }
    if (latitude == null || longitude == null) {
      toast.error("Please pick your center's location on the map");
      return;
    }
    if (staff.length === 0) {
      toast.error("Add at least one staff member");
      return;
    }
    for (const member of staff) {
      if (!member.name.trim() || !/^\d{13}$/.test(member.cnic)) {
        toast.error("Every staff member needs a name and a 13-digit CNIC");
        return;
      }
    }

    setLoading(true);
    try {
      const result = await centerOnboardingService.submitDetails(applicationId, sessionToken, {
        centerName: centerName.trim(),
        address: address.trim(),
        latitude,
        longitude,
        cityId,
        staff,
      });
      setApplication(result);
      setStep("status");
      toast.success("Details submitted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit details"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-royal-600 flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="alumni-sans-title text-foreground text-lg">Center Onboarding</p>
            <p className="text-xs text-muted-foreground">Apply to become a registered training center</p>
          </div>
        </div>

        {step === "prerequisites" && (
          <Card className="border-border/40">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Before you apply</h2>
              <p className="text-sm text-muted-foreground">
                Confirm you meet each requirement below before starting your application.
              </p>
              {checklistLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/40 cursor-pointer hover:bg-secondary/40"
                    >
                      <Checkbox
                        checked={!!acknowledged[item.id]}
                        onCheckedChange={(checked) =>
                          setAcknowledged((prev) => ({ ...prev, [item.id]: checked === true }))
                        }
                      />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <Button
                className="w-full gradient-primary text-white"
                disabled={checklistLoading || !allAcknowledged}
                onClick={() => setStep("verify")}
              >
                Yes, I have this — Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "verify" && (
          <Card className="border-border/40">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-1">Verify your license</h2>
              <p className="text-sm text-muted-foreground mb-5">
                We'll check your CNIC and license number with the Bureau.
              </p>
              <form onSubmit={handleVerifyLicense} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC (13 digits, no dashes)</Label>
                  <Input
                    id="cnic"
                    inputMode="numeric"
                    maxLength={13}
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value.replace(/\D/g, ""))}
                    placeholder="3520212345671"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input
                    id="license"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                    placeholder="ABC-12345"
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary text-white" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "otp" && (
          <Card className="border-border/40">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-1">Enter OTP</h2>
              <p className="text-sm text-muted-foreground mb-5">
                We sent a code to {phone ?? "your registered number"}.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-time code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="111111"
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary text-white" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify OTP
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={handleResendOtp}>
                  Resend OTP
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "details" && (
          <Card className="border-border/40">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-1">Center details</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Tell us about your center and its team. Instructor, Staff, and Maintenance CNICs are all required.
              </p>
              <form onSubmit={handleSubmitDetails} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="centerName">Center Name</Label>
                  <Input id="centerName" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={cityId} onValueChange={setCityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
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
                <div className="space-y-2">
                  <Label>Location</Label>
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={handleLocationChange}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Staff Roster</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addStaffRow}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {staff.map((member, index) => (
                      <div key={index} className="grid grid-cols-[1fr_1fr_140px_auto] gap-2 items-start">
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => updateStaffRow(index, { name: e.target.value })}
                        />
                        <Input
                          placeholder="CNIC (13 digits)"
                          inputMode="numeric"
                          maxLength={13}
                          value={member.cnic}
                          onChange={(e) =>
                            updateStaffRow(index, { cnic: e.target.value.replace(/\D/g, "") })
                          }
                        />
                        <Select
                          value={member.category}
                          onValueChange={(value) => updateStaffRow(index, { category: value as StaffCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAFF_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={staff.length === 1}
                          onClick={() => removeStaffRow(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-primary text-white" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "status" && application && (
          <Card className="border-border/40">
            <CardContent className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-semibold">
                {STATUS_COPY[application.status]?.title ?? application.status}
              </h2>
              <p className="text-sm text-muted-foreground">
                {STATUS_COPY[application.status]?.body ??
                  "You can check back later for updates on your application."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
