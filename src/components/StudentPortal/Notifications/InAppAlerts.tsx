import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Info, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: "success" | "info" | "warning" | "error";
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

const notifications: Notification[] = [
    {
        id: "1",
        type: "success",
        title: "Registration Successful",
        message: "Your initial registration is complete. Please proceed to profile completion.",
        time: "2 hours ago",
        isRead: false
    },
    {
        id: "2",
        type: "info",
        title: "Center Assigned",
        message: "You have been assigned to Lahore Training Center #3. Check your scheduling tab.",
        time: "Yesterday",
        isRead: true
    },
    {
        id: "3",
        type: "warning",
        title: "Document Required",
        message: "Medical certificate is pending. Please upload it to proceed to exam scheduling.",
        time: "2 days ago",
        isRead: true
    },
];

const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
    info: <Info className="w-5 h-5 text-primary" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
};

const colors = {
    success: "bg-success/5 border-success/20",
    info: "bg-primary/5 border-primary/20",
    warning: "bg-amber-500/5 border-amber-500/20",
    error: "bg-destructive/5 border-destructive/20",
};

export function InAppAlerts() {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-display font-bold">Recent Notifications</CardTitle>
                    <CardDescription>Stay updated with your progress</CardDescription>
                </div>
                <Bell className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={cn(
                            "p-4 rounded-xl border transition-all flex gap-4",
                            colors[notif.type],
                            !notif.isRead && "ring-1 ring-primary/10 shadow-sm"
                        )}
                    >
                        <div className="shrink-0 pt-1">
                            {icons[notif.type]}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-foreground">{notif.title}</p>
                                <span className="text-[10px] font-medium text-muted-foreground">{notif.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {notif.message}
                            </p>
                        </div>
                        {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
