'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { PageHeader } from '@/components/nexus/page-header';
import { GlassCard } from '@/components/nexus/glass-card';
import { MasteryRing } from '@/components/nexus/mastery-ring';
import {
  TOPICS,
  DEMO_KNOWLEDGE_STATES,
  CONCEPTS,
  getTopicMastery,
  getOverallMastery,
  DEMO_USER,
} from '@/lib/seed-data';

export default function ProgressPage() {
  const overallMastery = getOverallMastery();

  // Weekly activity data (deterministic demo)
  const weeklyActivity = [
    { day: 'Mon', value: 3 },
    { day: 'Tue', value: 5 },
    { day: 'Wed', value: 2 },
    { day: 'Thu', value: 7 },
    { day: 'Fri', value: 4 },
    { day: 'Sat', value: 6 },
    { day: 'Sun', value: 4 },
  ];
  const maxActivity = Math.max(...weeklyActivity.map((d) => d.value));

  // Mastery trend (deterministic demo)
  const masteryTrend = [
    { week: 'W1', value: 28 },
    { week: 'W2', value: 35 },
    { week: 'W3', value: 42 },
    { week: 'W4', value: 48 },
    { week: 'Now', value: overallMastery },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Progress Analytics"
        description="Track your mastery growth, study activity, and concept-level performance over time."
        icon={<TrendingUp className="h-6 w-6" />}
      />

      {/* Top row: mastery ring + key stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard delay={0} className="flex flex-col items-center">
          <h3 className="mb-4 self-start font-display text-lg font-semibold">Overall mastery</h3>
          <MasteryRing value={overallMastery} size={160} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {DEMO_USER.mastered_concepts} of {CONCEPTS.length} concepts mastered
          </p>
        </GlassCard>

        <GlassCard delay={0.05} className="lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-semibold">Mastery growth trend</h3>
          <div className="flex items-end justify-between gap-3 pt-4">
            {masteryTrend.map((point, i) => {
              const height = (point.value / 100) * 180;
              return (
                <div key={point.week} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-bold text-violet-bright">{point.value}%</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-violet/40 to-violet"
                    style={{ boxShadow: '0 0 12px #7C3AED40' }}
                  />
                  <span className="text-xs text-muted-foreground">{point.week}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Weekly activity */}
      <GlassCard delay={0.1}>
        <h3 className="mb-4 font-display text-lg font-semibold">This week's activity</h3>
        <div className="flex items-end justify-between gap-4 pt-4">
          {weeklyActivity.map((day, i) => {
            const height = (day.value / maxActivity) * 120;
            return (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="w-full rounded-t-md bg-gradient-to-t from-cyan/30 to-cyan"
                  style={{ boxShadow: '0 0 8px #06B6D440' }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Topic breakdown + concept performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard delay={0.15}>
          <h3 className="mb-4 font-display text-lg font-semibold">Topic mastery breakdown</h3>
          <div className="space-y-4">
            {TOPICS.map((topic, i) => {
              const mastery = getTopicMastery(topic.id);
              const color =
                mastery >= 80 ? '#10B981' : mastery >= 50 ? '#06B6D4' : mastery >= 25 ? '#F59E0B' : '#EF4444';
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                >
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{topic.name}</span>
                    <span className="font-bold" style={{ color }}>
                      {mastery}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <h3 className="mb-4 font-display text-lg font-semibold">Concept performance</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-2">
            {DEMO_KNOWLEDGE_STATES.map((ks, i) => {
              const concept = CONCEPTS.find((c) => c.id === ks.concept_id);
              if (!concept) return null;
              const accuracy = ks.attempts > 0 ? Math.round((ks.correct / ks.attempts) * 100) : 0;
              const color = accuracy >= 70 ? '#10B981' : accuracy >= 40 ? '#F59E0B' : '#EF4444';
              return (
                <motion.div
                  key={ks.concept_id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + i * 0.04 }}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{concept.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {ks.correct}/{ks.attempts} correct · {ks.last_practiced ?? 'Not practiced'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${accuracy}%`, backgroundColor: color }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold" style={{ color }}>
                      {accuracy}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Achievements */}
      <GlassCard delay={0.25}>
        <h3 className="mb-4 font-display text-lg font-semibold">Achievements</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Award, title: 'First Quest', desc: 'Completed your first quest', color: '#F59E0B', earned: true },
            { icon: Target, title: 'Concept Crusher', desc: 'Mastered 2 concepts', color: '#10B981', earned: true },
            { icon: Calendar, title: '7-Day Streak', desc: 'Studied 7 days in a row', color: '#7C3AED', earned: true },
            { icon: TrendingUp, title: 'Rising Scholar', desc: 'Reached 50% overall mastery', color: '#06B6D4', earned: true },
          ].map((achievement, i) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center"
              >
                <div
                  className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ color: achievement.color, backgroundColor: `${achievement.color}15` }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold">{achievement.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{achievement.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
