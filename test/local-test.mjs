// Local smoke test for the ask function. Run: node test/local-test.mjs
// Tests degraded paths without real API keys, plus the streaming protocol
// with a mocked Anthropic/Brave backend.

import assert from "node:assert";

let passed = 0;
const ok = (name) => { passed++; console.log("  ✓", name); };

// --- 1. Missing keys -> 503 not_configured -------------------------------
delete process.env.ANTHROPIC_API_KEY;
delete process.env.BRAVE_SEARCH_API_KEY;
delete process.env.SERPER_API_KEY;
const { default: handler } = await import("../netlify/functions/ask.mjs");

let res = await handler(new Request("http://x/api/ask", {
  method: "POST",
  body: JSON.stringify({ question: "my wifi is broken" }),
}));
assert.equal(res.status, 503);
assert.equal((await res.json()).error, "not_configured");
ok("missing keys -> 503 not_configured");

// --- 2. Method guard ------------------------------------------------------
res = await handler(new Request("http://x/api/ask", { method: "GET" }));
assert.equal(res.status, 405);
ok("GET -> 405");

// --- Mocked upstream for the remaining tests ------------------------------
process.env.ANTHROPIC_API_KEY = "test-key";
process.env.SERPER_API_KEY = "test-key"; // exercises the Serper provider path

const sse = [
  'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Your router likely lost its DNS settings [1]. "}}',
  'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Restart it first."}}',
  "data: [DONE]",
].join("\n") + "\n";

const realFetch = globalThis.fetch;
let triageResponse = JSON.stringify({
  content: [{ type: "text", text: '{"stop":"none","model":"main","queries":["router dns reset"],"lang":"en"}' }],
});

globalThis.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes("api.anthropic.com")) {
    const body = JSON.parse(opts.body);
    if (body.stream) {
      return new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } });
    }
    return new Response(triageResponse, { status: 200, headers: { "content-type": "application/json" } });
  }
  if (u.includes("google.serper.dev")) {
    return new Response(JSON.stringify({
      organic: [
        { title: "Router docs", link: "https://example.com/router", snippet: "Official router documentation" },
        { title: "DNS guide", link: "https://example.com/dns", snippet: "DNS basics" },
      ],
    }), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (u.includes("api.search.brave.com")) {
    return new Response(JSON.stringify({
      web: { results: [
        { title: "Router docs", url: "https://example.com/router", description: "Official router documentation" },
        { title: "DNS guide", url: "https://example.com/dns", description: "DNS basics" },
      ]},
    }), { status: 200, headers: { "content-type": "application/json" } });
  }
  // page fetches
  return new Response("<html><body><p>Reset instructions here.</p></body></html>", {
    status: 200, headers: { "content-type": "text/html" },
  });
};

// --- 3. Full streamed answer ----------------------------------------------
res = await handler(new Request("http://x/api/ask", {
  method: "POST",
  body: JSON.stringify({ question: "internet not working after power cut", level: "simple" }),
}));
assert.equal(res.status, 200);
const text = await res.text();
const nl = text.indexOf("\n");
const header = JSON.parse(text.slice(0, nl));
assert.equal(header.sources.length, 2);
assert.equal(header.sources[0].n, 1);
assert.match(text.slice(nl + 1), /router likely lost its DNS/i);
assert.match(text.slice(nl + 1), /\[1\]/);
ok("streamed answer: JSON header + text body + citation");

// --- 4. Stop-here trigger --------------------------------------------------
triageResponse = JSON.stringify({
  content: [{ type: "text", text: '{"stop":"banking","model":"fast","queries":[],"lang":"ro"}' }],
});
res = await handler(new Request("http://x/api/ask", {
  method: "POST",
  body: JSON.stringify({ question: "cineva de la banca imi cere codul de pe card" }),
}));
const stopData = await res.json();
assert.equal(stopData.stop, "banking");
assert.match(stopData.message, /banca/);
ok("stop-here banking -> Romanian fixed message");

// --- 5. Garbage triage output falls back safely ----------------------------
triageResponse = JSON.stringify({ content: [{ type: "text", text: "not json at all" }] });
res = await handler(new Request("http://x/api/ask", {
  method: "POST",
  body: JSON.stringify({ question: "printer says offline" }),
}));
assert.equal(res.status, 200);
ok("malformed triage -> safe fallback, still answers");

// --- 6. Question length guards ---------------------------------------------
res = await handler(new Request("http://x/api/ask", { method: "POST", body: JSON.stringify({ question: "hi" }) }));
assert.equal(res.status, 400);
res = await handler(new Request("http://x/api/ask", { method: "POST", body: JSON.stringify({ question: "x".repeat(3000) }) }));
assert.equal(res.status, 400);
ok("length guards -> 400");

globalThis.fetch = realFetch;
console.log(`\nAll ${passed} tests passed.`);
