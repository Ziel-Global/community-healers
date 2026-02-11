import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { CenterAssignmentStatus } from "@/components/StudentPortal/Scheduling/CenterAssignmentStatus";
import { ExamSlotPicker } from "@/components/StudentPortal/Scheduling/ExamSlotPicker";
import { FeePaymentCard } from "@/components/StudentPortal/Payments/FeePaymentCard";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function SchedulingPage() {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [isScheduling, setIsScheduling] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);

    const handleSchedule = async () => {
        if (!selectedDate) return;

        setIsScheduling(true);
        try {
            const examDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
            await api.post('/candidates/me/schedule', { examDate });

            setIsScheduled(true);
            toast({
                title: "Exam Scheduled",
                description: `Your exam has been scheduled for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
            });
        } catch (error: any) {
            console.error("Scheduling error:", error);
            toast({
                title: "Scheduling Failed",
                description: error.response?.data?.message || "Failed to schedule exam. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsScheduling(false);
        }
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
                        <CenterAssignmentStatus
                            centerName="Lahore Training Center #3"
                            centerId="LHR-003"
                            location="Model Town, Lahore"
                        />
                        <ExamSlotPicker
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            onSchedule={handleSchedule}
                            isScheduling={isScheduling}
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
