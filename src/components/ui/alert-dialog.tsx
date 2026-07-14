"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";

export function AlertDialog(props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

export function AlertDialogTrigger(props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      {...props}
    />
  );
}

export function AlertDialogPortal(props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal
      data-slot="alert-dialog-portal"
      {...props}
    />
  );
}

export interface AlertDialogOverlayProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Backdrop> {}

export function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-[100] bg-black/50 duration-100 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

export interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Popup> {
  size?: "default" | "sm";
}

export function AlertDialogContent({
  className,
  size = "default",
  ...props
}: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "fixed top-1/2 left-1/2 z-[100] grid w-full max-w-[90vw] sm:max-w-md -translate-x-1/2 -translate-y-1/2 gap-0 rounded-2xl bg-white p-0 text-slate-800 shadow-2xl border border-slate-200 outline-none focus:outline-none focus-visible:outline-none data-[size=sm]:sm:max-w-sm",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left px-6 pt-6 pb-4",
        className
      )}
      {...props}
    />
  );
}

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl",
        className
      )}
      {...props}
    />
  );
}

export interface AlertDialogMediaProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AlertDialogMedia({ className, ...props }: AlertDialogMediaProps) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

export interface AlertDialogTitleProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> {}

export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-[17px] font-bold text-slate-900 tracking-tight", className)}
      {...props}
    />
  );
}

export interface AlertDialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> {}

export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-[14px] leading-relaxed text-slate-500", className)}
      {...props}
    />
  );
}

export interface AlertDialogActionProps extends React.ComponentPropsWithoutRef<typeof Button> {}

export function AlertDialogAction({ className, ...props }: AlertDialogActionProps) {
  return (
    <Button data-slot="alert-dialog-action" className={cn(className)} {...props} />
  );
}

import { ButtonProps } from "./Button";

export interface AlertDialogCancelProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Close> {
  variant?: ButtonProps["variant"];
  size?: "default" | "sm" | "lg" | "icon";
}

export function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant={variant as any} size={size as any} />}
      className={cn(className)}
      {...props}
    />
  );
}


