# Architecture

*Canonical, reconstructed 2026-07-27 from the deployed system (the original 05 Architecture was lost). This describes what actually runs, not a plan. Kept in the repo under version control.*

## Shape

Patchwork is deliberately boring: a static front end and one serverless function. No framework, no build step, no database, no persistent state. That is a design choice, not a limitation, it serves the locked decisions (privacy is the architecture, no proprietary answer database, web only for v1).

```
Browser (public/)                     Serverless (netlify/functions/ask.mjs)
  index.html + style.css + app.js  ──►  POST /api/ask
    - complexity dial (level)             1. triage      (fast model)
    - EN/RO, example chips                2. search      (provider chain)
    - streamed answer + citations         3. read pages  (fetch top N, strip)
                                          4. answer      (routed model, streamed)
```

## The request pipeline

Every question is one POST to `/api/ask` carrying `{ question, level }`. The function runs four steps and streams the result back.

**1. Triage (one fast-model call).** The question goes to the fast model (default `claude-haiku-4-5`) which does not answer. It returns only JSON: a stop-here classification, a model route (`fast` or `main`), one or two web search queries, and the detected language. This is where the safety gate and the routing live, before any money is spent on retrieval or a strong model.

**2. Stop-here.** If triage flags `bricked`, `banking`, `panic`, or `self_harm`, the pipeline ends immediately and returns a fixed, human-written message in the user's language (English or Romanian today). No search, no generated answer. These messages are hand-authored and reviewed, never machine-generated.

**3. Live retrieval.** The search queries run through the provider chain (see below). Results are de-duplicated by URL and capped (6 sources). The top 3 pages are fetched directly, HTML stripped to text, capped at 8000 characters each, so the model reasons over real page content, not just search snippets. Nothing is cached or stored; every question hits the live web fresh.

**4. Answer (streamed).** The numbered sources plus the user's level and question go to the routed model (`fast` for simple lookups, `main`/`claude-sonnet-4-5` for hard ones) under the answer system prompt. The response streams to the browser token by token.

## Streaming wire protocol

The function returns `text/plain`, streamed, in three parts so the UI can show real progress and cite sources as they arrive:

1. Zero or more progress lines: `#searching`, `#reading`, `#writing`. The front end maps these to a status label.
2. One JSON header line: either `{ "sources": [...], "model": "fast|main" }` or `{ "error": "..." }`. (If the upstream model stream breaks after the header was sent, an error object may additionally appear in the body.)
3. The answer text, streamed to the end.

The front end parses the leading `#` lines, then the one JSON header, then renders the rest as the answer (escaping HTML, then re-adding inline code, bold, and citation links).

## Search provider chain

Providers are pluggable and form a fallback chain, configured by environment variables:

- `BRAVE_SEARCH_API_KEY` (Brave's own index, paid, most reliable, used by the official instance)
- `SERPER_API_KEY` (free tier)
- `SEARXNG_URL` (self-hosted SearXNG, free and open source; JSON output must be enabled)

Set several and they are tried in order until one returns results. Default order `brave > serper > searxng`, overridable with `PW_SEARCH_ORDER`. A provider that errors, times out (SearXNG calls abort after 6s), or returns nothing is skipped silently. This is what lets an unreliable provider be present without ever taking the tool down, and what lets a self-hoster run fully free with a commercial safety net.

## Model routing

Two tiers, both overridable by env (`PW_MODEL_FAST`, `PW_MODEL_MAIN`):

- Fast (`claude-haiku-4-5`): triage always, and answers to simple lookups.
- Main (`claude-sonnet-4-5`): answers to multi-step or high-stakes problems.

The live system uses two tiers; a third, stronger tier can be added through the same env override when a class of problems earns it.

## What is deliberately absent

- No accounts, no sessions, no cookies, no user identity.
- No database. No logging of question or answer content.
- No answer cache and no proprietary answer store: facts are always retrieved live and cited.
- No client-side storage (no localStorage).

## Privacy properties that fall out of this

Patchwork itself has nowhere to keep anything: a question exists only for the seconds it takes to answer it, in function memory, then it is gone. Privacy is not a policy layered on top; it is a consequence of the architecture.

The honest boundary: to answer, the question is transiently processed by third parties, the Anthropic API, the configured search provider, and the fetched source sites, each under its own policy, and the host platform (Netlify) keeps standard request logs. What the architecture guarantees is that Patchwork adds no storage, no identity, and no tracking of its own on top of that unavoidable minimum.

## Files

- `public/index.html`, `public/style.css`, `public/app.js` — the entire front end.
- `netlify/functions/ask.mjs` — the entire back end.
- `netlify.toml` — routing and security headers.
- `test/local-test.mjs` — smoke tests for the pipeline, protocol, stop-here, and provider fallback.

See [SYSTEM_PROMPT.md](SYSTEM_PROMPT.md) for the prompts, [POSITIONING.md](POSITIONING.md) for the principles these choices serve.
