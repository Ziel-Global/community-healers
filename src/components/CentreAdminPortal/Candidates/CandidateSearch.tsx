import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CandidateSearchProps {
    selectedDate: Date;
    onDateChange: (date: Date | undefined) => void;
}

export function CandidateSearch({ selectedDate, onDateChange }: CandidateSearchProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-card/40 p-3 sm:p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search by name, CNIC, or Reg ID..."
                    className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white/50 border-border/60 focus:border-primary/40 focus:ring-primary/20 rounded-xl text-sm sm:text-base w-full"
                />
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "h-10 sm:h-12 px-3 sm:px-6 rounded-xl border-border/60 gap-1.5 sm:gap-2 hover:bg-white transition-all bg-white/50 text-xs sm:text-sm justify-start text-left font-normal w-full sm:w-[240px]",
                            !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        {selectedDate ? format(selectedDate, "MMM dd, yyyy") : <span>Select date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="end" sideOffset={4}>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (date) {
                                onDateChange(date);
                                setOpen(false);
                            }
                        }}
                        disabled={false}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
