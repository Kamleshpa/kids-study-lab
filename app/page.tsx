"use client";

import { AnimatePresence, motion } from "framer-motion";
import { clearStoredUserLlm } from "@/lib/client-user-key";
import { showByokFields } from "@/lib/public-config";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Quiz } from "@/components/Quiz";
import { ReadyPrompt } from "@/components/ReadyPrompt";
import { ResultsScreen } from "@/components/ResultsScreen";
import { SetupForm } from "@/components/SetupForm";
import { StudyViewer } from "@/components/StudyViewer";
import { useStudy } from "@/context/StudyContext";

export default function Home() {
  const { state, submitSetup, resetApp } = useStudy();

  return (
    <main className="min-h-dvh pb-12">
      <header className="sticky top-0 z-10 border-b border-kid-ink/10 bg-kid-surface/40 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <span className="font-display text-xl font-bold text-kid-purple">
            Kids Study Lab
          </span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {state.phase !== "setup" && (
              <button
                type="button"
                onClick={() => resetApp()}
                className="rounded-xl border-2 border-kid-ink/25 bg-kid-surface/90 px-3 py-2 text-xs font-semibold text-kid-ink"
              >
                New topic
              </button>
            )}
            {showByokFields() && (
              <button
                type="button"
                onClick={() => {
                  clearStoredUserLlm();
                  window.location.reload();
                }}
                className="rounded-xl border-2 border-kid-purple/40 bg-kid-surface/80 px-3 py-2 text-xs font-semibold text-kid-purple"
              >
                Clear API key
              </button>
            )}
            <span className="text-2xl" aria-hidden>
              🚀
            </span>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {state.phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SetupForm
              onSubmit={submitSetup}
              errorMessage={state.loadingError}
              defaultSetup={state.loadingError ? state.setup : null}
            />
          </motion.div>
        )}

        {state.phase === "loading" && state.setup && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingAnimation setup={state.setup} />
          </motion.div>
        )}

        {state.phase === "study" && (
          <motion.div
            key="study"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StudyViewer />
          </motion.div>
        )}

        {state.phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ReadyPrompt />
          </motion.div>
        )}

        {state.phase === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Quiz />
          </motion.div>
        )}

        {state.phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultsScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
