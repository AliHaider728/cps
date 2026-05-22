import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Touch-friendly min height for mobile controls */
export const touchClass = "min-h-11 sm:min-h-0";

/** Standard page horizontal padding */
export const pagePadClass = "px-4 sm:px-6";
