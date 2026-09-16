import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useInspectors, useAssignInspector } from "@/hooks/queries/useCenterApplicationQueries";
import { CreateInspectorDialog } from "./CreateInspectorDialog";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

interface AssignInspectorDialogProps {
    application: CenterApplicationSummary | null;
    onClose: () => void;
    onAssigned: () => void;
}

export function AssignInspectorDialog({ application, onClose, onAssigned }: AssignInspectorDialogProps) {
    const { toast } = useToast();
    const { data: inspectors = [], isLoading: isLoadingInspectors } = useInspectors();
    const assignMutation = useAssignInspector(application?.id ?? "");

    const [selectedInspectorId, setSelectedInspectorId] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const reset = () => {
        setSelectedInspectorId("");
        setShowCreateDialog(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleAssign = () => {
        if (!application || !selectedInspectorId) return;
        assignMutation.mutate(selectedInspectorId, {
            onSuccess: () => {
                toast({ title: "Inspector assigned", description: `${application.centerName || "Application"} moved to Assigned.` });
                reset();
                onAssigned();
            },
            onError: (error) => {
                toast({ variant: "destructive", title: "Failed to assign inspector", description: getApiErrorMessage(error) });
            },
        });
    };

    return (
        <>
            <Dialog open={!!application} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-primary" />
                            Assign Inspector
                        </DialogTitle>
                        <DialogDescription>
                            {application?.centerName || "This application"} needs an inspector before its physical inspection can begin.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-2">
                        <Select value={selectedInspectorId} onValueChange={setSelectedInspectorId}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingInspectors ? "Loading inspectors..." : "Select an inspector"} />
                            </SelectTrigger>
                            <SelectContent>
                                {inspectors.length === 0 && !isLoadingInspectors ? (
                                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                        No inspectors yet — create one below.
                                    </div>
                                ) : (
                                    inspectors.map((inspector) => (
                                        <SelectItem key={inspector.id} value={inspector.id}>
                                            {[inspector.firstName, inspector.lastName].filter(Boolean).join(" ") || inspector.email}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="gap-2 text-primary" onClick={() => setShowCreateDialog(true)}>
                            <UserPlus className="w-4 h-4" /> New inspector
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose} disabled={assignMutation.isPending}>Cancel</Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedInspectorId || assignMutation.isPending}
                            className="gradient-primary text-white gap-2"
                        >
                            {assignMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Assign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CreateInspectorDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onCreated={(inspector) => {
                    setSelectedInspectorId(inspector.id);
                    setShowCreateDialog(false);
                }}
            />
        </>
    );
}
