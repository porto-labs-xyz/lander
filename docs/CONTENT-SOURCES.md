# Kiln website release, 13 November 2026

The founder approved launch of the full product website. This release ports the approved Sites v10 source (`da3d03133bd6534d9dddf102dadc2a8cff0262f6`) into the existing Gatsby project.

- Headline: “Private AI. Local production.”
- Home and About retain the approved editorial design, copy, self-hosted IBM Plex fonts, Crucible marks, static One hero, perspective-corrected interior and Atelier render.
- One target hardware price: £17,000. Specifications, privacy controls, model compatibility and availability remain development targets, not validated shipping claims.
- Hardware photos blend into the blue/red takeovers with CSS edge masks. Original image pixels, metallic highlights and cast shadows are preserved; masks follow the intrinsic image dimensions on mobile and desktop.
- Only assets used by these pages are added; historical videos and unused gallery images are not shipped in the new asset directory.
- Live registration preserves `https://formspree.io/f/xjgepgbg` and adds selected interest and optional company updates. Success appears only after an HTTP success; failures preserve the email for retry. Nothing is stored in browser storage.
- The `/book/` Google Calendar destination is unchanged. Footer contact and X destinations are preserved. Privacy copy describes the real form flow.
- The release is proposed by PR; Richard owns merge and production-domain publication.

## Mobile polish and comparison, 13 November 2026

- Native scroll-snap One/Atelier gallery supports swiping without intercepting vertical scrolling. Tabs, section colour, copy and selected product stay synchronized.
- Side-by-side comparison uses sticky product headers, larger values and separate shared foundations. It retains all proposed specifications and qualifications.
- The corrected One cutaway and red-background Atelier interior render are visible in the gallery and comparison. Renders illustrate concept component layout, not a final engineering build.
- Passive product and brand motion runs once per view, with brief transform/opacity animations, reduced-motion support and lifecycle cleanup. No video or animation library is added.

## Transition and typography refinement, 13 November 2026

- Desktop product tabs use a 180 ms opacity crossfade; mobile retains native scroll snapping. Mobile selection updates at the swipe midpoint with at most one callback per animation frame, without a delayed scroll-end timer.
- The large takeover colour is an opacity layer. Header colour comes from the selected section’s settled colour token, preventing intermediate colours from being cached. Both product images decode as the gallery approaches the viewport.
- CTA arrows become a small tilted square. A square also marks the active product and mobile position; the motion is a short press/hover response. The hardware caption rule is removed.
- Caption phrases stay intact at narrow widths, with balanced heading/caption wrapping and improved paragraph wrapping.
- `one-interior-v2.webp` corrects the frame perspective while retaining the open enclosure, components, blue grille, lighting and shadow. It is a concept render, not CAD or manufacturing evidence. The 1254px WebP is 195,192 bytes versus the previous 2,164,121-byte PNG.
- Ten controlled signup/gallery tests cover failure recovery, rapid desktop switching, native mobile synchronization, reduced motion, responsive alignment and cleanup.

## Studio interlude

A new front-facing four-unit Atelier studio render sits between the context and KilnOS chapters. It derives the rack design from the existing `studio-leather.jpg` reference, retaining the four coloured grilles and tilted-square lights. The requested setting is an empty open-plan warehouse studio with Mac-style displays and laptops showing creative work, wood desks, Herman Miller Aluminium Group-style leather chairs and a Baldessari-inspired architectural pop-art collage. Two WebP widths serve mobile and desktop; the square mobile crop keeps the entire rack visible. The rack sits against the rear wall near the golden-ratio focal line; the mobile crop is biased to 61.8% to retain it. The scene is a concept visualization.

## UI square colour system

Standalone tilted squares are reserved for controls and product selection. Yellow sections use blue; red and blue hardware sections use yellow; dark sections vary between yellow, blue and red. Header and mobile action markers follow the active section. The decorative workflow square and the floating square in the studio painting are removed. Established logo artwork and product status lights remain intact.

