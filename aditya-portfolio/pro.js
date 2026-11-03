(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v) => Math.min(1, Math.max(0, v));

  // 1. Headline word-mask reveal: each word rises out of a clip as the heading enters view
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.4 });
    document.querySelectorAll(".section-heading h2, .about-copy h2, .contact-section h2").forEach((h) => {
      let i = 0;
      const wrap = (node) => {
        const w = document.createElement("span"); w.className = "w";
        const inner = document.createElement("span"); inner.className = "wi";
        inner.style.setProperty("--i", String(i++));
        inner.append(node); w.append(inner); return w;
      };
      const out = [];
      Array.from(h.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            out.push(/^\s+$/.test(t) ? document.createTextNode(" ") : wrap(document.createTextNode(t)));
          });
        } else if (n.nodeName === "BR") out.push(n);
        else out.push(wrap(n));
      });
      h.replaceChildren(...out);
      h.classList.add("split");
      io.observe(h);
    });
  }

  // 2. About portrait: aperture opens and colour returns as it scrolls into view
  const photo = document.querySelector(".about-photo");
  if (photo && !reduce) {
    let ticking = false;
    const tick = () => {
      ticking = false;
      const r = photo.getBoundingClientRect();
      photo.style.setProperty("--p", clamp((innerHeight * 0.95 - r.top) / (innerHeight * 0.6)).toFixed(3));
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    tick();
  }

  // 3. Project screenshots tilt toward the pointer (fine pointers only)
  if (!reduce && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".project-shot").forEach((s) => {
      s.addEventListener("pointermove", (e) => {
        const b = s.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - 0.5;
        const y = (e.clientY - b.top) / b.height - 0.5;
        s.style.setProperty("--ry", (x * 7).toFixed(2) + "deg");
        s.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg");
      });
      s.addEventListener("pointerleave", () => {
        s.style.setProperty("--rx", "0deg");
        s.style.setProperty("--ry", "0deg");
      });
    });
  }
})();
