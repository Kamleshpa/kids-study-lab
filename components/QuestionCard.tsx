"use client";

import { motion } from "framer-motion";
import type { AnswerState, Difficulty, Question } from "@/lib/types";
import { KidMarkdown } from "./KidMarkdown";

const difficultyStyles: Record<
  Difficulty,
  { label: string; className: string }
> = {
  easy: {
    label: "Easy",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-600",
  },
  medium: {
    label: "Medium",
    className:
      "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/45 dark:text-amber-100 dark:border-amber-600",
  },
  hard: {
    label: "Hard",
    className:
      "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/45 dark:text-rose-100 dark:border-rose-600",
  },
};

type Props = {
  question: Question;
  answer: AnswerState;
  onSelect: (index: number) => void;
  onCheck: () => void;
};

export function QuestionCard({ question, answer, onSelect, onCheck }: Props) {
  const { checked, selectedIndex } = answer;
  const diff = difficultyStyles[question.difficulty];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${diff.className}`}
        >
          {diff.label}
        </span>
      </div>

      <h3 className="text-xl font-bold leading-snug text-kid-ink md:text-2xl">
        {question.question}
      </h3>

      <ul className="space-y-3">
        {question.choices.map((choice, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = i === question.correctIndex;
          let box =
            "border-4 border-kid-ink/10 bg-kid-surface/90 hover:border-kid-purple/40";
          if (checked) {
            if (isCorrect)
              box =
                "border-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-400";
            else if (isSelected && !isCorrect)
              box =
                "border-4 border-red-400 bg-red-50 dark:bg-red-950/40 dark:border-red-400";
            else
              box =
                "border-4 border-transparent bg-kid-surface/50 opacity-70 dark:bg-kid-surface/30";
          } else if (isSelected) {
            box =
              "border-4 border-kid-purple bg-kid-lavender/60 dark:bg-kid-purple/25";
          }

          return (
            <li key={i}>
              <button
                type="button"
                disabled={checked}
                onClick={() => onSelect(i)}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-lg font-medium transition ${box}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kid-ink/10 font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {choice}
              </button>
            </li>
          );
        })}
      </ul>

      {!checked && (
        <div className="space-y-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={selectedIndex === null}
            onClick={onCheck}
            className="min-h-[48px] w-full rounded-2xl border-4 border-kid-purple/40 bg-kid-surface py-3 text-lg font-bold text-kid-purple shadow-sm disabled:opacity-40"
          >
            Check answer{" "}
            <span className="font-normal text-kid-ink/70">(optional)</span>
          </motion.button>
          <p className="text-center text-sm text-kid-ink/65">
            You can use <strong>Next</strong> without checking—we&apos;ll show
            the right answers and your picks at the end.
          </p>
        </div>
      )}

      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-4 p-4 ${
            selectedIndex === question.correctIndex
              ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40"
              : "border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/35"
          }`}
        >
          <p className="text-lg font-bold">
            {selectedIndex === question.correctIndex
              ? "Nice work! That’s right!"
              : "Good try! Here’s the scoop:"}
          </p>
          <KidMarkdown className="mt-2 text-lg text-kid-ink/90 prose-p:text-kid-ink/90 prose-p:text-lg">
            {question.explanation}
          </KidMarkdown>
        </motion.div>
      )}
    </div>
  );
}
