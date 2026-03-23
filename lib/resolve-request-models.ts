import type { LanguageModel } from "ai";
import {
  createLanguageModelFromCredentials,
  getLanguageModel,
  getVerifierLanguageModel,
  normalizeProvider,
} from "@/lib/llm";

/**
 * Headers the browser may send (BYOK). Never log these values.
 * - x-llm-provider: openai | anthropic | google
 * - x-llm-api-key: secret
 * - x-llm-model: optional
 * - x-verifier-api-key: optional (defaults to same as generator)
 * - x-verifier-provider: optional
 * - x-verifier-model: optional
 */
export function resolveModelsFromRequest(req: Request): {
  generator: LanguageModel;
  verifier: LanguageModel;
  source: "user_headers" | "server_env";
} {
  const requireUser = process.env.REQUIRE_USER_LLM_KEYS === "true";
  const allowUser = process.env.ALLOW_USER_LLM_KEYS === "true" || requireUser;

  const h = req.headers;
  const userKey = h.get("x-llm-api-key")?.trim();

  if (requireUser) {
    if (!userKey) {
      throw new Error(
        "This deployment uses your own API key. Add your key in the form on the home page, then try again."
      );
    }
    return { ...buildModelsFromHeaders(h, userKey), source: "user_headers" };
  }

  if (allowUser && userKey) {
    return { ...buildModelsFromHeaders(h, userKey), source: "user_headers" };
  }

  return {
    generator: getLanguageModel(),
    verifier: getVerifierLanguageModel(),
    source: "server_env",
  };
}

function buildModelsFromHeaders(
  h: Headers,
  generatorApiKey: string
): { generator: LanguageModel; verifier: LanguageModel } {
  const genProviderRaw = h.get("x-llm-provider") || "openai";
  const genProvider = normalizeProvider(genProviderRaw);
  const genModel = h.get("x-llm-model")?.trim() || null;

  const verifierKey =
    h.get("x-verifier-api-key")?.trim() || generatorApiKey;
  const verifierProviderRaw =
    h.get("x-verifier-provider")?.trim() || genProviderRaw;
  const verifierProvider = normalizeProvider(verifierProviderRaw);
  const verifierModel = h.get("x-verifier-model")?.trim() || null;

  return {
    generator: createLanguageModelFromCredentials(
      genProvider,
      generatorApiKey,
      "generator",
      genModel
    ),
    verifier: createLanguageModelFromCredentials(
      verifierProvider,
      verifierKey,
      "verifier",
      verifierModel
    ),
  };
}
