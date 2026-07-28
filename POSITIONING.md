# Patchwork — Positioning & Principles

*Canonical source, reconstructed 2026-07-27 from project memory and the working product, after the original concept documents (02 Positioning Brief, 03 White Paper) were lost from Google Drive. This is now kept in the repository under version control. Review and correct anything that does not match your intent.*

## One line

A free web tool where a non-technical person describes a computer problem in their own words and gets help that is built from authoritative public sources (official docs, trusted community wikis, Stack Exchange), retrieved live and cited, and explained at the level of detail they choose.

**Tagline:** the patient friend who knows computers, and admits when they don't.

## What it is

Patchwork is a free, open-source, multilingual AI tech assistant, built as a bootstrapped personal side project. It meets people at the point of failure, a device that won't boot, sound gone after an update, a message they don't understand and are afraid to click, often on a borrowed machine or a live USB with nothing but a browser. It was born from a specific failure of general AI: an assistant fabricating a source with total confidence. Patchwork's whole design is the answer to that.

## Who it is for

Non-technical people in a tech emergency. Answers follow the user's language; the interface and hand-written safety messages are English and Romanian today, with more human-reviewed languages planned. Not developers, not power users. People who need a calm, trustworthy, verifiable answer and a way out that they can undo if it goes wrong.

## Locked decisions

These are settled. They do not change without an explicit, deliberate decision by the founder, and any change is recorded.

1. **Web only for v1.** No mobile, desktop, extension, or CLI in the first version.
2. **No persistent user identity** for the consumer tool. No accounts.
3. **No proprietary answer database.** Factual content is always retrieved live and cited, never stored and re-served.
4. **Cite or do not state.** No factual claim without a visible source. No invented links, commands, or paths.
5. **Reversibility before elegance.** Prefer the fix the user can undo; warn before anything risky and say how to back out.
6. **The user controls their own level** through the complexity dial.
7. **Stop-here triggers.** For a bricked device, a banking or scam situation, panic, or a personal crisis, Patchwork stops giving instructions and points to the right human help.
8. **Privacy is the architecture.** No persistent identity, no stored questions, no answer database. Privacy is structural, not a policy bolted on.
9. **Smart model routing.** A fast model for simple lookups, stronger models for hard or costly problems.
10. **Licensing:** AGPL-3.0 for the platform (in force today); Apache-2.0 or CC-BY-4.0 for the diagnostic standard and CC-BY-SA-4.0 for documentation (decided in principle; the diagnostic standard does not exist yet, and the doc-license notices are to be added when it does).
11. **DCO contributor sign-off, no corporate CLA.**
12. **Open source is the moat.** Anti-gouge. Slow, deliberate growth.
13. **v2 operator agent (PW-070b, locked):** Patchwork as a connector hosted via the user's own LLM client (Claude Desktop first). A self-contained Patchwork-built helper (PW-070a) is deferred to community contribution rather than built first.
14. **No lock-in, in either direction (PW-122):** the connector is host-portable, there is a one-command uninstaller, the web tool always remains available on its own, and the host client stays fully usable without Patchwork.

## Working principles

- Concise, practical output. No defensive disclaimers in what users read.
- Honest about uncertainty. "I don't know" is a valid, good answer when it's true.
- Never ask a user to share passwords, banking details, or 2FA codes.
- Truthful disclosure of uncertainty is a hard requirement, born from the founding incident. It must never collapse into refusing to help.

## Founder budget

Bootstrapped. Cap of 5,000 EUR of personal funding for Year 1, plus operating costs of up to 500 EUR per month. Modeled Year 1 Lean spend was about 6,604 EUR and Year 1 Standard about 15,865 EUR (the Standard scenario runs over the personal-funding cap and is flagged as such). The point of the cap is discipline: this is a trust-first, slow-growth project, not a fundraise.

## Current status (2026-07-27)

Concept phase is over. The v1 web tool is live and working at patchwork-helper.netlify.app, open source at github.com/marcellupei/patchwork. The live system prompt, retrieval pipeline, and stop-here logic are the real, deployed embodiment of the decisions above. See [ROADMAP.md](ROADMAP.md) for what is next and [MISSION.md](MISSION.md) for the shorter public statement.

---

## Pe scurt (RO)

Patchwork este un tool web gratuit unde un om non-tehnic descrie o problemă de calculator cu vorbele lui și primește ajutor construit din surse publice de încredere (documentație oficială, wiki-uri de comunitate, Stack Exchange), luate live și citate, explicate la nivelul pe care îl alege el. Tagline: prietenul răbdător care se pricepe la calculatoare și recunoaște când nu știe.

Deciziile blocate (nu se schimbă fără decizie explicită a fondatorului): web only în v1; fără conturi; fără bază proprie de răspunsuri, totul luat live și citat; cite-or-don't-state; reversibilitate înaintea eleganței; dial de complexitate controlat de user; stop-here (bricked, bancar, panică, criză); privacy prin arhitectură; rutare inteligentă de model; AGPL-3.0 pentru platformă; DCO fără CLA; open source e moat-ul, anti-gouge, creștere lentă; v2 operator agent ca connector în clientul LLM al userului (PW-070b); fără lock-in în nicio direcție (PW-122). Buget bootstrapped: plafon 5.000 EUR personal în anul 1 plus până la 500 EUR/lună operațional.

*Notă: document reconstruit din memorie și din produsul real după pierderea documentelor originale din Drive. Verifică și corectează ce nu se potrivește cu intenția ta.*
