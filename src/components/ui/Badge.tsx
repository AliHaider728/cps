import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:  "border-transparent bg-secondary text-secondary-foreground",
        primary:  "border-transparent bg-primary/10 text-primary",
        outline:  "text-foreground border-border",
        dark:     "border-transparent bg-slate-800 text-white",

        /* Timesheet / approval statuses */
        draft:    "bg-gray-100 text-gray-600 border-gray-300",
        pending:  "bg-yellow-50 text-yellow-700 border-yellow-300",
        approved: "bg-green-50 text-green-700 border-green-300",
        rejected: "bg-red-50 text-red-700 border-red-300",
        active:   "bg-blue-50 text-blue-700 border-blue-300",
        submitted:"bg-blue-50 text-blue-700 border-blue-300",

        /* Supervision RAG */
        GREEN:    "border-transparent bg-green-100 text-green-700",
        AMBER:    "border-transparent bg-yellow-100 text-yellow-700",
        RED:      "border-transparent bg-red-100 text-red-700",

        /* Legacy aliases — kept for existing pages */
        success:  "bg-green-50 text-green-700 border-green-300",
        danger:   "bg-red-50 text-red-700 border-red-300",
        warning:  "bg-yellow-50 text-yellow-700 border-yellow-300",
        purple:   "border-purple-200 bg-purple-50 text-purple-700",
        blue:     "border-blue-200 bg-blue-50 text-blue-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

type BadgeVariantProps = VariantProps<typeof badgeVariants>;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, Omit<BadgeVariantProps, "variant"> {
  variant?: BadgeVariantProps["variant"] | string;
  color?: string;
}

const COLOR_ALIASES: Record<string, string> = {
  success: "approved",
  danger:  "rejected",
  warning: "pending",
};

function Badge({ className, variant, color, children, ...props }: BadgeProps) {
  const raw = variant || color || "default";
  const v = COLOR_ALIASES[raw as string] || raw;
  return (
    <div className={cn(badgeVariants({ variant: v as any }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
