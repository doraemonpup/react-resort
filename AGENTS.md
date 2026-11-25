# AGENTS.md

## Commands

```bash
npm run dev      # Vite dev server on :3000 (alias of start)
npm start        # same dev server
npm run build    # production build to build/
npm test         # Vitest watch mode
npm test -- --run  # single Vitest pass (CI)
npm run preview  # serve the production build
```

## Architecture

- **Framework**: Vite 8 + React 19 (plain JS, no TypeScript). JSX lives in `.js` files - `vite.config.mjs` enables it with Vite 8's `oxc` option (`include: /\.(js|jsx|ts|tsx)$/`), not the old esbuild `jsx` loader.
- **Routing**: react-router v8 - pages in `src/pages/`, components in `src/components/`. Import from `react-router` (v8 removed `react-router-dom`).
- **State**: class-based React Context (`src/context.jsx`), not hooks/redux
- **Data**: static JSON in `src/data.js` (13 rooms, no external API). Prices in `€`, room sizes in `m²`.
- **Booking**: `src/bookingStore.js` (no React) - date helpers, a deterministic per-slug availability mock, and `localStorage` persistence under `resort-bookings`. No backend.
- **Contact**: `src/pages/Contact.jsx` is UI-only; submitting shows a receipt and sends/stores nothing.
- **Demo labelling**: `Navbar.jsx` renders a `Demo` pill next to the logo (`.nav-demo`); forms and the booking receipt use the shared `.demo-note` style.
- **Styling**: SCSS in `src/App.scss` (CSS custom properties) + `styled-components` (`StyledHero` only). Card surfaces share white/1px hairline/10px radius/`--lightShadow`; new panels should match that language.
- **Entry**: `src/index.jsx` mounts `<RoomProvider> > <BrowserRouter> > <App />`; Vite entry is `index.html` (project root)

## Routes

| Path | Page |
|---|---|
| `/` | Home (hero + availability strip) |
| `/rooms/` | Rooms (filterable list) |
| `/rooms/:slug` | SingleRoom |
| `/about` | About |
| `/contact` | Contact (demo form, no submission) |
| `/book` | Book (availability search) |
| `/book/:slug` | BookRoom (guest details) |
| `/booking/:ref` | BookingConfirmed |
| `*` | Error |

## Docker

```bash
docker compose up   # dev with live-reload via src/ volume mount
```

## Notes

- `public/_redirects` exists for Netlify SPA fallback routing
- Tests: `src/bookingStore.test.js` (Vitest + jsdom, 17 tests). `src/setupTests.js` loads `@testing-library/jest-dom`
- Dev server uses `strictPort: true` - a second instance fails rather than picking another port
- `allowScripts` in `package.json` approves install scripts for `@parcel/watcher`, `esbuild`, `fsevents` (npm 12 requirement)
- `.env` vars must be prefixed `VITE_`; `.env.local` is gitignored
