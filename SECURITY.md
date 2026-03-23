# Security & trust model (API keys)

## Can users use a short-lived token or OAuth instead of an API key?

**Most LLM APIs (OpenAI, Anthropic, Google Gemini) are designed around secret API keys**, not end-user OAuth for arbitrary third-party websites. There is generally **no supported flow** where:

- a visitor clicks “Sign in with OpenAI,” and  
- your app gets a **scoped, short-lived token** to call the API **without ever handling a secret**,

in the same way as “Sign in with Google” for basic profile access.

**Google Cloud / Vertex** and some enterprise setups can use workload identity or user OAuth for **your** org, but that still routes through **your** cloud project—not a pattern where random visitors each bring OAuth without you hosting a full auth backend.

So for a **public Vercel demo** where **each visitor pays their own usage**, the practical pattern is **Bring Your Own Key (BYOK)**.

---

## How this app handles BYOK

1. **Browser (session storage)**  
   The user can enter a provider + API key on the home page. The key is stored in **`sessionStorage`** for that tab only (cleared when the tab closes, unless the browser restores a session). It is **not** written to your Vercel database (this app has none).

2. **Each `/api/generate` request**  
   The browser sends the key in HTTP headers (`x-llm-api-key`, etc.). The **Vercel serverless function** reads those headers, calls the provider, and **does not persist the key** to disk or env between requests.

3. **What users must trust**  
   - **Your deployed code** (open source—review the repo, especially `app/api/generate` and `lib/resolve-request-models.ts`).  
   - **Vercel** as the host: the key exists in **server memory for the duration of that request** (and could appear in provider logs on their side).  
   - **The AI provider** with whatever logging they do.

4. **What we avoid**  
   - Keys are **not** logged in API error handlers (we only log error *messages*, not headers).  
   - Keys are **not** in client-side env vars like `NEXT_PUBLIC_*`.

---

## Deploying on Vercel for strangers to “play”

Recommended settings:

| Variable (Vercel) | Value | Purpose |
|-------------------|-------|---------|
| `REQUIRE_USER_LLM_KEYS` | `true` | Server **refuses** to use a shared `LLM_API_KEY`; every request must include user headers. |
| `NEXT_PUBLIC_REQUIRE_USER_LLM_KEYS` | `true` | UI shows the key form (must match server). |
| `LLM_API_KEY` | *(leave empty)* | So you never accidentally pay for everyone. |

Optional hybrid (e.g. workshop with a shared key + optional override):

| Variable | Value |
|----------|--------|
| `ALLOW_USER_LLM_KEYS` | `true` |
| `NEXT_PUBLIC_ALLOW_USER_LLM_KEYS` | `true` |
| `LLM_API_KEY` | your shared key |

If the client sends `x-llm-api-key`, that request uses the user’s key; otherwise it uses the server key.

---

## Reducing abuse

Public endpoints that forward to paid APIs should use **rate limiting** (e.g. Vercel Firewall, Upstash Redis, Cloudflare) and **monitoring**. This repo does not include rate limits by default.

---

## Reporting issues

If you find a place where keys could be logged or stored unintentionally, please open an issue or PR on the repository.
