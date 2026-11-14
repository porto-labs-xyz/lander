# Atelier camera reveal

The lower black Atelier section plays once when at least 35% visible. Over 7.2 seconds, the camera begins close to the left front edge, pans across the grille while pushing in, and settles on the illuminated square. The headline enters near the end, with a brief soft light bloom. There are no sound or replay controls.

A quiet original synthesized glass cue accompanies the arrival at the light only if a real tap/key has already unlocked browser audio. Blocked audio is discarded, never played late. Motion pauses offscreen and in background tabs; reduced motion retains the final static crop and readable copy. Route cleanup releases animations, observers and audio resources.

## Image and engineering scope

The motion uses the existing black Atelier exterior render unchanged. It does not show the earlier speculative interior or a case-closing mechanism. The exterior is labelled “Kiln Atelier / Black concept”. No new hardware geometry or components were generated for this camera move.

The current Kiln NVIDIA Share Deck, slide 7 (version 9, modified 12 November 2026), defines Atelier Base as two GPUs and Max as four, with NVIDIA RTX PRO 6000 Blackwell Max-Q as the candidate. The deck leaves CPU, motherboard, physical fit, cooling and BOM unvalidated. Exact interiors still require Richard’s approved parts list and CAD; no render establishes build feasibility.

## Scroll outlines and copy

The closed rectangular headline frames draw clockwise as the reader scrolls and unwind on reverse scroll. Geometry is cached on layout changes, updates are batched to one animation frame, and there is no idle loop. Reduced motion and printing keep full static borders. The hero frame follows the existing introduction scroll range; other frames draw as their headings enter view.

The five screenshot-selected secondary notes and the studio caption strip have been removed. Target pricing and the existing FAQ remain. The latest studio rack crop is retained. The rack page now follows a shorter privacy, capacity and KilnOS story, with four proposed specifications. All three hardware pages use one signup headline, one short line, one button and a privacy link.

## Implementation

The camera uses one image and transform/opacity animation. The initial and final crops have separate mobile composition, with the status light clear of the text. Gatsby and Sites share identical animation modules and CSS. The retired open concept asset is not loaded or displayed.
