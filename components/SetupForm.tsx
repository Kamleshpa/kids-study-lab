"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Grade, SetupInput } from "@/lib/types";

const GRADES: Grade[] = ["K", "1", "2", "3", "4", "5"];

const SUBJECTS = [
  { id: "Math", emoji: "🔢", label: "Math" },
  { id: "Science", emoji: "🔬", label: "Science" },
  { id: "Reading", emoji: "📚", label: "Reading" },
  { id: "Social Studies", emoji: "🌍", label: "Social Studies" },
  { id: "Art", emoji: "🎨", label: "Art" },
  { id: "Health", emoji: "❤️", label: "Health" },
] as const;

type Props = {
  onSubmit: (input: SetupInput) => void;
  errorMessage: string | null;
  /** Repopulate after a failed generation */
  defaultSetup?: SetupInput | null;
};

export function SetupForm({ onSubmit, errorMessage, defaultSetup }: Props) {
  const [grade, setGrade] = useState<Grade>("2");
  const [subject, setSubject] = useState<string>("Math");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    if (!defaultSetup) return;
    setGrade(defaultSetup.grade);
    setSubject(defaultSetup.subject);
    setTopic(defaultSetup.topic);
    setQuestionCount(defaultSetup.questionCount);
  }, [defaultSetup]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit({
      grade,
      subject,
      topic: topic.trim(),
      questionCount,
    });
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-6"
    >
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-kid-purple md:text-4xl">
          Let&apos;s learn something fun!
        </h1>
        <p className="mt-2 text-lg text-kid-ink/80">
          Pick your grade and topic. We&apos;ll make a lesson just for you.
        </p>
      </div>

      {errorMessage && (
        <div
          className="rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 text-center text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="mb-2 text-lg font-semibold text-kid-ink">
          Your grade
        </legend>
        <div className="flex flex-wrap justify-center gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={`min-h-[48px] min-w-[48px] rounded-2xl border-4 px-4 py-2 text-lg font-bold transition ${
                grade === g
                  ? "border-kid-purple bg-kid-lavender text-kid-purple scale-105"
                  : "border-transparent bg-white/80 text-kid-ink shadow-md"
              }`}
            >
              {g === "K" ? "K" : g}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-lg font-semibold text-kid-ink">
          Subject
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubject(s.id)}
              className={`flex min-h-[52px] flex-col items-center justify-center rounded-2xl border-4 px-2 py-3 text-sm font-semibold transition sm:text-base ${
                subject === s.id
                  ? "border-kid-mint bg-kid-mint/40 text-kid-ink scale-[1.02]"
                  : "border-transparent bg-white/90 text-kid-ink shadow-md"
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {s.emoji}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="topic"
          className="mb-2 block text-lg font-semibold text-kid-ink"
        >
          What do you want to study?
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. How plants grow, adding numbers to 20, the solar system..."
          className="w-full rounded-2xl border-4 border-kid-peach bg-white px-4 py-3 text-lg text-kid-ink placeholder:text-kid-ink/40 focus:border-kid-purple focus:outline-none"
          required
        />
      </div>

      <div>
        <label
          htmlFor="qcount"
          className="mb-2 flex justify-between text-lg font-semibold text-kid-ink"
        >
          <span>Quiz questions</span>
          <span className="text-kid-purple">{questionCount}</span>
        </label>
        <input
          id="qcount"
          type="range"
          min={5}
          max={20}
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="h-4 w-full cursor-pointer accent-kid-purple"
        />
        <p className="mt-1 text-sm text-kid-ink/70">Between 5 and 20</p>
      </div>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        className="min-h-[56px] rounded-full bg-gradient-to-r from-kid-purple to-kid-pink px-8 text-xl font-bold text-white shadow-lg"
      >
        Start learning!
      </motion.button>
    </motion.form>
  );
}
