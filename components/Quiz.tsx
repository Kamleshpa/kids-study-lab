"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { useStudy } from "@/context/StudyContext";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";

const swipeThreshold = 50;

export function Quiz() {
  const { state, setQuizIndex, selectAnswer, checkAnswer, showResults } =
    useStudy();
  const { questions, quizIndex, answers } = state;
  const q = questions[quizIndex];
  const answer = answers[quizIndex];
  const isLast = quizIndex === questions.length - 1;

  const noPickCount = answers.filter((a) => a.selectedIndex === null).length;

  const touchStartX = useRef<number | null>(null);

  function goNext() {
    if (quizIndex < questions.length - 1) setQuizIndex(quizIndex + 1);
  }
  function goPrev() {
    if (quizIndex > 0) setQuizIndex(quizIndex - 1);
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > swipeThreshold) goPrev();
    else if (dx < -swipeThreshold) goNext();
  };

  if (!q || !answer) return null;

  return (
    <div
      className="mx-auto w-full max-w-2xl px-4 py-4"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ProgressBar
        value={quizIndex + 1}
        max={questions.length}
        label={`Question ${quizIndex + 1} of ${questions.length}`}
      />

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {questions.map((_, i) => {
          const a = answers[i];
          let bg = "bg-kid-ink/20";
          if (a?.selectedIndex !== null) {
            if (a.checked) {
              bg =
                a.selectedIndex === questions[i].correctIndex
                  ? "bg-emerald-500"
                  : "bg-red-400";
            } else {
              bg = "bg-sky-500";
            }
          }
          return (
            <button
              key={i}
              type="button"
              aria-label={`Question ${i + 1}${
                a?.selectedIndex === null
                  ? ", no answer chosen"
                  : a.checked
                    ? a.selectedIndex === questions[i].correctIndex
                      ? ", correct"
                      : ", incorrect"
                    : ", answer chosen"
              }`}
              onClick={() => setQuizIndex(i)}
              className={`h-4 w-4 rounded-full transition ${
                i === quizIndex ? "ring-2 ring-kid-purple ring-offset-2" : ""
              } ${bg}`}
            />
          );
        })}
      </div>

      {isLast && noPickCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border-4 border-amber-300 bg-amber-50 px-4 py-3 text-center font-semibold text-amber-950 dark:border-amber-700 dark:bg-amber-950/35 dark:text-amber-100"
          role="status"
        >
          You still have {noPickCount} question
          {noPickCount === 1 ? "" : "s"} without a chosen answer. Pick one for
          each, or tap <strong>See my score</strong>—we&apos;ll show what you
          missed.
        </motion.div>
      )}

      <div className="relative mt-6 min-h-[280px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={quizIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="rounded-3xl border-4 border-kid-ink/15 bg-kid-surface/95 p-6 shadow-xl md:p-8"
          >
            <QuestionCard
              question={q}
              answer={answer}
              onSelect={selectAnswer}
              onCheck={checkAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={quizIndex === 0}
          className="min-h-[48px] rounded-2xl bg-kid-surface/90 px-6 py-3 font-bold text-kid-ink shadow-md disabled:opacity-40"
        >
          Previous
        </button>
        <div className="flex flex-wrap gap-2">
          {!isLast && (
            <button
              type="button"
              onClick={goNext}
              className="min-h-[48px] rounded-2xl bg-kid-mint px-6 py-3 font-bold shadow-md"
            >
              Next
            </button>
          )}
          {isLast && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={showResults}
              className="min-h-[48px] rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink px-6 py-3 font-bold text-white shadow-lg"
            >
              See my score
            </motion.button>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-sm text-kid-ink/55">
        Swipe to move between questions
      </p>
    </div>
  );
}
