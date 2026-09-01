'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NexusLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function NexusLogo({ className, showText = true, size = 'md' }: NexusLogoProps) {
  const dimensions = {
    sm: { box: 'w-7 h-7', icon: 16 },
    md: { box: 'w-9 h-9', icon: 20 },
    lg: { box: 'w-12 h-12', icon: 28 },
  };
  const d = dimensions[size];

  return (
    <Link href="/dashboard" className={cn('flex items-center gap-3 group', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl',
          'bg-gradient-to-br from-violet to-cyan',
          'shadow-lg shadow-violet/20 transition-transform group-hover:scale-105',
          d.box,
        )}
      >
        <svg
          width={d.icon}
          height={d.icon}
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
        >
          <path
            d="M12 2L2 7v10l10 5 10-5V7L12 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 2v20M2 7l10 5 10-5M2 17l10-5 10 5"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <span className={cn('font-display font-semibold tracking-tight', size === 'lg' ? 'text-xl' : 'text-base')}>
          NEXUS
        </span>
      )}
    </Link>
  );
}
