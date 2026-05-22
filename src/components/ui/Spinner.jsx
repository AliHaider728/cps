import { cn } from "../../lib/utils";

export function Spinner({ className, cls }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin",
        cls,
        className
      )}
    />
  );
}
