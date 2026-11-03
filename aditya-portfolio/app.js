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
    navigation.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
  });
});

$("#year").textContent = new Date().getFullYear();
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ==========================================================
   Smooth Eased Number Counter Animation
   ========================================================== */
function animateCount(element, target, duration = 1200) {
  if (!element || target <= 0) {
    if (element) element.textContent = target;
    return;
  }
  if (reduceMotion) {
    element.textContent = target;
    return;
  }

  const startTime = performance.now();
  const easeOutQuad = (t) => t * (2 - t);

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(target * easeOutQuad(progress));
    element.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = target;
    }
  }
  requestAnimationFrame(step);
}

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
      item.append(number, document.createTextNode(area));
      return item;
    }));
  }
}

function renderLinkedIn(data) {
  if (!data) return;
  renderAbout(data.about);
  if (!Array.isArray(data.posts) || data.posts.length === 0) return;
  const feed = $("#linkedin-feed");
  feed.replaceChildren(...data.posts.slice(0, 3).map((post) => {
    const article = document.createElement("article");
    article.className = "feed-item";
    const anchor = document.createElement("a");
    anchor.href = post.url || "https://www.linkedin.com/in/aditya-bisht-b3a12036b";
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.textContent = post.text || post.title || "View LinkedIn post";
    const time = document.createElement("time");
    if (post.date) time.dateTime = post.date;
    time.textContent = formatDate(post.date);
    article.append(anchor, time);
    return article;
  }));
  $("#linkedin-source").textContent = data.updatedAt ? `CURATED FROM LINKEDIN · UPDATED ${formatDate(data.updatedAt).toUpperCase()}` : "CURATED FROM LINKEDIN";
}

let pendingLeetCodeStats = null;

function renderLeetCode(data) {
  if (!data.stats) return;
  pendingLeetCodeStats = data;

  const total = Number(data.stats.totalSolved) || 0;
  const easy = Number(data.stats.easySolved) || 0;
  const medium = Number(data.stats.mediumSolved) || 0;
  const hard = Number(data.stats.hardSolved) || 0;
  const categoryTotal = (easy + medium + hard) || total;

  if (categoryTotal > 0) {
    const easyPct = (easy / categoryTotal) * 100;
    const mediumPct = (medium / categoryTotal) * 100;
    const hardPct = (hard / categoryTotal) * 100;
    const barEasy = $("#bar-easy");
    const barMedium = $("#bar-medium");
    const barHard = $("#bar-hard");

    if (barEasy) barEasy.title = `Easy: ${easy} (${easyPct.toFixed(1)}%)`;
    if (barMedium) barMedium.title = `Medium: ${medium} (${mediumPct.toFixed(1)}%)`;
    if (barHard) barHard.title = `Hard: ${hard} (${hardPct.toFixed(1)}%)`;

    const meter = $("#leetcode-meter");
    if (meter) {
      meter.setAttribute("aria-valuenow", String(total));
      meter.setAttribute(
        "aria-valuetext",
        `${easy} Easy (${easyPct.toFixed(0)}%), ${medium} Medium (${mediumPct.toFixed(0)}%), ${hard} Hard (${hardPct.toFixed(0)}%)`
      );
    }

    // Trigger bar fill animation
    const animateBars = () => {
      if (barEasy) barEasy.style.width = `${easyPct}%`;
      if (barMedium) barMedium.style.width = `${mediumPct}%`;
      if (barHard) barHard.style.width = `${hardPct}%`;
    };

    if (reduceMotion) {
      animateBars();
    } else {
      setTimeout(animateBars, 250);
    }
  }

  // Trigger stat count animations
  const statsPanel = document.querySelector('[aria-labelledby="leetcode-title"]');
  const triggerCounts = () => {
    animateCount($("#total"), total, 1100);
    animateCount($("#easy"), easy, 1000);
    animateCount($("#medium"), medium, 1200);
    animateCount($("#hard"), hard, 800);
  };

  if ("IntersectionObserver" in window && statsPanel && !reduceMotion) {
    let triggered = false;
    const statsObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        triggerCounts();
        statsObserver.disconnect();
      }
    }, { threshold: 0.25 });
    statsObserver.observe(statsPanel);
  } else {
    triggerCounts();
  }

  if (Array.isArray(data.recent) && data.recent.length) {
    const feed = $("#leetcode-feed");
    feed.replaceChildren(...data.recent.slice(0, 3).map((submission) => {
      const article = document.createElement("article");
      article.className = "feed-item";
      const anchor = document.createElement("a");
      anchor.href = submission.url || "https://leetcode.com/u/aditya__bisht/";
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.textContent = submission.title || "Accepted problem";
      const meta = document.createElement("span");
      meta.className = "feed-meta";
      meta.textContent = [submission.status || "Accepted", formatDate(submission.date)].filter(Boolean).join(" · ");
      article.append(anchor, meta);
      return article;
    }));
  }
  const updated = data.updatedAt ? formatDate(data.updatedAt).toUpperCase() : "DATE NOT RECORDED";
  $("#leetcode-source").textContent = `${data.source === "live" ? "PUBLIC PROFILE · UPDATED" : "MANUAL DATA · UPDATED"} ${updated}`;
}

