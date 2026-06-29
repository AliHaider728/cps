import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface TableScrollProps {
  children?: ReactNode;
  className?: string;
}

/** Wraps tables for horizontal scroll on mobile */
export default function TableScroll({ children, className }: TableScrollProps) {
  return (
    <div className={cn("w-full overflow-x-auto -webkit-overflow-scrolling-touch", className)}>
      {children}
    </div>
  );
}
