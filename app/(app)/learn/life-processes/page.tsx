'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Leaf,
  Wind,
  HeartPulse,
  FlaskConical,
  ArrowRight,
  ArrowLeft,
  Atom,
} from 'lucide-react';
import { PageHeader } from '@/components/nexus/page-header';
import { GlassCard } from '@/components/nexus/glass-card';
import { MasteryBadge } from '@/components/nexus/mastery-badge';
import {
  TOPICS,
  CONCEPTS,
  getTopicMastery,
  getConceptsByTopic,
  getKnowledgeState,
} from '@/lib/seed-data';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf,
  Wind,
  HeartPulse,
  FlaskConical,
};

export default function LifeProcessesWorldPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Life Processes World"
        description="Explore the four domains of life processes. Each area contains concepts at different mastery levels."
        icon={<Atom className="h-6 w-6" />}
        actions={
          <Link href="/learn">
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-2 text-sm font-medium transition-all hover:border-violet/30">
              <ArrowLeft className="h-4 w-4" />
              Back to worlds
            </button>
          </Link>
        }
      />

      {/* World map — 2.5D isometric grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {TOPICS.map((topic, i) => {
          const Icon = iconMap[topic.icon] ?? Leaf;
          const mastery = getTopicMastery(topic.id);
          const concepts = getConceptsByTopic(topic.id);
          const color = topic.color;

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard hover className="relative overflow-hidden" delay={i * 0.1}>
                {/* Atmospheric glow per topic */}
                <div
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-[60px]"
                  style={{ backgroundColor: `${color}15` }}
                />

                <div className="relative">
                  {/* Topic header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border"
                        style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold">{topic.name}</h3>
                        <p className="text-xs text-muted-foreground">{topic.world_area}</p>
                      </div>
                    </div>
                    <MasteryBadge value={mastery} size="md" />
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">{topic.description}</p>

                  {/* Mastery bar */}
                  <div className="mb-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Topic mastery</span>
                      <span className="font-bold" style={{ color }}>
                        {mastery}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${mastery}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                      />
                    </div>
                  </div>

                  {/* Concept nodes */}
                  <div className="space-y-2">
                    {concepts.map((concept, ci) => {
                      const ks = getKnowledgeState(concept.id);
                      const cm = ks?.mastery ?? 0;
                      const nodeColor =
                        cm >= 80 ? '#10B981' : cm >= 50 ? '#06B6D4' : cm >= 25 ? '#F59E0B' : '#EF4444';

                      return (
                        <motion.div
                          key={concept.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 + ci * 0.06 }}
                          className="group flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-2.5 transition-all hover:border-violet/30"
                        >
                          <span
                            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                            style={{
                              backgroundColor: nodeColor,
                              boxShadow: `0 0 6px ${nodeColor}80`,
                            }}
                          />
                          <span className="flex-1 text-sm">{concept.name}</span>
                          <span className="text-xs font-medium" style={{ color: nodeColor }}>
                            {cm}%
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  <Link href="/knowledge" className="mt-4 block">
                    <button className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-border/50 py-2 text-sm text-muted-foreground transition-all hover:border-violet/30 hover:text-violet-bright">
                      Explore concepts
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
