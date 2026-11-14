# Atelier assembly reveal

The lower black Atelier section plays once when at least 35% visible: a short case-off hold, a descending shell, a precise seated finish, then staggered HTML copy. It has no sound toggle or replay control. A quiet original synthesized cue accompanies seating only if a prior real tap/key has unlocked browser audio. A blocked cue is discarded, never played late. Motion pauses offscreen or in background tabs; reduced-motion and unavailable images retain the static finished product and readable copy.

## Engineering evidence and limits

The current Kiln NVIDIA Share Deck, slide 7 (version 9, modified 12 November 2026), defines Atelier Base as two GPUs and Max as four. The candidate is NVIDIA RTX PRO 6000 Blackwell Max-Q. The deck explicitly leaves the CPU, motherboard, physical fit, cooling and BOM unvalidated. No approved production assembly or CAD was found.

The Max-Q vendor specification is a 96GB, 300W, dual-slot actively cooled card, 4.4 inches high by 10.5 inches long. These dimensions and the actual single-blower/fin-strip appearance informed the four-card concept. This is not the larger 600W Workstation Edition and does not depict pooled GPU memory or NVLink. Reference: https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000-max-q/

The case-off render is an AI-assisted visualization, not vendor CAD, a fit study or a manufacturing drawing. It retains the approved exterior/camera and shows four upright card concepts. It intentionally leaves unselected motherboard, CPU cooler and PSU details in shadow. Lid clearance was visually reviewed, but connector positions, retention, PCIe routing, service access, power delivery, airflow and thermals still require engineering validation. A claimed production-accurate interior must come from Richard's approved BOM and CAD.

The page therefore says “Atelier Max / Four-GPU concept” and “Layout, fit and thermals to validate.” The case-closing path is presentational, not a claim about the production service mechanism. The original static image remains the no-JavaScript/failed-load fallback.

## Implementation

An additional compressed WebP supplies the open state. The existing closed render is reused for the masked moving shell and final state. The module uses opacity/transform animations, lazy image decoding near the viewport, no continuous scroll loop, and cleanup for route changes. The same module and styles are used by Gatsby and Sites.

The built-in image editor produced the open concept from the approved closed render and NVIDIA's product reference. The final correction removes cables projecting beyond the lid envelope. No generated image should be treated as engineering evidence.
