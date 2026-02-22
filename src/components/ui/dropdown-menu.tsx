"use client";

import * as React from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSection,
  MenuHeading,
  MenuSeparator,
  Transition,
} from "@headlessui/react";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Root ─────────────────────────────────────────────────────────────────────

const DropdownMenu = Menu;

// ─── Trigger ──────────────────────────────────────────────────────────────────

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, children, className, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    const childClassName: string | undefined = child.props.className;
    const childChildren: React.ReactNode = child.props.children;
    return (
      <MenuButton ref={ref} className={cn(childClassName, className)} {...props}>
        {childChildren}
      </MenuButton>
    );
  }
  return (
    <MenuButton ref={ref} className={className} {...props}>
      {children}
    </MenuButton>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// ─── Content (panel) ──────────────────────────────────────────────────────────

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "end" | "center";
    sideOffset?: number;
  }
>(({ className, align = "end", sideOffset = 4, children }, ref) => {
  const anchor = align === "start" ? "bottom start" : align === "end" ? "bottom end" : "bottom";
  return (
    <Transition
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <MenuItems
        ref={ref}
        anchor={{ to: anchor, gap: sideOffset }}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none",
          className,
        )}
      >
        {children}
      </MenuItems>
    </Transition>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

// ─── Item ─────────────────────────────────────────────────────────────────────

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    inset?: boolean;
    onSelect?: (event: Event) => void;
  }
>(({ className, inset, onClick, onSelect, ...props }, ref) => (
  <MenuItem>
    <button
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        onSelect?.(e as unknown as Event);
      }}
      {...props}
    />
  </MenuItem>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

// ─── Checkbox item ────────────────────────────────────────────────────────────

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean }
>(({ className, children, checked, ...props }, ref) => (
  <MenuItem>
    <button
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </button>
  </MenuItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

// ─── Radio item ───────────────────────────────────────────────────────────────

const DropdownMenuRadioItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <MenuItem>
    <button
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Circle className="h-2 w-2 fill-current" />
      </span>
      {children}
    </button>
  </MenuItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

// ─── Label ────────────────────────────────────────────────────────────────────

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <MenuHeading
    as="div"
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

// ─── Separator ────────────────────────────────────────────────────────────────

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <MenuSeparator
    as="div"
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// ─── Shortcut ─────────────────────────────────────────────────────────────────

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// ─── Group ────────────────────────────────────────────────────────────────────

const DropdownMenuGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <MenuSection as="div" ref={ref} className={className} {...props} />
));
DropdownMenuGroup.displayName = "DropdownMenuGroup";

// ─── Sub-menu stubs (not natively supported by Headless UI Menu) ───────────────

const DropdownMenuPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
DropdownMenuPortal.displayName = "DropdownMenuPortal";

const DropdownMenuSub = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
DropdownMenuSub.displayName = "DropdownMenuSub";

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <MenuItem>
    <button
      ref={ref}
      className={cn(
        "flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[focus]:bg-accent",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </button>
  </MenuItem>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

const DropdownMenuRadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <MenuSection as="div" ref={ref} className={className} {...props} />
));
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
