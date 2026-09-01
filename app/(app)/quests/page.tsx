'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Check, X, ArrowRight, Trophy, Clock, Users } from 'lucide-react';
import { PageHeader } from '@/components/nexus/page-header';
import { GlassCard } from '@/components/nexus/glass-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QUESTS, QUIZ_QUESTIONS } from '@/lib/seed-data';

export default function QuestsPage() {
  const { toast } = useToast();
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const activeQuest = QUESTS.find((q) => q.id === activeQuestId);
  const questQuestions = QUIZ_QUESTIONS.slice(0, activeQuest?.questionCount ?? 5);
  const question = questQuestions[currentQuestion];

  const handleStartQuest = (questId: string) => {
    setActiveQuestId(questId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questQuestions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      toast({
        title: 'Quest complete!',
        description: `You scored ${score + (selectedAnswer === question?.correctIndex ? 1 : 0)}/${questQuestions.length}. Mastery updated.`,
      });
    }
  };

  const handleExit = () => {
    setActiveQuestId(null);
    setQuizComplete(false);
  };

  if (activeQuest && !quizComplete) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={activeQuest.title}
          description={activeQuest.description}
          icon={<Swords className="h-6 w-6" />}
          actions={
            <Button variant="outline" onClick={handleExit}>
              Exit quest
            </Button>
          }
        />

        {/* Progress bar */}
        <GlassCard delay={0}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {questQuestions.length}
            </span>
            <span className="font-medium text-violet-bright">Score: {score}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              animate={{ width: `${((currentQuestion + (showResult ? 1 : 0)) / questQuestions.length) * 100}%` }}
              className="h-full rounded-full bg-violet"
              style={{ boxShadow: '0 0 8px #7C3AED80' }}
            />
          </div>
        </GlassCard>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard delay={0.1}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md bg-violet/10 px-2 py-0.5 text-xs font-medium text-violet-bright">
                  Difficulty: {'★'.repeat(question.difficulty)}
                </span>
              </div>
              <h3 className="mb-6 font-display text-xl font-semibold">{question.question}</h3>

              <div className="space-y-3">
                {question.options.map((option, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = i === question.correctIndex;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={showResult}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm transition-all ${
                        showCorrect
                          ? 'border-emerald/40 bg-emerald/10'
                          : showWrong
                            ? 'border-red-500/40 bg-red-500/10'
                            : isSelected
                              ? 'border-violet/40 bg-violet/10'
                              : 'border-border/50 bg-muted/20 hover:border-violet/30'
                      } ${!showResult && 'cursor-pointer'}`}
                    >
                      <span>{option}</span>
                      {showCorrect && <Check className="h-5 w-5 text-emerald-bright" />}
                      {showWrong && <X className="h-5 w-5 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-xl border border-border/50 bg-muted/30 p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Explanation: </span>
                    {question.explanation}
                  </p>
                  <Button onClick={handleNext} className="mt-4 w-full bg-violet hover:bg-violet-bright">
                    {currentQuestion < questQuestions.length - 1 ? 'Next question' : 'Complete quest'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (activeQuest && quizComplete) {
    const finalScore = score + (selectedAnswer === question?.correctIndex && showResult ? 0 : 0);
    const percentage = Math.round((score / questQuestions.length) * 100);

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-cyan">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold">Quest Complete!</h2>
            <p className="mt-2 text-muted-foreground">{activeQuest.title}</p>

            <div className="my-8 flex justify-center gap-8">
              <div>
                <div className="font-display text-3xl font-bold text-violet-bright">{score}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold">{questQuestions.length}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-emerald-bright">{percentage}%</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Accuracy</div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-4 text-sm text-muted-foreground">
              <span className="font-medium text-emerald-bright">+{activeQuest.xp} XP earned.</span> Your mastery
              has been updated based on this performance.
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={handleExit} className="flex-1">
                Back to quests
              </Button>
              <Button
                onClick={() => handleStartQuest(activeQuest.id)}
                className="flex-1 bg-violet hover:bg-violet-bright"
              >
                Try again
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Collaborative Quests"
        description="Team up with peers on knowledge-building challenges. Your performance updates mastery in real time."
        icon={<Swords className="h-6 w-6" />}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {QUESTS.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <GlassCard hover delay={i * 0.1} className="flex h-full flex-col">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    quest.difficulty === 'beginner'
                      ? 'bg-emerald/10 text-emerald-bright border border-emerald/20'
                      : quest.difficulty === 'intermediate'
                        ? 'bg-cyan/10 text-cyan-bright border border-cyan/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {quest.difficulty}
                </span>
                <span className="text-xs font-medium text-amber-500">+{quest.xp} XP</span>
              </div>

              <h3 className="mb-2 font-display text-lg font-semibold">{quest.title}</h3>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">{quest.description}</p>

              <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {quest.questionCount} questions
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {quest.participants.length + 1} participants
                </span>
              </div>

              {/* Participants */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-violet to-cyan text-[10px] font-semibold text-white">
                    AR
                  </div>
                  {quest.participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-cyan to-emerald text-[10px] font-semibold text-white"
                    >
                      {p.avatar_initials}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleStartQuest(quest.id)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-bright hover:shadow-lg hover:shadow-violet/30"
              >
                Start quest
                <ArrowRight className="h-4 w-4" />
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
