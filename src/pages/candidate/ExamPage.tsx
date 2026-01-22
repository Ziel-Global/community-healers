import { CBTInterface } from "@/components/StudentPortal/Exam/CBTInterface";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExamPage() {
    return (
        <div className="min-h-screen bg-background p-6">
            <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-foreground">Soft skill training CBT</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Examination Environment</p>
                    </div>
                </div>
                <Link to="/candidate">
                    <Button variant="ghost" size="sm">Exit Exam</Button>
                </Link>
            </header>

            <main className="max-w-6xl mx-auto">
                <CBTInterface />
            </main>
        </div>
    );
}
