import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useAddCommitteeMember } from "@/hooks/queries/useCommitteeQueries";
import type { CommitteeMember } from "@/services/committeeService";

const emptyForm = { email: "", password: "", firstName: "", lastName: "", phoneNumber: "" };

interface CreateCommitteeMemberDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated: (member: CommitteeMember) => void;
}

export function CreateCommitteeMemberDialog({ open, onClose, onCreated }: CreateCommitteeMemberDialogProps) {
    const { toast } = useToast();
    const addMemberMutation = useAddCommitteeMember();
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
        addMemberMutation.mutate(
            {
                email: form.email,
                password: form.password,
                firstName: form.firstName,
                lastName: form.lastName || undefined,
                phoneNumber: form.phoneNumber || undefined,
            },
            {
                onSuccess: (member) => {
                    toast({ title: "Committee member added", description: `${member.firstName} can now review assigned applications.` });
                    setForm(emptyForm);
                    onCreated(member);
                },
                onError: (error) => {
                    toast({ variant: "destructive", title: "Failed to add committee member", description: getApiErrorMessage(error) });
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
                        New Committee Member
                    </DialogTitle>
                    <DialogDescription>
                        Creates a login for a new member of the Approval Committee.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="new-member-first">First name *</Label>
                            <Input id="new-member-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="new-member-last">Last name</Label>
                            <Input id="new-member-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-member-email">Email *</Label>
                        <Input id="new-member-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-member-phone">Phone</Label>
                        <Input id="new-member-phone" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-member-password">Password *</Label>
                        <PasswordInput id="new-member-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={addMemberMutation.isPending}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={addMemberMutation.isPending} className="gradient-primary text-white gap-2">
                        {addMemberMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Add Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
