import React, { useState } from 'react';
import { PHYSICS_CURRICULUM_BOOKS } from '../data/physicsCurriculumBooks';
import { PHYSICS_REALMS } from '../data/physicsRealms';
import { retroAudio } from '../audio/retroAudio';
import { Sparkles, Navigation, Bookmark, Trophy, GraduationCap } from 'lucide-react';

function isQuizCompleted(quiz, completedQuizzes) {
  if (!quiz) return false;
  const sourceId = quiz.id || `quiz:${quiz.question}`;
  if (Array.isArray(completedQuizzes)) return completedQuizzes.includes(sourceId);
  if (completedQuizzes instanceof Set) return completedQuizzes.has(sourceId);
  return false;
}

export default function PhysicsBookSelector({ onSelectRealm, onStartQuiz, completedQuizzes = [] }) {
  const [selectedClassId, setSelectedClassId] = useState('class-6');
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  const currentBook = PHYSICS_CURRICULUM_BOOKS.find(b => b.id === selectedClassId) || PHYSICS_CURRICULUM_BOOKS[0];
  const currentChapter = currentBook.chapters[selectedChapterIndex] || currentBook.chapters[0];
  const targetRealm = PHYSICS_REALMS.find(r => r.id === currentChapter.realmTarget);

  const handleClassChange = (bookId) => {
    retroAudio.playInteract();
    setSelectedClassId(bookId);
    setSelectedChapterIndex(0);
  };

  const handleChapterChange = (idx) => {
    retroAudio.playBlip();
    setSelectedChapterIndex(idx);
  };

  const handlePlayChapter = () => {
    if (targetRealm && onSelectRealm) {
      retroAudio.playWarp();
      onSelectRealm(targetRealm);
    }
  };

  const chapterQuiz = currentChapter.quiz?.[0];
  const chapterQuizDone = isQuizCompleted(chapterQuiz, completedQuizzes);

  const handleLaunchChapterQuiz = () => {
    if (chapterQuiz && onStartQuiz) {
      retroAudio.playInteract();
      onStartQuiz(chapterQuiz);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 flex flex-col items-center overflow-x-hidden">
      {/* Header Banner */}
      <div className="w-full text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-400 text-amber-300 font-pixel text-[9px] sm:text-xs mb-2">
          <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          PHYSICS CURRICULUM LAB BOOKS
        </div>
        <h2 className="text-base sm:text-xl font-bold text-slate-100 font-pixel">
          SELECT YOUR CLASS SYLLABUS
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-1 px-2">
          Pick your grade level to load lab books, concept notes, and linked simulation quests.
        </p>
      </div>

      {/* Class Selector Tabs (Class 6 through 10) */}
      <div className="w-full max-w-2xl overflow-x-auto pb-2 px-1 mb-4 sm:mb-6">
        <div className="flex items-center gap-1.5 sm:gap-2 justify-start sm:justify-center min-w-max mx-auto">
          {PHYSICS_CURRICULUM_BOOKS.map(book => {
            const isSelected = book.id === selectedClassId;
            return (
              <button
                key={book.id}
                onClick={() => handleClassChange(book.id)}
                className={`btn-pixel text-[10px] sm:text-[11px] py-1.5 sm:py-2 px-3 sm:px-4 transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'btn-pixel-amber shadow-lg shadow-amber-500/30 -translate-y-0.5'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span>{book.icon}</span>
                <span>{book.grade}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Parchment Book Container */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 bg-slate-900/90 border-2 sm:border-3 border-amber-600/60 p-3 sm:p-6 rounded-lg shadow-2xl backdrop-blur relative">
        {/* Left Column: Book Spine & Chapters Index */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{currentBook.icon}</span>
            <div>
              <div className="font-pixel text-xs text-amber-400">{currentBook.grade}</div>
              <div className="font-mono text-xs text-slate-400">ROLE: {currentBook.role}</div>
            </div>
          </div>
          <h3 className="font-bold text-sm text-slate-200 mb-2 font-mono leading-snug">
            {currentBook.title}
          </h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-mono">
            {currentBook.description}
          </p>

          <div className="font-pixel text-[9px] text-slate-400 mb-2 uppercase tracking-wider">
            Chapters In This Book ({currentBook.chapters.length}):
          </div>

          <div className="space-y-2">
            {currentBook.chapters.map((ch, idx) => {
              const isSelected = idx === selectedChapterIndex;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChapterChange(idx)}
                  className={`chapter-item-btn ${isSelected ? 'active' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="font-mono line-clamp-1 font-semibold text-xs sm:text-sm">Ch {ch.number}: {ch.title}</span>
                  </div>
                  {ch.quiz && ch.quiz.length > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded font-pixel shrink-0">
                      Q
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Chapter Details, Concept Notes & Realm Quest Link */}
        <div className="md:col-span-8 flex flex-col justify-between">
          <div>
            {/* Chapter Header & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-3 border-b border-slate-800">
              <div>
                <span className="font-pixel text-[10px] text-amber-400">
                  CHAPTER {currentChapter.number}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-100 font-mono mt-0.5">
                  {currentChapter.title}
                </h4>
              </div>

              {/* Play This Chapter in Realm Button */}
              {targetRealm && (
                <button
                  onClick={handlePlayChapter}
                  className="btn-pixel btn-pixel-green text-[10px] py-2 px-3 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  <span>PLAY IN {targetRealm.name.toUpperCase().split(' ')[0]} REALM</span>
                </button>
              )}
            </div>

            {/* Chapter Synopsis */}
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded mb-4">
              <span className="font-pixel text-[9px] text-cyan-400 block mb-1">CHAPTER OVERVIEW:</span>
              <p className="font-mono text-xs text-slate-300 leading-relaxed">
                {currentChapter.summary}
              </p>
            </div>

            {/* Concept Nodes List */}
            <div className="mb-4">
              <span className="font-pixel text-[9px] text-amber-400 block mb-2">
                CORE CONCEPTS & DEFINITIONS ({currentChapter.concepts.length}):
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {currentChapter.concepts.map((concept, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 bg-slate-950/50 border border-slate-800 hover:border-slate-700 rounded transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sm text-amber-300">
                        {concept.title}
                      </span>
                      <span className={`font-pixel text-[8px] px-2 py-0.5 rounded border uppercase ${
                        concept.importance === 'primary'
                          ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                          : 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                      }`}>
                        {concept.importance}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-400 leading-relaxed">
                      {concept.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-mono text-xs text-slate-400">
                ACTIVE RECALL QUESTIONS AVAILABLE
              </span>
            </div>
            {chapterQuiz && (
              <button
                onClick={handleLaunchChapterQuiz}
                className="btn-pixel btn-pixel-amber text-[10px] sm:text-[11px] py-2.5 sm:py-2 px-4 flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{chapterQuizDone ? 'REVIEW CHAPTER QUIZ' : 'START CHAPTER QUIZ (+100 XP)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
