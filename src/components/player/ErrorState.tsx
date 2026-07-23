'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-red-500/30 bg-red-950/20 p-6 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-red-400">
          <AlertCircle className="h-6 w-6" />
          <span>Playback Error</span>
        </div>
        <p className="text-sm text-zinc-300">{error}</p>

        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="mt-4 w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
