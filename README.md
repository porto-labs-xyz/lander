# Kiln by Porto Labs

The approved Kiln product website, built in the existing Gatsby application. Home, About and booking pages introduce private AI hardware, KilnOS and studio pilots. Approved brand assets and fonts are served locally.

## Development

```sh
npm ci
npm run develop
```

## Validation

```sh
npm run build
node --test src/lib/interest-form.test.mjs
git diff --check
```

The signup tests use controlled responses and send no real lead. They cover success, duplicate prevention, rejected responses, network failures, timeout and cleanup. The signup endpoint and Calendar destination are preserved from the previous production page. Provider-side delivery has not been verified with a real submission.

## Release

Open a PR against `porto-labs-xyz/lander:main`. Richard reviews and merges for the production domain. Source provenance and content boundaries are in `docs/CONTENT-SOURCES.md`.

## Structure

- `src/components/HomeContent.jsx` and `AboutContent.jsx`: approved editorial content.
- `src/lib/kiln-interactions.js`: accessible tabs, dialogs, mobile menu and section-aware controls, with lifecycle cleanup.
- `src/lib/interest-form.mjs`: live signup handling and retry states.
- `src/styles/global.css`: approved website design; `booking.css` is scoped to the booking shell.
- `static/assets/kiln/`: approved assets and font licences.
