# 🧩 Patchwork

**The patient friend who knows computers, and admits when they don't.**

Patchwork is a free, open-source, multilingual tech assistant for non-technical people. You describe a problem in your own words; Patchwork searches authoritative public sources (vendor documentation, official wikis, Stack Exchange) live, and explains the fix at the level of detail *you* choose.

No account. No tracking. No stored questions. Free, forever.

**Project docs:** [Mission](MISSION.md) · [Positioning & Principles](POSITIONING.md) · [Architecture](ARCHITECTURE.md) · [System Prompts](SYSTEM_PROMPT.md) · [Feature Tracker](FEATURE_TRACKER.md) · [Roadmap](ROADMAP.md) · [Presence & Discoverability](PRESENCE.md) · [Budget](BUDGET.md)

## Principles (short version)

1. **Cite or don't state.** Every factual claim is backed by a visible, real source. No invented links, ever.
2. **Reversibility before elegance.** The recommended fix is the one you can undo.
3. **You control the level.** A complexity dial: simply / normally / technically.
4. **Stop-here triggers.** For bricked devices, banking/scam situations, panic, or personal crisis, Patchwork stops troubleshooting and points to the right human help.
5. **Privacy is the architecture.** No persistent identity, no logs of question content, no answer database. Everything is retrieved live and discarded.
6. **Your language.** Answers follow the language you ask in. The interface and the hand-written safety messages are English and Romanian today; more human-reviewed languages are on the [roadmap](ROADMAP.md).

## How it works

```
question ──► triage (fast model: safety + routing + search plan)
        ──► live web search (provider chain: Brave / Serper / SearXNG)
        ──► fetch top sources, extract text
        ──► answer (routed model, streamed, citations required)
```

The stack is deliberately boring: a static HTML/CSS/JS page and one serverless function. No build step, no framework, no database.

## Run your own

1. Fork/clone this repo and connect it to [Netlify](https://www.netlify.com) (free tier is fine), or run locally with `npx netlify dev`.
2. Set `ANTHROPIC_API_KEY` (from [console.anthropic.com](https://console.anthropic.com)) and at least one search provider:
   - `BRAVE_SEARCH_API_KEY` — [brave.com/search/api](https://brave.com/search/api/), paid, Brave's own index. Most reliable; used by the official instance.
   - `SERPER_API_KEY` — [serper.dev](https://serper.dev), free starter credits (~2,500 queries).
   - `SEARXNG_URL` — base URL of your own [SearXNG](https://docs.searxng.org) instance (free, open source, self-hosted). The instance must have JSON output enabled (`search.formats` includes `json` in `settings.yml`).

   **Set several and they form a fallback chain.** If a provider is down or returns nothing, the next one covers it, so an unreliable provider (a self-hosted SearXNG that gets rate-limited, say) can never take the tool down. Default priority is `brave > serper > searxng`; override with `PW_SEARCH_ORDER` (e.g. `searxng,brave` to run fully free with a commercial safety net).
3. Optional: `PW_MODEL_FAST` and `PW_MODEL_MAIN` to override the default models.

### Run it fully free and open

Set `SEARXNG_URL` to your own instance and Patchwork needs no paid search key at all. For reliability, pair it with a commercial key and `PW_SEARCH_ORDER=searxng,brave`: SearXNG serves every query it can, and the moment it can't, Patchwork falls back without the user noticing. If your instance doesn't use Brave, also edit the "Web search powered by Brave Search" attribution in `public/index.html` to match your provider.

That's the whole deployment.

## Contributing

Contributions are welcome, from typo fixes to translations to new retrieval sources. See [CONTRIBUTING.md](CONTRIBUTING.md). We use DCO sign-off (`git commit -s`), no CLA.

## License

- Platform code: [AGPL-3.0](LICENSE). If you run a modified Patchwork as a service, you share your changes. That's the point: the openness is the moat.

---

### 🇷🇴 Pe scurt, în română

Patchwork este un asistent tehnic gratuit și open-source pentru oameni care nu se pricep la calculatoare. Descrii problema cu vorbele tale; Patchwork caută în surse publice de încredere (documentație oficială, wiki-uri, Stack Exchange), în timp real, și îți explică soluția la nivelul de detaliu pe care îl alegi tu.

Fără cont. Fără tracking. Întrebările nu sunt stocate. Gratuit, pentru totdeauna. Fiecare afirmație are o sursă citată, iar dacă nu există sursă, Patchwork spune sincer că nu știe.
