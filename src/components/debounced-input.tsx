import * as React from 'react';
import { cn, debounce } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';

interface DebouncedInputProps extends Omit<InputProps, 'onChange'> {
  containerClassName?: string;
  value: string;
  open: boolean;
  onChange: (value: string) => Promise<void>;
  onChangeStatusOpen: (value: boolean) => void;
  debounceTimeout?: number;
  maxLength?: number;
  variant?: 'compact' | 'fluid';
}

export function DebouncedInput({
  id = 'query',
  containerClassName,
  open,
  value,
  onChange,
  maxLength = 80,
  debounceTimeout = 300,
  onChangeStatusOpen,
  className,
  variant = 'compact',
  ...props
}: DebouncedInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isFluid = variant === 'fluid';
  const [inputValue, setInputValue] = React.useState(value);
  const compactContainerClasses = !isFluid
    ? open
      ? 'flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-1 shadow-[0_14px_60px_-45px_rgba(0,0,0,0.65)] backdrop-blur'
      : 'flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/70 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.9)] backdrop-blur'
    : '';

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  // close search input on clicking outside,
  useOnClickOutside(inputRef, () => {
    if (!value && !isFluid) onChangeStatusOpen(false);
  });

  // configure keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // close search input on pressing escape
      if (e.key === 'Escape') {
        void onChange('');
      }
      // open search input on pressing ctrl + k or cmd + k
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        if (!inputRef.current) return;
        e.preventDefault();
        onChangeStatusOpen(true);
        inputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onChange, onChangeStatusOpen]);

  const debounceInput = React.useMemo(
    () =>
      debounce((nextValue: string) => {
        void onChange(nextValue);
      }, debounceTimeout),
    [debounceTimeout, onChange],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    debounceInput(event.target.value);
  };

  return (
    <div
      className={cn(
        'relative',
        isFluid &&
          'dark:border-white/15 group rounded-full border border-white/50 bg-white/80 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/30 dark:bg-white/5',
        compactContainerClasses,
        containerClassName,
      )}>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder="Search..."
        className={cn(
          'transition-all duration-300',
          isFluid
            ? 'dark:border-white/15 h-11 w-full rounded-full border border-white/40 bg-white/80 pl-11 pr-4 text-base shadow-[0_10px_40px_-25px_rgba(0,0,0,0.35)] backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-primary/50 dark:bg-white/5'
            : 'h-auto rounded-full bg-transparent py-1.5 pl-8 text-sm text-white/90 placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/30',
          isFluid
            ? 'placeholder:text-foreground/40'
            : open
            ? 'w-28 border-none md:w-40 lg:w-60'
            : 'w-0 border-none bg-transparent',
          className,
        )}
        value={inputValue}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />
      <Button
        id="search-btn"
        aria-label="Search"
        variant="ghost"
        className={cn(
          'absolute top-1/2 h-auto -translate-y-1/2 rounded-full p-1 hover:bg-transparent',
          isFluid
            ? 'left-3 bg-primary/10 text-primary hover:bg-primary/20'
            : open
            ? 'left-1 bg-transparent text-white/90'
            : 'left-1/2 -translate-x-1/2 bg-transparent text-white/90',
        )}
        onClick={() => {
          if (!inputRef.current) {
            return;
          }
          inputRef.current.focus();
          if (isFluid) {
            onChangeStatusOpen(true);
            return;
          }
          onChangeStatusOpen(!open);
        }}>
        <Icons.search
          className={cn(
            'transition-opacity hover:opacity-75 active:scale-95',
            isFluid ? 'h-4 w-4' : open ? 'h-4 w-4' : 'h-6 w-6',
          )}
          aria-hidden="true"
        />
      </Button>
      {isFluid && (
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
          {isLoading ? (
            <Icons.spinner
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="tracking-tight">{statusLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
