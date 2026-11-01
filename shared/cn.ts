/**
 * Shared className helper.
 *
 * Previously every site carried a byte-identical copy at `src/utils/cn.ts`
 * (three of them were dead code with zero importers). Import it from
 * `@aimirah/shared/cn` instead — see CONCERNS.md #1 and #12.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
