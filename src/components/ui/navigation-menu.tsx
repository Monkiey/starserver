import * as React from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  PopoverGroup,
  Transition,
} from "@headlessui/react";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Root ─────────────────────────────────────────────────────────────────────

const NavigationMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
NavigationMenu.displayName = "NavigationMenu";

// ─── List ─────────────────────────────────────────────────────────────────────

const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <PopoverGroup
    as="ul"
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className,
    )}
    {...props}
  />
));
NavigationMenuList.displayName = "NavigationMenuList";

// ─── Item ─────────────────────────────────────────────────────────────────────

const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <Popover as="li" ref={ref} className={cn("relative", className)} {...props} />
));
NavigationMenuItem.displayName = "NavigationMenuItem";

// ─── Trigger style ────────────────────────────────────────────────────────────

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[open]:bg-accent/50",
);

// ─── Trigger ──────────────────────────────────────────────────────────────────

const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <PopoverButton
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[open]:rotate-180"
      aria-hidden="true"
    />
  </PopoverButton>
));
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

// ─── Content ──────────────────────────────────────────────────────────────────

const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Transition
    enter="transition ease-out duration-150"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-100"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    <PopoverPanel
      ref={ref}
      className={cn(
        "absolute left-0 top-full mt-1.5 w-auto overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",
        className,
      )}
      {...props}
    />
  </Transition>
));
NavigationMenuContent.displayName = "NavigationMenuContent";

// ─── Link ─────────────────────────────────────────────────────────────────────

const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

// ─── Viewport (Popover-based navigation does not use a shared viewport) ────────
// Kept as a no-op for any consumers that still reference the export.
const NavigationMenuViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (_props, _ref) => null,
);
NavigationMenuViewport.displayName = "NavigationMenuViewport";

// ─── Indicator (kept for API compat) ─────────────────────────────────────────

const NavigationMenuIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </div>
));
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
