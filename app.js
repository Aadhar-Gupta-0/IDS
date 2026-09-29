/* ══════════════════════════════════════════════════════════════
   Group 9 · Job-Change Radar — interactions & charts
   No dependencies. Everything renders from data.js.
   ══════════════════════════════════════════════════════════════ */
(() => {
"use strict";

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const pct = (v, d = 0) => (v * 100).toFixed(d) + "%";
const esc = (s) => String(s).replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));

/* ── sound (optional, off by default) ───────────────────────── */
let audioOn = false, actx = null;
function blip(freq = 520, dur = 0.07, type = "square") {
  if (!audioOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.06, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination);
    o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* no audio available */ }
}
const soundBtn = $("#soundBtn");
soundBtn.addEventListener("click", () => {
  audioOn = !audioOn;
  soundBtn.setAttribute("aria-pressed", String(audioOn));
  soundBtn.textContent = audioOn ? "🔊" : "🔈";
  if (audioOn) { blip(660, .09); setTimeout(() => blip(880, .1), 90); }
});
document.addEventListener("click", e => {
  const t = e.target.closest(".btn, .chip-btn, .qcard, .mx-cell");
  if (t) blip(520, .05);
});

/* ── starfield ──────────────────────────────────────────────── */
const canvas = $("#stars"), ctx = canvas.getContext("2d");
let stars = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
function sizeStars() {
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.round((W * H) / 6500);
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.5 + .3, s: Math.random() * .22 + .04,
    a: Math.random() * Math.PI * 2, c: Math.random() > .82 ? (Math.random() > .5 ? "#5cf0ff" : "#ff5d8f") : "#fff6e6"
  }));
}
function drawStars() {
  ctx.clearRect(0, 0, W, H);
  for (const st of stars) {
    st.y += st.s; st.a += 0.02;
    if (st.y > H + 4) { st.y = -4; st.x = Math.random() * W; }
    ctx.globalAlpha = .35 + Math.sin(st.a) * .3;
    ctx.fillStyle = st.c;
    ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}
sizeStars(); drawStars();
addEventListener("resize", () => { sizeStars(); renderAllCharts(); }, { passive: true });

/* ── header: progress, stuck state, scroll-spy, LCD sign ────── */
const fill = $("#scrollFill"), topbar = $("#topbar"), dest = $("#destSign"), nav = $("#nav");
const stops = $$("section[data-sign]");
let signText = "NEXT STOP: THE QUESTION";

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  fill.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  topbar.classList.toggle("stuck", scrollY > 40);
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();

const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const sign = en.target.dataset.sign;
    if (sign && signText !== sign) {
      signText = sign;
      dest.innerHTML = '<span class="dot">●</span> NEXT STOP: ' + esc(sign);
    }
    const id = en.target.id;
    $$("#nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
stops.forEach(s => spy.observe(s));

$("#menuBtn").addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", String(open));
});
$$("#nav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

/* ── reveal on scroll ───────────────────────────────────────── */
const pending = new Set();
function growChart(el) {
  el.classList.add("in");
  $$(".hbar[data-w], .fill[data-w]", el).forEach((b, i) =>
    setTimeout(() => { b.style.width = b.dataset.w + "%"; }, i * 45));
  $$(".bar[data-h]", el).forEach((b, i) =>
    setTimeout(() => { b.style.height = b.dataset.h + "%"; }, i * 30));
  $$(".draw", el).forEach(p => {
    const len = p.getTotalLength ? p.getTotalLength() : 1200;
    p.style.setProperty("--len", len);
  });
}
function activate(el) {
  if (!pending.has(el)) return;
  pending.delete(el);
  if (el.classList.contains("chart")) growChart(el);
  else el.classList.add("in");
  revealObs.unobserve(el); chartObs.unobserve(el);
}
const revealObs = new IntersectionObserver(en => {
  en.forEach(e => { if (e.isIntersecting) activate(e.target); });
}, { threshold: .15 });
const chartObs = new IntersectionObserver(en => {
  en.forEach(e => { if (e.isIntersecting) activate(e.target); });
}, { threshold: .15 });
/* fallback sweep: keeps everything working even when observers stall */
function sweep() {
  if (!pending.size) return;
  const vh = innerHeight || document.documentElement.clientHeight;
  [...pending].forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * .92 && r.bottom > vh * .02) activate(el);
  });
}
let sweepTimer = null;
addEventListener("scroll", () => {
  if (sweepTimer) return;
  sweepTimer = setTimeout(() => { sweepTimer = null; sweep(); }, 140);
}, { passive: true });
addEventListener("resize", sweep, { passive: true });
addEventListener("load", () => { sweep(); setTimeout(sweep, 400); });
/* layout shifts (charts growing, fonts settling) move content that is already
   on screen — re-check whenever the document resizes so nothing stays hidden */
