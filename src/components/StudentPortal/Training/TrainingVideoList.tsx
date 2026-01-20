import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, CheckCircle2, Lock, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Video {
    id: string;
    title: string;
    duration: string;
    isCompleted: boolean;
    isLocked: boolean;
    module: string;
}

const videos: Video[] = [
    { id: "1", title: "تعارف اور حفاظتی قوانین", duration: "12:45", isCompleted: true, isLocked: false, module: "Module 1" },
    { id: "2", title: "سامان کو سنبھالنے کے طریقے", duration: "15:20", isCompleted: true, isLocked: false, module: "Module 1" },
    { id: "3", title: "ہنگامی طریقہ کار", duration: "18:10", isCompleted: false, isLocked: false, module: "Module 2" },
    { id: "4", title: "دستاویزی معیار", duration: "10:30", isCompleted: false, isLocked: true, module: "Module 3" },
];

export function TrainingVideoList() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Urdu Training Content</h2>
                    <p className="text-muted-foreground text-sm">Access your module-based video training</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Overall Progress</p>
                    <div className="flex items-center gap-3">
                        <Progress value={50} className="w-32 h-2 gradient-secondary" />
                        <span className="text-sm font-bold text-primary">50%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {videos.map((video) => (
                    <Card
                        key={video.id}
                        className={cn(
                            "border-border/40 transition-all group overflow-hidden",
                            video.isLocked ? "opacity-60 cursor-not-allowed" : "hover:border-primary/40 hover:shadow-md cursor-pointer"
                        )}
                    >
                        <div className="flex flex-col sm:flex-row items-stretch">
                            <div className={cn(
                                "sm:w-48 aspect-video bg-secondary/50 flex items-center justify-center relative group-hover:bg-secondary/70 transition-colors",
                                video.isCompleted && "bg-success/5"
                            )}>
                                {video.isLocked ? (
                                    <Lock className="w-10 h-10 text-muted-foreground/40" />
                                ) : video.isCompleted ? (
                                    <CheckCircle2 className="w-10 h-10 text-success/40" />
                                ) : (
                                    <PlayCircle className="w-12 h-12 text-primary group-hover:scale-110 transition-transform shadow-lg rounded-full" />
                                )}
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white backdrop-blur-sm">
                                    {video.duration}
                                </div>
                            </div>

                            <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{video.module}</span>
                                        <h3 className="text-lg font-bold text-foreground font-urdu dir-rtl leading-relaxed">{video.title}</h3>
                                    </div>
                                    {video.isCompleted && (
                                        <Badge variant="success" className="gap-1 px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-6 pt-2">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            {video.duration}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            Lecture
                                        </div>
                                    </div>
                                    {!video.isLocked && !video.isCompleted && (
                                        <Button size="sm" variant="ghost" className="text-primary font-bold group-hover:translate-x-1 transition-transform">
                                            Resume Training <PlayCircle className="w-4 h-4 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!video.isLocked && !video.isCompleted && (
                            <div className="h-1 w-full bg-secondary">
                                <div className="h-full gradient-primary w-1/3" />
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
