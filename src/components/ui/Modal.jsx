import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from "./dialog.jsx";

/** Backward-compatible modal API — powered by shadcn Dialog */
export function Modal({ isOpen, onClose, title, children, className = "" }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className={className}>
        {title && (
          <DialogHeader className="relative pr-10">
            <DialogTitle>{title}</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
        )}
        <div className="px-4 sm:px-6 pb-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
