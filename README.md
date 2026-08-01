# Beach Resort

Static React site for a luxury beach resort — rooms, filtering, and booking-facing pages.

## Available Scripts

### `npm start`

Runs the app in development mode with Vite.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits (HMR).

### `npm test`

Launches the Vitest test runner in watch mode. (No test files exist yet.)

### `npm run build`

Builds the app for production to the `build` folder using Vite. Assets are
hashed and the bundle is optimized for production.

### `npm run preview`

Serves the production `build` output locally for pre-deployment checks.

## Tech Stack

- [Vite](https://vitejs.dev) + `@vitejs/plugin-react` (replaced Create React App)
- [React Router](https://reactrouter.com) v8 — pages in `src/pages/`, components in `src/components/`
- React Context (class-based) in `src/context.js`
- Static data in `src/data.js` (13 rooms, no external API)
- SCSS (`src/App.scss`, CSS custom properties) + `styled-components` (`StyledHero`)
- Note: JSX lives in `.js` files; `vite.config.mjs` sets the esbuild `jsx` loader for `src/`

## Environment Variables

Vite exposes variables prefixed with `VITE_` via `import.meta.env` (e.g. `VITE_FOO`). `.env.local` is gitignored.

## Deployment

`public/_redirects` provides Netlify SPA fallback routing. `npm run build` outputs to `build/`, and Vite copies the `public/` directory into it.

## Docker

```bash
docker compose up   # dev with live-reload via src/ volume mount
```
