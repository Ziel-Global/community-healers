import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { superAdminNavItems } from "../SuperAdminPortal";
import { useActionLogs } from "@/hooks/queries/useSuperAdminQueries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import {
    ScrollText,
    Building2,
    UserCog,
    ClipboardCheck,
    Shield,
    Settings2,
    BookOpen,
    Clock,
    User,
} from "lucide-react";
import type { UserRole } from "@/types/roles";

type TabValue = "ALL" | UserRole;

const ROLE_TABS: { value: TabValue; label: string; icon: typeof ScrollText }[] = [
    { value: "ALL", label: "All", icon: ScrollText },
    { value: "BUREAU", label: "Bureau", icon: Building2 },
    { value: "COMMITTEE_CHAIRMAN", label: "Committee Chairman", icon: UserCog },
    { value: "COMMITTEE_MEMBER", label: "Committee Member", icon: ClipboardCheck },
    { value: "CENTER_ADMIN", label: "Center Admin", icon: Shield },
    { value: "SUPER_ADMIN", label: "Super Admin", icon: Settings2 },
    { value: "MINISTRY", label: "Ministry", icon: BookOpen },
];

const ROLE_LABEL: Record<string, string> = {
    BUREAU: "Bureau",
    COMMITTEE_CHAIRMAN: "Committee Chairman",
    COMMITTEE_MEMBER: "Committee Member",
    CENTER_ADMIN: "Center Admin",
    SUPER_ADMIN: "Super Admin",
    MINISTRY: "Ministry",
};

export default function LogsPage() {
    const [tab, setTab] = useState<TabValue>("ALL");

    const { data: response, isLoading } = useActionLogs(
        tab === "ALL" ? {} : { role: tab },
    );

    const logs = response?.data ?? [];

    return (
        <DashboardLayout
            title="Logs"
            subtitle="What every role has done, in one place"
            portalType="admin"
            navItems={superAdminNavItems}
        >
            <div className="max-w-4xl mx-auto space-y-4">
                <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
                    <TabsList className="flex-wrap h-auto gap-1">
                        {ROLE_TABS.map(({ value, label, icon: Icon }) => (
                            <TabsTrigger key={value} value={value} className="gap-1.5">
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                    <div className="divide-y divide-border/30 max-h-[650px] overflow-y-auto">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-4 flex items-center gap-4">
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : logs.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">
                                No actions logged yet{tab !== "ALL" ? ` for ${ROLE_LABEL[tab] ?? tab}` : ""}.
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-primary/5 transition-colors flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary shadow-sm border border-black/5">
                                        <ScrollText className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-foreground leading-none">{log.message}</span>
                                            <Badge variant="outline" className="text-[9px] uppercase font-bold h-4 px-1.5">
                                                {ROLE_LABEL[log.actorRole] ?? log.actorRole}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 truncate">
                                            <User className="w-3 h-3" /> {log.actorName || log.actorEmail || "Unknown"}
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
