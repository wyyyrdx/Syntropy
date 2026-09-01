'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MasteryRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  color?: string;
}

export function MasteryRing({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showLabel = true,
  color,
}: MasteryRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const ringColor = color ?? (value >= 80 ? '#10B981' : value >= 50 ? '#06B6D4' : value >= 25 ? '#F59E0B' : '#EF4444');

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(215 20% 14%)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${ringColor}80)` }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold" style={{ color: ringColor }}>
            {value}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">mastery</span>
        </div>
      )}
    </div>
  );
}
