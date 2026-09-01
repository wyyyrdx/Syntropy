'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Upload, Sparkles, Check, FileText } from 'lucide-react';
import { NexusLogo } from '@/components/nexus/nexus-logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { id: 0, title: 'Welcome to NEXUS', desc: 'Let\'s set up your learning profile.' },
  { id: 1, title: 'Your details', desc: 'Tell us a bit about yourself.' },
  { id: 2, title: 'Upload study material', desc: 'Share your Life Processes notes for AI analysis.' },
  { id: 3, title: 'AI analysis', desc: 'Watch as NEXUS extracts concepts from your material.' },
  { id: 4, title: 'Ready to explore', desc: 'Your knowledge map is prepared. Time to dive in.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      if (step === 2) {
        // Simulate upload + analysis
        const interval = setInterval(() => {
          setUploadProgress((p) => {
            if (p >= 100) {
              clearInterval(interval);
              return 100;
            }
            return p + 10;
          });
        }, 200);
      }
      if (step === 3) {
        const interval = setInterval(() => {
          setAnalysisProgress((p) => {
            if (p >= 100) {
              clearInterval(interval);
              return 100;
            }
            return p + 8;
          });
        }, 150);
      }
    } else {
      toast({ title: 'Onboarding complete!', description: 'Welcome to NEXUS. Let\'s start learning.' });
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-cyan/8 blur-[130px]" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <NexusLogo size="lg" className="mb-8" />

        {/* Progress dots */}
        <div className="mb-12 flex items-center gap-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s.id ? 'w-8 bg-violet' : step > s.id ? 'w-2 bg-emerald' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-strong rounded-2xl p-8"
            >
              <h1 className="font-display text-2xl font-bold tracking-tight">{steps[step].title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{steps[step].desc}</p>

              <div className="mt-8">
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-violet/20 bg-violet/5 p-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-violet-bright" />
                        <p className="text-sm text-muted-foreground">
                          NEXUS uses AI to understand your study material, map your knowledge, and
                          connect you with peers who complement your strengths.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">For this demo, we'll focus on:</p>
                      <p className="mt-1">Science — Life Processes (Nutrition, Respiration, Transportation, Excretion)</p>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Full name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full rounded-lg border border-border/50 bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-violet/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">School</label>
                      <input
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="Westfield College"
                        className="w-full rounded-lg border border-border/50 bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-violet/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Year</label>
                      <input
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Year 11"
                        className="w-full rounded-lg border border-border/50 bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-violet/50"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You can skip this step — we'll use demo defaults.
                    </p>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-8 text-center">
                      <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drop your study material here</p>
                      <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, or images — up to 10MB</p>
                      <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet/10 px-4 py-2 text-sm font-medium text-violet-bright border border-violet/20 hover:bg-violet/20">
                        <FileText className="h-4 w-4" />
                        Use sample: Life Processes Notes
                      </button>
                    </div>
                    {uploadProgress > 0 && (
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Uploading...</span>
                          <span className="font-medium">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            animate={{ width: `${uploadProgress}%` }}
                            className="h-full rounded-full bg-violet"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="h-20 w-20 rounded-full border-2 border-violet/20 border-t-violet"
                        />
                        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-bright" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {['Extracting concepts from notes', 'Identifying relationships', 'Building knowledge map', 'Estimating initial mastery'].map((task, i) => (
                        <motion.div
                          key={task}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.3 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          {analysisProgress > i * 25 ? (
                            <Check className="h-4 w-4 text-emerald-bright" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                          )}
                          <span className={analysisProgress > i * 25 ? 'text-foreground' : 'text-muted-foreground'}>
                            {task}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Analyzing...</span>
                        <span className="font-medium">{analysisProgress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          animate={{ width: `${analysisProgress}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-cyan"
                    >
                      <Check className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="space-y-2">
                      {[
                        { label: 'Concepts extracted', value: '13' },
                        { label: 'Topics identified', value: '4' },
                        { label: 'Initial mastery estimated', value: '55%' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-4 py-2.5 text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-bold text-violet-bright">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                {step > 0 ? (
                  <Button variant="ghost" onClick={handleBack} className="text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 2 && uploadProgress < 100 && uploadProgress > 0) ||
                    (step === 3 && analysisProgress < 100)
                  }
                  className="bg-violet hover:bg-violet-bright"
                >
                  {step === steps.length - 1 ? 'Enter NEXUS' : 'Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
