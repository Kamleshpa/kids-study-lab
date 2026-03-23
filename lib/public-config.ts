/**
 * Inlined at build time. Must match server env:
 * - REQUIRE_USER_LLM_KEYS → NEXT_PUBLIC_REQUIRE_USER_LLM_KEYS
 * - ALLOW_USER_LLM_KEYS → NEXT_PUBLIC_ALLOW_USER_LLM_KEYS
 */
export const BYOK_REQUIRED =
  process.env.NEXT_PUBLIC_REQUIRE_USER_LLM_KEYS === "true";

export const BYOK_OPTIONAL =
  process.env.NEXT_PUBLIC_ALLOW_USER_LLM_KEYS === "true";

export function showByokFields(): boolean {
  return BYOK_REQUIRED || BYOK_OPTIONAL;
}
