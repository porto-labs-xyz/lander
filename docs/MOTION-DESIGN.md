# Kiln motion

The hero, product photography and grille patterns share the approved red, yellow, blue and ink palette. The original SVG logo is unchanged; tilted-square accents belong to controls and the logo, not the artwork.

## Hero and hardware

A native picture selects Kiln One on mobile and Atelier on desktop. The desktop opening uses the full-width Atelier photograph at 2.4× scale with its top-edge focal point, then pulls back to 1×. Mobile retains its 3.5× One crop. The original inline logo moves into the header before the copy appears. Sticky travel is 65svh on mobile and 70svh on desktop, with ordinary scrolling throughout. The high-detail Atelier source is 1536 × 1024 WebP; it is not a native 4K render.

CSS view timelines drive the intro and photographic movement. Browsers without timeline support show the final static composition. The gallery retains native horizontal touch scrolling and its short desktop crossfade. Responsive image preloads select the same source as the picture element; gallery images decode near the viewport.

## Grille choreography

| Section | Composition | Pace |
| --- | --- | --- |
| Yellow / context | Five opposed horizontal slots; some cross the entire crop | Original pace |
| Blue / privacy | Four horizontal slots stepping diagonally | 60% of original pace, gentler ease-in/out |
| Red / invitation | Four alternating vertical slots | 60% of original pace, gentler ease-in/out |

Opaque colour layers make short trails. SVG and CSS geometry remain sharp at any scale. Mobile horizontal artwork is a 170% close crop; vertical artwork is 480–740px tall with thicker columns. No raster artwork, animation dependency or decorative squares are added.

Scroll seeks paused Web Animations timelines. Motion starts after 26% of the viewport has entered the artwork and takes 58% of a viewport of travel on yellow, or 58% / 0.6 on blue/red. The available page range limits travel so the final scene can settle at the footer. Holding a swipe holds the artwork, and reversing retraces the same movement. Row timings vary once per complete entry; the third row can finish before the second. Small overshoot and rebound retain the spring character. Yellow’s explicit replay button plays the same effects by time until another swipe interrupts it.

The runtime caches scene positions and page height, measures after layout changes, batches scroll events into one animation frame and skips unchanged playheads. It creates effects only on first entry and reuses them on subsequent entries/replays. ResizeObserver watches upstream sections as well as the artwork, so fonts, responsive reflow and content size changes invalidate the cache. There is no idle animation-frame loop.

Reduced-motion and missing Web Animations support show static artwork and hide replay. Visibility and dialogs pause playback. React unmount cancels effects, pending frames and observers and removes listeners. The enquiry form remains a real Formspree form; it is not the Sites preview form.

## Little Tilt arrival cue

The header lockup now uses the original SVG paths inline, with a separate square group. At the point where the logo finishes returning to its corner (65% of the intro timeline), an IntersectionObserver triggers one 1,000ms dance. A stable, nonvisual marker is positioned at that exact scroll distance; no new scroll handler or animation-frame loop is used. The pickup dips at 60ms, the hop peaks at 250ms, the second tilt falls at 390ms and the landing lands at 660ms, matching Little Tilt’s musical events.

The 88 KB MP3 is the approved Little Tilt sketch, unchanged. A small Sound off/on toggle explicitly enables audio. Web Audio resumes directly from that tap, then fetches and decodes the clip once. At arrival, the chime and square are scheduled with the same 35ms lead. The chime plays once, with a soft decay after the square settles. Enabling sound after arrival replays the paired cue while the intro is still visible. Muting fades an active source quickly; leaving the tab cancels sound and movement. Restored/deep-linked scroll positions never play an automatic cue, and reduced motion disables this intro cue. Audio does not load before opt-in.

Validation adds seven controlled tests: silent arrival, opt-in and scheduling, late opt-in, unmount during loading, background/reduced-motion handling, deep-link/fast-scroll suppression, and blocked-context recovery. Mobile-browser sound still depends on a user tap, device volume and the browser’s audio policy; it is not assumed to autoplay on a swipe.

Sources: [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) and [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay).

## Validation

`npm run build`, `node --test src/lib/*.test.mjs`, and `git diff --check` pass. There are 28 controlled tests covering signup, gallery, intro/audio, motion preferences, timing, scroll reversal, layout invalidation, replay and cleanup. Grille tests assert zero additional geometry reads or DOM queries across 60 ordinary offscreen scroll updates, no writes to unchanged/settled playheads, and effect reuse across re-entry/replay. These are work-count checks, not device FPS benchmarks.

Browser review of the production build covers 320px and 390px mobile frames, 1280px desktop, the three patterns, hold/reverse, responsive hero source selection, and opening/closing the enquiry dialog. No real lead or appointment was submitted. Physical iPhone frame-rate and audio output remain unverified.
