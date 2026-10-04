/* ============================================================
   GLAMORGAN TOY DRIVE — interactivity
   ============================================================ */

/* ---------- 1. Turn titles into toy blocks ---------- */
const BLOCK_COLORS = [
  "#ff5964","#ff9f43","#ffca3a","#6bd97b",
  "#4ea8ff","#9b7bff","#ff7eb6","#3fd4c4"
];

function buildBlocks(el){
  const text = el.textContent.trim();
  const words = text.split(/\s+/);
  el.setAttribute("aria-label", text);
  el.textContent = "";
  let ci = Math.floor(Math.random() * BLOCK_COLORS.length);
  let letterIndex = 0;
  words.forEach((word, wi) => {
    const w = document.createElement("span");
    w.className = "bl-word";
    [...word].forEach(ch => {
      const b = document.createElement("span");
      b.className = "bl";
      b.setAttribute("aria-hidden", "true");
      b.style.setProperty("--bc", BLOCK_COLORS[ci % BLOCK_COLORS.length]);
      b.style.setProperty("--tilt", ((Math.random() * 8) - 4).toFixed(1) + "deg");
      b.style.setProperty("--letter-index", letterIndex++);
      // The letter tile is pale wood; the painted letter sits inside as a child
      // so the wood shows around it and the colour lives in the letter itself.
      const l = document.createElement("span");
      l.className = "ltr";
      l.textContent = ch;
      b.appendChild(l);
      w.appendChild(b);
      ci += 1 + Math.floor(Math.random() * 2); // vary colors
    });
    el.appendChild(w);
    if (wi < words.length - 1) {
      const sp = document.createElement("span");
      sp.className = "bl-space";
      sp.setAttribute("aria-hidden", "true");
      el.appendChild(sp);
    }
  });
}
document.querySelectorAll("[data-blocks]").forEach(buildBlocks);
document.querySelectorAll(".toy-card").forEach((card, index) => card.style.setProperty("--card-i", index % 4));

/* ---------- 2. Reveal on scroll ---------- */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.18 });
document.querySelectorAll(".reveal").forEach(el => revealIO.observe(el));

/* ---------- 3. Slide tracking: dots, counter, progress ---------- */
const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll(".dots button")];
const bars = [...document.querySelectorAll(".progress span")];
const counterNow = document.getElementById("counterNow");
const counterName = document.getElementById("counterName");

function setActive(i){
  dots.forEach((d, k) => {
    d.classList.toggle("on", k === i);
    if (k === i) d.setAttribute("aria-current", "true");
    else d.removeAttribute("aria-current");
  });
  bars.forEach((b, k) => b.classList.toggle("on", k <= i));
  counterNow.textContent = String(i + 1).padStart(2, "0");
  counterName.textContent = slides[i].dataset.name || "";
}

const slideIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const index = slides.indexOf(e.target);
    setActive(index);
    slides.forEach(slide => slide.classList.remove("is-current"));
    e.target.classList.add("is-current");
  });
}, { threshold: 0, rootMargin: "-45% 0px -45% 0px" });
slides.forEach(s => slideIO.observe(s));
setActive(0);

dots.forEach(d => d.addEventListener("click", () => {
  document.getElementById(d.dataset.target)?.scrollIntoView({ behavior: "smooth" });
}));

/* keyboard: arrow keys move through slides like a presentation */
let navLock = false;
document.addEventListener("keydown", ev => {
  if (navLock || ev.altKey || ev.ctrlKey || ev.metaKey) return;
  if (!["ArrowDown","ArrowUp","PageDown","PageUp"].includes(ev.key)) return;
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  // only hijack when the viewport sits near a slide boundary (feels like slides, never traps scroll)
  const vh = window.innerHeight;
  const atTop = window.scrollY < 40;
  const nearBottom = window.scrollY + vh >= document.body.scrollHeight - 40;
  const forward = ev.key === "ArrowDown" || ev.key === "PageDown";

  const boundaries = slides.map(s => s.offsetTop - 90);
  const y = window.scrollY;
  let targetIdx = -1;
  if (forward) {
    targetIdx = boundaries.findIndex(b => b > y + 10);
  } else if (atTop) {
    return;
  } else {
    for (let i = boundaries.length - 1; i >= 0; i--) {
      if (boundaries[i] < y - 10) { targetIdx = i; break; }
    }
    if (targetIdx < 0) targetIdx = 0;
  }
  if (targetIdx === -1 || targetIdx >= slides.length || (nearBottom && forward)) return;

  ev.preventDefault();
  navLock = true;
  slides[targetIdx].scrollIntoView({ behavior: "smooth" });
  setTimeout(() => navLock = false, 750);
});

