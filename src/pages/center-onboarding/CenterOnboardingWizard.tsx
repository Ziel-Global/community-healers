import { useEffect, useState } from "react";
import { Building2, CalendarClock, CheckCircle2, ClipboardList, Loader2, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SoftSkillsBrand } from "@/components/SoftSkillsBrand";
import { getApiErrorMessage } from "@/lib/errors";
import {
  centerOnboardingService,
  type CenterApplication,
  type ChecklistItem,
  type ChecklistCategory,
} from "@/services/centerOnboardingService";
import type { ApplicationComment } from "@/services/centerApplicationCommentService";
import { StepIndicator, type WizardStep } from "@/components/CenterOnboarding/StepIndicator";
import { BuildingStep, type BuildingFormState } from "@/components/CenterOnboarding/BuildingStep";
import { StaffStep, type StaffFormRow } from "@/components/CenterOnboarding/StaffStep";
import { CenterInfoStep, type CenterInfoFormState } from "@/components/CenterOnboarding/CenterInfoStep";

type Step = "prerequisites" | "verify" | "otp" | "building" | "staff" | "center-info" | "status";

/** Hides most of the number — e.g. "+923001234567" -> "+9230xxxxxxx67" — so the OTP screen doesn't display it in full. */
function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone;
  const visibleStart = phone.slice(0, 4);
  const visibleEnd = phone.slice(-2);
  const maskedLength = phone.length - visibleStart.length - visibleEnd.length;
  return `${visibleStart}${"x".repeat(maskedLength)}${visibleEnd}`;
}

const DETAILS_STEPS: WizardStep[] = [
  { label: "Building", icon: Building2 },
  { label: "Staff", icon: Users },
  { label: "Center Info", icon: ClipboardList },
];

const DETAILS_STEP_ORDER: Step[] = ["building", "staff", "center-info"];

const CHECKLIST_CATEGORY_ORDER: ChecklistCategory[] = ["OPERATIONS_COMPLIANCE", "BUILDING_FACILITIES", "STAFF_TRAINERS"];
const CHECKLIST_CATEGORY_META: Record<ChecklistCategory, { label: string; icon: typeof ClipboardList }> = {
  OPERATIONS_COMPLIANCE: { label: "Operations & Compliance", icon: ClipboardList },
  BUILDING_FACILITIES: { label: "Building & Facilities", icon: Building2 },
  STAFF_TRAINERS: { label: "Staff & Trainers", icon: Users },
};

