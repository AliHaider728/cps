import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        primary: "border-transparent bg-primary/10 text-primary",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        danger: "border-red-200 bg-red-50 text-red-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        purple: "border-purple-200 bg-purple-50 text-purple-700",
        blue: "border-blue-200 bg-blue-50 text-blue-700",
        outline: "text-foreground border-border",
        dark: "border-transparent bg-slate-800 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, color, ...props }) {
  const v = variant || (color === "default" ? "default" : color) || "default";
  return <div className={cn(badgeVariants({ variant: v }), className)} {...props} />;
}

export { Badge, badgeVariants };
