import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { retroAudio } from '../audio/retroAudio';
import { Sparkles, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

function quizSourceId(quiz) {
  return quiz?.id || `quiz:${quiz?.question || 'unknown'}`;
}

export default function QuizModal({ quiz, onClose, onAwardXP }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
  }, [quiz]);

  if (!quiz || !Array.isArray(quiz.options)) return null;

  const isCorrect = selectedOption === quiz.correct;

  const handleSelectOption = (optionId) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
    setIsAnswered(true);

    if (optionId === quiz.correct) {
      retroAudio.playCorrect();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore confetti error
      }
      if (onAwardXP) onAwardXP(100, 'Quiz Challenge Mastered!', quizSourceId(quiz));
    } else {
      retroAudio.playWrong();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="pixel-box pixel-box-gold w-full max-w-xl bg-slate-950 p-3.5 sm:p-6 rounded-lg shadow-2xl relative max-h-[88vh] overflow-y-auto">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-2.5 mb-3 sm:mb-4 border-b border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="p-1 sm:p-1.5 bg-amber-500/20 border border-amber-400 rounded text-amber-300">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
            <span className="font-pixel text-[10px] sm:text-xs text-amber-400">ACTIVE RECALL CHALLENGE</span>
          </div>
          <span className="font-mono text-[10px] sm:text-xs text-cyan-400 px-2 py-0.5 bg-slate-900 border border-cyan-500/30 rounded shrink-0">
            +100 EXP
          </span>
        </div>

        {/* Question Text */}
        <div className="bg-slate-900/90 border-2 border-slate-800 p-3 sm:p-4 rounded mb-3 sm:mb-4">
          <p className="font-mono text-xs sm:text-sm md:text-base font-bold text-slate-100 leading-relaxed">
            {quiz.question}
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
          {quiz.options.map(opt => {
            const isChosen = selectedOption === opt.id;
            const isRight = opt.id === quiz.correct;

            let stateClass = '';
            if (isAnswered) {
              if (isRight) stateClass = 'correct';
              else if (isChosen && !isRight) stateClass = 'wrong';
              else stateClass = 'disabled';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswered}
                className={`quiz-option-btn ${stateClass}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-pixel text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-800 border border-slate-600 rounded text-amber-300 shrink-0">
                    [{opt.id}]
                  </span>
                  <span className="leading-snug text-xs sm:text-sm font-semibold tracking-wide text-left">{opt.text}</span>
                </div>
                {isAnswered && isRight && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />}
                {isAnswered && isChosen && !isRight && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Feedback / Explanation Box */}
        {isAnswered && (
          <div className={`p-3 sm:p-4 rounded border-2 mb-4 sm:mb-5 animate-fadeIn ${
            isCorrect ? 'bg-emerald-950/50 border-emerald-500/50' : 'bg-amber-950/50 border-amber-500/50'
          }`}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 font-pixel text-[10px] sm:text-xs">
              {isCorrect ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> EXCELLENT! CORRECT ANSWER
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 shrink-0" /> EXPLANATION & KEY TAKEAWAY
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              {quiz.explanation}
            </p>
          </div>
        )}

        {/* Bottom Close Action */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              retroAudio.playBlip();
              onClose();
            }}
            className="btn-pixel btn-pixel-primary text-[10px] sm:text-[11px] py-2.5 sm:py-2 px-4 w-full sm:w-auto text-center justify-center"
          >
            {isAnswered ? 'CONTINUE EXPLORING' : 'SKIP FOR NOW'}
          </button>
        </div>
      </div>
    </div>
  );
}
