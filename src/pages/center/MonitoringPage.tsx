import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { ExamMonitoringGrid } from "@/components/CentreAdminPortal/Monitoring/ExamMonitoringGrid";
import { Monitor } from "lucide-react";

export default function MonitoringPage() {
    return (
        <DashboardLayout
            title="Live Exam Monitoring"
            subtitle="Real-time tracking of active exam attempts"
            portalType="center"
            navItems={centerNavItems}
        >
            <div className="space-y-8 max-w-[1400px] mx-auto">
                <div className="p-6 rounded-2xl bg-card border border-[#e7eee9] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Active Session: Morning</h3>
                            <p className="text-sm text-muted-foreground">09:00 AM - 01:00 PM • 12 Candidates active</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e7f2db] text-[#426f36] text-xs font-bold ring-1 ring-[#c7ddb5]">
                            <span className="w-2 h-2 rounded-full bg-[#568a38] animate-pulse" />
                            Live Feed Active
                        </span>
                    </div>
                </div>

                <ExamMonitoringGrid />
            </div>
        </DashboardLayout>
    );
}
