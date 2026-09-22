import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useAddCommitteeChairman, useAddCommitteeMember } from "@/hooks/queries/useCommitteeQueries";
import type { CommitteeMember, CreateCommitteeMemberRequest } from "@/services/committeeService";

const emptyForm = { email: "", password: "", firstName: "", lastName: "", phoneNumber: "" };

type CommitteeAccountRole = "member" | "chairman";

interface CreateCommitteeMemberDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated: (member: CommitteeMember) => void;
    hasChairman?: boolean;
}

export function CreateCommitteeMemberDialog({ open, onClose, onCreated, hasChairman = false }: CreateCommitteeMemberDialogProps) {
    const { toast } = useToast();
    const addMemberMutation = useAddCommitteeMember();
    const addChairmanMutation = useAddCommitteeChairman();
    const [form, setForm] = useState(emptyForm);
    const [role, setRole] = useState<CommitteeAccountRole>("member");
    const [chairmanCreatedThisVisit, setChairmanCreatedThisVisit] = useState(false);
    const chairmanLocked = hasChairman || chairmanCreatedThisVisit;
    const isPending = addMemberMutation.isPending || addChairmanMutation.isPending;

    useEffect(() => {
        if (chairmanLocked && role === "chairman") {
            setRole("member");
        }
    }, [chairmanLocked, role]);

    const handleClose = () => {
        setForm(emptyForm);
        setRole("member");
        onClose();
    };

    const handleCreate = () => {
        if (!form.email || !form.password || !form.firstName) {
            toast({ variant: "destructive", title: "Incomplete form", description: "Email, password and first name are required." });
            return;
        }
        if (role === "chairman" && chairmanLocked) return;

        const request: CreateCommitteeMemberRequest = {
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName || undefined,
            phoneNumber: form.phoneNumber || undefined,
        };
        const creatingChairman = role === "chairman";
        const mutation = creatingChairman ? addChairmanMutation : addMemberMutation;

        mutation.mutate(request, {
            onSuccess: (member) => {
                if (creatingChairman) setChairmanCreatedThisVisit(true);
                toast({
                    title: creatingChairman ? "Committee chairman added" : "Committee member added",
                    description: creatingChairman
                        ? `${member.firstName} can now sign in as committee chairman.`
                        : `${member.firstName} can now review assigned applications.`,
                });
                setForm(emptyForm);
                setRole("member");
                onCreated(member);
            },
            onError: (error) => {
                toast({
                    variant: "destructive",
                    title: creatingChairman ? "Failed to add committee chairman" : "Failed to add committee member",
                    description: getApiErrorMessage(error),
                });
            },
        });
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
                    <div className="space-y-1.5">
                        <Label htmlFor="new-member-role">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as CommitteeAccountRole)}>
                            <SelectTrigger id="new-member-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="chairman" disabled={chairmanLocked}>Committee Chairman</SelectItem>
                            </SelectContent>
                        </Select>
                        {chairmanLocked && (
                            <p className="text-xs text-muted-foreground">A chairman already exists.</p>
                        )}
                    </div>
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
                    <Button variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isPending} className="gradient-primary text-white gap-2">
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {role === "chairman" ? "Add Chairman" : "Add Member"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
