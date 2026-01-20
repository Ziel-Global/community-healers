import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Calendar as CalendarIcon } from "lucide-react";

export function CandidateSearch() {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card/40 p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search candidates by name, CNIC, or Reg ID..."
                    className="pl-12 h-12 bg-white/50 border-border/60 focus:border-primary/40 focus:ring-primary/20 rounded-xl"
                />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="h-12 px-6 rounded-xl border-border/60 gap-2 hover:bg-white transition-all bg-white/50">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>Today</span>
                </Button>
                <Button variant="outline" className="h-12 px-6 rounded-xl border-border/60 gap-2 hover:bg-white transition-all bg-white/50">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <span>Filters</span>
                </Button>
            </div>
        </div>
    );
}