if (window.ResizeObserver) {
  let roTimer = null;
  new ResizeObserver(() => {
    clearTimeout(roTimer);
    roTimer = setTimeout(sweep, 90);
  }).observe(document.documentElement);
}
/* belt-and-braces: some embedded viewers stall observers, so poll until done */
let ticker = null;
function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    sweep();
    if (!pending.size) { clearInterval(ticker); ticker = null; }
  }, 350);
}
startTicker();
function watch(el) { pending.add(el); revealObs.observe(el); startTicker(); }
$$(".card, .question-box, .bet, .route li, .qcard, .matrix, .thr")
  .forEach((el, i) => { el.classList.add("reveal"); el.style.transitionDelay = (i % 4) * 60 + "ms"; watch(el); });

/* ══ CHARTS ══════════════════════════════════════════════════ */
const chartHosts = {};
let thrReady = false;   /* threshold UI is wired up later in this file */
function host(name) { return document.querySelector(`.chart[data-render="${name}"]`); }

/* vertical bars ------------------------------------------------ */
function vbars(items, opts = {}) {
  const max = opts.max ?? Math.max(...items.map(i => i.value)) * 1.12;
  const every = opts.labelEvery ?? 1, valEvery = opts.valEvery ?? 1;
  return `<div class="vbars">` + items.map((it, i) => {
    const h = Math.max(2, (it.value / max) * 100);
    const showLbl = i % every === 0 || i === items.length - 1;
    const showVal = i % valEvery === 0 || i === items.length - 1;
    return `<div class="vbar ${it.tone || ""}">
      <span class="val">${showVal ? (opts.fmt ? opts.fmt(it.value) : it.value) : ""}</span>
      <span class="bar" style="--h:${h}%" data-h="${h}"></span>
      <span class="lbl">${showLbl ? esc(it.label) : ""}${showLbl && it.sub ? `<small>${esc(it.sub)}</small>` : ""}</span>
    </div>`;
  }).join("") + `</div>`;
}
/* horizontal grouped bars -------------------------------------- */
function hbars(rows, opts = {}) {
  const max = opts.max ?? Math.max(...rows.flatMap(r => r.bars.map(b => b.value))) * 1.05;
  const legend = opts.legend
    ? `<div class="hlegend">${opts.legend.map(l => `<span><i class="swatch ${l.cls}"></i>${esc(l.label)}</span>`).join("")}</div>`
    : "";
  return legend + `<div class="hgroup">` + rows.map(r => `
    <div class="hrow">
      <div class="hrow-top"><span>${esc(r.label)}</span><span class="hval">${r.note || ""}</span></div>
      ${r.bars.map(b => `<div class="htrack">
          <span class="hbar ${b.cls || ""}" data-w="${(b.value / max) * 100}"></span>
          <span class="hval" style="font-family:var(--mono);font-size:12px;color:#4b4335">${b.text || ""}</span>
        </div>`).join("")}
    </div>`).join("") + `</div>`;
}
/* generic line chart (SVG) ------------------------------------- */
function lineChart(cfg) {
  const w = cfg.w || 660, h = cfg.h || 320;
  const L = cfg.padL ?? 52, R = 18, T = 16, B = 44;
  const xs = cfg.x, ys = cfg.y;
  const X = v => L + ((v - xs[0]) / (xs[1] - xs[0])) * (w - L - R);
  const Y = v => T + (1 - (v - ys[0]) / (ys[1] - ys[0])) * (h - T - B);
  const gridY = cfg.yTicks || [0, .25, .5, .75, 1];
  const gridX = cfg.xTicks || [xs[0], (xs[0] + xs[1]) / 2, xs[1]];

  let s = `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(cfg.aria || "line chart")}">`;
  s += `<g class="grid">` + gridY.map(v => `<line x1="${L}" y1="${Y(v)}" x2="${w - R}" y2="${Y(v)}"/>`).join("") + `</g>`;
  s += gridY.map(v => `<text class="axis" x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${cfg.yFmt ? cfg.yFmt(v) : v}</text>`).join("");
  s += gridX.map(v => `<text class="axis" x="${X(v)}" y="${h - 22}" text-anchor="middle">${cfg.xFmt ? cfg.xFmt(v) : v}</text>`).join("");
  if (cfg.xLabel) s += `<text class="axis" x="${(L + w - R) / 2}" y="${h - 4}" text-anchor="middle">${esc(cfg.xLabel)}</text>`;

  if (cfg.area) {
    const first = cfg.series[0].pts, last = first[first.length - 1];
    s += `<path class="area" d="M${X(first[0][0])} ${Y(ys[0])} ` +
      first.map(p => `L${X(p[0])} ${Y(p[1])}`).join(" ") + ` L${X(last[0])} ${Y(ys[0])} Z"/>`;
  }
  if (cfg.diag) s += `<line class="diag" x1="${X(xs[0])}" y1="${Y(ys[0])}" x2="${X(xs[1])}" y2="${Y(ys[1])}"/>`;

  cfg.series.forEach((se, i) => {
    const d = se.pts.map((p, k) => `${k ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(" ");
    s += `<path class="series draw ${se.cls || ""}" data-series="${i}" d="${d}"/>`;
    if (se.dots) s += se.pts.filter((_, k) => k % (se.dotEvery || 1) === 0)
      .map(p => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="4" fill="${se.dotColor || "#fff6e6"}" stroke="#241133" stroke-width="2"/>`).join("");
  });
  (cfg.labels || []).forEach(lb => {
    s += `<text class="lbl" x="${X(lb.x)}" y="${Y(lb.y)}" text-anchor="${lb.anchor || "start"}">${esc(lb.text)}</text>`;
  });
  if (cfg.markerId) s += `<g id="${cfg.markerId}"></g>`;
  s += `</svg>`;
  return { html: s, X, Y, w, h, L, R, T, B };
}

