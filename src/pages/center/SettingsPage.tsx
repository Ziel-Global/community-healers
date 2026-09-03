import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { centerNavItems } from "../CenterAdminPortal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { Clock, Loader2, Save } from "lucide-react";
import { useCenterDetails, useUpdateTrainingTimings } from "@/hooks/queries/useCenterAdminQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { toTimeInputValue, utcHHMMToPkt, pktHHMMToUtc } from "@/utils/time";
import { toast } from "sonner";

// The server stores and computes training hours as literal UTC wall-clock
// time (no Pakistan-timezone awareness at all) — "09:00"/"17:00" here is
// the true raw default the backend falls back to.
const RAW_DEFAULT_START = "09:00";
const RAW_DEFAULT_END = "17:00";

// This page displays/edits in Pakistan time throughout — everything below
// converts at the load/save boundary so the admin only ever sees and types
// genuine PKT hours, while the value sent to/received from the API stays
// in the raw UTC-labeled form the backend already expects.
const DEFAULT_START = utcHHMMToPkt(RAW_DEFAULT_START);
const DEFAULT_END = utcHHMMToPkt(RAW_DEFAULT_END);

export default function SettingsPage() {
  const [trainingStartTime, setTrainingStartTime] = useState(DEFAULT_START);
  const [trainingEndTime, setTrainingEndTime] = useState(DEFAULT_END);
  const [savedStartTime, setSavedStartTime] = useState(DEFAULT_START);
  const [savedEndTime, setSavedEndTime] = useState(DEFAULT_END);
  const [initialized, setInitialized] = useState(false);

  const { data: centerData, isLoading, isError, error: loadQueryError } = useCenterDetails();
  const updateTimings = useUpdateTrainingTimings();

  const centerId = centerData?.id ?? null;
  const centerName = centerData?.name || "";

  const loadError = isError
    ? getApiErrorMessage(loadQueryError, "Failed to load training timings.")
    : (!isLoading && !centerId ? "No centre is linked to this admin account." : null);

  // Seed the draft/saved baseline from the fetched center details, once.
  // Guarded by `initialized` so a background refetch doesn't clobber
  // in-progress edits the user hasn't saved yet.
  useEffect(() => {
    if (!isLoading && centerData?.id && !initialized) {
      const start = utcHHMMToPkt(toTimeInputValue(centerData.trainingStartTime, RAW_DEFAULT_START));
      const end = utcHHMMToPkt(toTimeInputValue(centerData.trainingEndTime, RAW_DEFAULT_END));
      setTrainingStartTime(start);
      setTrainingEndTime(end);
      setSavedStartTime(start);
      setSavedEndTime(end);
      setInitialized(true);
    }
  }, [isLoading, centerData, initialized]);

  useEffect(() => {
    if (isError) {
      toast.error(getApiErrorMessage(loadQueryError, "Failed to load training timings."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const hasChanges =
    trainingStartTime !== savedStartTime || trainingEndTime !== savedEndTime;

  const handleSave = () => {
    if (!centerId) {
      toast.error(loadError || "Center ID not available. Reload the page and try again.");
      return;
    }
    if (!hasChanges) return;
    if (trainingStartTime >= trainingEndTime) {
      toast.error("End time must be after start time.");
      return;
    }

    const rawStart = pktHHMMToUtc(trainingStartTime);
    const rawEnd = pktHHMMToUtc(trainingEndTime);

    updateTimings.mutate(
      { centerId, timings: { trainingStartTime: rawStart, trainingEndTime: rawEnd } },
      {
        onSuccess: (updated) => {
          const start = utcHHMMToPkt(toTimeInputValue(updated?.trainingStartTime, rawStart));
          const end = utcHHMMToPkt(toTimeInputValue(updated?.trainingEndTime, rawEnd));
          setTrainingStartTime(start);
          setTrainingEndTime(end);
          setSavedStartTime(start);
          setSavedEndTime(end);
          toast.success("Training timings saved.");
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "Failed to save training timings."));
        },
      }
    );
  };

  return (
    <DashboardLayout
      title="Center Settings"
      subtitle="Configure training hours for your centre"
      portalType="center"
      navItems={centerNavItems}
    >
      <div className="max-w-xl mx-auto">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="alumni-sans-title">Training Timings</CardTitle>
                <CardDescription>
                  {centerName
                    ? `Set daily training start and end for ${centerName}. Default is ${DEFAULT_START}–${DEFAULT_END}.`
                    : `Candidates must arrive 1 hour before start for verification. Default is ${DEFAULT_START}–${DEFAULT_END}.`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading timings…
              </div>
            ) : (
              <>
                {loadError && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    {loadError}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainingStartTime">Training start time</Label>
                    <TimePicker
                      id="trainingStartTime"
                      value={trainingStartTime}
                      onChange={setTrainingStartTime}
                      disabled={!centerId}
                    />
                    <p className="text-xs text-muted-foreground">
                      Verification closes at this time.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainingEndTime">Training end time</Label>
                    <TimePicker
                      id="trainingEndTime"
                      value={trainingEndTime}
                      onChange={setTrainingEndTime}
                      disabled={!centerId}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-muted-foreground">
                  Candidates are told to arrive at least <strong className="text-foreground">1 hour before</strong> the
                  training start time for verification.
                </div>

                <Button
                  onClick={handleSave}
                  disabled={updateTimings.isPending || !centerId || !hasChanges}
                  className="w-full sm:w-auto gap-2"
                >
                  {updateTimings.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save timings
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
