import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus,
    Search,
    HelpCircle,
    Filter,
    CheckCircle2,
    AlertCircle,
    Edit3,
    Trash2,
    Tag
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const questions = [
    { id: 1, text: "Which piece of safety equipment is mandatory when working with high-voltage?", difficulty: "Medium", category: "Safety", status: "Active" },
    { id: 2, text: "What should you do first in case of a chemical spill?", difficulty: "Hard", category: "Safety", status: "Active" },
    { id: 3, text: "Define the term 'CertifyPro Standard' in industrial context.", difficulty: "Easy", category: "General", status: "Inactive" },
];

export function QuestionEditor() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex-1 w-full md:max-w-md relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search questions by text or keyword..."
                        className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="h-11 px-4 border-border/60 gap-2 bg-white/50">
                        <Filter className="w-4 h-4 text-primary" />
                        Filter
                    </Button>
                    <Button className="gradient-primary text-black font-bold h-11 px-6 rounded-xl shadow-lg gap-2">
                        <Plus className="w-4 h-4" />
                        Add Question
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {questions.map((q) => (
                    <Card key={q.id} className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm group hover:border-primary/40 transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between gap-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <HelpCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-bold text-foreground leading-snug">{q.text}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="bg-white/50 text-[10px] uppercase font-bold tracking-tighter">
                                                <Tag className="w-3 h-3 mr-1" /> {q.category}
                                            </Badge>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "px-2 py-0 text-[10px] uppercase font-bold tracking-tighter",
                                                    q.difficulty === "Easy" ? "text-emerald-600 bg-emerald-50" :
                                                        q.difficulty === "Medium" ? "text-amber-600 bg-amber-50" : "text-destructive bg-destructive/5"
                                                )}
                                            >
                                                {q.difficulty}
                                            </Badge>
                                            <Badge variant={q.status === "Active" ? "success" : "secondary"} className="px-2 py-0 text-[10px] uppercase font-bold tracking-tighter">
                                                {q.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/40 text-primary">
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/40 text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
