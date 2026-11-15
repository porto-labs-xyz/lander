# Performance review — 13 November 2026

The existing static Gatsby rendering, native hero timelines, SVG logo, responsive WebP photography and native gallery scrolling are appropriate foundations. The review focused on the latest approved Sites grille runtime before bringing it into the website PR.

| Finding | Resolution | Evidence |
| --- | --- | --- |
| Every scroll update queried controls/dialog state and measured all three scenes and page height | Cache references and absolute bounds; invalidate on section/root resize, load, fonts and viewport changes | 60 ordinary offscreen scroll updates cause no additional DOM queries or geometry reads in controlled tests |
| Settled and offscreen effects received identical playhead writes each frame | Skip unchanged times, including boundary states | Tests verify no new writes while holding or scrolling beyond completed scenes |
| Each re-entry or replay cancelled and recreated every layer effect | Reuse effects and update their timing once per entry | Re-entry and replay keep the creation count at 15 for a five-row, three-layer scene |
| Reused effects can outlive asynchronous replay completion handlers | Guard completion by generation and cancel observers/listeners/effects on unmount | Lifecycle tests cover interruption, hidden pages, dialogs, reduced motion and cleanup |
| PR was behind approved artwork and hero crop | Port three vector compositions, thick mobile crop, 60% blue/red pacing and high-detail desktop hero | Production build and responsive browser review |

No animation library or dependency changes. Motion changes only transforms; image resolution is retained. The desktop detail source is 1536 × 1024 WebP, not 4K. Real iPhone FPS and provider-side enquiry delivery are not verified.

Validation: 28 tests pass, production build exits successfully, and diff checks pass. Gatsby reports existing toolchain warnings for its SVG manifest icon aspect ratio, outdated Browserslist data, svh calc parsing and a Node punycode deprecation. The browser retains the intended svh CSS; the application rendered and interactions worked in the reviewed build. Dependency upgrades are outside this focused PR update.

Richard owns PR review, merge and production-domain release.

[Mobile browser review](qa/grille-mobile-performance.jpg).
