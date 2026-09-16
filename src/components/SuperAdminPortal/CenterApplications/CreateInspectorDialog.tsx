import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useCreateInspector } from "@/hooks/queries/useCenterApplicationQueries";
import type { CenterApplicationInspector } from "@/services/centerApplicationService";

const emptyForm = { email: "", password: "", firstName: "", lastName: "", phoneNumber: "" };

interface CreateInspectorDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated: (inspector: CenterApplicationInspector) => void;
}

export function CreateInspectorDialog({ open, onClose, onCreated }: CreateInspectorDialogProps) {
    const { toast } = useToast();
    const createInspectorMutation = useCreateInspector();
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
        createInspectorMutation.mutate(
            {
                email: form.email,
                password: form.password,
                firstName: form.firstName,
                lastName: form.lastName || undefined,
                phoneNumber: form.phoneNumber || undefined,
            },
            {
                onSuccess: (inspector) => {
                    toast({ title: "Inspector created", description: `${inspector.firstName} can now be assigned to applications.` });
                    setForm(emptyForm);
                    onCreated(inspector);
                },
                onError: (error) => {
                    toast({ variant: "destructive", title: "Failed to create inspector", description: getApiErrorMessage(error) });
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
                        New Inspector
                    </DialogTitle>
                    <DialogDescription>
                        Creates a login for a field inspector who can be assigned to center applications.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="new-insp-first">First name *</Label>
                            <Input id="new-insp-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="new-insp-last">Last name</Label>
                            <Input id="new-insp-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-insp-email">Email *</Label>
                        <Input id="new-insp-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-insp-phone">Phone</Label>
                        <Input id="new-insp-phone" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-insp-password">Password *</Label>
                        <PasswordInput id="new-insp-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={createInspectorMutation.isPending}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createInspectorMutation.isPending} className="gradient-primary text-white gap-2">
                        {createInspectorMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Inspector
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
