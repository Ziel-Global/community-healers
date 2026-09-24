import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import {
  useMarkVideoComplete,
  usePlayVideo,
  useTrainingProgress,
} from "@/hooks/queries/useTrainingVideosQueries";
import type { NextVideo, TrainingVideoProgress } from "@/services/trainingVideosService";
import {
  Check,
  ChevronRight,
  Loader2,
  Lock,
  LogOut,
  Play,
  Shield,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type LessonStatus = "completed" | "current" | "locked";

interface SyllabusLesson {
  sequenceOrder: number;
  title: string;
  status: LessonStatus;
  video: NextVideo | null;
  progressPercent: number;
}

function buildSyllabus(
  progress: TrainingVideoProgress,
  watchPercentById: Record<string, number>
): SyllabusLesson[] {
  const currentOrder = progress.lastCompletedSequenceOrder + 1;

  return Array.from({ length: progress.totalVideos }, (_, index) => {
    const sequenceOrder = index + 1;
    const isCompleted = sequenceOrder <= progress.lastCompletedSequenceOrder;
    const isCurrent = progress.nextVideo?.sequenceOrder === sequenceOrder;
    const video = isCurrent ? progress.nextVideo : null;

    let status: LessonStatus = "locked";
    let progressPercent = 0;

    if (isCompleted) {
      status = "completed";
      progressPercent = 100;
    } else if (isCurrent || sequenceOrder === currentOrder) {
      status = "current";
      progressPercent = video ? watchPercentById[video.id] ?? 0 : 0;
    }

    return {
      sequenceOrder,
      title: video?.title ?? `Video ${String(sequenceOrder).padStart(2, "0")}`,
      status,
      video,
      progressPercent,
    };
  });
}

export default function TrainingInstructorPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: progress, isLoading } = useTrainingProgress();
  const playVideo = usePlayVideo();
  const markComplete = useMarkVideoComplete();

  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [watchPercentById, setWatchPercentById] = useState<Record<string, number>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSyllabusOpen, setMobileSyllabusOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const syllabus = useMemo(
    () => (progress ? buildSyllabus(progress, watchPercentById) : []),
    [progress, watchPercentById]
  );

  const coursePercent =
    progress && progress.totalVideos > 0
      ? Math.round((progress.lastCompletedSequenceOrder / progress.totalVideos) * 100)
      : 0;

  const selectedLesson =
    syllabus.find((lesson) => lesson.sequenceOrder === selectedOrder) ??
    syllabus.find((lesson) => lesson.status === "current") ??
    null;

  useEffect(() => {
    if (!progress) return;
    if (progress.nextVideo) {
      setSelectedOrder(progress.nextVideo.sequenceOrder);
      return;
    }
    if (progress.totalVideos > 0) {
      setSelectedOrder(progress.totalVideos);
    }
  }, [progress?.nextVideo?.id, progress?.lastCompletedSequenceOrder, progress?.totalVideos]);

  const handlePlay = (videoId: string) => {
    playVideo.mutate(videoId, {
      onSuccess: (result) => {
        setPlaybackUrl(result.url);
        setPlayingVideoId(videoId);
        setMobileSyllabusOpen(false);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Failed to load video."));
      },
    });
  };

  const handleSelectLesson = (lesson: SyllabusLesson) => {
    if (lesson.status === "locked") {
      toast.message("Complete the previous videos first.");
      return;
    }

    setSelectedOrder(lesson.sequenceOrder);

    if (lesson.status === "completed") {
      setPlaybackUrl(null);
      setPlayingVideoId(null);
      return;
    }

    if (lesson.video) {
      handlePlay(lesson.video.id);
    }
  };

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || !playingVideoId || !el.duration) return;
    const percent = Math.min(99, Math.round((el.currentTime / el.duration) * 100));
    setWatchPercentById((prev) => {
      if ((prev[playingVideoId] ?? 0) >= percent) return prev;
      return { ...prev, [playingVideoId]: percent };
    });
  };

  const handleEnded = () => {
    if (!playingVideoId) return;
    setWatchPercentById((prev) => ({ ...prev, [playingVideoId]: 100 }));
    markComplete.mutate(playingVideoId, {
      onSuccess: () => {
        setPlaybackUrl(null);
        setPlayingVideoId(null);
        toast.success("Lesson completed.");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Failed to record completion. Try again."));
      },
    });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      navigate("/training-instructor/auth");
      setIsLoggingOut(false);
    }
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Instructor";

  return (
    <div className="h-screen bg-[#f7f8f9] text-foreground overflow-hidden flex flex-col">
      {/* Top chrome */}
      <header className="h-14 shrink-0 border-b border-border/70 bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="alumni-sans-title text-[15px] leading-tight truncate">Soft skill training</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
              Training course
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Overall progress
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {progress?.lastCompletedSequenceOrder ?? 0}/{progress?.totalVideos ?? 0}
              <span className="text-muted-foreground font-normal ml-1.5">{coursePercent}%</span>
            </p>
          </div>
          <div className="w-28 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-700 transition-all duration-500 ease-out"
              style={{ width: `${coursePercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <p className="hidden sm:block text-xs text-muted-foreground truncate max-w-[140px]">
            {displayName}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {/* Mobile syllabus toggle */}
        <button
          type="button"
          onClick={() => setMobileSyllabusOpen(true)}
          className="lg:hidden absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
        >
          Course content
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {mobileSyllabusOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-foreground/25 backdrop-blur-sm z-40"
            onClick={() => setMobileSyllabusOpen(false)}
          />
        )}

        {/* Left: course content */}
        <aside
          className={cn(
            "w-[min(100%,22rem)] shrink-0 bg-white border-r border-border/80 flex flex-col z-50",
            "fixed inset-y-0 left-0 pt-14 lg:pt-0 lg:static lg:translate-x-0 transition-transform duration-300",
            mobileSyllabusOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="px-5 py-4 border-b border-border/60">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1">
              Course content
            </p>
            <h2 className="font-display text-xl font-semibold leading-snug">
              Soft Skills Certification
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                  style={{ width: `${coursePercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-emerald-800">
                {coursePercent}%
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {progress?.lastCompletedSequenceOrder ?? 0} of {progress?.totalVideos ?? 0} lessons complete
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading lessons…
              </div>
            ) : (
              <ul className="py-2">
                {syllabus.map((lesson) => {
                  const isActive = selectedLesson?.sequenceOrder === lesson.sequenceOrder;
                  const isPlaying = lesson.video?.id === playingVideoId && !!playbackUrl;

                  return (
                    <li key={lesson.sequenceOrder}>
                      <button
                        type="button"
                        onClick={() => handleSelectLesson(lesson)}
                        disabled={lesson.status === "locked"}
                        className={cn(
                          "w-full text-left px-4 py-3.5 border-l-[3px] transition-all duration-200",
                          "flex gap-3 items-start",
                          isActive
                            ? "bg-emerald-50/80 border-l-emerald-700"
                            : "border-l-transparent hover:bg-secondary/70",
                          lesson.status === "locked" && "opacity-55 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold",
                            lesson.status === "completed" && "bg-emerald-700 text-white",
                            lesson.status === "current" && "bg-white border-2 border-emerald-700 text-emerald-800",
                            lesson.status === "locked" && "bg-secondary text-muted-foreground border border-border"
                          )}
                        >
                          {lesson.status === "completed" ? (
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          ) : lesson.status === "locked" ? (
                            <Lock className="w-3 h-3" />
                          ) : isPlaying ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                          ) : (
                            lesson.sequenceOrder
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span
                              className={cn(
                                "text-sm leading-snug",
                                isActive ? "font-semibold text-foreground" : "font-medium text-foreground/90"
                              )}
                            >
                              {lesson.title}
                            </span>
                            {lesson.status === "current" && (
                              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 mt-0.5">
                                Now
                              </span>
                            )}
                          </span>

                          <span className="mt-2 flex items-center gap-2">
                            <span className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                              <span
                                className={cn(
                                  "block h-full rounded-full transition-all duration-300",
                                  lesson.status === "completed"
                                    ? "bg-emerald-700"
                                    : lesson.status === "current"
                                      ? "bg-emerald-600"
                                      : "bg-transparent"
                                )}
                                style={{ width: `${lesson.progressPercent}%` }}
                              />
                            </span>
                            <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">
                              {lesson.progressPercent}%
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Main player stage */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Preparing your course…
            </div>
          ) : progress?.nextVideo === null && progress.totalVideos > 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-md text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-700" strokeWidth={2.5} />
                </div>
                <h3 className="font-display text-3xl font-semibold">Course complete</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You finished all {progress.totalVideos} lessons. Your progress is saved for this account.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#0c1210] px-3 sm:px-8 pt-10 sm:pt-6 pb-6">
                <div className="max-w-5xl mx-auto">
                  <div className="relative rounded-xl overflow-hidden bg-black shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)] ring-1 ring-white/10 aspect-video">
                    {playbackUrl && playingVideoId ? (
                      <video
                        ref={videoRef}
                        key={playingVideoId}
                        controls
                        autoPlay
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        src={playbackUrl}
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_at_center,_rgba(16,85,58,0.35)_0%,_transparent_65%)]">
                        <button
                          type="button"
                          disabled={!selectedLesson?.video || playVideo.isPending}
                          onClick={() => selectedLesson?.video && handlePlay(selectedLesson.video.id)}
                          className={cn(
                            "group relative w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300",
                            "bg-white text-emerald-800 shadow-xl",
                            "hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                          )}
                        >
                          {playVideo.isPending ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <Play className="w-8 h-8 ml-1 fill-current" />
                          )}
                        </button>
                        <div className="text-center px-6">
                          <p className="text-white/50 text-[11px] uppercase tracking-[0.18em] font-medium mb-2">
                            {selectedLesson
                              ? `Lesson ${selectedLesson.sequenceOrder} of ${progress?.totalVideos ?? 0}`
                              : "Select a lesson"}
                          </p>
                          <p className="text-white font-display text-2xl sm:text-3xl font-semibold">
                            {selectedLesson?.title ?? "Course video"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-[#f7f8f9]">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800/80 mb-2">
                        {selectedLesson?.status === "completed"
                          ? "Completed lesson"
                          : selectedLesson?.status === "current"
                            ? "Current lesson"
                            : "Lesson"}
                      </p>
                      <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                        {selectedLesson?.title ?? "—"}
                      </h1>
                      <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                        Watch each lesson in order. Progress updates as you watch, and the next video unlocks when this one finishes.
                      </p>
                    </div>

                    {selectedLesson?.status === "current" && selectedLesson.video && !playbackUrl && (
                      <button
                        type="button"
                        disabled={playVideo.isPending}
                        onClick={() => handlePlay(selectedLesson.video!.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 text-sm font-semibold shadow-md shadow-emerald-900/15 transition-colors disabled:opacity-60"
                      >
                        {playVideo.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                        {selectedLesson.progressPercent > 0 ? "Resume" : "Start lesson"}
                      </button>
                    )}
                  </div>

                  {selectedLesson && (
                    <div className="mt-6 rounded-xl border border-border/70 bg-white p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Lesson progress
                        </p>
                        <p className="text-sm font-semibold tabular-nums">
                          {selectedLesson.progressPercent}%
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-700 transition-all duration-300"
                          style={{ width: `${selectedLesson.progressPercent}%` }}
                        />
                      </div>
                      {markComplete.isPending && (
                        <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving completion…
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