/* individual renderers ---------------------------------------- */
const renderers = {
  cityBins(el) {
    el.innerHTML = vbars(SITE.cityBins.map((b, i) => ({
      label: b.label, sub: "n=" + b.n.toLocaleString(), value: b.value * 100,
      tone: i === 0 ? "hot" : i >= 3 ? "alt" : ""
    })), { fmt: v => Math.round(v) + "%", max: 66 });
  },
  experience(el) {
    const labs = SITE.experience.map(r => r[0]);
    const c = lineChart({
      w: 660, h: 300, x: [0, labs.length - 1], y: [0, .5],
      xTicks: [0, 4, 8, 12, 16, labs.length - 1],
      yTicks: [0, .1, .2, .3, .4, .5],
      xFmt: v => labs[v], yFmt: v => pct(v, 0),
      xLabel: "years of experience", aria: "job-change rate by years of experience",
      area: true,
      series: [{ pts: SITE.experience.map((r, i) => [i, r[1]]), dots: true, dotEvery: 2 }],
      labels: [{ x: 0, y: .44, text: "45% under 1 year" },
               { x: 21, y: .21, text: "15% past 20", anchor: "end" }]
    });
    el.innerHTML = c.html;
  },
  missingPct(el) {
    el.innerHTML = hbars(SITE.missing.map(m => ({
      label: m.col, note: m.pct + "% missing",
      bars: [{ value: m.pct, cls: m.pct > 10 ? "b" : "" }]
    })), { max: 36 });
  },
  missingSignal(el) {
    el.innerHTML = hbars(SITE.missing.map(m => ({
      label: m.col,
      bars: [
        { value: m.missing * 100, cls: "b", text: pct(m.missing, 1) },
        { value: m.present * 100, cls: "a", text: pct(m.present, 1) }
      ]
    })), {
      max: 46,
      legend: [{ cls: "b", label: "value missing" }, { cls: "a", label: "value present" }]
    });
  },
  models(el) {
    const rows = SITE.models.map((m, i) => `
      <div class="modelrow ${i === 0 ? "win" : ""}">
        <div class="mr-head">
          <span class="mr-name">${i + 1}. ${esc(m.name)}</span>
          <span class="mr-note">${esc(m.note)}${m.roc_sd ? " · ±" + m.roc_sd.toFixed(3) : ""}</span>
        </div>
        <div class="mr-bars">
          <div class="mr-bar"><span class="tag">AUC</span>
            <span class="track"><span class="fill" data-w="${m.roc * 100}"></span></span>
            <span class="num">${m.roc.toFixed(3)}</span></div>
          <div class="mr-bar f1"><span class="tag">F1</span>
            <span class="track"><span class="fill" data-w="${m.f1 * 100}"></span></span>
            <span class="num">${m.f1.toFixed(3)}</span></div>
        </div>
      </div>`).join("");
    el.innerHTML = `<p class="hlegend">
        <span><i class="swatch a"></i>ROC-AUC (5-fold mean)</span>
        <span><i class="swatch b"></i>F1</span>
        <span><i class="swatch d"></i>the winner, by 0.006</span></p>${rows}`;
  },
  importance(el) {
    el.innerHTML = hbars(SITE.importance.map((f, i) => ({
      label: f.f, note: "±" + f.s.toFixed(3),
      bars: [{ value: f.v * 100, cls: i === 0 ? "b" : i < 3 ? "c" : "", text: f.v.toFixed(3) }]
    })), { max: 10.5 });
    el.insertAdjacentHTML("beforeend",
      `<p class="muted" style="font-family:var(--mono);font-size:11.5px;letter-spacing:.08em;margin:14px 0 0">
        DROP IN TEST ROC-AUC →</p>`);
  },
  roc(el) {
    const pts = SITE.roc.fpr.map((f, i) => [f, SITE.roc.tpr[i]]);
    const c = lineChart({
      w: 520, h: 380, x: [0, 1], y: [0, 1], area: true, diag: true,
      xTicks: [0, .25, .5, .75, 1], yTicks: [0, .25, .5, .75, 1],
      yFmt: v => v.toFixed(2), xFmt: v => v.toFixed(2),
      xLabel: "false positive rate", aria: "ROC curve, AUC 0.808",
      series: [{ pts }],
      labels: [{ x: .46, y: .32, text: "AUC 0.808" },
               { x: .78, y: .52, text: "chance 0.50" }]
    });
    el.innerHTML = c.html;
  },
  hist(el) {
    const { h0, h1, bins } = SITE.hist;
    const w = 660, h = 300, L = 46, R = 16, T = 18, B = 44;
    const sum0 = h0.reduce((a, b) => a + b, 0), sum1 = h1.reduce((a, b) => a + b, 0);
    const d0 = h0.map(v => v / sum0), d1 = h1.map(v => v / sum1);
    const max = Math.max(...d0, ...d1) * 1.1;
    const X = i => L + ((i + .5) / bins.length) * (w - L - R);
    const Y = v => T + (1 - v / max) * (h - T - B);
    const areaOf = (d, cls) => {
      const line = d.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
      return `<path class="dist ${cls}" d="${line} L${X(d.length - 1).toFixed(1)} ${Y(0)} L${X(0).toFixed(1)} ${Y(0)} Z"/>` +
             `<path class="series draw ${cls === "stay" ? "one" : "two"}" d="${line}"/>`;
    };
    const gridY = [0, .25, .5, .75, 1].map(v => T + (1 - v) * (h - T - B));
    let s = `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img" aria-label="score distribution by class">`;
    s += `<g class="grid">` + gridY.map(y => `<line x1="${L}" y1="${y.toFixed(1)}" x2="${w - R}" y2="${y.toFixed(1)}"/>`).join("") + `</g>`;
    [0, .25, .5, .75, 1].forEach(v => {
      const x = L + v * (w - L - R);
      s += `<text class="axis" x="${x}" y="${h - 22}" text-anchor="middle">${v.toFixed(2)}</text>`;
    });
    s += `<text class="axis" x="${(L + w - R) / 2}" y="${h - 4}" text-anchor="middle">predicted probability</text>`;
    s += areaOf(d1, "look") + areaOf(d0, "stay");
    s += `<text class="lbl" x="${X(4)}" y="${Y(d0[4]) - 14}" text-anchor="start">staying</text>`;
    s += `<text class="lbl" x="${X(33)}" y="${Y(d1[33]) - 16}" text-anchor="end">looking</text>`;
    s += `</svg>`;
    el.innerHTML = `<p class="hlegend" style="margin:0 0 6px">
        <span><i class="swatch a"></i>staying · 2,877</span>
        <span><i class="swatch b"></i>looking · 955</span>
      </p>` + s +
      `<p class="muted" style="font-family:var(--mono);font-size:11.5px;letter-spacing:.1em;margin:4px 0 0;text-align:center">
        RELATIVE DENSITY OF PREDICTED SCORES</p>`;
  },
  thrCurves(el) {
    const d = SITE.dense;
    const c = lineChart({
      w: 760, h: 320, x: [.2, .9], y: [0, 1],
      xTicks: [.2, .3, .4, .5, .6, .7, .8, .9], yTicks: [0, .25, .5, .75, 1],
      yFmt: v => pct(v, 0), xFmt: v => v.toFixed(2),
      xLabel: "probability threshold", aria: "precision, recall and share flagged by threshold",
      series: [
        { pts: d.map(r => [r.t, r.rec]), cls: "one" },
        { pts: d.map(r => [r.t, r.prec]), cls: "two" },
        { pts: d.map(r => [r.t, r.share]), cls: "three" }
      ],
      markerId: "thrMarker",
      labels: [
        { x: .26, y: .93, text: "recall found" },
        { x: .63, y: .38, text: "precision", anchor: "start" },
        { x: .42, y: .18, text: "share flagged" }
      ]
    });
    el.innerHTML = `<p class="hlegend" style="margin:0 0 6px">
        <span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="#241133" stroke-width="4"/></svg> recall</span>
        <span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="#ff5d8f" stroke-width="4"/></svg> precision</span>
        <span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="#9b5cff" stroke-width="4" stroke-dasharray="7 5"/></svg> share flagged</span>
      </p>` + c.html;
    chartHosts.thr = c;
    drawThrMarker();
  }
};

