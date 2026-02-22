"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Context ──────────────────────────────────────────────────────────────────

interface TooltipContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

// ─── Provider (passthrough — kept for API compatibility) ─────────────────────

const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

// ─── Root ─────────────────────────────────────────────────────────────────────

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
};

// ─── Trigger ─────────────────────────────────────────────────────────────────

const TooltipTrigger = React.forwardRef<
  HTMLElement,
  { children: React.ReactElement<React.HTMLAttributes<HTMLElement>> }
>(({ children }, ref) => {
  const { setOpen } = useTooltipContext();

  return React.cloneElement(children, {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    ref: ref as React.Ref<HTMLElement>,
  });
});
TooltipTrigger.displayName = "TooltipTrigger";

// ─── Content ─────────────────────────────────────────────────────────────────

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }
>(({ className, sideOffset = 4, children, ...props }, ref) => {
  const { open } = useTooltipContext();
  if (!open) return null;

  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "absolute bottom-full left-1/2 z-50 -translate-x-1/2 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className,
      )}
      style={{ marginBottom: sideOffset }}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
