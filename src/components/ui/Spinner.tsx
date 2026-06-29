import * as React from "react";
import { cn } from "../../lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  cls?: string;
}

export function Spinner({ className, cls, ...props }: SpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin",
        cls,
        className
      )}
      {...props}
    />
  );
}
