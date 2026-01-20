import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Upload, ListVideo, Trash2, Edit3, GripVertical, CheckCircle2, Plus } from "lucide-react";

const modules = [
    { id: 1, title: "Module 1: Safety Fundamentals", videos: 12, status: "Published" },
    { id: 2, title: "Module 2: Industrial Equipment", videos: 15, status: "Published" },
    { id: 3, title: "Module 3: Certification Protocols", videos: 8, status: "Draft" },
    { id: 4, title: "Module 4: Advanced Safety", videos: 10, status: "Planned" },
];

export function AcademyManager() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                        <ListVideo className="w-5 h-5 text-primary" />
                        Academy Content Structure
                    </h3>
                    <p className="text-sm text-muted-foreground">Manage organization and visibility of Urdu training videos</p>
                </div>
                <Button className="gradient-primary text-black font-bold h-11 px-6 rounded-xl shadow-lg gap-2">
                    <Upload className="w-4 h-4" />
                    Upload New Video
                </Button>
            </div>

            <div className="grid gap-4">
                {modules.map((m) => (
                    <Card key={m.id} className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm group hover:border-primary/40 transition-all">
                        <CardContent className="p-0">
                            <div className="flex items-center p-4 gap-4">
                                <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center relative shadow-inner overflow-hidden">
                                    <PlayCircle className="w-6 h-6 text-primary z-10" />
                                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-foreground">{m.title}</h4>
                                        <Badge variant={m.status === "Published" ? "success" : "secondary"} className="text-[9px] uppercase font-bold tracking-tight h-4 px-1.5 ring-1 ring-inset">
                                            {m.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{m.videos} Urdu Training Videos • Last updated 2 days ago</p>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 rounded-lg bg-white border border-border/40 hover:text-primary">
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit Module
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg bg-white border border-border/40 text-destructive">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-6 rounded-2xl border-2 border-dashed border-border/60 bg-secondary/20 flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-primary/40" />
                </div>
                <div>
                    <p className="font-bold text-foreground">Create a New Module</p>
                    <p className="text-sm text-muted-foreground">Modules help organize content for candidate consumption</p>
                </div>
                <Button variant="outline" className="border-border/60 rounded-xl bg-white shadow-sm mt-2">
                    Add Module Folder
                </Button>
            </div>
        </div>
    );
}
