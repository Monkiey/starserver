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

interface StarSearchToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function StarSearchToggle({ enabled, onToggle }: StarSearchToggleProps) {
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
            <span className="text-xs">Star</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {enabled
              ? 'Star-powered search is ON'
              : 'Click to enable Star-powered search'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
