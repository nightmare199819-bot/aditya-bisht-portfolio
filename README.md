# Aditya Bisht — Portfolio

A responsive personal portfolio shaped around the profile and public posts shared on LinkedIn. It presents three project explorations: Aquire, Chain Chapter, and AgriNova. Voice Pay AI and the tomato UAV research paper are excluded. Descriptions reflect the available profile details; project labels stay neutral where completion status is unknown.

## Design

- Midnight navy `#101426`, royal violet `#34204F`, champagne gold `#C6A76A`, ivory `#E9E4DA`, and slate `#202A3A`.
- Playfair Display headlines with Space Grotesk interface and body text.
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

The page includes manually curated excerpts from two recent profile posts. Edit `data/linkedin.json` to refresh the excerpts or add up to three entries. Use public post links and excerpts you are comfortable displaying. LinkedIn’s member-post read permission (`r_member_social`) is restricted to approved applications, so this site does not scrape LinkedIn or store credentials. See the [LinkedIn Posts API permissions](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api) documentation.

## Accessibility and responsive behavior

The page includes a skip link, visible keyboard focus, semantic page sections, a labeled mobile menu, descriptive image text, and reduced-motion handling. Layout adapts for phones and tablets. Google Fonts have system fallbacks.

