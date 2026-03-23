"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  /** Markdown string (e.g. **bold**, lists) */
  children: string;
  className?: string;
};

/**
 * Renders kid-safe markdown (no raw HTML). Use for LLM fields that may include **bold** etc.
 */
export function KidMarkdown({ children, className = "" }: Props) {
  return (
    <div
      className={`prose max-w-none text-kid-ink prose-p:my-2 prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-kid-purple prose-ul:my-2 prose-ol:my-2 dark:prose-invert ${className}`}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
