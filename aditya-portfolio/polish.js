(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const btn = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");

  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  const top = document.createElement("button");
  top.type = "button";
  top.className = "to-top";
  top.setAttribute("aria-label", "Back to top");
  top.textContent = "↑";
  document.body.append(bar, top);
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    header?.classList.toggle("is-scrolled", y > 8);
    top.classList.toggle("is-shown", y > innerHeight * 0.8);
    const mark = y + innerHeight * 0.35;
    let current = null;
    sections.forEach((s) => { if (s.offsetTop <= mark) current = s.id; });
    links.forEach((a) => {
      if (current && a.getAttribute("href") === `#${current}`) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update);
  update();

  // Mobile menu: close on Escape or outside tap
  const closeMenu = () => {
    nav?.classList.remove("is-open");
    btn?.setAttribute("aria-expanded", "false");
    btn?.setAttribute("aria-label", "Open navigation");
  };
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav?.classList.contains("is-open")) { closeMenu(); btn?.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (nav?.classList.contains("is-open") && !nav.contains(e.target) && !btn?.contains(e.target)) closeMenu();
  });

  // Whole project card is clickable (links stay the accessible target)
  document.querySelectorAll(".project-card").forEach((card) => {
    const link = card.querySelector("h3 a");
    if (!link) return;
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      window.open(link.href, "_blank", "noopener");
    });
  });
})();
