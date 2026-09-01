'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  Brain,
  Users,
  Swords,
  TrendingUp,
  ArrowRight,
  Flame,
  Trophy,
  Target,
  BookOpen,
  Sparkles,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/nexus/page-header';
import { GlassCard } from '@/components/nexus/glass-card';
import { MasteryRing } from '@/components/nexus/mastery-ring';
import { MasteryBadge } from '@/components/nexus/mastery-badge';
import {
  DEMO_USER,
  TOPICS,
  LIFE_PROCESSES_CHAPTER,
  getTopicMastery,
  getOverallMastery,
  DEMO_KNOWLEDGE_STATES,
  CONCEPTS,
  QUESTS,
  PEER_STUDENTS,
  masteryLevel,
} from '@/lib/seed-data';

export default function DashboardPage() {
  const overallMastery = getOverallMastery();
  const masteredCount = DEMO_KNOWLEDGE_STATES.filter((ks) => ks.mastery >= 80).length;
  const developingCount = DEMO_KNOWLEDGE_STATES.filter(
    (ks) => ks.mastery >= 25 && ks.mastery < 80,
  ).length;
  const noviceCount = DEMO_KNOWLEDGE_STATES.filter((ks) => ks.mastery < 25).length;
  const weakestTopic = TOPICS.reduce((min, t) =>
    getTopicMastery(t.id) < getTopicMastery(min.id) ? t : min,
  );
  const strongestTopic = TOPICS.reduce((max, t) =>
    getTopicMastery(t.id) > getTopicMastery(max.id) ? t : max,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${DEMO_USER.name.split(' ')[0]}`}
        description="Here's your learning overview for Life Processes."
        icon={<LayoutDashboard className="h-6 w-6" />}
        actions={
          <Link href="/learn">
            <button className="inline-flex items-center gap-2 rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-bright hover:shadow-lg hover:shadow-violet/30">
              <Globe className="h-4 w-4" />
              Enter Learning World
            </button>
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard delay={0} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet/10 text-violet-bright border border-violet/20">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold">{overallMastery}%</div>
            <div className="text-xs text-muted-foreground">Overall mastery</div>
          </div>
        </GlassCard>

        <GlassCard delay={0.05} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald-bright border border-emerald/20">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold">{DEMO_USER.quests_completed}</div>
            <div className="text-xs text-muted-foreground">Quests completed</div>
          </div>
        </GlassCard>

        <GlassCard delay={0.1} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/10 text-cyan-bright border border-cyan/20">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold">{DEMO_USER.study_streak}</div>
            <div className="text-xs text-muted-foreground">Day study streak</div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold">{CONCEPTS.length}</div>
            <div className="text-xs text-muted-foreground">Concepts tracked</div>
          </div>
        </GlassCard>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overall mastery ring + breakdown */}
        <GlassCard delay={0.2} className="lg:col-span-1">
          <h3 className="mb-4 font-display text-lg font-semibold">Mastery overview</h3>
          <div className="flex flex-col items-center gap-6">
            <MasteryRing value={overallMastery} size={160} />
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald" />
                  Mastered
                </span>
                <span className="font-medium">{masteredCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-cyan" />
                  Developing
                </span>
                <span className="font-medium">{developingCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Novice
                </span>
                <span className="font-medium">{noviceCount}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Topic mastery bars */}
        <GlassCard delay={0.25} className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Life Processes — topic mastery</h3>
            <Link href="/knowledge" className="text-xs text-violet-bright hover:underline">
              View knowledge map
            </Link>
          </div>
          <div className="space-y-5">
            {TOPICS.map((topic, i) => {
              const mastery = getTopicMastery(topic.id);
              const color =
                mastery >= 80 ? '#10B981' : mastery >= 50 ? '#06B6D4' : mastery >= 25 ? '#F59E0B' : '#EF4444';
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{topic.name}</span>
                      <MasteryBadge value={mastery} />
                    </div>
                    <span className="font-display text-sm font-bold" style={{ color }}>
                      {mastery}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery}%` }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.08, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          href="/learn/life-processes"
          icon={<Globe className="h-5 w-5" />}
          title="Learning World"
          description="Explore Life Processes interactively"
          color="#06B6D4"
          delay={0.4}
        />
        <QuickActionCard
          href="/peers"
          icon={<Users className="h-5 w-5" />}
          title="Peer Matching"
          description="Find students who complement you"
          color="#7C3AED"
          delay={0.45}
        />
        <QuickActionCard
          href="/quests"
          icon={<Swords className="h-5 w-5" />}
          title="Collaborative Quests"
          description="Challenge yourself with peers"
          color="#F59E0B"
          delay={0.5}
        />
      </div>

      {/* Focus area + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard delay={0.55}>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-bright" />
            <h3 className="font-display text-lg font-semibold">AI study recommendation</h3>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-red-400">Focus area</span>
              <MasteryBadge value={getTopicMastery(weakestTopic.id)} />
            </div>
            <p className="text-sm text-muted-foreground">
              Your weakest area is <span className="font-medium text-foreground">{weakestTopic.name}</span> at{' '}
              <span className="font-bold text-red-400">{getTopicMastery(weakestTopic.id)}%</span>. You'd benefit
              from a peer who's strong here.{' '}
              <Link href="/peers" className="font-medium text-violet-bright hover:underline">
                Find a match →
              </Link>
            </p>
          </div>
          <div className="mt-3 rounded-xl border border-emerald/20 bg-emerald/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-emerald-bright">Your strength</span>
              <MasteryBadge value={getTopicMastery(strongestTopic.id)} />
            </div>
            <p className="text-sm text-muted-foreground">
              You're strongest in <span className="font-medium text-foreground">{strongestTopic.name}</span> at{' '}
              <span className="font-bold text-emerald-bright">{getTopicMastery(strongestTopic.id)}%</span>. You
              could teach this to a peer who's struggling.
            </p>
          </div>
        </GlassCard>

        <GlassCard delay={0.6}>
          <h3 className="mb-4 font-display text-lg font-semibold">Recent activity</h3>
          <div className="space-y-3">
            {[
              { icon: Trophy, text: 'Completed "Respiration Basics" quest', time: '2h ago', color: '#10B981' },
              { icon: Target, text: 'Improved Aerobic Respiration mastery to 85%', time: '5h ago', color: '#06B6D4' },
              { icon: Users, text: 'New peer match: Maya Chen (91% Transportation)', time: '1d ago', color: '#7C3AED' },
              { icon: BookOpen, text: 'Uploaded "Circulatory System Diagrams"', time: '2d ago', color: '#F59E0B' },
            ].map((activity, i) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.65 + i * 0.08 }}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3"
                >
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ color: activity.color, backgroundColor: `${activity.color}15` }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-sm">{activity.text}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Available quests preview */}
      <GlassCard delay={0.7}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Available quests</h3>
          <Link href="/quests" className="text-xs text-violet-bright hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUESTS.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75 + i * 0.1 }}
              className="rounded-xl border border-border/50 bg-muted/20 p-4 transition-all hover:border-violet/30"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {quest.difficulty}
                </span>
                <span className="text-xs font-medium text-amber-500">+{quest.xp} XP</span>
              </div>
              <h4 className="mb-1 font-medium">{quest.title}</h4>
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{quest.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {quest.participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-violet to-cyan text-[10px] font-semibold text-white"
                    >
                      {p.avatar_initials}
                    </div>
                  ))}
                </div>
                <Link href="/quests">
                  <button className="inline-flex items-center gap-1 text-xs font-medium text-violet-bright hover:underline">
                    Join
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
  color,
  delay,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -2 }}
        className="glass rounded-2xl p-5 transition-all hover:border-violet/30 hover:glow-violet"
      >
        <div
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
        >
          {icon}
        </div>
        <h3 className="mb-1 font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </motion.div>
    </Link>
  );
}
