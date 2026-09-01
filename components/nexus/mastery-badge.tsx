'use client';

import { cn } from '@/lib/utils';
import { masteryLevel, masteryColor } from '@/lib/seed-data';
import type { MasteryLevel as ML } from '@/lib/types';

interface MasteryBadgeProps {
  value: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function MasteryBadge({ value, className, size = 'sm' }: MasteryBadgeProps) {
  const level: ML = masteryLevel(value);
  const color = masteryColor(level);

  const labels: Record<ML, string> = {
    mastered: 'Mastered',
    proficient: 'Proficient',
    developing: 'Developing',
    novice: 'Novice',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        className,
      )}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}10`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {labels[level]}
    </span>
  );
}
