import { Gavel } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export const committeeChairmanNavItems = [
  { label: "Dashboard", href: "/committee-chairman", icon: <Gavel className="w-4 h-4" /> },
];

export default function CommitteeChairmanPortal() {
  return (
    <DashboardLayout
      title="Committee Chairman"
      subtitle="Final decisions on center applications"
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-xl">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Welcome</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are signed in as Committee Chairman. Inspection review and final decisions will be available here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
