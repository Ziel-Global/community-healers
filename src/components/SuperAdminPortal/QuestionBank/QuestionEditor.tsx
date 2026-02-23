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
    Tag,
    AlertTriangle
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { superAdminService } from "@/services/superAdminService";
import { Question, QuestionCategory, CreateQuestionRequest } from "@/types/superAdmin";

export function QuestionEditor() {
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        text: "",
        textUrdu: "",
        category: "GENERAL",
        option1: "",
        option1Urdu: "",
        option2: "",
        option2Urdu: "",
        option3: "",
        option3Urdu: "",
        option4: "",
        option4Urdu: "",
        correctAnswer: "",
    });
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

    const fetchQuestions = async () => {
        try {
            const questionsData = await superAdminService.getQuestions();
            setQuestions(questionsData);
        } catch (error: any) {
            console.error("Failed to load questions", error);

            // Check if it's a 401 (token expired)
            if (error.message?.includes('jwt expired') || error.message?.includes('401')) {
                toast({
                    title: "Session Expired",
                    description: "Your session has expired. Please log in again.",
                    variant: "destructive",
                });

                // Clear auth and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/super-admin';
            } else {
                toast({
                    title: "Failed to Load Questions",
                    description: error.message || "An error occurred while fetching questions.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch questions on component mount
    useEffect(() => {
        fetchQuestions();
    }, [toast]);

    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.text || !formData.textUrdu ||
            !formData.option1 || !formData.option1Urdu ||
            !formData.option2 || !formData.option2Urdu ||
            !formData.option3 || !formData.option3Urdu ||
            !formData.option4 || !formData.option4Urdu ||
            !formData.correctAnswer) {
            toast({
                title: "Incomplete Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const request: CreateQuestionRequest = {
                questionText: formData.text,
                questionTextUrdu: formData.textUrdu,
                category: formData.category as QuestionCategory,
                option1: formData.option1,
                option1Urdu: formData.option1Urdu,
                option2: formData.option2,
                option2Urdu: formData.option2Urdu,
                option3: formData.option3,
                option3Urdu: formData.option3Urdu,
                option4: formData.option4,
                option4Urdu: formData.option4Urdu,
                correctAnswer: formData.correctAnswer === formData.option1 ? 1 :
                    formData.correctAnswer === formData.option2 ? 2 :
                        formData.correctAnswer === formData.option3 ? 3 : 4,
            };

            if (editingQuestionId) {
                await superAdminService.updateQuestion(editingQuestionId, request);
                toast({
                    title: "Question Updated",
                    description: "The question has been successfully updated.",
                });
            } else {
                await superAdminService.createQuestion(request);
                toast({
                    title: "Question Added",
                    description: "The question has been successfully added to the question bank.",
                });
            }

            setIsDialogOpen(false);
            resetForm();

            // Refresh list
            await fetchQuestions();
        } catch (error: any) {
            toast({
                title: "Failed to Add Question",
                description: error.message || "An error occurred while adding the question.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (question: Question) => {
        setEditingQuestionId(question.id);
        setFormData({
            text: question.questionText,
            textUrdu: question.questionTextUrdu || "",
            category: question.category,
            option1: question.options.find(o => o.optionNumber === 1)?.optionText || "",
            option1Urdu: question.option1Urdu || "",
            option2: question.options.find(o => o.optionNumber === 2)?.optionText || "",
            option2Urdu: question.option2Urdu || "",
            option3: question.options.find(o => o.optionNumber === 3)?.optionText || "",
            option3Urdu: question.option3Urdu || "",
            option4: question.options.find(o => o.optionNumber === 4)?.optionText || "",
            option4Urdu: question.option4Urdu || "",
            correctAnswer: question.options.find(o => o.optionNumber === question.correctAnswer)?.optionText || "",
        });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (question: Question) => {
        setQuestionToDelete(question);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!questionToDelete) return;

        try {
            await superAdminService.deleteQuestion(questionToDelete.id);
            toast({
                title: "Question Deleted",
                description: "The question has been successfully removed.",
            });
            await fetchQuestions();
        } catch (error: any) {
            toast({
                title: "Delete Failed",
                description: error.message || "Could not delete the question.",
                variant: "destructive",
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setQuestionToDelete(null);
        }
    };

    const resetForm = () => {
        setEditingQuestionId(null);
        setFormData({
            text: "",
            textUrdu: "",
            category: "GENERAL",
            option1: "",
            option1Urdu: "",
            option2: "",
            option2Urdu: "",
            option3: "",
            option3Urdu: "",
            option4: "",
            option4Urdu: "",
            correctAnswer: "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex-1 w-full md:max-w-md relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search questions by text or keyword..."
                        className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="gradient-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Question
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading questions...</p>
                    </div>
                </div>
            ) : questions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <HelpCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No questions found</p>
                        <p className="text-xs text-muted-foreground mt-1">Click "Add Question" to create one</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {questions
                        .filter(q => q.questionText.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((q) => (
                            <Card key={q.id} className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm group hover:border-primary/40 transition-all">
                                <CardContent className="p-6">
                                    <div className="flex justify-between gap-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <HelpCircle className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="alumni-sans-title text-xl font-semibold text-foreground leading-snug">{q.questionText}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline" className="bg-white/50 text-[10px] uppercase font-bold tracking-tighter">
                                                        <Tag className="w-3 h-3 mr-1" /> {q.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(q)}
                                                className="h-9 w-9 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/40 text-primary"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(q)}
                                                className="h-9 w-9 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/40 text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            )}

            {/* Add/Edit Question Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl alumni-sans-title flex items-center gap-2">
                            {editingQuestionId ? <Edit3 className="w-6 h-6 text-primary" /> : <HelpCircle className="w-6 h-6 text-primary" />}
                            {editingQuestionId ? 'Edit Question' : 'Add New Question'}
                        </DialogTitle>
                        <DialogDescription>
                            Create a new question for the training question bank.
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
                                className="border-gray-400"
                            />
                        </div>

                        {/* Question Text Urdu */}
                        <div className="space-y-2">
                            <Label htmlFor="questionTextUrdu" className="flex justify-between">
                                <span>Question Text (Urdu) *</span>
                            </Label>
                            <Textarea
                                id="questionTextUrdu"
                                placeholder="اردو میں سوال لکھیں..."
                                value={formData.textUrdu}
                                onChange={(e) => setFormData({ ...formData, textUrdu: e.target.value })}
                                rows={3}
                                className="text-right border-gray-400"
                                dir="rtl"
                            />
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Answer Options</h3>

                            {/* Option 1 - English and Urdu aligned horizontally */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="option1" className="block min-h-[20px]">Option 1 (English) *</Label>
                                    <Input
                                        id="option1"
                                        placeholder="First option"
                                        value={formData.option1}
                                        onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                                        className="border-gray-400 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="option1Urdu" className="text-right block min-h-[20px]">Option 1 (Urdu) *</Label>
                                    <Input
                                        id="option1Urdu"
                                        placeholder="پہلا آپشن"
                                        value={formData.option1Urdu}
                                        onChange={(e) => setFormData({ ...formData, option1Urdu: e.target.value })}
                                        className="text-right border-gray-400 text-base"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            {/* Option 2 - English and Urdu aligned horizontally */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="option2" className="block min-h-[20px]">Option 2 (English) *</Label>
                                    <Input
                                        id="option2"
                                        placeholder="Second option"
                                        value={formData.option2}
                                        onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                                        className="border-gray-400 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="option2Urdu" className="text-right block min-h-[20px]">Option 2 (Urdu) *</Label>
                                    <Input
                                        id="option2Urdu"
                                        placeholder="دوسرا آپشن"
                                        value={formData.option2Urdu}
                                        onChange={(e) => setFormData({ ...formData, option2Urdu: e.target.value })}
                                        className="text-right border-gray-400 text-base"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            {/* Option 3 - English and Urdu aligned horizontally */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="option3" className="block min-h-[20px]">Option 3 (English) *</Label>
                                    <Input
                                        id="option3"
                                        placeholder="Third option"
                                        value={formData.option3}
                                        onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                                        className="border-gray-400 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="option3Urdu" className="text-right block min-h-[20px]">Option 3 (Urdu) *</Label>
                                    <Input
                                        id="option3Urdu"
                                        placeholder="تیسرا آپشن"
                                        value={formData.option3Urdu}
                                        onChange={(e) => setFormData({ ...formData, option3Urdu: e.target.value })}
                                        className="text-right border-gray-400 text-base"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            {/* Option 4 - English and Urdu aligned horizontally */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="option4" className="block min-h-[20px]">Option 4 (English) *</Label>
                                    <Input
                                        id="option4"
                                        placeholder="Fourth option"
                                        value={formData.option4}
                                        onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                                        className="border-gray-400 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="option4Urdu" className="text-right block min-h-[20px]">Option 4 (Urdu) *</Label>
                                    <Input
                                        id="option4Urdu"
                                        placeholder="چوتھا آپشن"
                                        value={formData.option4Urdu}
                                        onChange={(e) => setFormData({ ...formData, option4Urdu: e.target.value })}
                                        className="text-right border-gray-400 text-base"
                                        dir="rtl"
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
                                <SelectTrigger id="correctAnswer" className="border-gray-400">
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
                                    <SelectTrigger id="category" className="border-gray-400">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GENERAL">General</SelectItem>
                                        <SelectItem value="SAFETY">Safety</SelectItem>
                                        <SelectItem value="TECHNICAL">Technical</SelectItem>
                                        <SelectItem value="PROCEDURES">Procedures</SelectItem>
                                        <SelectItem value="REGULATIONS">Regulations</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                resetForm();
                            }}
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
                                    {editingQuestionId ? 'Saving...' : 'Adding...'}
                                </>
                            ) : (
                                <>
                                    {editingQuestionId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    {editingQuestionId ? 'Save Changes' : 'Add Question'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this question? This action cannot be undone.
                            <div className="mt-4 p-3 bg-muted rounded-lg text-foreground italic border-l-4 border-destructive">
                                "{questionToDelete?.questionText}"
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setQuestionToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Question
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
