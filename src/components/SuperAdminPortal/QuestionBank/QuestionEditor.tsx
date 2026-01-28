import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";

interface Question {
    id: number;
    text: string;
    category: string;
    options?: string[];
    correctAnswer?: string;
}

const initialQuestions: Question[] = [
    { id: 1, text: "Which piece of safety equipment is mandatory when working with high-voltage?", category: "Safety" },
    { id: 2, text: "What should you do first in case of a chemical spill?", category: "Safety" },
    { id: 3, text: "Define the term 'CertifyPro Standard' in industrial context.", category: "General" },
];

export function QuestionEditor() {
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [questions, setQuestions] = useState<Question[]>(() => {
        const saved = localStorage.getItem("examQuestions");
        if (saved) {
            return JSON.parse(saved);
        }
        return initialQuestions;
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        text: "",
        category: "General",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctAnswer: "",
    });

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.text || !formData.option1 || !formData.option2 || !formData.option3 || !formData.option4 || !formData.correctAnswer) {
            toast({
                title: "Incomplete Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            const newQuestion: Question = {
                id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
                text: formData.text,
                category: formData.category,
                options: [formData.option1, formData.option2, formData.option3, formData.option4],
                correctAnswer: formData.correctAnswer,
            };

            const updatedQuestions = [...questions, newQuestion];
            setQuestions(updatedQuestions);
            
            // Save to localStorage
            localStorage.setItem("examQuestions", JSON.stringify(updatedQuestions));

            setIsSubmitting(false);
            setIsDialogOpen(false);

            // Reset form
            setFormData({
                text: "",
                category: "General",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                correctAnswer: "",
            });

            toast({
                title: "Question Added",
                description: "The question has been successfully added to the question bank.",
            });
        }, 1000);
    };

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
                    <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="gradient-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg gap-2"
                    >
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
                                        <p className="alumni-sans-title text-xl font-semibold text-foreground leading-snug">{q.text}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="bg-white/50 text-[10px] uppercase font-bold tracking-tighter">
                                                <Tag className="w-3 h-3 mr-1" /> {q.category}
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

            {/* Add Question Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl alumni-sans-title flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-primary" />
                            Add New Question
                        </DialogTitle>
                        <DialogDescription>
                            Create a new question for the exam question bank.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        {/* Question Text */}
                        <div className="space-y-2">
                            <Label htmlFor="questionText">Question Text *</Label>
                            <Textarea
                                id="questionText"
                                placeholder="Enter the question text here..."
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Answer Options</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="option1">Option 1 *</Label>
                                    <Input
                                        id="option1"
                                        placeholder="First option"
                                        value={formData.option1}
                                        onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="option2">Option 2 *</Label>
                                    <Input
                                        id="option2"
                                        placeholder="Second option"
                                        value={formData.option2}
                                        onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="option3">Option 3 *</Label>
                                    <Input
                                        id="option3"
                                        placeholder="Third option"
                                        value={formData.option3}
                                        onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="option4">Option 4 *</Label>
                                    <Input
                                        id="option4"
                                        placeholder="Fourth option"
                                        value={formData.option4}
                                        onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Correct Answer */}
                        <div className="space-y-2">
                            <Label htmlFor="correctAnswer">Correct Answer *</Label>
                            <Select
                                value={formData.correctAnswer}
                                onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
                            >
                                <SelectTrigger id="correctAnswer">
                                    <SelectValue placeholder="Select the correct answer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {formData.option1 && <SelectItem value={formData.option1}>Option 1: {formData.option1}</SelectItem>}
                                    {formData.option2 && <SelectItem value={formData.option2}>Option 2: {formData.option2}</SelectItem>}
                                    {formData.option3 && <SelectItem value={formData.option3}>Option 3: {formData.option3}</SelectItem>}
                                    {formData.option4 && <SelectItem value={formData.option4}>Option 4: {formData.option4}</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Question Metadata</h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Safety">Safety</SelectItem>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                        <SelectItem value="Procedures">Procedures</SelectItem>
                                        <SelectItem value="Regulations">Regulations</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gradient-primary text-white gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Question
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
