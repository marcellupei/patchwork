# 🧩 Patchwork

**The patient friend who knows computers, and admits when they don't.**

Patchwork is a free, open-source, multilingual tech assistant for non-technical people. You describe a problem in your own words; Patchwork searches authoritative public sources (vendor documentation, official wikis, Stack Exchange) live, and explains the fix at the level of detail *you* choose.

No account. No tracking. No stored questions. Free, forever.

## Principles (short version)

1. **Cite or don't state.** Every factual claim is backed by a visible, real source. No invented links, ever.
2. **Reversibility before elegance.** The recommended fix is the one you can undo.
3. **You control the level.** A complexity dial: simply / normally / technically.
4. **Stop-here triggers.** For bricked devices, banking/scam situations, panic, or personal crisis, Patchwork stops troubleshooting and points to the right human help.
5. **Privacy is the architecture.** No persistent identity, no logs of question content, no answer database. Everything is retrieved live and discarded.
6. **Any language.** Ask in your language, get the answer in your language.

## How it works

```
question ──► triage (fast model: safety + routing + search plan)
        ──► live web search (Brave Search API)
        ──► fetch top sources, extract text
        ──► answer (routed model, streamed, citations required)
```

The stack is deliberately boring: a static HTML/CSS/JS page and one serverless function. No build step, no framework, no database.

## Run your own

1. Fork/clone this repo and connect it to [Netlify](https://www.netlify.com) (free tier is fine), or run locally with `npx netlify dev`.
2. Set two environment variables:
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
   - one search key: `SERPER_API_KEY` ([serper.dev](https://serper.dev), free tier ~2,500 queries/month) or `BRAVE_SEARCH_API_KEY` ([brave.com/search/api](https://brave.com/search/api/), paid, Brave's own index). If both are set, Brave is used.
3. Optional: `PW_MODEL_FAST` and `PW_MODEL_MAIN` to override the default models.

That's the whole deployment.

## Contributing

Contributions are welcome, from typo fixes to translations to new retrieval sources. See [CONTRIBUTING.md](CONTRIBUTING.md). We use DCO sign-off (`git commit -s`), no CLA.

## License

- Platform code: [AGPL-3.0](LICENSE). If you run a modified Patchwork as a service, you share your changes. That's the point: the openness is the moat.

---

### 🇷🇴 Pe scurt, în română

Patchwork este un asistent tehnic gratuit și open-source pentru oameni care nu se pricep la calculatoare. Descrii problema cu vorbele tale; Patchwork caută în surse publice de încredere (documentație oficială, wiki-uri, Stack Exchange), în timp real, și îți explică soluția la nivelul de detaliu pe care îl alegi tu.

Fără cont. Fără tracking. Întrebările nu sunt stocate. Gratuit, pentru totdeauna. Fiecare afirmație are o sursă citată, iar dacă nu există sursă, Patchwork spune sincer că nu știe.
