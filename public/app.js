// Patchwork frontend. No frameworks, no analytics, no storage of user content.

const I18N = {
  en: {
    heroTitle: "What's broken?",
    tagline: "The patient friend who knows computers, and admits when they don't.",
    examples: [
      "My laptop is suddenly very slow",
      "Wi-Fi works on my phone but not my PC",
      "I want to try Linux, where do I start?",
    ],
    p1t: "Cited, always.",
    p1: "Every claim links to a real, public source you can open.",
    p2t: "Private by design.",
    p2: "No account, no tracking, your question is not stored.",
    p3t: "Honest.",
    p3: "When it doesn't know, it says so instead of guessing.",
    braveNote: "Web search powered by",
    questionLabel: "Describe your problem",
    placeholder: "Describe what's happening, in your own words. Example: my laptop says 'no bootable device' when I turn it on.",
    dialLabel: "Explain it:",
    simple: "Simply",
    standard: "Normally",
    expert: "Technically",
    ask: "Help me",
    working: "Looking it up…",
    sourcesTitle: "Sources",
    verifyNote: "Patchwork only states what it can cite. Check the sources if something looks off.",
    privacy: "No account. No tracking. Your question is processed to answer it and is not stored.",
    freeForever: "Free, forever.",
    errNetwork: "Couldn't reach the server. Check your connection and try again.",
    errConfig: "This Patchwork instance isn't fully set up yet (missing API keys). If you run it, add ANTHROPIC_API_KEY and a search key (SERPER_API_KEY or BRAVE_SEARCH_API_KEY).",
    errGeneric: "Something went wrong on our side. Try again in a minute.",
    errShort: "Tell me a little more about the problem first.",
  },
  ro: {
    heroTitle: "Ce s-a stricat?",
    tagline: "Prietenul răbdător care se pricepe la calculatoare și recunoaște când nu știe.",
    examples: [
      "Laptopul meu a devenit brusc foarte lent",
      "Wi-Fi merge pe telefon, dar nu pe PC",
      "Vreau să încerc Linux, de unde încep?",
    ],
    p1t: "Cu surse, mereu.",
    p1: "Fiecare afirmație trimite la o sursă publică reală, pe care o poți deschide.",
    p2t: "Privat prin construcție.",
    p2: "Fără cont, fără tracking, întrebarea ta nu e stocată.",
    p3t: "Sincer.",
    p3: "Când nu știe, spune asta în loc să ghicească.",
    braveNote: "Căutare web prin",
    questionLabel: "Descrie problema ta",
    placeholder: "Descrie ce se întâmplă, cu vorbele tale. Exemplu: laptopul îmi scrie 'no bootable device' când îl pornesc.",
    dialLabel: "Explică-mi:",
    simple: "Pe înțelesul meu",
    standard: "Normal",
    expert: "Tehnic",
    ask: "Ajută-mă",
    working: "Caut…",
    sourcesTitle: "Surse",
    verifyNote: "Patchwork afirmă doar ce poate cita. Verifică sursele dacă ceva nu pare în regulă.",
    privacy: "Fără cont. Fără tracking. Întrebarea ta e procesată doar ca să primești răspunsul și nu e stocată.",
    freeForever: "Gratuit, pentru totdeauna.",
    errNetwork: "Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.",
    errConfig: "Această instanță Patchwork nu e configurată complet încă (lipsesc cheile API). Dacă o administrezi, adaugă ANTHROPIC_API_KEY și o cheie de căutare (SERPER_API_KEY sau BRAVE_SEARCH_API_KEY).",
    errGeneric: "Ceva n-a mers la noi. Încearcă din nou într-un minut.",
    errShort: "Spune-mi întâi puțin mai mult despre problemă.",
  },
};

let lang = navigator.language?.toLowerCase().startsWith("ro") ? "ro" : "en";
let level = "standard";
let busy = false;

