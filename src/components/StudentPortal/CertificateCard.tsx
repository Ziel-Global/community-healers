import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, Download, Share2 } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface CertificateData {
    certificate_number: string;
    score: string;
    issuedDate: string;
    expiryDate: string | null;
    downloadUrl: string | null;
}

interface CertificateCardProps {
    certificate: CertificateData;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Award className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{t('certificate.ready')}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('certificate.congratsExam')}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40 text-sm px-3 py-1">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {t('certificate.certified')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 rounded-xl bg-card border border-border/40">
                        <p className="text-xs text-muted-foreground mb-1">{t('certificate.certificateNumber')}</p>
                        <p className="font-bold text-foreground font-mono text-lg">{certificate.certificate_number}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/40">
                        <p className="text-xs text-muted-foreground mb-1">{t('certificate.examScore')}</p>
                        <p className="font-bold text-green-600 dark:text-green-400 text-lg">{certificate.score}% - {t('certificate.passed')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/40">
                        <p className="text-xs text-muted-foreground mb-1">{t('certificate.issueDate')}</p>
                        <p className="font-bold text-foreground">
                            {format(new Date(certificate.issuedDate), 'MMMM d, yyyy')}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/40">
                        <p className="text-xs text-muted-foreground mb-1">{t('certificate.validUntil')}</p>
                        <p className="font-bold text-foreground">
                            {certificate.expiryDate ? format(new Date(certificate.expiryDate), 'MMMM d, yyyy') : t('certificate.indefinite')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button size="lg" className="flex-1 gap-2 shadow-lg" disabled={!certificate.downloadUrl}>
                        <Download className="w-4 h-4" />
                        {t('certificate.downloadPDF')}
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        {t('certificate.share')}
                    </Button>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">{t('common.note')}</strong> {t('certificate.note')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
