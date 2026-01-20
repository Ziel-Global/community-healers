import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { CandidateActionCard } from "@/components/CentreAdminPortal/Candidates/CandidateActionCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function VerificationPage() {
    return (
        <DashboardLayout
            title="Identity Verification"
            subtitle="Verify candidate presence and unlock exams"
            portalType="center"
            navItems={centerNavItems}
        >
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by Reg ID for direct verification..."
                        className="pl-12 h-12 bg-white/50 border-border/60 focus:border-primary/40 focus:ring-primary/20 rounded-xl"
                    />
                </div>
                <CandidateActionCard />
            </div>
        </DashboardLayout>
    );
}
