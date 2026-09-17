import { DashboardLayout } from "@/components/DashboardLayout";
import { candidateNavItems } from "./RegistrationPage";
import { CertificatePreviewCard } from "@/components/Certificates/CertificatePreviewCard";
import { useMyCertificate } from "@/hooks/queries/useCandidateQueries";
import { candidateService } from "@/services/candidateService";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Loader2 } from "lucide-react";

export default function CertificatesPage() {
    const { data: certificate, isLoading } = useMyCertificate();

    return (
        <DashboardLayout
            title="My Certificates"
            subtitle="View and download your official certifications"
            portalType="candidate"
            navItems={candidateNavItems}
        >
            <div className="max-w-5xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : certificate ? (
                    <CertificatePreviewCard
                        certNumber={certificate.certificate_number}
                        issuedDate={certificate.issuedDate}
                        score={certificate.score}
                        fetchPdf={candidateService.getMyCertificatePdfBlob}
                    />
                ) : (
                    <Card className="border-border/40 shadow-sm">
                        <CardContent className="p-10 text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mx-auto grayscale opacity-40">
                                <Award className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-foreground">Certificate Pending</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                                    Your certificate will be generated automatically once the ministry verifies your exam results.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
