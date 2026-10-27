# Aditya Bisht — Portfolio

A responsive personal portfolio shaped around the profile and public posts shared on LinkedIn. It presents four selected projects: Aquire, Chain Chapter, AgriNova, and DevTrack AI. DevTrack AI links to its live site. Voice Pay AI and the tomato UAV research paper are excluded. Descriptions reflect the available profile details; project labels stay neutral where completion status is unknown.

## Design

- Midnight navy `#101426`, royal violet `#34204F`, champagne gold `#C6A76A`, ivory `#E9E4DA`, and slate `#202A3A`.
- Sora headings with DM Sans interface and body text, using larger type for comfortable reading.
- AB monogram profile placeholder, responsive mobile navigation, keyboard focus styles, semantic landmarks, and reduced-motion support.

## Run and publish

Serve this folder from a static HTTP server so the JSON data files can load. The site has no build step. Enable GitHub Pages for the `main` branch and repository root to publish.

## Replace the profile image

The hero uses `assets/profile-placeholder.svg`. Add a portrait image under `assets/`, then update its `src` and descriptive `alt` text in `index.html`. A square image fits the frame best.

## Data updates

### LeetCode

`.github/workflows/refresh-profile.yml` refreshes the public profile daily at **04:23 UTC (09:53 India time)** and supports a manual run from **Actions → Refresh public LeetCode data → Run workflow**. The default username is `aditya__bisht`; change `LEETCODE_USERNAME` in the workflow if the profile changes. It updates accepted-problem counts and up to five recent accepted problems in `data/leetcode.json`.

LeetCode does not publish a supported developer API for this data. The workflow uses its publicly reachable but undocumented GraphQL endpoint. It sends no session cookies or credentials. The endpoint can change, rate-limit, or block scheduled requests. When refresh fails, the script leaves the existing data untouched and the Actions run reports the failure.

For scheduled commits to work, enable **Settings → Actions → General → Workflow permissions → Read and write permissions**. The workflow requests only `contents: write`. GitHub may delay scheduled runs; use the manual trigger for an immediate refresh.

### LinkedIn

The current About summary and learning areas are synthesized from the curated post takeaways in `data/linkedin.json`. The page renders those fields automatically whenever the JSON changes. Add or revise posts, then update the `about.paragraphs` and `about.learningAreas` fields to keep the summary grounded in the latest learning.\n\nLinkedIn does not provide this site with automatic access to personal posts: its Posts API requires the restricted `r_member_social` permission, which is available only to approved applications. Until that access is configured, new posts must be added to the curated data file. The site does not scrape LinkedIn or store credentials. See the [LinkedIn Posts API permissions](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api) documentation.

## Motion and visual treatment

The visual system uses animated orbital linework, moving project illustrations, directional and staggered scroll reveals, and warm hover lighting. Type and contrast are sized for easier reading. Scroll reveals only activate when JavaScript, `IntersectionObserver`, and the visitor’s motion preference allow them. The `prefers-reduced-motion` setting disables decorative animation and reveals content immediately.

## Accessibility and responsive behavior

The page includes a skip link, visible keyboard focus, semantic page sections, a labeled mobile menu, descriptive image text, and reduced-motion handling. Layout adapts for phones and tablets. Google Fonts have system fallbacks.

