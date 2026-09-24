import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useCreateTrainingInstructor } from "@/hooks/queries/useTrainingInstructorsQueries";
import type { TrainingInstructor } from "@/services/trainingInstructorsService";

const emptyForm = { email: "", password: "", firstName: "", lastName: "" };

interface CreateInstructorDialogProps {
    centerId: string;
    open: boolean;
    onClose: () => void;
    onCreated: (instructor: TrainingInstructor) => void;
}

export function CreateInstructorDialog({ centerId, open, onClose, onCreated }: CreateInstructorDialogProps) {
    const { toast } = useToast();
    const createInstructorMutation = useCreateTrainingInstructor();
    const [form, setForm] = useState(emptyForm);

    const handleClose = () => {
        setForm(emptyForm);
        onClose();
    };

    const handleCreate = () => {
        if (!form.email || !form.password || !form.firstName) {
            toast({ variant: "destructive", title: "Incomplete form", description: "Email, password and first name are required." });
            return;
        }
        createInstructorMutation.mutate(
            {
                centerId,
                payload: {
                    email: form.email,
                    password: form.password,
                    firstName: form.firstName,
                    lastName: form.lastName || undefined,
                },
            },
            {
                onSuccess: (instructor) => {
                    toast({ title: "Instructor added", description: `${instructor.firstName} can now log in and play the course.` });
                    setForm(emptyForm);
                    onCreated(instructor);
                },
                onError: (error) => {
                    toast({ variant: "destructive", title: "Failed to add instructor", description: getApiErrorMessage(error) });
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        New Training Instructor
                    </DialogTitle>
                    <DialogDescription>
                        Creates a login for a new instructor at your center.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="new-instructor-first">First name *</Label>
                            <Input id="new-instructor-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="new-instructor-last">Last name</Label>
                            <Input id="new-instructor-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-instructor-email">Email *</Label>
                        <Input id="new-instructor-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-instructor-password">Password *</Label>
                        <PasswordInput id="new-instructor-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={createInstructorMutation.isPending}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createInstructorMutation.isPending} className="gradient-primary text-white gap-2">
                        {createInstructorMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Add Instructor
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