function renderAllCharts() {
  Object.keys(renderers).forEach(k => {
    const el = host(k);
    if (el) { const wasIn = el.classList.contains("in"); renderers[k](el); if (wasIn) applyIn(el); }
  });
}
function applyIn(el) {
  el.classList.add("in");
  $$(".hbar[data-w], .fill[data-w]", el).forEach(b => { b.style.width = b.dataset.w + "%"; });
  $$(".bar[data-h]", el).forEach(b => { b.style.height = b.dataset.h + "%"; });
  $$(".draw", el).forEach(p => {
    const len = p.getTotalLength ? p.getTotalLength() : 1200;
    p.style.setProperty("--len", len);
  });
}

renderAllCharts();
$$(".chart").forEach(c => watch(c));
setTimeout(sweep, 300);

/* ══ HERO: guess game ═══════════════════════════════════════ */
const dots = $("#dots");
dots.innerHTML = Array.from({ length: 100 }, (_, i) => `<span class="dot" data-i="${i}"></span>`).join("");
$("#guessBtn").addEventListener("click", () => {
  const on = $$(".dot", dots).filter((d, i) => i % 4 === 3);
  on.forEach((d, i) => setTimeout(() => d.classList.add("on"), i * 35));
  const ans = $("#guessAnswer");
  ans.textContent = "25 of 100. One in four. ★";
  ans.classList.add("win");
  $("#guessBtn").textContent = "That's the project";
  $("#guessBtn").disabled = true;
  $("#guessBtn").style.opacity = ".7";
  blip(740, .12, "triangle");
});

