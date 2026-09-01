'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Users,
  Globe,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Atom,
  ChevronRight,
} from 'lucide-react';
import { NexusLogo } from '@/components/nexus/nexus-logo';

const features = [
  {
    icon: Brain,
    title: 'AI Knowledge Mapping',
    description:
      'Upload your notes. NEXUS extracts concepts and builds a visual map of what you know — and what you don\'t.',
    color: '#7C3AED',
  },
  {
    icon: Users,
    title: 'Complementary Peer Matching',
    description:
      'Get matched with students whose strengths are your weaknesses. Learn together, not alone.',
    color: '#06B6D4',
  },
  {
    icon: Globe,
    title: 'Interactive Learning World',
    description:
      'Explore Life Processes as a visual environment — Nutrition Forest, Respiration Valley, and more.',
    color: '#10B981',
  },
  {
    icon: Target,
    title: 'Mastery-Based Quests',
    description:
      'Collaborative challenges that adapt to your knowledge level and update mastery in real time.',
    color: '#F59E0B',
  },
];

const stats = [
  { value: '13', label: 'Concepts mapped' },
  { value: '4', label: 'Life process domains' },
  { value: '3min', label: 'From upload to insight' },
];

const flow = [
  { step: '01', title: 'Upload material', desc: 'Share your study notes for Life Processes' },
  { step: '02', title: 'AI analysis', desc: 'Concepts are extracted and mapped automatically' },
  { step: '03', title: 'See your map', desc: 'Visualize mastery across every concept' },
  { step: '04', title: 'Get matched', desc: 'Find peers who complement your knowledge' },
  { step: '05', title: 'Quest together', desc: 'Enter challenges and watch mastery grow' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet/15 blur-[150px]" />
        <div className="absolute top-1/2 -right-60 h-[500px] w-[500px] rounded-full bg-cyan/10 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald/8 blur-[150px]" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-12">
        <NexusLogo size="md" />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link href="/login">
            <button className="group inline-flex items-center gap-2 rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-bright hover:shadow-lg hover:shadow-violet/30">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-32 text-center lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet/20 bg-violet/5 px-4 py-1.5 text-xs font-medium text-violet-bright"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Collaborative Learning
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Understand what you know.
          <br />
          <span className="text-gradient-brand">Connect with who complements you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground"
        >
          NEXUS maps your knowledge from study material, identifies your gaps, and matches you
          with peers whose strengths are your weaknesses — so you learn together, effectively.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/login">
            <button className="group inline-flex items-center gap-2 rounded-xl bg-violet px-6 py-3 text-base font-semibold text-white transition-all hover:bg-violet-bright hover:shadow-xl hover:shadow-violet/30">
              Try the demo
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-6 py-3 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:border-violet/30 hover:bg-card/60">
              Explore dashboard
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-gradient-brand">{stat.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Not just another study app
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            The first platform that understands your knowledge and connects you with the right people to grow it.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group glass rounded-2xl p-6 transition-all duration-300 hover:border-violet/30"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
                  style={{
                    color: feature.color,
                    borderColor: `${feature.color}30`,
                    backgroundColor: `${feature.color}10`,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            From notes to knowledge in 5 steps
          </h2>
        </motion.div>

        <div className="relative grid gap-6 md:grid-cols-5">
          {flow.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative"
            >
              <div className="glass rounded-xl p-5">
                <div className="mb-3 font-display text-2xl font-bold text-violet-bright/50">
                  {item.step}
                </div>
                <h3 className="mb-1 text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              {i < flow.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-gradient-to-r from-violet/40 to-transparent md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-32 lg:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-strong relative overflow-hidden rounded-3xl p-12 text-center"
        >
          <div className="absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-violet/20 blur-[80px]" />
          <div className="relative">
            <Atom className="mx-auto mb-6 h-12 w-12 text-violet-bright" />
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to see what you know?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join the demo and experience the full NEXUS flow in under 5 minutes.
            </p>
            <Link href="/login">
              <button className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-violet px-6 py-3 text-base font-semibold text-white transition-all hover:bg-violet-bright hover:shadow-xl hover:shadow-violet/30">
                Enter NEXUS
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <NexusLogo showText={true} size="sm" />
          <p className="text-xs text-muted-foreground">
            NEXUS — AI-Powered Collaborative Learning. Built for the hackathon.
          </p>
        </div>
      </footer>
    </div>
  );
}
