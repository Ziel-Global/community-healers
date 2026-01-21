import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { CenterAssignmentStatus } from "@/components/StudentPortal/Scheduling/CenterAssignmentStatus";
import { ExamSlotPicker } from "@/components/StudentPortal/Scheduling/ExamSlotPicker";
import { FeePaymentCard } from "@/components/StudentPortal/Payments/FeePaymentCard";

export default function SchedulingPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

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
