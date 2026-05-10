# AGENTS.md

## Commands

```bash
npm start        # dev server on :3000
npm run build    # production build to build/
npm test         # CRA test runner (no tests exist)
```

## Architecture

- **Framework**: Create React App (plain JS, no TypeScript)
- **Routing**: react-router-dom v7 — pages in `src/pages/`, components in `src/components/`
- **State**: class-based React Context (`src/context.js`), not hooks/redux
- **Data**: static JSON in `src/data.js` (13 rooms, no external API)
- **Styling**: SCSS in `src/App.scss` (CSS custom properties) + `styled-components` (`StyledHero` only)
- **Entry**: `src/index.js` mounts `<RoomProvider> > <BrowserRouter> > <App />`

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
- No tests, no linter/typechecker beyond CRA defaults (`react-app` ESLint preset)
- `.env.*` files are gitignored — use `.env.local` for local overrides
