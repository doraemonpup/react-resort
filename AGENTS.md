# AGENTS.md

## Commands

```bash
npm start        # Vite dev server on :3000
npm run build    # production build to build/
npm test         # Vitest (no tests exist yet)
npm run preview  # serve the production build
```

## Architecture

- **Framework**: Vite 7 + React (plain JS, no TypeScript). JSX lives in `.js` files — `vite.config.mjs` configures the esbuild `jsx` loader for `src/`.
- **Routing**: react-router v8 — pages in `src/pages/`, components in `src/components/`. Import from `react-router` (v8 removed `react-router-dom`).
- **State**: class-based React Context (`src/context.js`), not hooks/redux
- **Data**: static JSON in `src/data.js` (13 rooms, no external API)
- **Styling**: SCSS in `src/App.scss` (CSS custom properties) + `styled-components` (`StyledHero` only)
- **Entry**: `src/index.js` mounts `<RoomProvider> > <BrowserRouter> > <App />`; Vite entry is `index.html` (project root)

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/rooms/` | Rooms (filterable list) |
| `/rooms/:slug` | SingleRoom |
| `/about` | About |
| `*` | Error |

## Docker

```bash
docker compose up   # dev with live-reload via src/ volume mount
```

## Notes

- `public/_redirects` exists for Netlify SPA fallback routing
- No tests, no linter beyond Vite defaults
- `allowScripts` in `package.json` approves install scripts for `@parcel/watcher`, `esbuild`, `fsevents` (npm 12 requirement)
- `.env` vars must be prefixed `VITE_`; `.env.local` is gitignored
