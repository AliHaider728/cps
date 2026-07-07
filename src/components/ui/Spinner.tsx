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

export function LoadingFallback({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spinner className="h-8 w-8 text-blue-600 mb-4" />
      {text && <p className="text-slate-500 font-medium">{text}</p>}
    </div>
  );
}
