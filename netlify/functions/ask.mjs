// Patchwork — /api/ask
// One request in, one cited answer out. No accounts, no storage, no logs of content.
// Pipeline: triage (fast model) -> live web search -> fetch sources -> answer (routed model), streamed.
//
// Env vars (set in Netlify UI -> Site settings -> Environment variables):
//   ANTHROPIC_API_KEY      required
//   BRAVE_SEARCH_API_KEY   search provider (paid: https://brave.com/search/api/)
//   SERPER_API_KEY         search provider (free tier: https://serper.dev)
//   SEARXNG_URL            search provider: base URL of a self-hosted SearXNG
//                          instance with JSON output enabled (free, open source)
//     Set at least one. Set several and they form a fallback chain, so an
//     unreliable provider never takes the tool down. Default priority:
//     brave > serper > searxng. Override with PW_SEARCH_ORDER.
//   PW_SEARCH_ORDER        optional, e.g. "searxng,brave" to make SearXNG primary
//                          with Brave as the safety net.
//   PW_MODEL_FAST          optional, default "claude-haiku-4-5"
//   PW_MODEL_MAIN          optional, default "claude-sonnet-4-5"

export const config = { path: "/api/ask" };

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const BRAVE_URL = "https://api.search.brave.com/res/v1/web/search";
const SERPER_URL = "https://google.serper.dev/search";

const MAX_QUESTION_CHARS = 2000;
const MAX_SOURCES = 6;
const PAGE_FETCH_COUNT = 3;
const PAGE_FETCH_TIMEOUT_MS = 5000;
const PAGE_TEXT_CHARS = 8000;

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const TRIAGE_SYSTEM = `You are the triage step of Patchwork, a free tech-help assistant for non-technical users. You never answer the user. You only classify and plan. Respond with ONLY a JSON object, no other text:

{
  "stop": "none" | "bricked" | "banking" | "panic" | "self_harm",
  "model": "fast" | "main",
  "queries": ["...", "..."],
  "lang": "two-letter language code of the user's message"
}

stop rules (use ONLY when clearly applicable, not for passing mentions):
- "bricked": device will not power on / boot at all, or the fix risks permanent damage (firmware flashing on a dead device, etc.)
- "banking": user is being scammed right now, shares banking credentials, or asks for help moving money under pressure
- "panic": user is in acute distress about a tech emergency and needs calming + human help more than instructions
- "self_harm": any indication of self-harm or suicide risk
- otherwise "none"

model rules: "fast" for simple lookups (what does this error mean, how do I turn X on), "main" for multi-step problems, ambiguous symptoms, or anything where a wrong answer is costly.

queries: 1-2 focused web search queries, in English, that would find authoritative documentation for this problem (vendor docs, official wikis, Stack Exchange). If the user's language is not English, you may add one query in their language.`;

const ANSWER_SYSTEM = `You are Patchwork: the patient friend who knows computers, and admits when they don't. You help non-technical people fix tech problems.

Hard rules, in order:
1. CITE OR DO NOT STATE. Every factual claim about how software or hardware behaves must be supported by the numbered sources provided. Cite inline like [1], [2]. If the sources do not cover something, say plainly "I couldn't verify this" and say what you'd need. NEVER invent a link, a menu path, a command, or a source.
2. REVERSIBILITY BEFORE ELEGANCE. Prefer the fix that is easy to undo. Before any risky step (deleting, flashing, formatting, registry edits), tell the user what could go wrong and how to back out.
3. MATCH THE USER'S LEVEL. The request includes a level:
   - simple: short sentences, no jargon, one step at a time, explain what each step does in everyday words.
   - standard: normal helpful-friend tone, light jargon with quick definitions.
   - expert: concise, technical, commands and paths welcome.
4. ANSWER IN THE USER'S LANGUAGE, natively and naturally, whatever it is. Keep source titles in their original language.
5. Be honest about uncertainty. "I don't know" is a good answer when it's true.
6. Never ask the user to share passwords, banking details, or 2FA codes with you or anyone.

Structure: a one-line diagnosis of what's probably going on, then the steps, then a short "if this didn't work" line. Keep it as short as the problem allows.`;

