# Feature Tracker

*Canonical, reconstructed 2026-07-27 after the original 07 Feature Tracker was lost. This is the single source of truth for feature status and the decision log. PW-NNN IDs are preserved where known from project memory; new IDs continue the scheme. Kept in the repo under version control.*

## Status legend

- **Shipped** — live in production.
- **Locked** — decided, not yet built; do not change without an explicit founder decision.
- **Planned** — agreed direction, not yet started.
- **Deferred** — intentionally postponed, often to community contribution.

## Shipped (v1, live at patchwork-helper.netlify.app)

| ID | Feature | Notes |
|----|---------|-------|
| PW-001 | Web tool, no build step, no account | Static front end + one serverless function |
| PW-002 | Live retrieval with mandatory citations | Cite or do not state; no answer database |
| PW-003 | Complexity dial (simple / standard / expert) | User controls their own level |
| PW-004 | Stop-here triggers | bricked, banking, panic, self_harm; fixed EN/RO messages |
| PW-005 | Smart model routing | Fast model for lookups, main for hard problems |
| PW-006 | Bilingual UI (EN + RO), answers in user's language | |
| PW-007 | Privacy by architecture | No identity, no stored questions, no cache |
| PW-008 | Streaming answer with live progress | `#searching/#reading/#writing` + sources + text |
| PW-009 | Pluggable search provider chain with fallback | Brave, Serper, SearXNG; unreliable providers can't take the tool down |
| PW-010 | Accessibility pass | AA contrast, 44px targets, focus-visible, ARIA dial |
| PW-011 | Open source, AGPL-3.0, DCO, no CLA | Repo public at github.com/marcellupei/patchwork |

## Locked (decided, not yet built)

| ID | Feature | Notes |
|----|---------|-------|
| PW-070b | v2 operator agent as a connector | Patchwork hosted via the user's own LLM client, Claude Desktop first |
| PW-122 | No lock-in in either direction | Host-portable connector, one-command uninstaller, web tool always standalone, host usable without Patchwork |

## Planned

| ID | Feature | Notes |
|----|---------|-------|
| PW-020 | Authoritative source list | Bias retrieval to official docs and trusted wikis (ArchWiki, vendor docs, Stack Exchange), public and community-editable, with free fallback. Candidate first "good first issue" |
| PW-021 | One-command quickstart + short demo video | Needed for launch (Product Hunt, Show HN) |
| PW-022 | More human-reviewed languages | UI and especially stop-here messages |
| PW-023 | Privacy-safe answer quality feedback | Must not store question content |

## Deferred

| ID | Feature | Notes |
|----|---------|-------|
| PW-070a | Self-contained Patchwork-built helper | Deferred to community contribution rather than built first |
| PW-030 | Live USB / boot-to-browser distribution | Would touch the locked "web only for v1" decision; kept as a later distribution idea, not unlocked |

## Decision log

- **2026-05 (concept phase):** Locked the core decisions now recorded in [POSITIONING.md](POSITIONING.md): web only v1, no accounts, no proprietary answer database, cite or do not state, reversibility before elegance, user-controlled level, stop-here, privacy as architecture, smart routing, AGPL-3.0, DCO no CLA, open source as moat, PW-070b, PW-122.
- **2026-07-26/27 (build):** Shipped v1 (PW-001 to PW-011). Chose Netlify hosting. Chose Brave as the official-instance search provider (Brave dropped its free tier in Feb 2026); added Serper and SearXNG as alternatives behind a fallback chain. Kept "web only v1" locked; Live USB (PW-030) not unlocked.
- **2026-07-27 (positioning):** Set the launch wedge (crisis / no account / high-stakes command / verifiable sources) rather than "better than ChatGPT." See [PRESENCE.md](PRESENCE.md).
- **2026-07-27 (data loss):** Original concept documents (00-09) lost from Google Drive; canonical docs reconstructed into the repo under git.

*Note: reconstructed from project memory and shipped code. Correct any ID or status that does not match your record.*
