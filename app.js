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

function renderLeetCode(data) {
  if (!data.stats) return;
  const fields = [["total", "totalSolved"], ["easy", "easySolved"], ["medium", "mediumSolved"], ["hard", "hardSolved"]];
  fields.forEach(([id, key]) => { $("#" + id).textContent = data.stats[key] ?? "—"; });
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

Promise.all([
  fetch("data/linkedin.json").then((response) => response.ok ? response.json() : null).catch(() => null),
  fetch("data/leetcode.json").then((response) => response.ok ? response.json() : null).catch(() => null),
]).then(([linkedin, leetcode]) => {
  if (linkedin) renderLinkedIn(linkedin);
  if (leetcode) renderLeetCode(leetcode);
});



const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  const revealItems = [
    ...document.querySelectorAll(".section-heading"),
    ...document.querySelectorAll(".project-card"),
    ...document.querySelectorAll(".about-monogram, .about-copy, .focus-card, .activity-panel"),
    ...document.querySelectorAll(".contact-section .eyebrow, .contact-section h2, .contact-section .button"),
  ];
  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    if (item.matches(".project-card")) {
      item.dataset.reveal = "zoom";
      const cardIndex = [...item.parentElement.children].indexOf(item);
      item.style.transitionDelay = `${cardIndex * 130}ms`;
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

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
  });
});
