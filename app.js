const $ = (selector) => document.querySelector(selector);
const menuButton = $(".menu-toggle");
const navigation = $("#site-nav");

menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(expanded));
  menuButton.setAttribute("aria-label", expanded ? "Close navigation" : "Open navigation");
  navigation?.classList.toggle("is-open", expanded);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
  });
});

const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

function renderAbout(about) {
  if (!about) return;
  const primary = $("#about-summary-primary");
  const secondary = $("#about-summary-secondary");
  if (primary && about.paragraphs?.[0]) primary.textContent = about.paragraphs[0];
  if (secondary && about.paragraphs?.[1]) secondary.textContent = about.paragraphs[1];
  const list = $("#linkedin-learning-areas");
  if (list && Array.isArray(about.learningAreas)) {
    list.replaceChildren(...about.learningAreas.map((area, index) => {
      const item = document.createElement("li");
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      item.append(number, document.createTextNode(String(area)));
      return item;
    }));
  }
}

function renderLinkedIn(data) {
  if (!data) return;
  renderAbout(data.about);
  if (!Array.isArray(data.posts) || data.posts.length === 0) return;
  const feed = $("#linkedin-feed");
  if (!feed) return;
  feed.replaceChildren(...data.posts.slice(0, 3).map((post) => {
    const article = document.createElement("article");
    article.className = "feed-item";
    const anchor = document.createElement("a");
    const fallback = "https://www.linkedin.com/in/aditya-bisht-b3a12036b";
    let href = fallback;
    try {
      const parsed = new URL(post.url || fallback);
      if (parsed.protocol === "https:" && (parsed.hostname === "www.linkedin.com" || parsed.hostname === "linkedin.com")) href = parsed.href;
    } catch {}
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = String(post.text || post.title || "View LinkedIn post");
    const time = document.createElement("time");
    if (post.date) time.dateTime = String(post.date);
    time.textContent = formatDate(post.date);
    article.append(anchor, time);
    return article;
  }));
  const source = $("#linkedin-source");
  if (source) source.textContent = data.updatedAt ? `CURATED FROM LINKEDIN · UPDATED ${formatDate(data.updatedAt).toUpperCase()}` : "CURATED FROM LINKEDIN";
}

function renderLeetCode(data) {
  if (!data || !data.stats) return;
  const fields = [["total", "totalSolved"], ["easy", "easySolved"], ["medium", "mediumSolved"], ["hard", "hardSolved"]];
  fields.forEach(([id, key]) => {
    const node = $("#" + id);
    if (node) node.textContent = String(data.stats[key] ?? "—");
  });
  if (Array.isArray(data.recent) && data.recent.length) {
    const feed = $("#leetcode-feed");
    if (feed) feed.replaceChildren(...data.recent.slice(0, 3).map((submission) => {
      const article = document.createElement("article");
      article.className = "feed-item";
      const anchor = document.createElement("a");
      const fallback = "https://leetcode.com/u/aditya__bisht/";
      let href = fallback;
      try {
        const parsed = new URL(submission.url || fallback);
        if (parsed.protocol === "https:" && parsed.hostname === "leetcode.com") href = parsed.href;
      } catch { /* Keep the safe profile fallback. */ }
      anchor.href = href;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = String(submission.title || "Accepted problem");
      const meta = document.createElement("span");
      meta.className = "feed-meta";
      meta.textContent = [submission.status || "Accepted", formatDate(submission.date)].filter(Boolean).join(" · ");
      article.append(anchor, meta);
      return article;
    }));
  }
  const source = $("#leetcode-source");
  if (source) {
    const updated = data.updatedAt ? formatDate(data.updatedAt).toUpperCase() : "DATE NOT RECORDED";
    source.textContent = `${data.source === "live" ? "PUBLIC PROFILE · UPDATED" : "MANUAL DATA · UPDATED"} ${updated}`;
  }
}

Promise.all([
  fetch("data/linkedin.json").then((response) => response.ok ? response.json() : null).catch(() => null),
  fetch("data/leetcode.json").then((response) => response.ok ? response.json() : null).catch(() => null),
]).then(([linkedin, leetcode]) => {
  if (linkedin) renderLinkedIn(linkedin);
  if (leetcode) renderLeetCode(leetcode);
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canUseGsap = !reduceMotion && window.gsap && window.ScrollTrigger;

if (canUseGsap) {
  gsap.registerPlugin(ScrollTrigger);

  const heroItems = document.querySelectorAll(".hero-copy .eyebrow, .hero-copy h1, .hero-copy .hero-intro, .hero-copy .hero-tags, .hero-copy .hero-actions, .hero-copy .hero-foot");
  gsap.from(heroItems, {
    autoAlpha: 0,
    y: 24,
    duration: 0.8,
    stagger: 0.09,
    ease: "power3.out",
    delay: 0.12,
  });
  gsap.from(".portrait-card", {
    autoAlpha: 0,
    y: 28,
    scale: 0.97,
    duration: 1.1,
    ease: "power3.out",
    delay: 0.28,
  });

  const revealItems = document.querySelectorAll(
    ".section-heading, .project-card, .about-monogram, .about-copy, .focus-card, .activity-panel, .contact-section .eyebrow, .contact-section h2, .contact-section .contact-copy, .contact-section .button"
  );
  revealItems.forEach((item, index) => {
    gsap.fromTo(item,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        delay: item.matches(".project-card") ? (index % 4) * 0.08 : 0,
        ease: "power3.out",
        scrollTrigger: { trigger: item, start: "top 88%", once: true },
      }
    );
  });

  const scene = $(".portrait-card");
  const core = $(".portrait-core");
  const rings = document.querySelectorAll(".portrait-ring");
  if (scene && core && window.matchMedia("(pointer: fine)").matches) {
    scene.addEventListener("pointermove", (event) => {
      const bounds = scene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      scene.style.setProperty("--pointer-x", `${x * 100}%`);
      scene.style.setProperty("--pointer-y", `${y * 100}%`);
      gsap.to(scene, {
        rotateY: (x - 0.5) * 8,
        rotateX: (0.5 - y) * 6,
        duration: 0.55,
        ease: "power3.out",
        transformPerspective: 1100,
        overwrite: true,
      });
      gsap.to(core, {
        rotateY: (x - 0.5) * 12,
        rotateX: (0.5 - y) * 9,
        z: 18,
        duration: 0.65,
        ease: "power3.out",
        overwrite: true,
      });
      rings.forEach((ring, index) => gsap.to(ring, {
        x: (x - 0.5) * (index ? -12 : 12),
        y: (y - 0.5) * (index ? -9 : 9),
        duration: 0.8,
        ease: "power3.out",
        overwrite: true,
      }));
    });
    scene.addEventListener("pointerleave", () => {
      scene.style.setProperty("--pointer-x", "52%");
      scene.style.setProperty("--pointer-y", "42%");
      gsap.to([scene, core, ...rings], {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        z: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.55)",
        overwrite: true,
      });
    });
  }
} else if (!reduceMotion && "IntersectionObserver" in window) {
  const revealItems = [
    ...document.querySelectorAll(".section-heading"),
    ...document.querySelectorAll(".project-card"),
    ...document.querySelectorAll(".about-monogram, .about-copy, .focus-card, .activity-panel"),
    ...document.querySelectorAll(".contact-section .eyebrow, .contact-section h2, .contact-section .contact-copy, .contact-section .button"),
  ];
  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    if (item.matches(".project-card")) item.style.setProperty("--delay", `${(index % 4) * 75}ms`);
  });
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -7% 0px" });
  revealItems.forEach((item) => observer.observe(item));
}