/* ══ duel: reveal scores ════════════════════════════════════ */
$("#duelBtn").addEventListener("click", () => {
  $$(".score").forEach(s => {
    const target = +s.dataset.score;
    s.classList.toggle("hot", target >= 50);
    const num = $(".score-num", s);
    let v = 0;
    const step = () => {
      v += Math.max(1, Math.round(target / 14));
      if (v >= target) { num.textContent = target + "%"; return; }
      num.textContent = v + "%";
      setTimeout(step, 45);
    };
    step();
  });
  $("#duelBtn").textContent = "Both scored ✓";
  $("#duelBtn").disabled = true;
  $("#duelBtn").style.opacity = ".7";
});

/* ══ models: place your bets ════════════════════════════════ */
const betRow = $("#betRow");
betRow.innerHTML = SITE.models.map(m =>
  `<button class="btn btn-ghost" data-name="${esc(m.name)}" data-cursor="BET">${esc(m.name)}</button>`).join("");
betRow.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b || betRow.dataset.done) return;
  betRow.dataset.done = "1";
  $$("#betRow button").forEach(x => {
    x.classList.remove("btn-ghost");
    x.classList.add(x.dataset.name === "Logistic Regression" ? "right" : "wrong");
  });
  b.classList.add("picked");
  $("#betResult").hidden = false;
  const chart = host("models");
  if (chart) { chart.classList.add("in"); applyIn(chart); }
  blip(880, .14, "triangle");
});

