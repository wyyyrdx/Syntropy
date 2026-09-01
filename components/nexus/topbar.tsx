'use client';

import { Bell, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEMO_USER } from '@/lib/seed-data';

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/60 px-6 backdrop-blur-xl">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search concepts, peers, quests..."
            className="h-9 border-border/50 bg-muted/30 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="h-4 w-4 text-violet-bright" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-bright" />
        </Button>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card/40 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet to-cyan text-xs font-semibold text-white">
            {DEMO_USER.avatar_initials}
          </div>
          <span className="hidden text-sm font-medium sm:inline">{DEMO_USER.name.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
