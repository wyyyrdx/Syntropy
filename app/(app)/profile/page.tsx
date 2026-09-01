'use client';

import { motion } from 'framer-motion';
import { User, Mail, School, Calendar, Flame, Trophy, Target, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/nexus/page-header';
import { GlassCard } from '@/components/nexus/glass-card';
import { MasteryRing } from '@/components/nexus/mastery-ring';
import { DEMO_USER, getOverallMastery, CONCEPTS, DEMO_KNOWLEDGE_STATES } from '@/lib/seed-data';

export default function ProfilePage() {
  const overallMastery = getOverallMastery();
  const masteredCount = DEMO_KNOWLEDGE_STATES.filter((ks) => ks.mastery >= 80).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Profile"
        description="Your learning identity and achievements in NEXUS."
        icon={<User className="h-6 w-6" />}
      />

      {/* Profile header */}
      <GlassCard delay={0}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-cyan text-2xl font-bold text-white">
            {DEMO_USER.avatar_initials}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">{DEMO_USER.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{DEMO_USER.bio}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {DEMO_USER.email}
              </span>
              <span className="flex items-center gap-1.5">
                <School className="h-4 w-4" />
                {DEMO_USER.school}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {DEMO_USER.year}
              </span>
            </div>
          </div>
          <MasteryRing value={overallMastery} size={120} />
        </div>
      </GlassCard>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Target, label: 'Overall mastery', value: `${overallMastery}%`, color: '#7C3AED' },
          { icon: BookOpen, label: 'Concepts mastered', value: `${masteredCount}/${CONCEPTS.length}`, color: '#10B981' },
          { icon: Trophy, label: 'Quests completed', value: DEMO_USER.quests_completed, color: '#F59E0B' },
          { icon: Flame, label: 'Study streak', value: `${DEMO_USER.study_streak} days`, color: '#06B6D4' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <GlassCard delay={i * 0.08} className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ color: stat.color, backgroundColor: `${stat.color}10` }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Study materials */}
      <GlassCard delay={0.3}>
        <h3 className="mb-4 font-display text-lg font-semibold">Study materials</h3>
        <div className="space-y-3">
          {[
            { title: 'Life Processes — Class Notes', type: 'Notes', date: 'Aug 10', concepts: 13 },
            { title: 'Circulatory System Diagrams', type: 'Textbook', date: 'Aug 12', concepts: 4 },
          ].map((material, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + i * 0.08 }}
              className="flex items-center gap-4 rounded-lg border border-border/40 bg-muted/20 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet/10 text-violet-bright">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{material.title}</div>
                <div className="text-xs text-muted-foreground">
                  {material.type} · Uploaded {material.date} · {material.concepts} concepts extracted
                </div>
              </div>
              <span className="rounded-md bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald-bright border border-emerald/20">
                Analyzed
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Account info */}
      <GlassCard delay={0.4}>
        <h3 className="mb-4 font-display text-lg font-semibold">Account</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Member since</div>
            <div className="mt-1 text-sm font-medium">August 2026</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Plan</div>
            <div className="mt-1 text-sm font-medium">Demo account</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
