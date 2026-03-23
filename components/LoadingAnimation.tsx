"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { byokHeaders, readStoredUserLlm } from "@/lib/client-user-key";
import { BYOK_REQUIRED } from "@/lib/public-config";
import type { SetupInput } from "@/lib/types";
import { useStudy } from "@/context/StudyContext";

const MESSAGES = [
  "Getting your lesson ready…",
  "Double-checking facts with a teacher brain…",
  "Sprinkling fun facts…",
  "Making sure everything is kid-safe…",
  "Almost there!",
  "Drawing colorful examples…",
];

type Props = {
  setup: SetupInput;
};

export function LoadingAnimation({ setup }: Props) {
  const { loadSuccess, loadError } = useStudy();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = readStoredUserLlm();
        if (BYOK_REQUIRED && !stored) {
          loadError(
            "Add your API key on the home page (session expired or missing)."
          );
          return;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(stored ? byokHeaders(stored) : {}),
        };

        const res = await fetch("/api/generate", {
          method: "POST",
          headers,
          body: JSON.stringify(setup),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          loadError(typeof data.error === "string" ? data.error : "Oops! Try again.");
          return;
        }
        loadSuccess({
          studyPages: data.studyPages,
          questions: data.questions,
          verification: data.verification ?? null,
        });
      } catch {
        if (!cancelled) loadError("Could not reach the server. Check your connection.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setup, loadSuccess, loadError]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4">
      <div className="relative h-32 w-32">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-lg"
            style={{
              background: ["#c4b5fd", "#6ee7b7", "#fda4af"][i],
            }}
            animate={{
              rotate: [0, 12, -12, 0],
              x: [0, 10 * (i - 1), 0],
              y: [0, -8, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm text-center text-xl font-semibold text-kid-ink"
      >
        {MESSAGES[msgIndex]}
      </motion.p>
    </div>
  );
}
