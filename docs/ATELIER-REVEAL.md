# Atelier camera reveal

The lower black Atelier section plays once when at least 35% visible. The camera eases into a pan across the front edge, pushes toward the status light, then makes a small damped settle. The faster slide lands at 2.5 seconds; the full sequence and hold span 3.8 seconds. At the landing, the status light follows the chime’s measured amplitude over 800 milliseconds. Red, blue and yellow overlap softly at the note entrances, with a smaller final yellow swell before returning to white. The light stays softly tinted instead of flashing on and off. The larger two-line headline enters with the final movement, with responsive sizing that keeps the status light clear. There are no sound or replay controls.

The established “Little Tilt” chime (`/assets/little-tilt.mp3`) accompanies the landing when a genuine tap/key has unlocked browser audio and the file has decoded in time. It uses the opening 800 milliseconds at 0.65 gain, with a smooth fade over the tail. A quiet 360 ms stereo room and two low-pass-filtered echoes at 120/240 ms add space. The direct notes stay clear; the light follows their envelope while the ambience decays underneath. There is no delay feedback, and all tails fit within the existing final hold. The homepage introduction retains the full chime. The light and sound begin in the same cue callback. Light opacity is a precomputed, smoothed RMS envelope of that exact excerpt, including its gain fade; no live analyser or frame loop is needed. Blocked, unavailable or late audio is discarded; the same gentle visual phrase still plays silently. Motion pauses offscreen and in background tabs; reduced motion keeps a static crop without colour pulses. Cleanup aborts loading and releases observers, animations and audio resources.

## Image and engineering scope

The motion uses the black Atelier exterior render with its baked-in diamond lamp removed. A shared CSS square, rotated 18° clockwise, provides the white lamp and all three animated colours at exactly the same position. It remains visible with reduced motion and without JavaScript. Square hover marks keep a gentle 18–28° tilt. It does not show the earlier speculative interior or a case-closing mechanism. The small exterior caption was removed at the user’s request; the image remains a hardware concept. The chassis, grille and camera composition are retained.

The current Kiln NVIDIA Share Deck, slide 7 (version 9, modified 12 November 2026), defines Atelier Base as two GPUs and Max as four, with NVIDIA RTX PRO 6000 Blackwell Max-Q as the candidate. The deck leaves CPU, motherboard, physical fit, cooling and BOM unvalidated. Exact interiors still require Richard’s approved parts list and CAD; no render establishes build feasibility.

## Scroll outlines and copy

The closed rectangular headline frames draw clockwise as the reader scrolls and unwind on reverse scroll. A single miter-joined path starts at the top-edge midpoint; the complete outline drops its dash pattern, so all four corners remain flush without cap notches. Geometry is cached on layout changes, updates are batched to one animation frame, and there is no idle loop. Reduced motion and printing keep full static borders. The hero frame follows the existing introduction scroll range; other frames draw as their headings enter view.

The screenshot-selected secondary notes, workspace caption, black Atelier caption, FAQ aside and studio caption strip have been removed. Target pricing and the existing FAQ remain. The latest studio rack crop is retained. The rack page now follows a shorter privacy, capacity and KilnOS story, with four proposed specifications. All three hardware pages use one signup headline, one short line, one button and a privacy link.

## Implementation

The camera uses one image and transform/opacity animation. The initial and final crops have separate mobile composition, with the status light clear of the text. Gatsby and Sites share identical animation modules and CSS. The retired open concept asset is not loaded or displayed.

## Contact and final CTA

The contact dialog has two visible fields: email and message. A hidden topic preserves contextual routing, and the optional organisation field is omitted. Contact still does not subscribe visitors to marketing. The form shows a sending label while pending and retains input on failure; confirmation appears only after the existing server/provider acknowledges success. Booking remains a separate link: the existing calendar destination on Sites and `/book/` on Gatsby. No real message or appointment is submitted during QA.

The final hardware exploration heading is “Find your Kiln.” with “Explore the range” as its link. The studio rack image uses a photographic treatment of the existing v4 image, preserving the composition, four hardware units and frame geometry. The new WebPs are responsive 1536/768 exports; they do not establish manufacturing feasibility.

## Typography

Monument uses normal font kerning, restrained headline tracking (−0.02em; display −0.025em), and roomier line heights. The product names share the same tracking, with explicit word spacing and a Rack title that wraps within its mobile margins. Body copy, form fields and supporting text keep normal tracking and comfortable leading. The approved outlined logo assets stay unchanged.

## Landing controls

The homepage header registration button and mobile registration dock are hidden and inert during the opening macro view. They fade in with the menu as the hero is revealed (68–86% of the intro scroll). Returning to the opening hides them again. Reduced-motion/static layouts and other pages retain their visible controls.
