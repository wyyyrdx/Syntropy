'use client';

import { motion } from 'framer-motion';
import { Users, ArrowRight, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader } from '@/components/nexus/page-header';
import { GlassCard } from '@/components/nexus/glass-card';
import {
  PEER_STUDENTS,
  PEER_TOPIC_MASTERIES,
  DEMO_TOPIC_MASTERIES,
  TOPICS,
} from '@/lib/seed-data';
import type { PeerRecommendation } from '@/lib/types';

// Compute complementary peer recommendations
function getRecommendations(): PeerRecommendation[] {
  return PEER_STUDENTS.map((peer) => {
    const peerMasteries = PEER_TOPIC_MASTERIES[peer.id] ?? [];
    const youCanTeach: PeerRecommendation['youCanTeach'] = [];
    const theyCanTeach: PeerRecommendation['theyCanTeach'] = [];

    DEMO_TOPIC_MASTERIES.forEach((dm) => {
      const pm = peerMasteries.find((p) => p.topicId === dm.topicId);
      if (!pm) return;
      const diff = dm.mastery - pm.mastery;
      if (diff > 15) {
        youCanTeach.push({
          chapterId: dm.topicId,
          yourMastery: dm.mastery,
          theirMastery: pm.mastery,
        });
      } else if (diff < -15) {
        theyCanTeach.push({
          chapterId: dm.topicId,
          theirMastery: pm.mastery,
          yourMastery: dm.mastery,
        });
      }
    });

    const complementScore = Math.min(
      100,
      (youCanTeach.length + theyCanTeach.length) * 25 +
        youCanTeach.reduce((s, x) => s + Math.abs(x.yourMastery - x.theirMastery), 0) +
        theyCanTeach.reduce((s, x) => s + Math.abs(x.theirMastery - x.yourMastery), 0),
    );

    const topicName = (id: string) => TOPICS.find((t) => t.id === id)?.name ?? id;

    const reasonParts: string[] = [];
    if (theyCanTeach.length > 0) {
      reasonParts.push(
        `They can teach you ${theyCanTeach.map((t) => topicName(t.chapterId)).join(', ')}`,
      );
    }
    if (youCanTeach.length > 0) {
      reasonParts.push(
        `You can teach them ${youCanTeach.map((t) => topicName(t.chapterId)).join(', ')}`,
      );
    }
    const reason = reasonParts.length > 0 ? reasonParts.join('. ') : 'Similar knowledge profile.';

    return { peer, reason, complementScore, youCanTeach, theyCanTeach };
  }).sort((a, b) => b.complementScore - a.complementScore);
}

export default function PeersPage() {
  const recommendations = getRecommendations();
  const topicName = (id: string) => TOPICS.find((t) => t.id === id)?.name ?? id;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Peer Matching"
        description="AI-identified students whose strengths complement your weaknesses — and vice versa."
        icon={<Users className="h-6 w-6" />}
      />

      {/* How it works banner */}
      <GlassCard delay={0} className="flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet/10 text-violet-bright border border-violet/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground">
          NEXUS compares your topic-level mastery with other students. When your strength matches
          their weakness (or the reverse), you're matched — with a clear explanation of why.
        </p>
      </GlassCard>

      {/* Recommendations */}
      <div className="space-y-6">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.peer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <GlassCard hover delay={i * 0.1}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                {/* Peer info */}
                <div className="flex items-center gap-4 lg:w-64">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-cyan text-lg font-bold text-white">
                    {rec.peer.avatar_initials}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{rec.peer.name}</h3>
                    <p className="text-xs text-muted-foreground">{rec.peer.school}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-violet-bright">
                        {rec.complementScore}% complement
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complementary analysis */}
                <div className="flex-1 space-y-3">
                  {rec.theyCanTeach.length > 0 && (
                    <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-bright" />
                        <span className="text-sm font-medium text-emerald-bright">They can teach you</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.theyCanTeach.map((t) => (
                          <div key={t.chapterId} className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-1.5">
                            <span className="text-xs font-medium">{topicName(t.chapterId)}</span>
                            <span className="text-xs text-emerald-bright">{t.theirMastery}%</span>
                            <span className="text-xs text-muted-foreground">vs your {t.yourMastery}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rec.youCanTeach.length > 0 && (
                    <div className="rounded-lg border border-violet/20 bg-violet/5 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-violet-bright" />
                        <span className="text-sm font-medium text-violet-bright">You can teach them</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.youCanTeach.map((t) => (
                          <div key={t.chapterId} className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-1.5">
                            <span className="text-xs font-medium">{topicName(t.chapterId)}</span>
                            <span className="text-xs text-violet-bright">{t.yourMastery}%</span>
                            <span className="text-xs text-muted-foreground">vs their {t.theirMastery}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                </div>

                {/* Action */}
                <div className="flex flex-col gap-2 lg:w-40">
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-bright hover:shadow-lg hover:shadow-violet/30">
                    Start quest
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-2.5 text-sm font-medium transition-all hover:border-violet/30">
                    View profile
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
