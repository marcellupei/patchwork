# Roadmap

This is a direction, not a promise of dates. Patchwork grows slowly and on purpose: the moat is trust, and trust is not rushed. Everything here is subject to the locked decisions in [POSITIONING.md](POSITIONING.md).

## Now — v1, live

The web tool is public and working: describe a problem, get an answer built from live web sources with every claim cited, at the level of detail you choose.

- [x] Web app, no build step, no account, no tracking
- [x] Live retrieval + mandatory citations (cite or don't state)
- [x] Complexity dial: simply / normally / technically
- [x] Stop-here safety triggers (bricked, banking, panic, crisis)
- [x] Smart model routing (fast model for simple lookups, stronger for hard ones)
- [x] Bilingual interface (English + Romanian), answers in the user's language
- [x] Open source, AGPL-3.0, contributor sign-off (DCO), no CLA

## Next — hardening v1

The near-term work is about trust and reach, not new surfaces.

- [ ] **Authoritative source list.** Bias retrieval toward official docs and trusted community wikis (ArchWiki, vendor documentation, Stack Exchange), with a public, community-editable list and a free fallback for topics it doesn't cover.
- [ ] **One-command quickstart + short demo** so anyone can run their own copy or evaluate it in a minute.
- [ ] **More human-reviewed languages** for the interface and, most importantly, for the stop-here safety messages (these are never machine-translated blindly).
- [x] **Accessibility pass** (shipped: AA contrast, keyboard focus, ARIA, large touch targets) — kept current with every UI change. The people Patchwork serves need this most.
- [ ] **Answer quality feedback loop** that does not compromise privacy (no storing question content).

## Later — v2, the operator agent

A carefully scoped step from "tells you the fix" toward "can help you carry it out," without ever becoming a black box or a lock-in.

- [ ] **Patchwork as a connector for the LLM client you already use** (hosted via your own AI client, Claude Desktop first). You stay in control; Patchwork brings the cited, safe, source-backed method.
- [ ] A self-contained helper is deferred to community contribution rather than built first.
- [ ] **No lock-in, in either direction:** the connector is host-portable, there is a one-command uninstaller, the web tool always remains available on its own, and the host stays fully usable without Patchwork.

## Always — the principles that don't change

These are not roadmap items. They are the floor.

- No factual claim without a visible source. No invented links, ever.
- Reversibility before elegance.
- Privacy is the architecture: no persistent identity, no stored questions, no answer database.
- Open source is the moat. Anti-gouge. Slow, honest growth.
- The user controls their own level, and can always walk away with nothing lost.

---

## Cum contribui

Contribuțiile sunt binevenite, de la corecturi la traduceri la surse noi de retrieval. Traducerile și sursele autoritare sunt primele lucruri la care poți ajuta. Vezi [CONTRIBUTING.md](CONTRIBUTING.md). Folosim semnătură DCO (`git commit -s`), fără CLA.

*Notă: acest roadmap reflectă deciziile blocate ale proiectului. Termenii și ordinea se pot schimba; principiile de la final, nu.*
