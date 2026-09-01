'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  Brain,
  Users,
  Swords,
  TrendingUp,
  User,
  Atom,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NexusLogo } from './nexus-logo';
import { DEMO_USER } from '@/lib/seed-data';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learning World', icon: Globe },
  { href: '/knowledge', label: 'Knowledge Map', icon: Brain },
  { href: '/peers', label: 'Peer Matching', icon: Users },
  { href: '/quests', label: 'Quests', icon: Swords },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card/40 backdrop-blur-xl">
      <div className="flex h-16 items-center border-b border-border px-6">
        <NexusLogo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-violet/10 border border-violet/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="relative h-4 w-4 flex-shrink-0" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-cyan text-sm font-semibold text-white">
            {DEMO_USER.avatar_initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{DEMO_USER.name}</p>
            <p className="truncate text-xs text-muted-foreground">{DEMO_USER.school}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
