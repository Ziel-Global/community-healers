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
                    <div className="space-y-3">
                        {certificate.isExpired && (
                            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
                                This certificate expired on {new Date(certificate.expiryDate!).toLocaleDateString()}.
                            </div>
                        )}
                        <CertificatePreviewCard
                            certNumber={certificate.certificateNumber}
                            issuedDate={certificate.issuedDate}
                            score={certificate.score}
                            fetchPdf={candidateService.getMyCertificatePdfBlob}
                        />
                    </div>
                ) : (
                    <Card className="border-border/40 shadow-sm">
                        <CardContent className="p-10 text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mx-auto grayscale opacity-40">
                                <Award className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-foreground">Certificate Pending</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                                    Your certificate is issued automatically the moment you pass your exam.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