/* ---------- 4. Hero toy parallax ---------- */
const hero = document.querySelector(".slide-hero");
const floaters = [...document.querySelectorAll(".hero-toys [data-depth]")];
if (hero && matchMedia("(pointer:fine)").matches) {
  hero.addEventListener("mousemove", ev => {
    const r = hero.getBoundingClientRect();
    const dx = (ev.clientX - r.left) / r.width - 0.5;
    const dy = (ev.clientY - r.top) / r.height - 0.5;
    floaters.forEach(f => {
      const d = +f.dataset.depth || 10;
      f.style.translate = `${-dx * d}px ${-dy * d}px`;
    });
  });
  hero.addEventListener("mouseleave", () => {
    floaters.forEach(f => f.style.translate = "0 0");
  });
}

/* ---------- 5. BRING A TOY: toy drop + confetti + pledge ---------- */
const TOY_PHOTOS = [
  "assets/toy-hot-wheels.jpg","assets/toy-lego-bricks.jpg",
  "assets/toy-star-wars-figure.jpg","assets/toy-action-figures.jpg",
  "assets/toy-plush-bears.jpg",
  "assets/toy-train.jpg","assets/toy-balls.jpg",
  "assets/toy-puzzle.jpg","assets/toy-board-game.jpg"
];
const COLORS = ["#ff5964","#ffca3a","#6bd97b","#4ea8ff","#9b7bff","#ff7eb6","#ff9f43"];
const bringBtn = document.getElementById("bringBtn");
const pledgeEl = document.getElementById("pledgeCount");

let pledges = 0;
try { pledges = +(localStorage.getItem("gtb-pledges") || 0); } catch (e) {}
function renderPledge(){
  pledgeEl.textContent = `${pledges} toy${pledges === 1 ? "" : "s"} pledged by visitors so far`;
}
renderPledge();

function confettiBurst(x, y, n = 26){
  for (let i = 0; i < n; i++) {
    const c = document.createElement("i");
    c.className = "confetti";
    c.style.left = x + (Math.random() * 160 - 80) + "px";
    c.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    c.style.animationDuration = (1.6 + Math.random() * 1.4) + "s";
    c.style.animationDelay = (Math.random() * 0.25) + "s";
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    if (Math.random() > 0.5) c.style.borderRadius = "50%";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3400);
  }
}

bringBtn?.addEventListener("click", () => {
  const rect = bringBtn.getBoundingClientRect();
  const bin = document.getElementById("finalBin")?.getBoundingClientRect();

  // fly a toy from the button into the bin
  const t = document.createElement("img");
  t.className = "fly-toy";
  t.alt = "";
  t.src = TOY_PHOTOS[Math.floor(Math.random() * TOY_PHOTOS.length)];
  t.style.left = rect.left + rect.width / 2 - 32 + "px";
  t.style.top = rect.top - 10 + "px";
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (bin) {
      const dx = (bin.left + bin.width / 2) - (rect.left + rect.width / 2);
      const dy = (bin.top + 60) - rect.top;
      t.style.transform = `translate(${dx}px, ${dy}px) scale(.35) rotate(${Math.random() * 540 - 270}deg)`;
    } else {
      t.style.transform = "translateY(140px) scale(.4)";
    }
    t.style.opacity = "0";
  }));
  setTimeout(() => t.remove(), 1100);

  confettiBurst(rect.left + rect.width / 2, rect.top);
  pledges++;
  try { localStorage.setItem("gtb-pledges", pledges); } catch (e) {}
  renderPledge();
});

/* ---------- 6. reveal project bug-report contact ---------- */
const reportBugBtn = document.getElementById("reportBugBtn");
const bugReportContact = document.getElementById("bugReportContact");
reportBugBtn?.addEventListener("click", () => {
  const isExpanded = reportBugBtn.getAttribute("aria-expanded") === "true";
  reportBugBtn.setAttribute("aria-expanded", String(!isExpanded));
  bugReportContact.hidden = isExpanded;
});

/* ---------- 7. back to top ---------- */
document.getElementById("toTop")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
