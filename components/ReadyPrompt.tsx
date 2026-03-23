"use client";

import { motion } from "framer-motion";
import { useStudy } from "@/context/StudyContext";

export function ReadyPrompt() {
  const { backToStudy, startQuiz } = useStudy();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-8 px-6 py-10 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-8xl"
        aria-hidden
      >
        🌟
      </motion.div>
      <h2 className="font-display text-3xl font-bold text-kid-purple md:text-4xl">
        Are you ready to test what you learned?
      </h2>
      <p className="text-lg text-kid-ink/85">
        You can always go back and read the lesson again. Take your time!
      </p>
      <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={backToStudy}
          className="min-h-[52px] flex-1 rounded-2xl border-4 border-kid-purple bg-white py-3 text-lg font-bold text-kid-purple"
        >
          Let me review
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={startQuiz}
          className="min-h-[52px] flex-1 rounded-2xl bg-gradient-to-r from-kid-mint to-kid-teal py-3 text-lg font-bold text-kid-ink shadow-lg"
        >
          I&apos;m ready!
        </motion.button>
      </div>
    </motion.div>
  );
}