const $ = (id) => document.getElementById(id);
const t = (key) => I18N[lang][key] ?? I18N.en[key] ?? key;

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  $("langToggle").textContent = lang === "ro" ? "EN" : "RO";

  const examplesBox = $("examples");
  if (examplesBox) {
    examplesBox.innerHTML = "";
    for (const ex of t("examples")) {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.type = "button";
      chip.textContent = ex;
      chip.addEventListener("click", () => {
        $("question").value = ex;
        $("question").focus();
      });
      examplesBox.appendChild(chip);
    }
  }
}

function showError(msg) {
  const card = $("errorCard");
  card.textContent = msg;
  card.classList.remove("hidden");
}

function renderAnswer(el, raw, sources) {
  // Minimal safe rendering: escape everything, then re-add inline code and citation links.
  let safe = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  safe = safe.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  safe = safe.replace(/\[(\d{1,2})\]/g, (m, n) => {
    const src = sources.find((s) => s.n === Number(n));
    return src
      ? `<a class="cite" href="${src.url.replace(/"/g, "&quot;")}" target="_blank" rel="noopener">[${n}]</a>`
      : m;
  });
  el.innerHTML = safe;
}

async function ask() {
  if (busy) return;
  const question = $("question").value.trim();
  $("errorCard").classList.add("hidden");
  if (question.length < 3) {
    showError(t("errShort"));
    return;
  }

  busy = true;
  const btn = $("askBtn");
  btn.disabled = true;
  btn.textContent = t("working");

  const answerCard = $("answerCard");
  const answerEl = $("answer");
  const stopEl = $("stopBanner");
  const sourcesBox = $("sourcesBox");
  const sourcesList = $("sourcesList");
  answerCard.classList.remove("hidden");
  stopEl.classList.add("hidden");
  sourcesBox.classList.add("hidden");
  $("verifyNote").classList.add("hidden");
  answerEl.textContent = "";
  answerEl.classList.add("cursor");
  sourcesList.innerHTML = "";

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, level }),
    });

    if (res.status === 503) { showError(t("errConfig")); answerCard.classList.add("hidden"); return; }
    if (!res.ok) { showError(t("errGeneric")); answerCard.classList.add("hidden"); return; }

    const type = res.headers.get("content-type") ?? "";

    // Non-streamed JSON: stop-here response.
    if (type.includes("application/json")) {
      const data = await res.json();
      if (data.stop) {
        stopEl.textContent = data.message;
        stopEl.classList.remove("hidden");
        answerEl.classList.remove("cursor");
        return;
      }
      showError(t("errGeneric"));
      answerCard.classList.add("hidden");
      return;
    }

    // Streamed: first line is JSON {sources:[...]}, rest is answer text.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let sources = [];
    let headerParsed = false;
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      if (!headerParsed) {
        const nl = buffer.indexOf("\n");
        if (nl === -1) continue;
        try {
          const header = JSON.parse(buffer.slice(0, nl));
          sources = header.sources ?? [];
        } catch { /* tolerate malformed header */ }
        buffer = buffer.slice(nl + 1);
        headerParsed = true;
        if (sources.length) {
          sourcesList.innerHTML = sources
            .map(
              (s) =>
                `<li><a href="${s.url.replace(/"/g, "&quot;")}" target="_blank" rel="noopener">${s.title
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")}</a></li>`
            )
            .join("");
          sourcesBox.classList.remove("hidden");
        }
      }

      if (headerParsed && buffer) {
        text += buffer;
        buffer = "";
        renderAnswer(answerEl, text, sources);
      }
    }

    if (!text.trim()) showError(t("errGeneric"));
    else $("verifyNote").classList.remove("hidden");
  } catch {
    showError(t("errNetwork"));
  } finally {
    answerEl.classList.remove("cursor");
    busy = false;
    btn.disabled = false;
    btn.textContent = t("ask");
  }
}

$("langToggle").addEventListener("click", () => {
  lang = lang === "ro" ? "en" : "ro";
  applyLang();
});

document.querySelectorAll(".dial-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dial-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    level = btn.dataset.level;
  });
});

$("askBtn").addEventListener("click", ask);
$("question").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) ask();
});

applyLang();