// Data lives in ./data (local) or ../data (when the site sits in the aditya-portfolio/ folder on GitHub Pages)
const fetchData = (name) => fetch("data/" + name).then((r) => r.ok ? r.json() : Promise.reject()).catch(() => fetch("../data/" + name).then((r) => r.ok ? r.json() : null)).catch(() => null);
Promise.all([
  fetchData("linkedin.json"),
  fetchData("leetcode.json"),
]).then(([linkedin, leetcode]) => {
  if (linkedin) renderLinkedIn(linkedin);
  if (leetcode) renderLeetCode(leetcode);
});

/* ==========================================================
   Scroll Reveal Observer
   ========================================================== */
if (!reduceMotion && "IntersectionObserver" in window) {
  const revealItems = [
    ...document.querySelectorAll(".section-heading"),
    ...document.querySelectorAll(".project-card"),
    ...document.querySelectorAll(".skill-category"),
    ...document.querySelectorAll(".about-monogram, .about-copy, .focus-card, .activity-panel"),
    ...document.querySelectorAll(".contact-section .eyebrow, .contact-section h2, .contact-section .button"),
  ];
  revealItems.forEach((item) => {
    item.classList.add("reveal");
    if (item.matches(".project-card, .skill-category")) {
      item.dataset.reveal = "zoom";
      const cardIndex = [...item.parentElement.children].indexOf(item);
      item.style.transitionDelay = `${cardIndex * 110}ms`;
    } else if (item.matches(".about-monogram, .activity-panel:nth-child(odd), .section-heading")) {
      item.dataset.reveal = "from-left";
    } else if (item.matches(".about-copy, .activity-panel:nth-child(even)")) {
      item.dataset.reveal = "from-right";
    } else {
      item.dataset.reveal = "zoom";
    }
  });

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        entry.target.addEventListener("transitionend", () => {
          entry.target.style.willChange = "auto";
        }, { once: true });
        activeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  revealItems.forEach((item) => observer.observe(item));
}

/* ==========================================================
   Cursor Spotlight Tracking for All Interactive Cards
   ========================================================== */
document.querySelectorAll(".project-card, .skill-category, .activity-panel").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
  });
});

/* ==========================================================
   Ambient Neural / Network Mesh Canvas (Hero Background)
   ========================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const hero = document.getElementById("top");
  if (!hero) return;

  let width = (canvas.width = hero.clientWidth);
  let height = (canvas.height = hero.clientHeight);

  const nodeCount = Math.min(Math.max(Math.floor((width * height) / 22000), 24), 48);
  const nodes = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.6 + 1.2,
      baseAlpha: Math.random() * 0.35 + 0.25,
    });
  }

  const mouse = { x: -1000, y: -1000, radius: 150 };

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener("pointerleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  let isHeroVisible = true;
  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      isHeroVisible = entry.isIntersecting;
      if (isHeroVisible) requestAnimationFrame(draw);
    }, { threshold: 0.05 });
    heroObserver.observe(hero);
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = hero.clientWidth;
      height = canvas.height = hero.clientHeight;
    }, 150);
  });

  function draw() {
    if (!isHeroVisible) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0) node.x = width;
      else if (node.x > width) node.x = 0;
      if (node.y < 0) node.y = height;
      else if (node.y > height) node.y = 0;

      // Mouse interactive deflection
      const dxm = mouse.x - node.x;
      const dym = mouse.y - node.y;
      const distMouse = Math.sqrt(dxm * dxm + dym * dym);
      if (distMouse < mouse.radius && distMouse > 0) {
        const force = (1 - distMouse / mouse.radius) * 0.75;
        node.x -= (dxm / distMouse) * force;
        node.y -= (dym / distMouse) * force;
      }

      // Draw node point
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 200, 120, ${node.baseAlpha})`;
      ctx.fill();

      // Connect lines to nearby nodes
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 125;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(125, 245, 196, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// Initialize ambient background when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAmbientCanvas);
} else {
  initAmbientCanvas();
}
