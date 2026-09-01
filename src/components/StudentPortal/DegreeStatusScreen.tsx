import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ShieldCheck, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateCandidateMe, useUploadDocument } from "@/hooks/queries/useCandidateQueries";
import { getApiErrorMessage } from "@/lib/errors";

interface DegreeStatusScreenProps {
  status: "UPLOADED" | "APPROVED" | "REJECTED";
  reviewNote?: string | null;
  onSwitchedToExam: () => void;
}

export function DegreeStatusScreen({ status, reviewNote, onSwitchedToExam }: DegreeStatusScreenProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDocumentMutation = useUploadDocument();
  const updateCandidateMeMutation = useUpdateCandidateMe();
  const [confirmingSwitch, setConfirmingSwitch] = useState(false);

  const handleReupload = (file: File | null) => {
    if (!file) return;
    uploadDocumentMutation.mutate(
      { type: "degreeTranscript", file },
      {
        onSuccess: () => {
          toast({ title: t("documents.uploadSuccess"), description: file.name });
        },
        onError: (error) => {
          toast({
            title: t("documents.uploadFailed"),
            description: getApiErrorMessage(error, t("documents.uploadFailed")),
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleSwitchToExam = () => {
    if (!confirmingSwitch) {
      setConfirmingSwitch(true);
      return;
    }
    updateCandidateMeMutation.mutate(
      { certificationPath: "EXAM" },
      {
        onSuccess: () => onSwitchedToExam(),
        onError: (error) => {
          toast({
            title: t("registration.error"),
            description: getApiErrorMessage(error, t("registration.failedToSave")),
            variant: "destructive",
          });
        },
      },
    );
  };

  if (status === "UPLOADED") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
              {t("education.underReviewTitle")}
            </h2>
            <p className="text-amber-700 dark:text-amber-300">{t("education.underReviewDesc")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
              {t("education.approvedPendingTitle")}
            </h2>
            <p className="text-emerald-700 dark:text-emerald-300">{t("education.approvedPendingDesc")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // REJECTED
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-destructive mb-2">{t("education.rejectedTitle")}</h2>
            <p className="text-muted-foreground">{t("education.rejectedDesc")}</p>
            {reviewNote && (
              <p className="text-sm text-muted-foreground mt-3">
                <span className="font-medium">{t("education.rejectedReasonLabel")}:</span> {reviewNote}
              </p>
            )}
          </div>

          {confirmingSwitch && (
            <p className="text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3">
              {t("education.switchToExamConfirm")}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf,image/*"
              onChange={(e) => handleReupload(e.target.files?.[0] || null)}
            />
            <Button
              className="gradient-primary text-white"
              disabled={uploadDocumentMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadDocumentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("education.reuploadButton")}
            </Button>
            <Button
              variant="outline"
              disabled={updateCandidateMeMutation.isPending}
              onClick={handleSwitchToExam}
            >
              {updateCandidateMeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("education.switchToExamButton")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
