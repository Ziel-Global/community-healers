import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface StepSuccessModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  titleEn: string;
  titleUr: string;
}

export function StepSuccessModal({
  open,
  onOpenChange,
  titleEn,
  titleUr,
}: StepSuccessModalProps) {
  // We use a small state to trigger the animation reliably every time it opens
  const [showProgress, setShowProgress] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (open) {
      setShowProgress(true);
      setAnimationKey(prev => prev + 1);
    } else {
      setShowProgress(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideClose 
        className="sm:max-w-2xl text-center p-16 border-x-2 border-b-2 border-t-4 border-primary/30 border-t-primary overflow-hidden shadow-[0_25px_50px_-12px_hsl(var(--primary)/0.2),inset_0_0_20px_hsl(var(--primary)/0.15)] bg-gradient-to-b from-background to-primary/5"
      >
        {/* Subtle Decorative Confetti / Dots in corners */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
          <svg className="absolute top-8 left-8 text-primary w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="20" cy="20" r="15" />
            <circle cx="70" cy="50" r="8" opacity="0.6" />
            <circle cx="30" cy="80" r="10" opacity="0.4" />
          </svg>
          <svg className="absolute top-8 right-8 text-primary w-10 h-10" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="80" cy="30" r="12" />
            <circle cx="20" cy="60" r="10" opacity="0.7" />
            <circle cx="60" cy="80" r="6" opacity="0.3" />
          </svg>
        </div>

        <div key={animationKey} className="flex flex-col items-center justify-center space-y-12 relative z-10">
          {/* Animated Checkmark with Double Glow (Larger) */}
          <div className="relative mt-4">
            <div 
              className="w-32 h-32 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center ring-[10px] ring-green-500/10 ring-offset-[16px] ring-offset-green-500/5 dark:ring-offset-background"
              style={{
                animation: showProgress ? "checkmarkHeartbeat 1.5s ease-in-out infinite" : "none"
              }}
            >
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="space-y-6 w-full">
            {/* English Text (Larger) */}
            <div dir="ltr" className="text-4xl font-bold alumni-sans-title text-foreground">
              {titleEn}
            </div>
            
            <div className="h-[2px] bg-border/40 w-2/3 mx-auto rounded-full" />
            
            {/* Urdu Text (Larger) */}
            <div dir="rtl" className="text-3xl font-medium text-foreground/90" style={{ fontFamily: 'Noto Nastaliq Urdu, Jameel Noori Nastaleeq, serif', lineHeight: '2.2' }}>
              {titleUr}
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        {showProgress && (
          <div 
            key={`progress-${animationKey}`}
            className="absolute bottom-0 left-0 h-2 bg-primary z-20" 
            style={{
              animation: "shrinkWidth 3s linear forwards"
            }}
          />
        )}
        <style>{`
          @keyframes shrinkWidth {
            from { width: 100%; }
            to { width: 0%; }
          }
          @keyframes checkmarkHeartbeat {
            0% { transform: scale(1); }
            14% { transform: scale(1.1); }
            28% { transform: scale(1); }
            42% { transform: scale(1.1); }
            70% { transform: scale(1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
