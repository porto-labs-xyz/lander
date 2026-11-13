# Kiln scroll rhythm

The opening contains only the enlarged Kiln logo and a 3.5× close-up of One’s aluminium edge, blue grille and status light. During a short native scroll, the actual header logo shrinks and moves home; the hardware pulls back and moves into its final position. Only once the product has settled does the headline, subtitle and action appear beneath it. A sticky stage holds this sequence for 65svh on mobile (70svh on desktop), then releases into the page. Scrolling is never intercepted and products never switch automatically.

| Moment | Mobile | Desktop |
| --- | --- | --- |
| Opening One | 3.5× macro to 1×; 65svh stage travel | 3.5× macro to 1×; 70svh stage travel |
| Header logo | 3× centred mark to original 88px header logo | 4× centred mark to original 103px header logo |
| Hero copy | Revealed after the object settles, during the final quarter of the sequence | Same |
| Yellow Crucible | One 1.35s anticipation, hop, tilt and settle | Same |
| Studio rack | 1.00 to 1.06 scale, anchored near rack | 1.00 to 1.11 scale, same anchor |
| Exposed hardware | 0.92 to 1.025 scale, settling as it passes centre | 0.88 to 1.04 scale |
| Chapter content | One 560ms entrance, 18px travel | Same; workflow panel offset 80ms |
| Product selection square | One 340ms turn on selection | Same |
| Product/colour state | Native horizontal swipe | Existing 180ms crossfade |

Scroll motion uses CSS named view timelines on stable wrappers and transforms on their images. There are no new JavaScript scroll callbacks, animation dependencies, video sequences, filters, or layout-property animations. Browsers without view-timeline/timeline-scope support retain the static compositions and short entrances. The intro timeline is scoped at the root to coordinate the real header logo with the hero; there is no duplicate logo handoff. Opacity reveals leave heading text available to assistive technology, while unrevealed navigation/action links remain unfocusable until visible. An IntersectionObserver introduces content once; content is visible by default even if JavaScript does not run. The yellow Crucible is split into its original two SVG paths: only the square moves, and the vessel masks its start. Final geometry is unchanged. The square’s pop is scoped to this existing logo, not repeated as page ornament.

Reduced-motion disables both timed and scroll-driven effects, with no hidden content; the extended hero stage also disappears, returning to the static product layout. Preference changes disconnect observers and pending image-load callbacks. Hidden documents pause animation; unmount removes listeners and classes. Native gallery swiping and pinch zoom remain independent of vertical motion.

## Design references

- [Material motion system](https://m3.material.io/styles/motion/overview/how-it-works): distinct spatial/effect behaviour, consistent motion language and device-sensitive movement. Kiln uses its own restrained curves; these are not a claim to implement Material's spring physics.
- [Apple Mac Studio](https://www.apple.com/mac-studio/): large hardware photography, clear chapter contrast, technical details alternating with workspace context. The live page was inspected as a presentation reference; no Apple assets are reused.
- [Apple motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion): purposeful, brief and optional motion that respects gestures.
- [CSS animation timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline) and [named view timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline): progressive enhancement and declarative scroll progress.

## Validation

Gatsby production build and the existing signup/gallery suite, plus focused tests for motion preference changes, delayed image loading, background pause and unmount cleanup. Browser review checks the macro and full-object states, sticky-stage release, the yellow Crucible’s final geometry and narrow mobile layout. Real iPhone frame-rate profiling remains a device check; no 60fps claim is made from desktop browser QA.

## Little Tilt arrival cue

The header lockup now uses the original SVG paths inline, with a separate square group. At the point where the logo finishes returning to its corner (65% of the intro timeline), an IntersectionObserver triggers one 1,000ms dance. A stable, nonvisual marker is positioned at that exact scroll distance; no new scroll handler or animation-frame loop is used. The pickup dips at 60ms, the hop peaks at 250ms, the second tilt falls at 390ms and the landing lands at 660ms, matching Little Tilt’s musical events.

The 88 KB MP3 is the approved Little Tilt sketch, unchanged. A small Sound off/on toggle explicitly enables audio. Web Audio resumes directly from that tap, then fetches and decodes the clip once. At arrival, the chime and square are scheduled with the same 35ms lead. The chime plays once, with a soft decay after the square settles. Enabling sound after arrival replays the paired cue while the intro is still visible. Muting fades an active source quickly; leaving the tab cancels sound and movement. Restored/deep-linked scroll positions never play an automatic cue, and reduced motion disables this intro cue. Audio does not load before opt-in.

Validation adds seven controlled tests: silent arrival, opt-in and scheduling, late opt-in, unmount during loading, background/reduced-motion handling, deep-link/fast-scroll suppression, and blocked-context recovery. Mobile-browser sound still depends on a user tap, device volume and the browser’s audio policy; it is not assumed to autoplay on a swipe.

Sources: [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) and [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay).

### Responsive device opening

The opening is art-directed by viewport width: Kiln One on mobile (up to 760px), Kiln Atelier on wider screens. A native `picture` source lets the browser request only the matching hero asset, with no user-agent sniffing or resize handler. Atelier uses the approved red-grille cutout and its own top-edge focal point; One keeps its existing macro framing. Both share the scroll timeline, logo handoff, Little Tilt cue and delayed copy reveal. The caption changes with the same breakpoint. Static/reduced-motion layouts also use the appropriate device.
