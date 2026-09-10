import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { inspectorNavItems } from "../InspectorPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  useInspectorApplicationDetail,
  useUploadEvidence,
  useSetChecklistResult,
  useSubmitInspection,
} from "@/hooks/queries/useInspectorQueries";
import { getApiErrorMessage } from "@/lib/errors";

const MIN_EVIDENCE = 2;

export default function InspectorApplicationDetailPage() {
  const { applicationId = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useInspectorApplicationDetail(applicationId);
  const uploadMutation = useUploadEvidence(applicationId);
  const resultMutation = useSetChecklistResult(applicationId);
  const submitMutation = useSubmitInspection(applicationId);
  const [notesByItem, setNotesByItem] = useState<Record<string, string>>({});
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." portalType="inspector" navItems={inspectorNavItems}>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { application, checklist } = data;
  const isReadOnly = application.status !== "INSPECTION_IN_PROGRESS";
  const allMarked = checklist.every((item) => item.passed !== null);

  const handleFileSelected = (checklistItemId: string, file: File | null) => {
    if (!file) return;
    setUploadingItemId(checklistItemId);
    uploadMutation.mutate(
      { checklistItemId, photo: file },
      {
        onSuccess: () => {
          toast.success("Evidence photo uploaded");
          setUploadingItemId(null);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "Failed to upload photo"));
          setUploadingItemId(null);
        },
      },
    );
  };

  const handleMark = (checklistItemId: string, passed: boolean) => {
    resultMutation.mutate(
      { checklistItemId, passed, notes: notesByItem[checklistItemId] },
      {
        onSuccess: () => toast.success(passed ? "Marked as passed" : "Marked as failed"),
        onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update checklist item")),
      },
    );
  };

  const handleSubmit = () => {
    submitMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Inspection submitted for Super Admin review");
        navigate("/inspector");
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Failed to submit inspection")),
    });
  };

  return (
    <DashboardLayout
      title={application.centerName || "Application"}
      subtitle={application.address || undefined}
      portalType="inspector"
      navItems={inspectorNavItems}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {isReadOnly && (
          <div className="p-4 rounded-xl bg-secondary/40 border border-border/40 text-sm text-muted-foreground">
            This application's status is <strong>{application.status}</strong> — checklist is read-only.
          </div>
        )}

        {checklist.map((item) => {
          const evidenceCount = item.evidence.length;
          const canMark = evidenceCount >= MIN_EVIDENCE;

          return (
            <Card key={item.checklistItemId} className="border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                  {item.passed !== null && (
                    <Badge variant={item.passed ? "success" : "destructive"}>
                      {item.passed ? "Passed" : "Failed"}
                    </Badge>
                  )}
                </div>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    {evidenceCount} / {MIN_EVIDENCE} photos minimum
                  </div>
                  {!isReadOnly && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => (fileInputRefs.current[item.checklistItemId] = el)}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          e.target.value = "";
                          handleFileSelected(item.checklistItemId, file);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadingItemId === item.checklistItemId}
                        onClick={() => fileInputRefs.current[item.checklistItemId]?.click()}
                      >
                        {uploadingItemId === item.checklistItemId ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload Photo
                      </Button>
                    </>
                  )}
                </div>

                {!isReadOnly && (
                  <>
                    <Textarea
                      placeholder="Notes (optional)"
                      defaultValue={item.notes || ""}
                      onChange={(e) =>
                        setNotesByItem((prev) => ({ ...prev, [item.checklistItemId]: e.target.value }))
                      }
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                        disabled={!canMark || resultMutation.isPending}
                        onClick={() => handleMark(item.checklistItemId, true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Pass
                      </Button>
                      <Button
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        disabled={!canMark || resultMutation.isPending}
                        onClick={() => handleMark(item.checklistItemId, false)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Fail
                      </Button>
                    </div>
                    {!canMark && (
                      <p className="text-xs text-muted-foreground">
                        Upload at least {MIN_EVIDENCE} photos before marking this item.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

        {!isReadOnly && (
          <div className="flex justify-end pt-4">
            <Button
              className="gradient-primary text-white"
              disabled={!allMarked || submitMutation.isPending}
              onClick={handleSubmit}
            >
              {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Inspection
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