/* ══ threshold lab ══════════════════════════════════════════ */
const range = $("#thrRange");
const dense = SITE.dense;
const el = {
  v: $("#thrValue"), share: $("#mShare"), rec: $("#mRec"), prec: $("#mPrec"), f1: $("#mF1"),
  tp: $("#lTP"), fn: $("#lFN"), fp: $("#lFP"), tn: $("#lTN"), verdict: $("#thrVerdict")
};
function rowFor(t) {
  let best = dense[0];
  for (const r of dense) if (Math.abs(r.t - t) < Math.abs(best.t - t)) best = r;
  return best;
}
function drawThrMarker() {
  if (!thrReady || !chartHosts.thr) return;
  const g = document.getElementById("thrMarker");
  if (!g || !document.getElementById("thrRange")) return;
  const t = +range.value / 100;
  const { X, Y } = chartHosts.thr;
  const r = rowFor(+range.value / 100);
  g.innerHTML =
    `<line class="marker" x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(1)}"/>` +
    [[r.rec, "#241133"], [r.prec, "#ff5d8f"], [r.share, "#9b5cff"]]
      .map(p => `<circle class="marker-dot" cx="${X(t)}" cy="${Y(p[0])}" r="7" fill="${p[1]}"/>`).join("");
}
function updateThr() {
  const t = +range.value;
  const r = rowFor(t / 100);
  el.v.textContent = (t / 100).toFixed(2);
  el.share.textContent = pct(r.share, 1);
  el.rec.textContent = pct(r.rec, 1);
  el.prec.textContent = pct(r.prec, 1);
  el.f1.textContent = r.f1.toFixed(3);
  el.tp.textContent = r.tp; el.fn.textContent = r.fn;
  el.fp.textContent = r.fp; el.tn.textContent = r.tn;

  let txt = `Call ${pct(r.share, 1)} of trainees, reach ${pct(r.rec, 1)} of the job hunters, ` +
            `${pct(r.prec, 1)} of calls land.`;
  if (t <= 35) txt += " Very wide net — great coverage, but recruiters drown in false alarms.";
  else if (t === 50) txt += " The default wide net: coverage first, at the cost of 680 wasted calls.";
  else if (t === 60) txt += " The sweet spot for F1 — the best balance of the two errors.";
  else if (t === 70) txt += " Short list: fewer calls, but about half the job hunters slip away.";
  else if (t >= 80) txt += " Tiny list. Very certain, nearly useless for coverage — 3 in 4 hunters missed.";
  else if (t > 50 && t < 70) txt += " A middle setting: trading coverage for call quality.";
  else txt += " More certain calls, fewer hunters found.";
  el.verdict.textContent = txt;

  $$("[data-preset]").forEach(b => b.classList.toggle("on", +b.dataset.preset === t));
  drawThrMarker();
}
range.addEventListener("input", () => { updateThr(); if (+range.value % 5 === 0) blip(440 + +range.value * 3, .04, "sine"); });
$$("[data-preset]").forEach(b => b.addEventListener("click", () => {
  range.value = b.dataset.preset; updateThr(); blip(700, .08);
}));
thrReady = true;
updateThr();

/* ══ confusion matrix notes ═════════════════════════════════ */
const note = $("#matrixNote");
const baseNote = note.textContent;
$$(".mx-cell").forEach(c => {
  c.addEventListener("mouseenter", () => { note.textContent = c.dataset.note; note.style.color = "#fff6e6"; });
  c.addEventListener("mouseleave", () => { note.textContent = baseNote; note.style.color = ""; });
  c.addEventListener("focus", () => { note.textContent = c.dataset.note; });
  c.setAttribute("tabindex", "0");
  const label = c.querySelector("span").textContent;
  c.setAttribute("data-label", label);
  c.querySelector("span").style.display = "";
});

/* ══ data dictionary table ══════════════════════════════════ */
$("#dictBody").innerHTML = SITE.dictionary.map(r => {
  const missVal = parseFloat(r[3]);
  const hot = missVal >= 10 ? " hot" : "";
  return `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td>
    <td class="miss${hot}">${esc(r[3])}</td><td>${esc(r[4])}</td></tr>`;
}).join("");

