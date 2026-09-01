'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Lock } from 'lucide-react';
import { PageHeader } from '@/components/nexus/page-header';
import { GlassCard } from '@/components/nexus/glass-card';
import { TOPICS, LIFE_PROCESSES_CHAPTER, getTopicMastery } from '@/lib/seed-data';

const worldAreas = [
  { label: 'Nutrition Forest', emoji: 'forest' },
  { label: 'Respiration Valley', emoji: 'valley' },
  { label: 'Transportation City', emoji: 'city' },
  { label: 'Excretion Lab', emoji: 'lab' },
];

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning World"
        description="Explore your subjects as interactive visual environments."
        icon={<Globe className="h-6 w-6" />}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Active chapter card */}
        <Link href="/learn/life-processes" className="sm:col-span-2 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -2 }}
            className="glass relative overflow-hidden rounded-2xl p-8 transition-all hover:border-violet/30 hover:glow-violet"
          >
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan/10 blur-[60px]" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1 text-xs font-medium text-cyan-bright">
                Active
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
                {LIFE_PROCESSES_CHAPTER.name}
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {LIFE_PROCESSES_CHAPTER.description}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald" />
                  {TOPICS.length} topics
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-violet" />
                  13 concepts
                </div>
                <button className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-violet-bright">
                  Enter world
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Locked future subjects */}
        <GlassCard delay={0.1} className="flex flex-col items-center justify-center text-center opacity-60">
          <Lock className="mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold">More subjects coming</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Physics, Chemistry, and Mathematics will be added in future updates.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
