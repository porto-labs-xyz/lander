# Kiln scroll rhythm

The product opens in close view and slowly pulls back. The studio photograph then moves toward the rack, followed by an approach into the exposed hardware. Text and product controls remain in normal document flow. There is no added scroll distance, pinning, scroll interception or automatic product switching.

| Moment | Mobile | Desktop |
| --- | --- | --- |
| Opening One | 1.06 to 0.95 scale; 14px total travel | 1.09 to 0.93 scale; 26px travel |
| Studio rack | 1.00 to 1.06 scale, anchored near rack | 1.00 to 1.11 scale, same anchor |
| Exposed hardware | 0.92 to 1.025 scale, settling as it passes centre | 0.88 to 1.04 scale |
| Chapter content | One 560ms entrance, 18px travel | Same; workflow panel offset 80ms |
| Product selection square | One 340ms turn on selection | Same |
| Product/colour state | Native horizontal swipe | Existing 180ms crossfade |

Scroll motion uses CSS named view timelines on stable wrappers and transforms on their images. There are no new JavaScript scroll callbacks, animation dependencies, video sequences, filters, or layout-property animations. Browsers without view-timeline support retain the static compositions and short entrances. An IntersectionObserver introduces content once; content is visible by default even if JavaScript does not run.

Reduced-motion disables both timed and scroll-driven effects, with no hidden content or changed layout. Preference changes disconnect observers and pending image-load callbacks. Hidden documents pause animation; unmount removes listeners and classes. Native gallery swiping and pinch zoom remain independent of vertical motion.

## Design references

- [Material motion system](https://m3.material.io/styles/motion/overview/how-it-works): distinct spatial/effect behaviour, consistent motion language and device-sensitive movement. Kiln uses its own restrained curves; these are not a claim to implement Material's spring physics.
- [Apple Mac Studio](https://www.apple.com/mac-studio/): large hardware photography, clear chapter contrast, technical details alternating with workspace context. The live page was inspected as a presentation reference; no Apple assets are reused.
- [Apple motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion): purposeful, brief and optional motion that respects gestures.
- [CSS animation timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline) and [named view timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline): progressive enhancement and declarative scroll progress.

## Validation

Gatsby production build and the existing signup/gallery suite, plus focused tests for motion preference changes, delayed image loading, background pause and unmount cleanup. Browser review checks the exposed Atelier, two scroll positions and mobile layout. Real iPhone frame-rate profiling remains a device check; no 60fps claim is made from desktop browser QA.
