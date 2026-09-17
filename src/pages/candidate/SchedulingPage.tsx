import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { ExamSlotPicker } from "@/components/StudentPortal/Scheduling/ExamSlotPicker";
import { CenterSelector } from "@/components/StudentPortal/Scheduling/CenterSelector";
import { FeePaymentCard } from "@/components/StudentPortal/Payments/FeePaymentCard";
import { useEligibleCenters, useScheduleExam } from "@/hooks/queries/useCandidateQueries";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";

export default function SchedulingPage() {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedCenterId, setSelectedCenterId] = useState<string | undefined>();
    const [isScheduled, setIsScheduled] = useState(false);
    const scheduleExamMutation = useScheduleExam();

    // Local date components, not toISOString() — the Calendar gives a Date
    // at local midnight for the clicked day, and toISOString() converts to
    // UTC first, which silently shifts the date back a day for any
    // timezone ahead of UTC (e.g. PKT, UTC+5) — the candidate would be
    // scheduled for a different day than the one they clicked and the
    // confirmation toast (which does use local time) shows them.
    const examDateStr = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        : undefined;

    // Shares its cache entry with the same call inside CenterSelector.
    const centersQuery = useEligibleCenters(examDateStr);
    const requiresCenterSelection = centersQuery.isSuccess && (centersQuery.data?.centers.length ?? 0) > 0;

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedCenterId(undefined);
    };

    const handleSchedule = () => {
        if (!selectedDate || !examDateStr) return;
        if (requiresCenterSelection && !selectedCenterId) return;

        scheduleExamMutation.mutate({ examDate: examDateStr, centerId: selectedCenterId }, {
            onSuccess: () => {
                setIsScheduled(true);
                toast({
                    title: "Exam Scheduled",
                    description: `Your exam has been scheduled for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
                });
            },
            onError: (error) => {
                console.error("Scheduling error:", error);
                toast({
                    title: "Scheduling Failed",
                    description: getApiErrorMessage(error, "Failed to schedule exam. Please try again."),
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <DashboardLayout
            title="Exam Scheduling"
            subtitle="Select your preferred exam slot and center"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <ExamSlotPicker
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                            onSchedule={handleSchedule}
                            isScheduling={scheduleExamMutation.isPending}
                            isScheduled={isScheduled}
                        />

                        {selectedDate && examDateStr && !isScheduled && (
                            <CenterSelector
                                examDate={examDateStr}
                                selectedCenterId={selectedCenterId}
                                onSelectCenter={setSelectedCenterId}
                            />
                        )}
                    </div>
                    <div className="space-y-8">
                        <FeePaymentCard
                            type="exam"
                            amount={2000}
                            isPaid={false}
                            onGenerateQR={() => console.log("Generate QR clicked")}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
