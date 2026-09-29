import { cn } from "@/lib/utils";

/** SoftSkills field chrome — visible mint-gray border on light surfaces */
export const softFieldClassName =
  "rounded-[9px] border border-[#c9d6c8] bg-white text-[#183d34] shadow-sm placeholder:text-[#93a087] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary focus-visible:ring-offset-0";

/** SoftSkills select menu panel */
export const softSelectContentClassName =
  "rounded-[10px] border border-[#c9d6c8] bg-white text-[#183d34] shadow-[0_12px_32px_rgba(22,76,62,0.12)] overflow-hidden";

/** SoftSkills select option row */
export const softSelectItemClassName =
  "rounded-lg py-2.5 pl-8 pr-3 text-sm text-[#183d34] cursor-pointer outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-[#164c3e] data-[highlighted]:text-white focus:bg-[#164c3e] focus:text-white";

export function softField(...extra: Array<string | undefined | false | null>) {
  return cn(softFieldClassName, ...extra);
}