const STOP_MESSAGES = {
  bricked: {
    en: "This looks like a problem where do-it-yourself steps could make things permanently worse, and I don't want to guess with your device on the line. The safest move is a repair professional or the manufacturer's official support. If the device is under warranty, opening it or flashing it yourself can void it. I'm genuinely better used for problems where mistakes are reversible.",
    ro: "Aici pașii făcuți pe cont propriu pot agrava lucrurile ireversibil, și nu vreau să ghicesc când dispozitivul tău e în joc. Cel mai sigur drum este un service specializat sau suportul oficial al producătorului. Dacă dispozitivul e în garanție, desfacerea sau reinstalarea firmware-ului pe cont propriu o poate anula. Sunt mult mai util la problemele unde greșelile se pot repara.",
  },
  banking: {
    en: "Stop for a second: when money or banking access is involved, the only safe advice is to contact your bank directly, using the phone number on the back of your card or on the bank's official website (type it yourself, don't click a link someone sent you). Do not share codes, passwords, or move money because someone urged you to, no matter who they claim to be. Banks never ask for that. I can help you afterwards with the technical cleanup, but the bank call comes first.",
    ro: "O secundă: când e vorba de bani sau acces bancar, singurul sfat sigur este să contactezi banca direct, la numărul de pe spatele cardului sau de pe site-ul oficial al băncii (scrie-l tu în browser, nu da click pe linkuri primite). Nu comunica nimănui coduri sau parole și nu muta bani pentru că cineva insistă, indiferent cine spune că este. Băncile nu cer așa ceva niciodată. Te pot ajuta după aceea cu partea tehnică, dar telefonul la bancă e primul pas.",
  },
  panic: {
    en: "Take a breath, you're not going to make this worse by pausing. Almost nothing in tech is as lost as it feels in the first ten minutes: files usually still exist, accounts can be recovered, and most 'disasters' have a boring fix. Step one is to stop clicking and change nothing. Then, if you can, ask someone nearby to sit with you while you sort it out, or tell me calmly what happened, one sentence at a time, and we'll take it slowly.",
    ro: "Respiră, nu strici nimic dacă iei o pauză. Aproape nimic în tehnologie nu e atât de pierdut pe cât pare în primele zece minute: fișierele de obicei există în continuare, conturile se pot recupera, iar majoritatea 'dezastrelor' au o rezolvare banală. Pasul unu: nu mai da click pe nimic și nu schimba nimic. Apoi, dacă poți, roagă pe cineva apropiat să stea cu tine cât rezolvi, sau povestește-mi calm ce s-a întâmplat, o propoziție pe rând, și o luăm încet.",
  },
  self_harm: {
    en: "I'm stopping the tech talk because you matter more than any device. What you're feeling deserves real human support, not troubleshooting steps. Please reach out to someone you trust, or to a crisis line where trained people are available right now (in the EU you can call 112 in an emergency; many countries also have a dedicated helpline). If you'd like, come back any time and we'll fix the computer together, no rush.",
    ro: "Las deoparte partea tehnică, pentru că tu contezi mai mult decât orice dispozitiv. Ce simți acum merită sprijin uman adevărat, nu pași de depanare. Te rog vorbește cu cineva în care ai încredere sau sună la o linie de criză unde răspund oameni pregătiți (în România: 112 în urgențe, sau linia antisuicid 0800 801 200). Dacă vrei, revino oricând și reparăm calculatorul împreună, fără grabă.",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

async function anthropic(apiKey, body) {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`anthropic ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res;
}

async function triage(apiKey, model, question) {
  const fallback = { stop: "none", model: "main", queries: [question.slice(0, 200)], lang: "en" };
  try {
    const res = await anthropic(apiKey, {
      model,
      max_tokens: 300,
      system: TRIAGE_SYSTEM,
      messages: [{ role: "user", content: question }],
    });
    const data = await res.json();
    const text = (data.content?.[0]?.text ?? "").trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const parsed = JSON.parse(match[0]);
    return {
      stop: ["bricked", "banking", "panic", "self_harm"].includes(parsed.stop) ? parsed.stop : "none",
      model: parsed.model === "fast" ? "fast" : "main",
      queries: Array.isArray(parsed.queries) && parsed.queries.length
        ? parsed.queries.slice(0, 2).map((q) => String(q).slice(0, 200))
        : fallback.queries,
      lang: typeof parsed.lang === "string" ? parsed.lang.slice(0, 2).toLowerCase() : "en",
    };
  } catch {
    return fallback;
  }
}

async function braveSearch(apiKey, query) {
  const url = `${BRAVE_URL}?q=${encodeURIComponent(query)}&count=5&text_decorations=false`;
  const res = await fetch(url, {
    headers: { "X-Subscription-Token": apiKey, Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  return (data?.web?.results ?? []).map((r) => ({
    title: r.title ?? r.url,
    url: r.url,
    snippet: r.description ?? "",
  }));
}

async function serperSearch(apiKey, query) {
  const res = await fetch(SERPER_URL, {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ q: query, num: 5 }),
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  return (data?.organic ?? []).map((r) => ({
    title: r.title ?? r.link,
    url: r.link,
    snippet: r.snippet ?? "",
  }));
}

async function searxngSearch(baseUrl, query) {
  // Self-hosted SearXNG instance. The instance must have JSON output enabled
  // (settings.yml -> search.formats includes "json"). Timed out so a slow or
  // dead instance can never stall the request; on any failure returns [] so the
  // fallback chain moves on.
  const url = `${baseUrl.replace(/\/+$/, "")}/search?q=${encodeURIComponent(query)}&format=json&safesearch=1&language=en`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "PatchworkBot/0.1 (+https://github.com/marcellupei/patchwork)",
      },
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => null);
    return (data?.results ?? []).slice(0, 5).map((r) => ({
      title: r.title ?? r.url,
      url: r.url,
      snippet: r.content ?? "",
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// Build the ordered list of configured search providers. More than one can be
// set: they form a fallback chain, so an unreliable provider (a self-hosted
// SearXNG that gets rate-limited, say) can never take the whole tool down as
// long as one more provider is configured. Default order puts the reliable
// commercial APIs first; override with PW_SEARCH_ORDER (comma-separated names)
// to make SearXNG primary with a commercial safety net.
function buildProviders() {
  const providers = [];
  if (process.env.BRAVE_SEARCH_API_KEY) {
    providers.push({ name: "brave", fn: (q) => braveSearch(process.env.BRAVE_SEARCH_API_KEY, q) });
  }
  if (process.env.SERPER_API_KEY) {
    providers.push({ name: "serper", fn: (q) => serperSearch(process.env.SERPER_API_KEY, q) });
  }
  if (process.env.SEARXNG_URL) {
    providers.push({ name: "searxng", fn: (q) => searxngSearch(process.env.SEARXNG_URL, q) });
  }
  const order = (process.env.PW_SEARCH_ORDER || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (order.length) {
    providers.sort((a, b) => {
      const i = order.indexOf(a.name);
      const j = order.indexOf(b.name);
      return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
    });
  }
  return providers;
}

// Run one query through the provider chain, returning the first non-empty
// result set. A provider that throws or returns nothing is skipped silently.
async function searchWithFallback(providers, query) {
  for (const p of providers) {
    try {
      const results = await p.fn(query);
      if (results && results.length) return results;
    } catch {
      /* provider down, try the next */
    }
  }
  return [];
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPageText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PAGE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "PatchworkBot/0.1 (+https://github.com/marcellupei/patchwork; open-source tech help)" },
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.includes("html")) return "";
    const html = await res.text();
    return stripHtml(html).slice(0, PAGE_TEXT_CHARS);
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const providers = buildProviders();
  if (!anthropicKey || providers.length === 0) return json({ error: "not_configured" }, 503);

  const modelFast = process.env.PW_MODEL_FAST || "claude-haiku-4-5";
  const modelMain = process.env.PW_MODEL_MAIN || "claude-sonnet-4-5";

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const question = String(body.question ?? "").trim();
  const level = ["simple", "standard", "expert"].includes(body.level) ? body.level : "standard";
  if (question.length < 3) return json({ error: "question_too_short" }, 400);
  if (question.length > MAX_QUESTION_CHARS) return json({ error: "question_too_long" }, 400);

  // 1. Triage: stop-here check, model routing, search planning. One fast call.
  const plan = await triage(anthropicKey, modelFast, question);

  // 2. Stop-here triggers end the pipeline. Fixed, human-written responses only.
  if (plan.stop !== "none") {
    const msg = STOP_MESSAGES[plan.stop];
    return json({ stop: plan.stop, message: plan.lang === "ro" ? msg.ro : msg.en });
  }

  // 3 + 4. Live retrieval and streamed answer, with real progress markers.
  // Wire protocol: zero or more "#stage" lines (searching/reading/writing),
  // then exactly one JSON line ({sources:[...]} or {error:...}), then plain text.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const model = plan.model === "fast" ? modelFast : modelMain;

  const stream = new ReadableStream({
    async start(controller) {
      const say = (s) => controller.enqueue(encoder.encode(s));
      try {
        // Search. No cached answer database, ever.
        say("#searching\n");
        const resultLists = await Promise.all(plan.queries.map((q) => searchWithFallback(providers, q)));
        const seen = new Set();
        const sources = [];
        for (const r of resultLists.flat()) {
          if (!r.url || seen.has(r.url)) continue;
          seen.add(r.url);
          sources.push(r);
          if (sources.length >= MAX_SOURCES) break;
        }

        // Read the top pages.
        say("#reading\n");
        const pageTexts = await Promise.all(
          sources.slice(0, PAGE_FETCH_COUNT).map((s) => fetchPageText(s.url))
        );
        pageTexts.forEach((text, i) => {
          if (text) sources[i].pageText = text;
        });

        const sourceBlock = sources.length
          ? sources
              .map(
                (s, i) =>
                  `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.pageText ? `Content: ${s.pageText}` : `Snippet: ${s.snippet}`}`
              )
              .join("\n\n")
          : "(No sources could be retrieved. Say so honestly, give only widely-known general guidance clearly labeled as unverified, and suggest where the user could look.)";

        const userPrompt = `Sources retrieved from the live web just now:\n\n${sourceBlock}\n\n---\nUser's level: ${level}\nUser's question:\n${question}`;

        // Answer.
        say("#writing\n");
        const upstream = await anthropic(anthropicKey, {
          model,
          max_tokens: 1500,
          stream: true,
          system: ANSWER_SYSTEM,
          messages: [{ role: "user", content: userPrompt }],
        });

        say(
          JSON.stringify({
            sources: sources.map((s, i) => ({ n: i + 1, title: s.title, url: s.url })),
            model: plan.model,
          }) + "\n"
        );

        const reader = upstream.body.getReader();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const evt = JSON.parse(payload);
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                say(evt.delta.text);
              }
            } catch {
              /* partial frame, skip */
            }
          }
        }
      } catch (err) {
        // Header not sent yet or upstream broke: emit an error header the client understands.
        try {
          say(JSON.stringify({ error: "upstream_error", detail: String(err?.message ?? err).slice(0, 200) }) + "\n");
        } catch {
          /* stream already closed */
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
};
