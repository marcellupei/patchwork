# Budget

*Reconstructed 2026-07-27. The original 04 Budget.xlsx (Y1/Y2, Lean/Standard) was lost and its line items are not recoverable. This is a fresh model built from the real costs we now know, which makes it more concrete than the May estimate. It covers infrastructure and operating cost only, not founder time or marketing spend. Kept in the repo under version control; rebuild as a spreadsheet if you want to model scenarios interactively.*

## Founder constraints (unchanged, from POSITIONING.md)

- Personal funding cap: **5,000 EUR** for Year 1.
- Operating cost ceiling: **up to 500 EUR / month**.

## What actually costs money now

The stack is nearly free by design. Real cost drivers as of mid-2026:

| Item | Cost | Notes |
|------|------|-------|
| Hosting (Netlify) | 0 EUR | Free tier covers the static site + serverless function at MVP traffic |
| Domain (planned, e.g. patchwork.help) | ~25 EUR / year | Not yet purchased; the live instance runs on the free netlify.app subdomain |
| Search: Brave Search API | ~5 USD / month base | Includes ~1,000 queries; metered above that. Official instance uses this |
| Search: Serper | 0 EUR | Free starter credits (~2,500 queries), alternative to Brave |
| Search: SearXNG | 0 EUR (self-host) | Free and open; optional ~5 EUR/mo VPS if you host it yourself |
| Anthropic API | variable, per query | The main variable cost. See below |

The Anthropic API is the one cost that scales with usage. From this session's live testing, a full question (Haiku triage + Haiku/Sonnet answer over ~3 fetched pages) runs roughly **1 to 3 euro cents**, depending on how often the harder model is routed. Treat that as an estimate to confirm against the real usage dashboard once traffic is live.

## Operating cost by traffic (estimate)

| Questions / month | Anthropic (est.) | Search | Total / month | Within 500 EUR cap? |
|-------------------|------------------|--------|---------------|---------------------|
| 1,000 | ~20-30 EUR | ~5 EUR (Brave) | **~30 EUR** | Yes, easily |
| 5,000 | ~100-150 EUR | ~25 EUR | **~150 EUR** | Yes |
| 10,000 | ~200-300 EUR | ~50 EUR | **~300 EUR** | Yes |
| 15,000+ | ~350-450 EUR | ~75 EUR | **~450+ EUR** | Approaching the ceiling |

The operating ceiling holds until roughly 15,000 questions a month. That is a lot of real usage for a bootstrapped tool, so the cap is comfortable for a long time. When it approaches, the levers are: route the fast model more aggressively, cache nothing but tighten retrieval, or move a share of traffic to SearXNG to cut search cost.

## Year 1 infrastructure total (lean, founder does the work)

- Domain: ~25 EUR.
- Search + API + hosting: scales with traffic, well under the 500 EUR/month ceiling until high volume.

If Patchwork runs at ~1,000-2,000 questions/month for much of Year 1, total infrastructure spend lands in the low hundreds of euros, far inside the 5,000 EUR cap. The cap's real purpose is discipline, not because infrastructure threatens it.

## What this model deliberately excludes

The lost May model (Lean ~6,604 EUR, Standard ~15,865 EUR) was larger than pure infrastructure, so it almost certainly included founder time, and/or contracted design, content, or marketing spend. This reconstruction does not estimate those, because they are choices, not fixed costs. If you want the full business model (your time valued, any paid marketing, contracted work), that is a separate document to build deliberately, and I can do it with your inputs rather than guessing.

## Recommendation

Track actuals from month one: the Anthropic usage dashboard and the Brave dashboard give real numbers that beat any estimate here. Once you have two or three months of real data, this file becomes a real forecast instead of a model.

*Reconstructed from real 2026 costs and this session's testing, not from the original spreadsheet. Per-query and per-token figures are estimates to validate against live usage.*
