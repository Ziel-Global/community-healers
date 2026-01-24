import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Calendar as CalendarIcon } from "lucide-react";

export function CandidateSearch() {
    return (
        <div className="flex flex-col gap-3 sm:gap-4 bg-card/40 p-3 sm:p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
            <div className="relative flex-1 group w-full">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search by name, CNIC, or Reg ID..."
                    className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white/50 border-border/60 focus:border-primary/40 focus:ring-primary/20 rounded-xl text-sm sm:text-base w-full"
                />
            </div>

            <div className="flex gap-2 w-full sm:w-auto self-start">
                <Button variant="outline" className="h-9 sm:h-12 px-3 sm:px-6 rounded-xl border-border/60 gap-1.5 sm:gap-2 hover:bg-white transition-all bg-white/50 text-xs sm:text-sm">
                    <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span>Today</span>
                </Button>
                <Button variant="outline" className="h-9 sm:h-12 px-3 sm:px-6 rounded-xl border-border/60 gap-1.5 sm:gap-2 hover:bg-white transition-all bg-white/50 text-xs sm:text-sm">
                    <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span>Filters</span>
                </Button>
            </div>
        </div>
    );
}
