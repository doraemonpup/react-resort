# Beach Resort

Static React site for a luxury beach resort - rooms, filtering, and booking-facing pages.

## Available Scripts

### `npm run dev` / `npm start`

Both run the app in development mode with Vite.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits (HMR). The port is pinned with `strictPort`,
so a second instance will fail instead of silently moving to another port.

### `npm test`

Launches the Vitest test runner in watch mode. Use `npm test -- --run` for a
single CI-style pass, or `npm test -- --run src/bookingStore.test.js` to target
one file.

### `npm run build`

Builds the app for production to the `build` folder using Vite. Assets are
hashed and the bundle is optimized for production.

### `npm run preview`

Serves the production `build` output locally for pre-deployment checks.

## Features

- **Home** - hero with an availability strip, services, featured rooms.
- **Rooms** - filterable list by type, guests, price, size (m²), breakfast and pets.
- **Single room** - gallery, details, amenity list, and a booking card with a
  live nights × rate total.
- **Booking flow** - `/book` searches availability for a date range and guest
  count; `/book/:slug` collects guest details; `/booking/:ref` shows the receipt.
  Availability is mocked deterministically per room slug in `src/bookingStore.js`,
  and confirmed bookings are persisted to `localStorage` (`resort-bookings`).
  There is no backend.
- **Contact** - `src/pages/Contact.jsx` is a **UI-only demo**: the Send button
  unlocks once all four fields are filled (and the email looks valid), then the
  form is replaced by a "Thanks, we'll reply within 24 hours" receipt. Nothing is
  transmitted or stored.

Prices are shown in `€`; room sizes are stored and displayed in `m²`.

The whole site is a demo: a `Demo` badge sits next to the logo in the navbar, and
the contact, guest-details and booking-receipt surfaces each carry a short note
saying nothing is actually sent, charged or stored server-side.

## Tech Stack

- [Vite](https://vitejs.dev) 8 + `@vitejs/plugin-react` (replaced Create React App)
- [React Router](https://reactrouter.com) v8 - pages in `src/pages/`, components in `src/components/`
- React 19 with a class-based Context (`src/context.jsx`) for room state and filtering
- Static data in `src/data.js` (13 rooms, no external API)
- SCSS (`src/App.scss`, CSS custom properties) + `styled-components` (`StyledHero` only)
- [Vitest](https://vitest.dev) 5 with `jsdom` and `@testing-library/jest-dom`
- Note: JSX lives in `.js` files; `vite.config.mjs` enables JSX transforming for
  those files through Vite 8's `oxc` option

## Project Structure

```
index.html            Vite entry
vite.config.mjs       plugins, dev port, build dir, Vitest config
src/
  index.jsx           mounts <RoomProvider> > <BrowserRouter> > <App />
  App.jsx             routes
  App.scss            all styling
  data.js             static room data
  bookingStore.js     dates, availability mock, localStorage persistence
  bookingStore.test.js
  context.jsx         RoomProvider (class component)
  components/         Navbar, Hero, Banner, AvailabilityForm, RoomFilter, …
  pages/              Home, Rooms, SingleRoom, Book, BookRoom,
                      BookingConfirmed, Contact, About, Error
```

## Environment Variables

Vite exposes variables prefixed with `VITE_` via `import.meta.env` (e.g. `VITE_FOO`). `.env.local` is gitignored.

## Deployment

`public/_redirects` provides Netlify SPA fallback routing. `npm run build` outputs to `build/`, and Vite copies the `public/` directory into it.

## Docker

```bash
docker compose up   # dev with live-reload via src/ volume mount
```
