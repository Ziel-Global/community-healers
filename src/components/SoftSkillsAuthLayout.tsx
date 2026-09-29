import { CheckCircle2 } from "lucide-react";
import { SoftSkillsBrand } from "@/components/SoftSkillsBrand";
import { AuthBackButton } from "@/components/AuthBackButton";

type SoftSkillsAuthLayoutProps = {
  portalLabel: string;
  headline: string;
  description: string;
  highlights?: string[];
  children: React.ReactNode;
};

export function SoftSkillsAuthLayout({
  portalLabel,
  headline,
  description,
  highlights = [],
  children,
}: SoftSkillsAuthLayoutProps) {
  return (
    <div className="fixed inset-0 bg-[#f5f8f2] flex overflow-hidden candidate-auth">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[#12382d]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,#28614a_0%,transparent_55%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <SoftSkillsBrand light className="mb-10" />

          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#b3d0c2] mb-4 flex items-center gap-2">
            <span className="block w-5 h-0.5 bg-[#d7f88c]" />
            {portalLabel}
          </p>
          <h1 className="font-display text-4xl xl:text-5xl font-semibold text-white tracking-tight mb-4 leading-[1.15]">
            {headline}
          </h1>
          <p className="text-base text-[#b0c2ac] leading-relaxed max-w-md">{description}</p>

          {highlights.length > 0 && (
            <div className="mt-12 space-y-4">
              {highlights.map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d7f88c]/15 border border-[#d7f88c]/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[#d7f88c]" />
                  </div>
                  <span className="text-[#e2eae2] font-medium text-sm">{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 lg:px-16 bg-white border-l border-[#e7eee9]">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur pt-4 pb-2 flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <SoftSkillsBrand compact alwaysShowText showTagline={false} />
          </div>
          <AuthBackButton />
        </div>

        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-6 sm:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