/* ══ notebook route ═════════════════════════════════════════ */
$("#route").innerHTML = SITE.roadmap.map(s => `
  <li><span class="stop-badge">${s[0]}</span>
    <div class="r-body">
      <div><h3>${esc(s[1])}</h3><p>${esc(s[2])}</p></div>
      <span class="r-tag">${esc(s[3])}</span>
    </div></li>`).join("");
$$("#route li").forEach(li => { li.classList.add("reveal"); watch(li); });

/* ══ viva FAQ ═══════════════════════════════════════════════ */
const TOPICS = [
  ["all", "All 65"], ["business", "Business"], ["data", "Data"], ["prep", "Preparation"],
  ["model", "Modelling"], ["results", "Results"], ["ethics", "Ethics"], ["code", "Code"], ["curve", "Curveballs"]
];
$("#vivaChips").innerHTML = TOPICS.map(([k, l], i) =>
  `<button class="chip-btn ${i === 0 ? "on" : ""}" data-topic="${k}">${l}</button>`).join("");

const faq = $("#faq");
faq.innerHTML = VIVA.map((q, i) => {
  const [topic, curve, question, answer, tip] = q;
  const isCurve = curve === 1;
  return `<article class="qcard" data-topic="${topic}" data-curve="${isCurve ? 1 : 0}" data-i="${i}">
    <div class="q-top">
      <span class="q-topic ${isCurve ? "curve" : ""}">${isCurve ? "★ " : ""}${esc(topic)}</span>
      <span class="q-hint">TAP TO OPEN</span>
    </div>
    <p class="q-text-q">${esc(question)}</p>
    <div class="q-a">${answer}${tip ? `<p class="q-tip">💡 ${tip}</p>` : ""}</div>
  </article>`;
}).join("");
$$(".qcard", faq).forEach(c => { c.classList.add("reveal"); watch(c); });

let topic = "all", allOpen = false;
function applyFilter() {
  $$(".qcard", faq).forEach(c => {
    const match = topic === "all"
      || (topic === "curve" ? c.dataset.curve === "1" : c.dataset.topic === topic);
    c.classList.toggle("hidden", !match);
  });
}
$("#vivaChips").addEventListener("click", e => {
  const b = e.target.closest(".chip-btn"); if (!b) return;
  topic = b.dataset.topic;
  $$(".chip-btn").forEach(x => x.classList.toggle("on", x === b));
  applyFilter(); blip(600, .05);
});
faq.addEventListener("click", e => {
  const c = e.target.closest(".qcard"); if (!c) return;
  c.classList.toggle("open");
});
$("#vivaToggle").addEventListener("click", () => {
  allOpen = !allOpen;
  $$(".qcard", faq).forEach(c => c.classList.toggle("open", allOpen));
  $("#vivaToggle").textContent = allOpen ? "Hide all answers" : "Show all answers";
  $("#vivaToggle").classList.toggle("on", allOpen);
});
$("#vivaRandom").addEventListener("click", () => {
  const visible = $$(".qcard:not(.hidden)", faq);
  const pick = visible[Math.floor(Math.random() * visible.length)];
  $$(".qcard", faq).forEach(c => c.classList.remove("open"));
  pick.classList.add("open");
  pick.scrollIntoView({ behavior: "smooth", block: "center" });
  blip(760, .1, "triangle");
});

/* ══ team names (persisted locally) ═════════════════════════ */
$$(".name-slot").forEach(slot => {
  const key = "g9-" + slot.dataset.key;
  slot.dataset.ph = "Your name";
  const saved = localStorage.getItem(key);
  if (saved) slot.textContent = saved;
  const sync = () => {
    const v = slot.textContent.trim();
    if (v) localStorage.setItem(key, v);
  };
  slot.addEventListener("input", sync);
  slot.addEventListener("blur", () => { if (!slot.textContent.trim()) slot.textContent = ""; sync(); });
  slot.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); slot.blur(); } });
});

/* ══ cursor badge ═══════════════════════════════════════════ */
const badge = $("#cursorBadge");
if (matchMedia("(pointer:fine)").matches) {
  document.addEventListener("mousemove", e => {
    const t = e.target.closest("[data-cursor]");
    if (t) {
      badge.textContent = t.dataset.cursor;
      badge.style.left = e.clientX + "px";
      badge.style.top = e.clientY + "px";
      badge.classList.add("show");
    } else badge.classList.remove("show");
  }, { passive: true });
}

/* first paint for above-the-fold reveal */
requestAnimationFrame(() => $$(".hero .card, .question-box").forEach(el => el.classList.add("in")));
})();
