"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useScore, useStudy } from "@/context/StudyContext";
import { KidMarkdown } from "./KidMarkdown";

const confettiColors = [
  "#c4b5fd",
  "#6ee7b7",
  "#fda4af",
  "#fde047",
  "#7dd3fc",
];

function Confetti({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random(),
        color: confettiColors[i % confettiColors.length],
        rotate: Math.random() * 360,
      })),
    []
  );

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0 h-3 w-3 rounded-sm"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            rotate: p.rotate,
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{ y: "100vh", opacity: 0.9 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

function ScoreRing({
  correct,
  total,
}: {
  correct: number;
  total: number;
}) {
  const denom = Math.max(total, 1);
  const pct = (correct / denom) * 100;
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg className="-rotate-90 transform" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="12"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-kid-purple">{correct}</span>
        <span className="text-sm text-kid-ink/70">of {total}</span>
      </div>
    </div>
  );
}

export function ResultsScreen() {
  const { state, retryQuiz, resetApp } = useStudy();
  const { correct, answered, byDiff, incorrect, unanswered } = useScore();
  const totalQ = state.questions.length;
  const celebrate =
    answered > 0 && correct / answered >= 0.7;

  const ringTotal = answered > 0 ? answered : totalQ;

  return (
    <>
      <Confetti active={celebrate} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg px-4 py-8"
      >
        <h2 className="text-center font-display text-3xl font-bold text-kid-purple">
          Your score
        </h2>

        <div className="mt-8">
          <ScoreRing correct={correct} total={ringTotal} />
        </div>

        <p className="mt-4 text-center text-xl font-semibold text-kid-ink">
          You got <strong>{correct}</strong> right
          {answered > 0 ? (
            <span className="block text-base font-normal text-kid-ink/70">
              out of {answered} question{answered === 1 ? "" : "s"} you
              answered ({totalQ} total)
            </span>
          ) : (
            <span className="block text-base font-normal text-kid-ink/70">
              Pick answers next time to see how you did on each one!
            </span>
          )}
        </p>

        {unanswered > 0 && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-center font-medium text-amber-950">
            You didn&apos;t choose an answer for {unanswered} question
            {unanswered === 1 ? "" : "s"}. They&apos;re listed below as{" "}
            <em>skipped</em>.
          </p>
        )}

        <div className="mt-8 space-y-2 rounded-2xl border-4 border-white/80 bg-white/90 p-4">
          <h3 className="font-bold text-kid-ink">By difficulty</h3>
          {(["easy", "medium", "hard"] as const).map((d) => (
            <div key={d} className="flex justify-between text-kid-ink/90">
              <span className="capitalize">{d}</span>
              <span>
                {byDiff[d].correct}/{byDiff[d].total || 0} correct
                {byDiff[d].total === 0 && " (none answered)"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border-4 border-kid-purple/30 bg-white/95 p-4">
          <h3 className="font-display text-xl font-bold text-kid-purple">
            Your answers (every pick counts)
          </h3>
          <p className="mt-1 text-sm text-kid-ink/75">
            Here&apos;s what you chose during the quiz.
          </p>
          <ul className="mt-4 space-y-5">
            {state.questions.map((q, i) => {
              const a = state.answers[i];
              const picked =
                a?.selectedIndex !== null ? a.selectedIndex : null;
              const yourText =
                picked !== null ? q.choices[picked] : null;
              const correctText = q.choices[q.correctIndex];
              let status: string;
              let statusClass: string;
              if (picked === null) {
                status = "Skipped";
                statusClass = "text-kid-ink/60";
              } else if (picked === q.correctIndex) {
                status = "Correct";
                statusClass = "text-emerald-700 font-bold";
              } else {
                status = "Not quite";
                statusClass = "text-rose-700 font-bold";
              }

              return (
                <li
                  key={q.id}
                  className="rounded-xl border-2 border-kid-ink/10 bg-kid-lavender/20 p-3"
                >
                  <p className="font-semibold text-kid-ink">{q.question}</p>
                  <p className="mt-2 text-kid-ink/90">
                    <span className="text-kid-ink/60">Your answer: </span>
                    {yourText ?? (
                      <em className="text-kid-ink/55">No answer chosen</em>
                    )}
                  </p>
                  <p className="mt-1 text-kid-ink/90">
                    <span className="text-kid-ink/60">Correct answer: </span>
                    <strong>{correctText}</strong>
                  </p>
                  <p className={`mt-1 text-sm ${statusClass}`}>{status}</p>
                  <div className="mt-2 border-t border-kid-ink/10 pt-2">
                    <p className="text-sm font-medium text-kid-ink/85">Why:</p>
                    <KidMarkdown className="prose-sm text-kid-ink/85 prose-p:text-kid-ink/85 prose-p:my-1">
                      {q.explanation}
                    </KidMarkdown>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {incorrect.length > 0 && (
          <div className="mt-6 rounded-2xl border-4 border-kid-peach bg-kid-peach/20 p-4">
            <h3 className="font-display text-xl font-bold text-kid-ink">
              Keep practicing
            </h3>
            <p className="mt-1 text-kid-ink/85">
              Topics to review (you picked a wrong letter):
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-kid-ink">
              {incorrect.slice(0, 5).map((q) => (
                <li key={q.id}>{q.question}</li>
              ))}
            </ul>
            {incorrect.length > 5 && (
              <p className="mt-2 text-sm text-kid-ink/70">
                …and {incorrect.length - 5} more in the list above.
              </p>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={retryQuiz}
            className="min-h-[52px] rounded-2xl bg-gradient-to-r from-kid-mint to-kid-teal py-3 text-lg font-bold text-kid-ink shadow-lg"
          >
            Try quiz again
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={resetApp}
            className="min-h-[52px] rounded-2xl border-4 border-kid-purple bg-white py-3 text-lg font-bold text-kid-purple"
          >
            Study something new
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
