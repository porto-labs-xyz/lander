# FREQ stealth landing page provenance

## Current stealth direction, 29 October 2026

The founder requested a sleek, minimal, premium landing page that hints at an AI creative and compute system without disclosing features, architecture or commercial positioning. This direction supersedes the October homepage requirements below for the current public page. The previous implementation is preserved at `entropy-acs/landing-before-freq-stealth-2026-10-29` (baseline `b3df6f0`). The refreshed working branch is `entropy-acs/freq-stealth-landing`.

Headline: “A new frequency for imagination.” Supporting copy: “We’re building a new kind of creative system. Where AI, imagination and personal computing meet.” These describe work in progress. They do not claim production capabilities, availability, a release date or hardware performance.

## Branding and conversion sources

- FREQ design system draft 0.2.0, `freq-design-system/README.md`, `freq.css` and `DECK-REFERENCE.md`: near-black #0B0B0D, paper #F4F2ED, lime #C8FF4D, Space Grotesk display/body and IBM Plex Mono labels.
- Existing public FREQ deck handoff: `assets/hero.png` copied unchanged to `static/images/freq/chrome.png`. It is decorative brand artwork, not a hardware or product render. The same image replaces the old product screenshot in social metadata.
- The handoff's local Space Grotesk and IBM Plex Mono fonts are retained with their original licence notice in `static/fonts/`.
- Porto's released corporate design system remains a separate reference. FREQ carries “by Porto Labs”; this page does not redefine the corporate identity.
- The existing Formspree form destination is retained, with native email validation, submitting, success, failure and timeout states. A normal form action remains available without JavaScript. Joining consents to FREQ updates from Porto Labs.
- `/book/` retains the existing Google Calendar appointment embed and direct fallback link. Its surrounding shell now uses FREQ branding.
- Public contact and Porto X links are retained. Prototype links, financial details, team biographies and product screenshots are omitted from the stealth homepage.

## Retained narrative and evidence boundary

“Co-create”, artist permission and source attribution remain useful narrative history. Preserve the following October mapping and archived assets for future work; they do not establish the current launch offer. The newer stealth direction does not amend the canonical whitepaper or protocol proposals. Local preview and controlled signup checks do not establish real mailing-list delivery or a completed appointment. No deployment is part of this change.

---

## Historical October homepage sources

# Landing page content sources

Reviewed 12 October 2026 against the founder's latest 15-page October Porto product presentation. Only public product concepts and selected concept graphics are included. The private deck, financial raise page and fundraising details are not published in this repository.

## Page and asset mapping

| Homepage content | October presentation page | Public asset / treatment |
| --- | --- | --- |
| Streaming + music generation | 1 | Accessible hero supporting copy |
| Co-create | Founder instruction, 12 October 2026 | Main slogan and social preview |
| Press play; familiar streaming | 3 | `static/images/october/listening.webp` |
| Voice/text requests; Same song. Your version. | 4 | `static/images/october/voice.webp` |
| User Variation Tracks; creator discovery and sharing | 5 | `static/images/october/creators.webp` |
| Stream, share, earn; illustrative royalty allocation | 6 | `static/images/october/ledger.webp` and HTML steps |
| What, who, how, when; daily Aptos/USDC payout target | 7 | Responsive HTML payout record |
| 10% / 30% Porto fees; 90% / 70% rights pools; proposed £10 cap | 8 | Accessible HTML figures and bars, with proposal qualifications |
| London first; prototype, pilot, expansion | 10–11 | HTML milestones |
| Co-founders and relevant experience | 12 | Existing approved portraits and updated roles |
| Amplify your catalogue; contact; AltaLab cohort | 15 | HTML artist invitation and signup |

The three app frames are extracted from page coordinates `(340, 98, 923, 463)` in a 960 × 540 presentation. The Ledger table uses `(53, 314, 649, 451)`. Renders are 2.5×, encoded as WebP. They contain fictional concept content and no fundraising information. The original-record image has not been used to imply a working financial service.

`porto-co-create-1200x630.png` is a new social preview composed from the listening screen, approved Porto mark and current headline. The old competitor-comparison social graphic is no longer referenced.

## Evidence boundaries

### Archived hero P cutout

The founder subsequently removed the standalone P above Co-create on 12 October 2026. The hero no longer references this asset. The retained `static/images/porto-mark-transparent.webp` was derived from the existing `porto-mark-dark-branded.webp` using the built-in image editing tool with transparent output. The RGBA output was resized to 432 × 432 and encoded as lossless WebP with its alpha preserved. The header and footer retain their existing artwork.

Final image-edit prompt:

> Use case: background-extraction. Edit target: the supplied Porto P brand mark. Remove ONLY the near-black background, including the background visible through the enclosed counter of the P. Deliver a genuine transparent RGBA PNG. Preserve the exact existing P silhouette, its paper-white pencil texture, coral-red left edge and round coral detail, subtle charcoal outlines, proportions, position and scale within the square canvas. This is a precise logo cutout, not a redesign or recreation. Keep all original foreground artwork intact, including the rough drawn edge. No added shadow, glow, background, text or other elements. The transparent result must work over a warm charcoal website without any rectangular halo.

### Product claims

- Current prototype URL supplied by the founder: https://porto-prototype.vercel.app/.
- Product concepts are labelled separately from currently available prototype interactions.
- Permissions, full music generation and production catalogue licensing are not demonstrated by these images.
- The illustrative Ledger is not a live statement, and no payment is represented as completed.
- Commercial shares are proposed allocations of track revenue to rights-holder pools. Individual receipts depend on contracts and registered splits.
- Generation pricing, launch terms and the economics of originals beyond the proposed cap remain under validation.
- The October website proposal does not amend older public whitepaper/PIP specifications. Those remain separately scoped sources.

## Omitted material

The previous homepage's ownership Venn diagram, 8p/70p comparison, node-operator flow, obsolete player image, dated city roadmap, £5 subscription and app-chain FAQ have been removed from the page. No market-size or competitor claims are introduced. Raise, valuation, runway and use of funds are excluded.
