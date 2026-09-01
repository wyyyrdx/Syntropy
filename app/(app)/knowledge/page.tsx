'use client';

import { motion } from 'framer-motion';
import { Brain, Network } from 'lucide-react';
import { PageHeader } from '@/components/nexus/page-header';
import { GlassCard } from '@/components/nexus/glass-card';
import { MasteryBadge } from '@/components/nexus/mastery-badge';
import {
  TOPICS,
  CONCEPTS,
  getConceptsByTopic,
  getKnowledgeState,
  getTopicMastery,
  masteryLevel,
  masteryColor,
} from '@/lib/seed-data';

export default function KnowledgeMapPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge Map"
        description="Your understanding of every concept in Life Processes, visualized as a network."
        icon={<Brain className="h-6 w-6" />}
      />

      {/* Legend */}
      <GlassCard delay={0}>
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-sm font-medium">Mastery legend:</span>
          {(['mastered', 'proficient', 'developing', 'novice'] as const).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: masteryColor(level), boxShadow: `0 0 6px ${masteryColor(level)}80` }}
              />
              <span className="text-sm capitalize text-muted-foreground">{level}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Knowledge map — radial layout */}
      <GlassCard delay={0.1} className="overflow-visible">
        <div className="relative flex min-h-[600px] items-center justify-center">
          {/* Central node */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="relative"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-violet/30 bg-violet/10">
                <div className="text-center">
                  <Network className="mx-auto h-6 w-6 text-violet-bright" />
                  <div className="mt-1 text-xs font-semibold">Life Processes</div>
                </div>
              </div>
              <div className="absolute inset-0 animate-glow-pulse rounded-2xl bg-violet/20 blur-xl" />
            </motion.div>
          </div>

          {/* SVG connections */}
          <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
            {TOPICS.map((_, i) => {
              const angle = (i / TOPICS.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 220;
              const cx = 50;
              const cy = 50;
              const x = cx + Math.cos(angle) * (radius / 6);
              const y = cy + Math.sin(angle) * (radius / 6);
              return (
                <motion.line
                  key={i}
                  x1="50%"
                  y1="50%"
                  x2={`${x * 2}%`}
                  y2={`${y * 2}%`}
                  stroke="hsl(215 20% 20%)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                />
              );
            })}
          </svg>

          {/* Topic nodes positioned radially */}
          {TOPICS.map((topic, i) => {
            const angle = (i / TOPICS.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 220;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const mastery = getTopicMastery(topic.id);
            const color = topic.color;
            const concepts = getConceptsByTopic(topic.id);

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="w-44 rounded-xl border bg-card/80 p-3 backdrop-blur-sm transition-all hover:scale-105"
                  style={{ borderColor: `${color}30` }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color }}>
                      {topic.name}
                    </span>
                    <span className="text-xs font-bold" style={{ color }}>
                      {mastery}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${mastery}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {concepts.slice(0, 3).map((c) => {
                      const ks = getKnowledgeState(c.id);
                      const cm = ks?.mastery ?? 0;
                      return (
                        <span
                          key={c.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: masteryColor(masteryLevel(cm)),
                          }}
                        />
                      );
                    })}
                    {concepts.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{concepts.length - 3}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Concept detail list */}
      <div className="grid gap-6 md:grid-cols-2">
        {TOPICS.map((topic, i) => {
          const concepts = getConceptsByTopic(topic.id);
          return (
            <GlassCard key={topic.id} delay={0.2 + i * 0.1}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold" style={{ color: topic.color }}>
                  {topic.name}
                </h3>
                <MasteryBadge value={getTopicMastery(topic.id)} />
              </div>
              <div className="space-y-2">
                {concepts.map((concept, ci) => {
                  const ks = getKnowledgeState(concept.id);
                  const cm = ks?.mastery ?? 0;
                  const color = masteryColor(masteryLevel(cm));
                  return (
                    <motion.div
                      key={concept.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + ci * 0.05 }}
                      className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3"
                    >
                      <div
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{concept.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{concept.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color }}>
                          {cm}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {ks?.correct ?? 0}/{ks?.attempts ?? 0} correct
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
