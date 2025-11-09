import * as React from "react";

import { cn } from "@/lib/utils";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("grid gap-6", className)}
      {...props}
    />
  );
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field" className={cn("grid gap-3", className)} {...props} />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      className={cn("relative flex items-center gap-3", className)}
      {...props}
    >
      <div className="h-px flex-1 bg-border" />
      {children && (
        <div
          data-slot="field-separator-content"
          className="text-muted-foreground text-xs"
        >
          {children}
        </div>
      )}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldSeparator };
