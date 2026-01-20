import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LayoutDashboard,
  Award,
  Building2,
  BarChart3,
  FileCheck,
  Settings,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/ministry",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Certificates",
    href: "/ministry/certificates",
    icon: <Award className="w-4 h-4" />,
  },
  {
    label: "Centers",
    href: "/ministry/centers",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    label: "Reports",
    href: "/ministry/reports",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    label: "Approvals",
    href: "/ministry/approvals",
    icon: <FileCheck className="w-4 h-4" />,
  },
  {
    label: "Settings",
    href: "/ministry/settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

const pendingCertificates = [
  {
    id: "CERT-2024-001",
    name: "Muhammad Ahmed",
    center: "Lahore Center #1",
    examDate: "Jan 20, 2024",
    score: 85,
  },
  {
    id: "CERT-2024-002",
    name: "Fatima Khan",
    center: "Karachi Center #2",
    examDate: "Jan 20, 2024",
    score: 90,
  },
  {
    id: "CERT-2024-003",
    name: "Ali Hassan",
    center: "Islamabad Center #1",
    examDate: "Jan 19, 2024",
    score: 75,
  },
  {
    id: "CERT-2024-004",
    name: "Ayesha Malik",
    center: "Lahore Center #3",
    examDate: "Jan 19, 2024",
    score: 80,
  },
];

export default function MinistryPortal() {
  return (
    <DashboardLayout
      title="Ministry Dashboard"
      subtitle="Certificate Authority Portal"
      portalType="ministry"
      navItems={navItems}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Issued"
          value="45,230"
          icon={Award}
          change="+1,234 this month"
          changeType="positive"
        />
        <StatCard
          title="Pending Review"
          value="892"
          icon={Clock}
          change="142 urgent"
          changeType="neutral"
        />
        <StatCard
          title="Today's Issuances"
          value="156"
          icon={CheckCircle2}
          change="On track"
          changeType="positive"
        />
        <StatCard
          title="Centers Active"
          value="86"
          icon={Building2}
          change="100% operational"
          changeType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Certificates */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-card/60 backdrop-blur border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Pending Certificates
              </h3>
              <p className="text-sm text-muted-foreground">
                Select candidates for bulk certificate issuance
              </p>
            </div>
            <Button variant="gradient">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Issue Selected
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 pr-2">
                    <Checkbox />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Candidate
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Center
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Exam Date
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Score
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingCertificates.map((cert) => (
                  <tr
                    key={cert.id}
                    className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="py-4 pr-2">
                      <Checkbox />
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {cert.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cert.id}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {cert.center}
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {cert.examDate}
                    </td>
                    <td className="py-4">
                      <Badge className="bg-success/20 text-success border-success/30">
                        {cert.score}%
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="gradient" size="sm">
                          Issue
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Showing 4 of 892 pending certificates
            </p>
            <Button variant="outline" size="sm">
              Load More
            </Button>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="space-y-6">
          {/* Issuance Stats */}
          <div className="p-6 rounded-xl bg-card/60 backdrop-blur border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              This Week
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Issued</span>
                <span className="text-lg font-bold text-foreground">1,234</span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{ width: "78%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                78% of weekly target
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-3 rounded-lg bg-secondary/30 text-center">
                <p className="text-lg font-bold text-foreground">42</p>
                <p className="text-xs text-muted-foreground">Lahore</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 text-center">
                <p className="text-lg font-bold text-foreground">38</p>
                <p className="text-xs text-muted-foreground">Karachi</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 text-center">
                <p className="text-lg font-bold text-foreground">28</p>
                <p className="text-xs text-muted-foreground">Islamabad</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 text-center">
                <p className="text-lg font-bold text-foreground">48</p>
                <p className="text-xs text-muted-foreground">Others</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-xl bg-card/60 backdrop-blur border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                View Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
