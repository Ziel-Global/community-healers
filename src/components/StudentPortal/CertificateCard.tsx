import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, Download, Loader2, Share2 } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { candidateService } from "@/services/candidateService";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/errors";

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
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await candidateService.getMyCertificatePdfBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `certificate-${certificate.certificate_number}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to download certificate"));
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card className="border-[#d8e4bc] shadow-[0_16px_40px_#163a2b0c] bg-gradient-to-br from-[#edf5df] to-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-[#e7eee9] bg-[#f5f8f2]">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[13px] bg-[#e9f1e3] flex items-center justify-center border border-[#dce7d6]">
                            <Award className="w-6 h-6 text-[#3c6445]" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-display font-semibold text-[#183d34] tracking-tight">{t('certificate.ready')}</CardTitle>
                            <p className="text-sm text-[#64736d] mt-1">
                                {t('certificate.congratsExam')}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-[#e7f2db] text-[#426f36] border-[#c7ddb5] text-sm px-3 py-1 hover:bg-[#e7f2db]">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {t('certificate.certified')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-white border border-[#e7eee9]">
                        <p className="text-xs text-[#658075] mb-1">{t('certificate.certificateNumber')}</p>
                        <p className="font-bold text-[#183d34] font-mono text-lg">{certificate.certificate_number}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#e7eee9]">
                        <p className="text-xs text-[#658075] mb-1">{t('certificate.examScore')}</p>
                        <p className="font-bold text-[#426f36] text-lg">{t('certificate.passed')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#e7eee9]">
                        <p className="text-xs text-[#658075] mb-1">{t('certificate.issueDate')}</p>
                        <p className="font-semibold text-[#183d34]">
                            {format(new Date(certificate.issuedDate), 'MMMM d, yyyy')}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#e7eee9]">
                        <p className="text-xs text-[#658075] mb-1">{t('certificate.validUntil')}</p>
                        <p className="font-semibold text-[#183d34]">
                            {certificate.expiryDate ? format(new Date(certificate.expiryDate), 'MMMM d, yyyy') : t('certificate.indefinite')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button size="lg" className="flex-1 gap-2" disabled={downloading} onClick={handleDownload}>
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {t('certificate.downloadPDF')}
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        {t('certificate.share')}
                    </Button>
                </div>

                <div className="mt-4 p-4 rounded-xl ss-status-info">
                    <p className="text-xs text-[#64736d]">
                        <strong className="text-[#183d34]">{t('common.note')}</strong> {t('certificate.note')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
