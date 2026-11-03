(() => {
  const root = document.documentElement;
  if (!root.classList.contains("js-hero")) return;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const stories = [...document.querySelectorAll(".story")].map((el) => {
    const panels = [...el.querySelectorAll(".story-panel")];
    el.style.setProperty("--n", panels.length + 0.3);
    const targets = [...document.querySelectorAll(el.dataset.targets || "")];
    const flies = targets.map((t, i) => { const f = document.createElement("figure"); f.className = "story-fly"; f.style.zIndex = 30 + i; const im = new Image(); im.alt = ""; im.src = panels[i] ? panels[i].querySelector("img").src : ""; f.append(im); document.body.append(f); return f; });
    return { el, panels, targets, flies, count: el.querySelector(".story-count"), tag: el.querySelector(".story-tag") };
  });
  const narrow = matchMedia("(max-width: 760px)");
  let ticking = false;
  const update = () => {
    ticking = false;
    if (narrow.matches) return;
    stories.forEach(({ el, panels, count, targets, flies }) => {
      const r = el.getBoundingClientRect();
      const vh = innerHeight, vw = innerWidth, A = r.bottom;
      el.classList.toggle("fly", A < vh - 1);
      flies.forEach((f, i) => {
        const T = targets[i].getBoundingClientRect();
        const D = vh + (T.top - A) - 0.12 * vh;
        const k = clamp((vh - A) / D), e = 1 - Math.pow(1 - k, 3);
        if (k <= 0 || k >= 1) { f.style.display = "none"; return; }
        f.style.display = "block";
        f.style.left = T.left * e + "px"; f.style.top = T.top * e + "px";
        f.style.width = vw + (T.width - vw) * e + "px"; f.style.height = vh + (T.height - vh) * e + "px";
        f.style.borderRadius = 14 * e + "px";
        f.style.opacity = 1 - clamp((k - 0.9) / 0.1);
      });
      if (r.bottom < -50 || r.top > vh + 50) return;
      const total = r.height - innerHeight;
      const p = clamp(-r.top / total);
      const t = p * (panels.length + 0.3) ;
      el.style.setProperty("--p", p.toFixed(3));
      let active = 0;
      panels.forEach((pn, i) => {
        const v = i === 0 ? 1 : clamp(t - i + 0.9);
        pn.style.setProperty("--v", v.toFixed(3));
        pn.style.zIndex = i + 1;
        const d = clamp((t - i - 0.15) * 2.2) * (i === panels.length - 1 ? 1 : clamp(1 - (t - i - 0.85) * 3));
        pn.style.setProperty("--d", ((i === 0 ? clamp(0.25 + t * 2.5) * clamp(1 - (t - 0.85) * 3) : d) * clamp((r.bottom - vh) / (0.3 * vh))).toFixed(3));
        if (v > 0.5) active = i;
        pn.inert = i !== active;
      });
      if (count) count.textContent = String(active + 1).padStart(2, "0") + " / " + String(panels.length).padStart(2, "0");
    });
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  update();
})();
