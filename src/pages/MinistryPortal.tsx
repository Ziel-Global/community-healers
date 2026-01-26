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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Primary Issuance Queue */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-10">
            <section className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-xl alumni-sans-title text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Pending Certification Review
                </h2>
              </div>
              <PassedCandidateTable />
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-xl alumni-sans-title text-foreground flex items-center gap-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Global Certificate Registry
              </h2>
              <VerifiableRegistry />
            </section>
          </div>

          {/* Authority Oversight Side Panel */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-xl alumni-sans-title text-foreground flex items-center gap-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Recent Authority Actions
              </h2>
              <MinistryIssuanceLogs />
            </section>

            <Card className="border-border/40 bg-card overflow-hidden shadow-sm">
              <CardHeader className="bg-secondary/30 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Issuance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { label: "Lahore Region", value: "45%", color: "bg-primary" },
                    { label: "Karachi Region", value: "30%", color: "bg-indigo-500" },
                    { label: "Islamabad Region", value: "15%", color: "bg-emerald-500" },
                    { label: "Multan Region", value: "10%", color: "bg-amber-500" },
                  ].map((region) => (
                    <div key={region.label} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>{region.label}</span>
                        <span className="text-muted-foreground">{region.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${region.color}`} style={{ width: region.value }} />
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6 text-xs h-9 font-bold border-border/60">
                  View Regional Analytics
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-black text-white shadow-royal space-y-4">
              <h3 className="text-lg alumni-sans-title flex items-center gap-2 text-primary">
                <FileCheck className="w-5 h-5" />
                Quarterly Audit Prep
              </h3>
              <p className="text-xs font-medium leading-relaxed opacity-80">
                Consolidate all issuance records and authority logs for the upcoming external compliance audit.
              </p>
              <Button className="w-full gradient-primary text-black font-bold h-11 rounded-xl">
                Prepare Audit Bundle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
