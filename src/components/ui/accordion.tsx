"use client";

import * as React from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Context (accordion group — tracks defaultValue for initial open state) ───

interface AccordionContextValue {
  defaultValue?: string | string[];
  type?: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue>({});

// ─── Root ─────────────────────────────────────────────────────────────────────

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type = "single", defaultValue, collapsible: _collapsible, ...props }, ref) => (
    <AccordionContext.Provider value={{ defaultValue, type }}>
      <div ref={ref} className={className} {...props} />
    </AccordionContext.Provider>
  ),
);
Accordion.displayName = "Accordion";

// ─── Item (each Disclosure is independent) ────────────────────────────────────

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => {
    const { defaultValue } = React.useContext(AccordionContext);
    const isDefaultOpen = Array.isArray(defaultValue)
      ? defaultValue.includes(value ?? "")
      : defaultValue === value;

    return (
      <Disclosure
        as="div"
        ref={ref}
        defaultOpen={isDefaultOpen}
        className={cn("border-b", className)}
        {...props}
      />
    );
  },
);
AccordionItem.displayName = "AccordionItem";

// ─── Trigger ──────────────────────────────────────────────────────────────────

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <div className="flex">
    <DisclosureButton
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline data-[open]:underline",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[open]:rotate-180 [[data-open]_&]:rotate-180" />
    </DisclosureButton>
  </div>
));
AccordionTrigger.displayName = "AccordionTrigger";

// ─── Content ──────────────────────────────────────────────────────────────────

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <DisclosurePanel
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all duration-200 ease-out data-[closed]:opacity-0",
      className,
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </DisclosurePanel>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
