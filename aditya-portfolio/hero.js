(() => {
  if (!document.documentElement.classList.contains("js-hero")) return;
  const stage = document.querySelector(".hero-stage");
  const sticky = document.querySelector(".hero-sticky");
  const photo = document.querySelector(".hero-photo");
  const card = document.querySelector(".portrait-card");
  const copy = document.querySelector(".hero-copy");
  if (!stage || !sticky || !photo || !card) return;

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const pinned = matchMedia("(min-width: 681px) and (min-height: 700px)");
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const p = clamp(scrollY / (vh * (pinned.matches ? 0.75 : 0.8)));
    const e = ease(p);
    const s = sticky.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    photo.style.left = `${lerp(0, c.left - s.left, e)}px`;
    photo.style.top = `${lerp(0, c.top - s.top, e)}px`;
    photo.style.width = `${lerp(s.width, c.width, e)}px`;
    photo.style.height = `${lerp(vh, c.height, e)}px`;
    stage.style.setProperty("--scrim", String(lerp(1, 0.3, e)));
    stage.style.setProperty("--cap", String(clamp(1 - p * 3)));
    stage.style.setProperty("--copy", String(clamp((p - 0.3) / 0.45)));
    stage.style.setProperty("--card", String(clamp((p - 0.62) / 0.38)));
    if (copy) copy.inert = p < 0.3; // keep hidden links out of the tab order
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
  addEventListener("load", update);
  pinned.addEventListener?.("change", update);
  update();

  // "#top" would land mid-animation; go to the true top instead
  document.querySelectorAll('a[href="#top"]').forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); })
  );
})();
