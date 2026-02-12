'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AISearchToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function AISearchToggle({ enabled, onToggle }: AISearchToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={enabled ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5 px-2"
            onClick={() => onToggle(!enabled)}>
            <Icons.sparkles
              className={`h-4 w-4 ${enabled ? 'text-yellow-300' : ''}`}
            />
            <span className="text-xs">AI</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {enabled
              ? 'AI-powered search is ON'
              : 'Click to enable AI-powered search'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
