import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { ExamSlotPicker } from "@/components/StudentPortal/Scheduling/ExamSlotPicker";
import { FeePaymentCard } from "@/components/StudentPortal/Payments/FeePaymentCard";
import { useScheduleExam } from "@/hooks/queries/useCandidateQueries";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";

export default function SchedulingPage() {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [isScheduled, setIsScheduled] = useState(false);
    const scheduleExamMutation = useScheduleExam();

    const handleSchedule = () => {
        if (!selectedDate) return;

        const examDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        scheduleExamMutation.mutate(examDate, {
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
                            onDateSelect={setSelectedDate}
                            onSchedule={handleSchedule}
                            isScheduling={scheduleExamMutation.isPending}
                            isScheduled={isScheduled}
                        />
                    </div>
                    <div className="space-y-8">
                        <FeePaymentCard
                            type="exam"
                            amount={2000}
                            isPaid={false}
                            onPay={() => console.log("Pay clicked")}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
