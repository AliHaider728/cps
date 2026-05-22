import { Check } from "lucide-react";
import { Button } from "../../../../components/ui/Button.jsx";
import { Input } from "../../../../components/ui/Input.jsx";
import { Textarea } from "../../../../components/ui/textarea.jsx";
import { NativeSelect } from "../../../../components/ui/select.jsx";
import { Label } from "../../../../components/ui/label.jsx";
import { Badge } from "../../../../components/ui/Badge.jsx";
import { Skeleton } from "../../../../components/ui/skeleton.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogCloseButton,
} from "../../../../components/ui/dialog.jsx";
import { cn } from "../../../../lib/utils";

export const Spinner = ({ cls }) => (
  <Skeleton className={cn("inline-block w-4 h-4 rounded-full border-2 border-primary border-t-transparent bg-transparent", cls)} />
);

export const Btn = ({ onClick, disabled, variant = "primary", size = "md", type = "button", children, cls = "", className }) => (
  <Button
    type={type}
    onClick={onClick}
    disabled={disabled}
    variant={variant}
    size={size}
    className={cn(cls, className)}
  >
    {children}
  </Button>
);

export const ModalShell = ({ title, onClose, children, footer, wide, open = true }) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
    <DialogContent className={cn("flex flex-col max-h-[92vh] p-0 gap-0", wide ? "max-w-2xl" : "max-w-lg")}>
      <DialogHeader className="relative shrink-0 pr-12">
        <DialogTitle className="text-[15px]">{title}</DialogTitle>
        <DialogCloseButton />
      </DialogHeader>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [scrollbar-width:thin]">{children}</div>
      {footer && (
        <DialogFooter className="shrink-0 flex-col sm:flex-row gap-2">{footer}</DialogFooter>
      )}
    </DialogContent>
  </Dialog>
);

export const FormField = ({ label, value, onChange, type = "text", placeholder, options, required, textarea, rows = 4, cls = "" }) => {
  const id = `f_${label?.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
  return (
    <div className={cn("grid grid-cols-1 gap-1.5", cls)}>
      <Label htmlFor={id}>
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {options ? (
        <NativeSelect id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {options.map((o) => {
            const [v, l] = Array.isArray(o) ? o : [o, o];
            return <option key={v} value={v}>{l}</option>;
          })}
        </NativeSelect>
      ) : textarea ? (
        <Textarea id={id} rows={rows} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
};

export const DetailRow = ({ label, value, mono }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className={cn("text-sm text-slate-800 font-semibold sm:text-right sm:max-w-[60%] break-words", mono && "font-mono")}>
      {value || value === 0 ? value : "—"}
    </span>
  </div>
);

export const EditRow = ({ label, value, onChange, type = "text", options }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-1.5 sm:gap-3 py-2.5 border-b border-slate-50 last:border-0 items-center">
    <Label className="normal-case tracking-normal text-slate-400">{label}</Label>
    {options ? (
      <NativeSelect value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return <option key={v} value={v}>{l}</option>;
        })}
      </NativeSelect>
    ) : (
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    )}
  </div>
);

export const ToggleRow = ({ label, checked, onChange, disabled }) => (
  <label className={cn(
    "flex items-center justify-between gap-3 py-3 px-4 rounded-xl border border-border bg-card min-h-11",
    disabled ? "opacity-60" : "cursor-pointer hover:bg-accent"
  )}>
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="accent-primary w-5 h-5 sm:w-4 sm:h-4"
    />
  </label>
);

const STATUS_VARIANT = {
  missing: "default", uploaded: "blue", approved: "success", expired: "warning",
  rejected: "danger", active: "success", ended: "default", restricted: "danger",
};

export const RagBadge = ({ status }) => {
  const v = status === "red" ? "danger" : status === "amber" ? "warning" : status === "green" ? "success" : "default";
  return <Badge variant={v} className="uppercase tracking-wider text-[11px] rounded-lg">{status || "n/a"}</Badge>;
};

export const StatusBadge = ({ status }) => (
  <Badge variant={STATUS_VARIANT[status] || "default"} className="uppercase tracking-wider text-[11px] rounded-lg">
    {status || "—"}
  </Badge>
);

export const ConfirmIcon = () => <Check size={14} />;

export const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB");
  } catch {
    return String(d);
  }
};

export const fmtDateInput = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return "";
  }
};
