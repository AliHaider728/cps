import { cn } from "../../lib/utils";

/** Wraps tables for horizontal scroll on mobile */
export default function TableScroll({ children, className }) {
  return (
    <div className={cn("w-full overflow-x-auto -webkit-overflow-scrolling-touch", className)}>
      {children}
    </div>
  );
}