## Earlier source notes

# Kiln stealth landing page provenance

## Current direction, 10 November 2026

The founder requested alignment with the linked Kiln for Creative Studios Figma deck, removal of FREQ mentions, brief and mysterious Kiln copy, no computer imagery, and unchanged calls to action. This supersedes the historical FREQ direction below.

Reference: https://www.figma.com/deck/gGykvFL4L6tuTmfFiGkPZR/Kiln-%E2%80%94-For-Creative-Studios?node-id=3-2

The cover and workflow/next-step slides were inspected in the browser. The page adopts their paper, black, blue, monospaced headings and restrained editorial layout. The paper background (#F1F0EC) follows the Figma reference. A subsequent founder-supplied One & Atelier design and engineering PDF, Appendix E (page 27), supplies the exact digital palette: red #F12A1C, yellow #FFD400, blue #003BFF and black #171819. These supersede the initial approximate blue and black. The page uses blue for its abstract art panel, yellow for its aperture and hero waitlist button, red for the smaller fragment and signal, and black for text. Colours are used decoratively and do not encode product state. The private PDF and its hardware renders are not published. The lowercase live-text kiln wordmark is a typographic treatment; it does not claim to be an exact export of the deck logo. Abstract square artwork is original CSS, with a matching social preview. No hardware imagery, private slides, confidential slide copy or performance claims are published.

Headline: “Your imagination. A space of its own.” Supporting copy: “Private creative AI. Something new is taking shape at Kiln.” Retain the earlier invitation and stealth framing as narrative value. Product availability and launch dates remain unstated.

“Join the waitlist”, “Book a call”, “Stay close”, “Get in touch” and “Follow on X” keep their labels and destinations. Formspree submission logic and Google Calendar booking URL are unchanged. Consent, metadata, manifest and booking copy now name Kiln. Historical FREQ assets and the copy archive below remain available for reference and are not used by the live pages.

This change prepares a reviewable PR. Deployment remains manual and is not included.

---

# FREQ stealth landing page provenance

## Current stealth direction, 29 October 2026

The founder requested a sleek, minimal, premium landing page that hints at an AI creative and compute system without disclosing features, architecture or commercial positioning. This direction supersedes the October homepage requirements below for the current public page. The previous implementation is preserved at `entropy-acs/landing-before-freq-stealth-2026-10-29` (baseline `b3df6f0`). The refreshed working branch is `entropy-acs/freq-stealth-landing`.

Headline: “A new frequency for imagination.” Supporting copy: “We’re building a new kind of creative system. Where AI, imagination and personal computing meet.” These describe work in progress. They do not claim production capabilities, availability, a release date or hardware performance.

## Branding and conversion sources

- Brand correction supplied by the founder on 29 October: `FREQ-Brands-Agencies-27-10-2026-v5.pdf`. The founder approved the existing landing copy and requested visual alignment. The newer Afterimage identity supersedes the earlier chrome-and-bright-lime treatment for this page.
- Exact fluid wordmark extracted from the PDF's page 1 image object, including its existing alpha channel, retained as `static/images/freq/wordmark.png`. Abstract orbital/grain artwork extracted unchanged from the page 15 image object as `static/images/freq/afterimage-orbits.png`. Only these brand assets are used, not slide screenshots, device renders, commercial claims or the complete deck.
- The PDF uses oxblood #251820, bone #EEE9D8, lavender supporting type and restrained yellow-lime #D9E867. Arial regular/bold is the deck's body/display family, with IBM Plex Mono labels. The landing page uses the system Arial stack and the previously licensed local IBM Plex Mono font. Bone signup surfaces echo the deck's light slides.
- The approved headline, supporting copy and conversion labels remain unchanged. The earlier chrome artwork and Space Grotesk font stay in the repository as historical assets; they are no longer referenced by the active homepage.
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
