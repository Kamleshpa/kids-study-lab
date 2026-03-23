"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useStudy } from "@/context/StudyContext";
import { ProgressBar } from "./ProgressBar";

const swipeThreshold = 50;

export function StudyViewer() {
  const { state, setStudyPage, goReady } = useStudy();
  const { studyPages, studyPageIndex, verification } = state;
  const page = studyPages[studyPageIndex];
  const isLast = studyPageIndex === studyPages.length - 1;

  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    if (studyPageIndex < studyPages.length - 1) {
      setStudyPage(studyPageIndex + 1);
    }
  }, [studyPageIndex, studyPages.length, setStudyPage]);

  const goPrev = useCallback(() => {
    if (studyPageIndex > 0) {
      setStudyPage(studyPageIndex - 1);
    }
  }, [studyPageIndex, setStudyPage]);

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

  if (!page) return null;

  return (
    <div
      className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col px-4 py-4"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {verification && !verification.approved && verification.note && (
        <div
          className="mb-4 rounded-2xl border-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <strong>Heads up:</strong> We couldn&apos;t fully verify this lesson
          after several tries. It&apos;s still okay to read, but an adult might
          want to skim it too. ({verification.attempts} generation
          {verification.attempts === 1 ? "" : "s"})
        </div>
      )}
      {verification?.approved && (
        <p className="mb-4 text-center text-sm font-medium text-emerald-800">
          Lesson double-checked for accuracy and kid-safety
        </p>
      )}

      <ProgressBar
        value={studyPageIndex + 1}
        max={studyPages.length}
        label={`Page ${studyPageIndex + 1} of ${studyPages.length}`}
      />

      <div className="mt-4 flex justify-center gap-2">
        {studyPages.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to page ${i + 1}`}
            onClick={() => setStudyPage(i)}
            className={`h-3 w-3 rounded-full transition ${
              i === studyPageIndex ? "bg-kid-purple scale-125" : "bg-kid-ink/25"
            }`}
          />
        ))}
      </div>

      <div className="relative mt-6 min-h-[320px] flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={studyPageIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border-4 border-white/80 bg-white/90 p-6 shadow-xl md:p-8"
          >
            <h2 className="font-display text-2xl font-bold text-kid-purple md:text-3xl">
              {page.title}
            </h2>
            <div className="prose prose-lg mt-4 max-w-none text-kid-ink prose-p:leading-relaxed prose-strong:text-kid-purple">
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={studyPageIndex === 0}
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-white/90 px-6 py-3 font-bold text-kid-ink shadow-md disabled:opacity-40"
        >
          Back
        </button>
        {isLast ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={goReady}
            className="min-h-[52px] rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink px-6 py-3 font-bold text-white shadow-lg"
          >
            Ready for the test?
          </motion.button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="min-h-[48px] rounded-2xl bg-kid-mint px-6 py-3 font-bold text-kid-ink shadow-md"
          >
            Next
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-sm text-kid-ink/60">
        Tip: swipe left or right to turn pages
      </p>
    </div>
  );
}
