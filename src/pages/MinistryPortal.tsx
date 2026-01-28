import { DashboardLayout } from "@/components/DashboardLayout";
import { MinistryStats } from "@/components/MinistryPortal/Dashboard/MinistryStats";
import { PassedCandidateTable } from "@/components/MinistryPortal/Review/PassedCandidateTable";
import { VerifiableRegistry } from "@/components/MinistryPortal/Registry/VerifiableRegistry";
import { MinistryIssuanceLogs } from "@/components/MinistryPortal/Audit/MinistryIssuanceLogs";
import {
  ShieldCheck,
  Award,
  Search,
  History,
  LayoutDashboard,
  Users,
  FileCheck,
  Building2,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ministryNavItems = [
  {
    label: "Authority Hub",
    href: "/ministry",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Candidate Review",
    href: "/ministry/review",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Certificate Registry",
    href: "/ministry/registry",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    label: "Issuance Logs",
    href: "/ministry/logs",
    icon: <History className="w-4 h-4" />,
  },
  {
    label: "Center Oversight",
    href: "/ministry/centers",
    icon: <Building2 className="w-4 h-4" />,
  },
];

export default function MinistryPortal() {
  return (
    <DashboardLayout
      title="Ministry Authority Portal"
      subtitle="Certification Issuance & Governance Oversight"
      portalType="ministry"
      navItems={ministryNavItems}
    >
      <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
        {/* Authority Overview Stats */}
        <MinistryStats />

      </div>
    </DashboardLayout>
  );
}
