# Aditya Bisht: Portfolio

Static portfolio site (HTML, CSS, vanilla JS) with a tiny Node server for local preview. No build step.

## Run locally
```
node server.js
```
Open http://localhost:3000 (use `PORT=4000 node server.js` if 3000 is busy).

## Design
- Palette: near-black `#080A09`, emerald `#00C878`, mint `#7DF5C4`, warm gold `#E2C57E` (small details), ivory text.
- Type: Fraunces (headings), Inter (reading), JetBrains Mono (labels, numbers), loaded from Google Fonts with system fallbacks.
- Hero: full-screen photo that shrinks into the right-hand frame on scroll (`hero.js`).
- Motion: headline word reveal, About portrait aperture reveal, project screenshot hover-pan and tilt (`pro.js`), scroll progress and section highlight (`polish.js`).

## File layers (loaded in this order)
`styles.css` base, `theme.css` palette, `polish.css` UI fixes, `hero.css` scroll hero, `gold.css` gold accents, `pro.css` type and components.
Scripts: `app.js` data and base effects, `polish.js` navigation UX, `hero.js` scroll hero, `pro.js` motion, `story.js` pinned full-screen scroll stories (with `story.css`).

## Images
Story panels 1-2 are real screenshots (`assets/story/aquire.jpg`, `devtrack.jpg`). Project boxes and Skills/Learning panels are illustrations rendered from content, not real screenshots.

## Live data
- LeetCode: `data/leetcode.json`, refreshed daily by a GitHub Actions workflow (`.github/workflows/refresh-profile.yml`) using LeetCode's public GraphQL endpoint. `app.js` fetches the JSON and renders it.
- LinkedIn: `data/linkedin.json` is curated by hand. LinkedIn does not allow automatic access to personal posts without approved API permissions.

## Profile photo
Hero uses `assets/aditya.jpg`; About uses `assets/aditya-portrait.jpg` (a portrait crop of the same photo).