const HAS_SCHEDULE_INFO = new Set(["SCHEDULED", "UNDER_REVIEW", "APPROVED", "REJECTED"]);

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  INSPECTION_PENDING: {
    title: "Application submitted",
    body: "Your center details and staff roster have been received. An Approval Committee will be assigned to visit your premises soon.",
  },
  PENDING_CHAIRMAN_REVIEW: {
    title: "Application submitted",
    body: "Your center details and staff roster have been received. An Approval Committee will be assigned to visit your premises soon.",
  },
  INSPECTION_IN_PROGRESS: {
    title: "Committee assigned",
    body: "An Approval Committee has been assigned to your application. They'll schedule a date to visit your premises soon.",
  },
  SCHEDULED: {
    title: "Inspection scheduled",
    body: "The committee has scheduled your inspection — see the date and their notes below.",
  },
  UNDER_REVIEW: {
    title: "Under review",
    body: "The inspection is complete and your application is now with the Bureau for a final decision.",
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

const emptyBuilding: BuildingFormState = {
  buildingArea: "",
  buildingCapacity: "",
  buildingOwnership: null,
  receptionAvailable: null,
  requiredSystemsAvailable: null,
  camerasAvailable: null,
  camerasInfo: "",
};

const emptyCenterInfo: CenterInfoFormState = {
  centerName: "",
  address: "",
  centerPhone: "",
  email: "",
  latitude: null,
  longitude: null,
  city: null,
  isJointVenture: false,
  jointVentureLicenseNumber: "",
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
  const [comments, setComments] = useState<ApplicationComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [building, setBuilding] = useState<BuildingFormState>(emptyBuilding);
  const [staffRows, setStaffRows] = useState<StaffFormRow[]>([
    { name: "", cnic: "", category: "TRAINER", qualification: "" },
  ]);
  const [rosterSaved, setRosterSaved] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [centerInfo, setCenterInfo] = useState<CenterInfoFormState>(emptyCenterInfo);

  useEffect(() => {
    centerOnboardingService
      .getChecklist()
      .then(setChecklist)
      .catch((error) => toast.error(getApiErrorMessage(error, "Failed to load prerequisites")))
      .finally(() => setChecklistLoading(false));
  }, []);

  const checklistItems = Array.isArray(checklist) ? checklist : [];
  const allAcknowledged =
    checklistItems.length > 0 && checklistItems.every((item) => acknowledged[item.id]);

  // Once the committee has scheduled a date, show the applicant the date + comment thread.
  useEffect(() => {
    if (step !== "status" || !applicationId || !sessionToken || !application) return;
    if (!HAS_SCHEDULE_INFO.has(application.status)) return;

    setCommentsLoading(true);
    centerOnboardingService
      .getComments(applicationId, sessionToken)
      .then(setComments)
      .catch((error) => toast.error(getApiErrorMessage(error, "Failed to load inspection updates")))
      .finally(() => setCommentsLoading(false));
  }, [step, applicationId, sessionToken, application?.status]);

  const goToStepForStatus = (app: CenterApplication) => {
    setApplication(app);

    if (app.status !== "DETAILS_PENDING") {
      setStep("status");
      return;
    }

    setBuilding({
      buildingArea: app.buildingArea != null ? String(app.buildingArea) : "",
      buildingCapacity: app.buildingCapacity != null ? String(app.buildingCapacity) : "",
      buildingOwnership: app.buildingOwnership,
      receptionAvailable: app.receptionAvailable,
      requiredSystemsAvailable: app.requiredSystemsAvailable,
      camerasAvailable: app.camerasAvailable,
      camerasInfo: app.camerasInfo ?? "",
    });

    if (app.staff && app.staff.length > 0) {
      setStaffRows(
        app.staff.map((s) => ({
          id: s.id,
          name: s.name,
          cnic: s.cnic,
          category: s.category,
          qualification: s.qualification ?? "",
          documentObjectKey: s.documentObjectKey,
        })),
      );
      setRosterSaved(true);
    }

    setCenterInfo({
      centerName: app.centerName ?? "",
      address: app.address ?? "",
      centerPhone: app.centerPhone ?? "",
      email: app.email ?? "",
      latitude: app.latitude,
      longitude: app.longitude,
      city: app.city ?? null,
      isJointVenture: app.isJointVenture,
      jointVentureLicenseNumber: app.jointVentureLicenseNumber ?? "",
    });

    setStep(DETAILS_STEP_ORDER[Math.min(Math.max(app.detailsStep, 1), 3) - 1]);
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

  const handleLocationChange = (
    lat: number,
    lng: number,
    geocodedAddress: string | null,
    detectedCity: string | null,
  ) => {
    setCenterInfo((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      city: detectedCity,
      address: prev.address.trim() ? prev.address : geocodedAddress ?? prev.address,
    }));
  };

  const handleSubmitBuilding = async () => {
    if (!applicationId || !sessionToken) return;

    const area = Number(building.buildingArea);
    const capacity = Number(building.buildingCapacity);
    if (!area || area <= 0) {
      toast.error("Enter a valid building area");
      return;
    }
    if (!capacity || capacity <= 0) {
      toast.error("Enter a valid building capacity");
      return;
    }
    if (!building.buildingOwnership) {
      toast.error("Select whether the building is rented or owned");
      return;
    }
    if (
      building.receptionAvailable === null ||
      building.requiredSystemsAvailable === null ||
      building.camerasAvailable === null
    ) {
      toast.error("Please answer every question about the building");
      return;
    }

    setLoading(true);
    try {
      const result = await centerOnboardingService.submitBuildingDetails(applicationId, sessionToken, {
        buildingArea: area,
        buildingCapacity: capacity,
        buildingOwnership: building.buildingOwnership,
        receptionAvailable: building.receptionAvailable,
        requiredSystemsAvailable: building.requiredSystemsAvailable,
        camerasAvailable: building.camerasAvailable,
        camerasInfo: building.camerasInfo.trim() || undefined,
      });
      setApplication(result);
      setStep("staff");
      toast.success("Building details saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save building details"));
    } finally {
      setLoading(false);
    }
  };

  const handleStaffRowsChange = (rows: StaffFormRow[]) => {
    setStaffRows(rows);
    setRosterSaved(false);
  };

  const handleSaveRoster = async () => {
    if (!applicationId || !sessionToken) return;

    if (staffRows.length === 0) {
      toast.error("Add at least one staff member");
      return;
    }
    for (const member of staffRows) {
      if (!member.name.trim() || !/^\d{13}$/.test(member.cnic)) {
        toast.error("Every staff member needs a name and a 13-digit CNIC");
        return;
      }
    }

    setLoading(true);
    try {
      const result = await centerOnboardingService.submitStaff(
        applicationId,
        sessionToken,
        staffRows.map((row) => ({
          name: row.name.trim(),
          cnic: row.cnic,
          category: row.category,
          qualification: row.qualification.trim() || undefined,
        })),
      );
      setApplication(result);
      if (result.staff) {
        setStaffRows(
          result.staff.map((s) => ({
            id: s.id,
            name: s.name,
            cnic: s.cnic,
            category: s.category,
            qualification: s.qualification ?? "",
            documentObjectKey: s.documentObjectKey,
          })),
        );
      }
      setRosterSaved(true);
      toast.success("Staff roster saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save staff roster"));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadStaffDocument = async (index: number, file: File) => {
    if (!applicationId || !sessionToken) return;
    const row = staffRows[index];
    if (!row.id) return;

    setUploadingIndex(index);
    try {
      const updated = await centerOnboardingService.uploadStaffDocument(applicationId, sessionToken, row.id, file);
      setStaffRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, documentObjectKey: updated.documentObjectKey } : r)),
      );
      toast.success("Document uploaded");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to upload document"));
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmitCenterInfo = async () => {
    if (!applicationId || !sessionToken) return;

    if (!centerInfo.centerName.trim() || !centerInfo.address.trim()) {
      toast.error("Please fill in center name and address");
      return;
    }
    if (!centerInfo.centerPhone.trim()) {
      toast.error("Please provide the center's phone number");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(centerInfo.email.trim())) {
      toast.error("Please provide a valid email — we'll send your password setup link there");
      return;
    }
    if (centerInfo.latitude == null || centerInfo.longitude == null) {
      toast.error("Please pick your center's location on the map");
      return;
    }
    if (!centerInfo.city) {
      toast.error("Couldn't detect a city for this pin — try a location closer to a populated area");
      return;
    }
    if (centerInfo.isJointVenture && !centerInfo.jointVentureLicenseNumber.trim()) {
      toast.error("Please provide the Joint Venture license number");
      return;
    }

    setLoading(true);
    try {
      const result = await centerOnboardingService.submitCenterInfo(applicationId, sessionToken, {
        centerName: centerInfo.centerName.trim(),
        address: centerInfo.address.trim(),
        centerPhone: centerInfo.centerPhone.trim(),
        email: centerInfo.email.trim(),
        latitude: centerInfo.latitude,
        longitude: centerInfo.longitude,
        city: centerInfo.city,
        isJointVenture: centerInfo.isJointVenture,
        jointVentureLicenseNumber: centerInfo.isJointVenture
          ? centerInfo.jointVentureLicenseNumber.trim()
          : undefined,
      });
      setApplication(result);
      setStep("status");
      toast.success("Application submitted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit application"));
    } finally {
      setLoading(false);
    }
  };

  const showStepIndicator = DETAILS_STEP_ORDER.includes(step);
  const currentDetailsStepNumber = DETAILS_STEP_ORDER.indexOf(step) + 1;

  return (
    <div className="min-h-screen bg-[#f5f8f2] relative flex items-start justify-center py-10 px-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(215,248,140,0.18)_0%,transparent_50%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <SoftSkillsBrand subtitle="Center Onboarding" alwaysShowText />
        </div>

        {showStepIndicator && (
          <div className="rounded-2xl border border-[#d5e0d4] bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-5 shadow-[0_8px_24px_rgba(22,76,62,0.04)]">
            <StepIndicator steps={DETAILS_STEPS} currentStep={currentDetailsStepNumber} />
          </div>
        )}

        {step === "prerequisites" && (
          <Card className="border border-[#d5e0d4] rounded-2xl bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)]">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-semibold text-[#183d34]">Before you apply</h2>
              <p className="text-sm text-[#6d8474]">
                Confirm you meet each requirement below before starting your application.
              </p>
              {checklistLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {CHECKLIST_CATEGORY_ORDER.map((category) => {
                    const items = checklistItems.filter((item) => item.category === category);
                    if (items.length === 0) return null;
                    const meta = CHECKLIST_CATEGORY_META[category];
                    const Icon = meta.icon;
                    const confirmedCount = items.filter((item) => acknowledged[item.id]).length;

                    return (
                      <div key={category} className="space-y-2.5">
                        <div className="flex items-center gap-2 px-1">
                          <Icon className="w-4 h-4 text-[#164c3e]" />
                          <h3 className="text-sm font-bold text-[#183d34]/80 uppercase tracking-wide">{meta.label}</h3>
                          <span className="text-[11px] text-[#6d8474] font-semibold bg-[#f4f7f3] border border-[#c9d6c8] rounded-full min-w-[36px] text-center px-1.5 py-0.5">
                            {confirmedCount}/{items.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-start gap-3 p-3 rounded-xl border border-[#c9d6c8] bg-white cursor-pointer hover:bg-[#f8faf7] transition-colors"
                            >
                              <Checkbox
                                checked={!!acknowledged[item.id]}
                                onCheckedChange={(checked) =>
                                  setAcknowledged((prev) => ({ ...prev, [item.id]: checked === true }))
                                }
                              />
                              <div>
                                <p className="text-sm font-medium text-[#183d34]">{item.label}</p>
                                {item.description && (
                                  <p className="text-xs text-[#6d8474]">{item.description}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                className="w-full bg-[#164c3e] hover:bg-[#12382d] text-white h-11 rounded-[10px] shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                disabled={checklistLoading || !allAcknowledged}
                onClick={() => setStep("verify")}
              >
                Yes, I have this — Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "verify" && (
          <Card className="border border-[#d5e0d4] rounded-2xl bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)]">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-[#183d34] mb-1">Verify your license</h2>
              <p className="text-sm text-[#6d8474] mb-5">
                We'll check your CNIC and license number with the Bureau.
              </p>
              <form onSubmit={handleVerifyLicense} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnic" className="text-[#183d34]">CNIC (13 digits, no dashes)</Label>
                  <Input
                    id="cnic"
                    className="h-11"
                    inputMode="numeric"
                    maxLength={13}
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value.replace(/\D/g, ""))}
                    placeholder="3520212345671"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license" className="text-[#183d34]">License Number</Label>
                  <Input
                    id="license"
                    className="h-11"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                    placeholder="ABC-12345"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#164c3e] hover:bg-[#12382d] text-white h-11 rounded-[10px] shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "otp" && (
          <Card className="border border-[#d5e0d4] rounded-2xl bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)]">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-[#183d34] mb-1">Enter OTP</h2>
              <p className="text-sm text-[#6d8474] mb-5">
                We sent a code to {phone ? maskPhone(phone) : "your registered number"}.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-[#183d34]">One-time code</Label>
                  <InputOTP id="otp" maxLength={6} value={otp} onChange={(value) => setOtp(value.replace(/\D/g, ""))}>
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="h-12 w-12 text-lg border-[#c9d6c8]" />
                      <InputOTPSlot index={1} className="h-12 w-12 text-lg border-[#c9d6c8]" />
                      <InputOTPSlot index={2} className="h-12 w-12 text-lg border-[#c9d6c8]" />
                      <InputOTPSlot index={3} className="h-12 w-12 text-lg border-[#c9d6c8]" />
                      <InputOTPSlot index={4} className="h-12 w-12 text-lg border-[#c9d6c8]" />
                      <InputOTPSlot index={5} className="h-12 w-12 text-lg border-[#c9d6c8]" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#164c3e] hover:bg-[#12382d] text-white h-11 rounded-[10px] shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify OTP
                </Button>
                <Button type="button" variant="ghost" className="w-full text-[#6d8474]" onClick={handleResendOtp}>
                  Resend OTP
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "building" && (
          <BuildingStep value={building} onChange={(patch) => setBuilding((prev) => ({ ...prev, ...patch }))} onSubmit={handleSubmitBuilding} loading={loading} />
        )}

        {step === "staff" && (
          <StaffStep
            rows={staffRows}
            onRowsChange={handleStaffRowsChange}
            onSaveRoster={handleSaveRoster}
            onUploadDocument={handleUploadStaffDocument}
            onContinue={() => setStep("center-info")}
            onBack={() => setStep("building")}
            saving={loading}
            uploadingIndex={uploadingIndex}
            rosterSaved={rosterSaved}
          />
        )}

        {step === "center-info" && (
          <CenterInfoStep
            value={centerInfo}
            onChange={(patch) => setCenterInfo((prev) => ({ ...prev, ...patch }))}
            onLocationChange={handleLocationChange}
            onSubmit={handleSubmitCenterInfo}
            onBack={() => setStep("staff")}
            loading={loading}
          />
        )}

        {step === "status" && application && (
          <div className="space-y-4">
            <Card className="border border-[#d5e0d4] rounded-2xl bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)]">
              <CardContent className="p-6 sm:p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#164c3e] mx-auto" />
                <h2 className="text-lg font-semibold text-[#183d34]">
                  {STATUS_COPY[application.status]?.title ?? application.status}
                </h2>
                <p className="text-sm text-[#6d8474]">
                  {STATUS_COPY[application.status]?.body ??
                    "You can check back later for updates on your application."}
                </p>
              </CardContent>
            </Card>

            {HAS_SCHEDULE_INFO.has(application.status) && (
              <>
                <Card className="border border-[#d5e0d4] rounded-2xl bg-white">
                  <CardContent className="p-5 flex items-center gap-2.5">
                    <CalendarClock className="w-4 h-4 text-[#164c3e] shrink-0" />
                    <div>
                      <p className="text-xs text-[#6d8474]">Scheduled Inspection Date</p>
                      <p className="text-sm font-semibold text-[#183d34]">
                        {formatDate(application.scheduledInspectionDate) ?? "Not scheduled yet"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-[#d5e0d4] rounded-2xl bg-white">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#164c3e]" />
                      <h3 className="text-sm font-semibold text-[#183d34]">Committee Updates</h3>
                    </div>
                    {commentsLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-[#6d8474]">No updates yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="p-3 rounded-xl bg-[#f4f7f3] border border-[#c9d6c8]">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-semibold text-[#183d34]">
                                {comment.author.firstName} {comment.author.lastName}
                              </p>
                              <p className="text-[11px] text-[#6d8474]">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                            <p className="text-sm text-[#6d8474]">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
