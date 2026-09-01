'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, Lock, Sparkles } from 'lucide-react';
import { NexusLogo } from '@/components/nexus/nexus-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('alex@nexus.edu');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      toast({
        title: 'Welcome to NEXUS',
        description: 'You are signed in as Alex Rivera (demo mode).',
      });
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-cyan/8 blur-[130px]" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Back link */}
        <div className="px-6 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        {/* Login form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="glass-strong rounded-2xl p-8">
              <div className="mb-8 flex flex-col items-center text-center">
                <NexusLogo showText={false} size="lg" className="mb-4" />
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                  Welcome to NEXUS
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to access your learning world
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDemoLogin();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-border/50 bg-muted/30 pl-9"
                      placeholder="you@school.edu"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-border/50 bg-muted/30 pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet py-2.5 text-base font-semibold text-white hover:bg-violet-bright hover:shadow-lg hover:shadow-violet/30"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet/30 bg-violet/5 py-2.5 text-sm font-medium text-violet-bright transition-all hover:bg-violet/10 hover:shadow-lg hover:shadow-violet/20"
              >
                <Sparkles className="h-4 w-4" />
                Continue with demo account
              </button>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{' '}
                <button onClick={handleDemoLogin} className="font-medium text-violet-bright hover:underline">
                  Create one
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
