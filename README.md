# Kids Study Lab

A **kid-friendly web app** (grades K–5): choose a topic, read short AI-made study pages, then take a multiple-choice quiz with explanations and a score summary. Includes an optional **verifier** step to reduce bad facts and improve safety.

**Fork this repo** to run it on your machine or in the cloud—see [Choose how to run it](#choose-how-to-run-it) below.

---

## Choose how to run it

Pick **one** path. You only need technical steps for the option you choose.

| Option | Best if you… | You need |
|--------|----------------|----------|
| **[A. Your computer (simplest)](#a-run-on-your-computer-recommended)** | Want it on your laptop/desktop | [Node.js](https://nodejs.org/) (LTS) + a free API key |
| **[B. GitHub Codespaces](#b-run-in-the-browser-github-codespaces)** | Don’t want to install Node | GitHub account + browser |
| **[C. VS Code Dev Container](#c-vs-code--docker-dev-container)** | Already use Docker + VS Code | Docker Desktop |
| **[D. Windows quick note](#d-windows-users)** | Use Windows | Same as A, different copy command |

---

## A. Run on your computer (recommended)

### 1. Get the code

- **Fork** this repository on GitHub (button **Fork** on the repo page), **or**
- **Clone** your fork:
  ```bash
  git clone https://github.com/YOUR_USERNAME/ai_kids_study.git
  cd ai_kids_study
  ```
  Replace `YOUR_USERNAME` with your GitHub username.

> **No Git?** On GitHub, click **Code → Download ZIP**, unzip, and open that folder in Terminal / PowerShell.

### 2. Install Node.js

Install **LTS** from **[https://nodejs.org/](https://nodejs.org/)** (includes `npm`).  
Restart your terminal, then check:

```bash
node -v
npm -v
```

You should see version numbers (Node **18** or newer is fine).

### 3. Create your env file and add an API key

From the project folder:

```bash
npm run setup
```

This creates **`.env.local`** from `.env.example` (only if it doesn’t exist).

Open **`.env.local`** in any text editor and set:

```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-...your-key-here...
```

Save the file. See **[Get an API key](#get-an-api-key-plain-english)** below if you don’t have one yet.

### 4. Install packages and start the app

```bash
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

To stop the server, press `Ctrl+C` in the terminal.

---

## B. Run in the browser (GitHub Codespaces)

No Node install on your PC—everything runs in a cloud workspace.

1. **Fork** this repo on GitHub.
2. Open **your fork** → green **Code** button → **Codespaces** → **Create codespace on main**.
3. Wait for the environment to finish setting up (it runs `npm install` automatically).
4. In the Codespace terminal:
   ```bash
   npm run setup
   ```
5. Open **`.env.local`** in the editor (left file tree), paste your **`LLM_API_KEY=`**, save.
6. Run:
   ```bash
   npm run dev
   ```
7. When prompted, **open port 3000** (or use the **Ports** tab → open in browser).

Your API key stays in that cloud machine—**never commit** `.env.local` (it’s gitignored).

---

## C. VS Code + Docker (Dev Container)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [VS Code](https://code.visualstudio.com/) with the **Dev Containers** extension.
2. Clone your fork and open the folder in VS Code.
3. **Command Palette** → **Dev Containers: Reopen in Container**.
4. After the container builds: `npm run setup`, edit `.env.local`, then `npm run dev`.

---

## D. Windows users

If `cp` doesn’t work in **PowerShell**, create the env file manually:

```powershell
Copy-Item .env.example .env.local
```

Or run **`npm run setup`** (works on Windows with Node installed).

Then edit `.env.local` in Notepad or VS Code and continue with **`npm install`** and **`npm run dev`**.

---

## Get an API key (plain English)

The app talks to an AI provider. You need **one account** and **one secret key** (like a password the app uses).

| If you use… | Sign up / keys |
|-------------|----------------|
| **OpenAI** | [platform.openai.com](https://platform.openai.com/) → API keys → create key |
| **Anthropic (Claude)** | [console.anthropic.com](https://console.anthropic.com/) |
| **Google (Gemini)** | [Google AI Studio](https://aistudio.google.com/) |

Put the key in **`.env.local`** as `LLM_API_KEY=...` and set `LLM_PROVIDER` to `openai`, `anthropic`, or `google`.

**Cost:** Many providers have free or low-cost trial credit; generation uses tokens per lesson—see their pricing pages.

---

## Verifier LLM (optional second model)

After each lesson draft, a **verifier** model runs a second pass: it checks facts, that quiz **correct answers** match the choices, and basic **kid-safety** guardrails. If it isn’t happy, the app can **regenerate** the lesson (up to **2** extra attempts).

**You don’t have to configure anything extra** if you’re happy with the defaults: the verifier uses your **same** `LLM_API_KEY` (and usually the same provider) but a **stronger default model** than the author—for example, **GPT‑4o** as verifier while the author uses **GPT‑4o mini**.

### Example: same provider, explicit models (OpenAI)

```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-...your-key...
LLM_MODEL=gpt-4o-mini

VERIFIER_LLM_PROVIDER=openai
VERIFIER_LLM_API_KEY=sk-...your-key...
VERIFIER_LLM_MODEL=gpt-4o
```

(You can use one key for both lines; split keys are only needed if you use different accounts.)

### Example: generator on OpenAI, verifier on Anthropic

```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-...openai...

VERIFIER_LLM_PROVIDER=anthropic
VERIFIER_LLM_API_KEY=sk-ant-api03-...anthropic...
# Optional; defaults to a capable Claude model if omitted:
# VERIFIER_LLM_MODEL=claude-3-5-sonnet-20241022
```

More options: [`.env.example`](./.env.example).

---

## Environment variables (short)

| Variable | Required? | Meaning |
|----------|-----------|---------|
| `LLM_PROVIDER` | Yes | `openai`, `anthropic`, or `google` |
| `LLM_API_KEY` | Yes | Secret key from that provider |
| `LLM_MODEL` | No | Override author model ID |
| `VERIFIER_LLM_PROVIDER` | No | Verifier provider (defaults to same as `LLM_PROVIDER`) |
| `VERIFIER_LLM_API_KEY` | No | Verifier key (defaults to `LLM_API_KEY`) |
| `VERIFIER_LLM_MODEL` | No | Verifier model ID (defaults to a stronger model per provider) |

Details: [`.env.example`](./.env.example).

---

## Quiz behavior

- **Check answer** is optional; you can go **Next** without it.
- The **score** uses any answer you **selected**, even if you didn’t check.
- **Results** show your pick, the correct answer, and the **explanation** for every question.

---

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run setup` | Create `.env.local` from `.env.example` (if missing) |
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Run production server (after `build`) |
| `npm run lint` | Run ESLint |

---

## Troubleshooting

| Problem | Try this |
|---------|----------|
| **`Missing LLM_API_KEY`** | Edit `.env.local`; no quotes around the key unless the provider says so. Restart `npm run dev`. |
| **Port 3000 in use** | Stop other apps on 3000, or run `npx next dev -p 3001` and open http://localhost:3001 |
| **`npm install` warnings** | Often safe for local dev. See [npm notices](#npm-install-notices-safe-to-ignore-for-local-dev) below. |
| **Blank page / errors** | Use Node **18+** or **20 LTS** / **22 LTS**. Run `npm install` again. |

---

## npm install notices (safe to ignore for local dev)

- **`EBADENGINE` (Node 23)** — Some packages don’t list Node 23 in `engines`; the app usually still runs. Prefer **Node 22 LTS** from [nodejs.org](https://nodejs.org/) if you want zero warnings.
- **`npm audit` high severity** — Often tied to **Next.js 14** until a major upgrade. Avoid `npm audit fix --force` unless you plan to upgrade Next on purpose.
- **npm 11 notice** — Optional global npm upgrade only.

---

## Project layout

- [`PLAN.md`](./PLAN.md) — Architecture and design notes  
- [`idea.md`](./idea.md) — Original product idea  

---

## License

[MIT](./LICENSE) — fork, change, and share; keep the license notice.

---

## Publish your own copy to GitHub

If this folder isn’t a Git repo yet:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Create a **new empty repository** on GitHub (no README), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME`.  
Prefer a GUI? Use **[GitHub Desktop](https://desktop.github.com/)** — *File → Add Local Repository* → *Publish repository*.

---

## Sharing improvements

Pull requests and issues are welcome on the original repo you forked from. If this is **your** fork, enable **Issues** in the repo **Settings** if you want others to report problems.
