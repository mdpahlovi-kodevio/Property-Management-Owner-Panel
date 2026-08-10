# Project knowledge

Property Management System — **Owner Panel** (admin dashboard for property owners). React 19 SPA built with Vite 8, TanStack Router + Query, Tailwind CSS v4, shadcn/ui, and Better Auth. Deployed to Vercel at `owner.bookingisyours.com`. Code lives in `src/`; there is no backend in this repo (consumes a remote API).

## Quickstart
- Setup: `npm install` (needs `.env` with `VITE_APP_SERVER=<api origin>`; `.env` is gitignored)
- Dev: `npm run dev` → **port 3020** (not the Vite default)
- Build: `npm run build` (Vite build → `dist/`)
- Preview: `npm run preview` (port 3020, `--host`)
- Lint: `npm run lint` (ESLint, TanStack config)
- Format: `npm run format` (prettier --write + eslint --fix) · Check: `npm run check` (prettier --check)
- **No test script/harness configured** (jsdom is installed but unused).

## Architecture
- **Routing:** TanStack Router, file-based. Routes in `src/routes/` → `routeTree.gen.ts` is **auto-generated** by the router plugin (`vite.config.ts`) — never hand-edit. `__auth/` = signin/verification/reset; `__main/` = app shell (sidebar, breadcrumbs, auth + permission gate in `beforeLoad`). Router has `defaultPendingComponent`/`defaultErrorComponent`/`defaultNotFoundComponent`.
- **Server state:** React Query. Shared `queryClient` in `src/main.tsx`, injected into router context. Queries use `refetchOnWindowFocus: false`, `retry: 1`. Session cache key is `SessionKey` from `src/lib/api/auth.ts`.
- **API layer:** `src/lib/api/` — one module per domain (auth, booking, property, calendar, etc.), re-exported via `src/lib/api/index.ts`. `base.ts` provides `request()` (fetch wrapper, `credentials: 'include'`, JSON body, 401 clears the session cache and throws the API `message`), `Paginated<T>` type, `toQuery()`, and `resolveImage()` (uploads served from `baseURL`). Base URL = `import.meta.env.VITE_APP_SERVER`, prefix `/api/v1`.
- **Auth:** Better Auth (`better-auth`); session loaded via `authApi.getSession()` in `__main/route.tsx`. `user.isDefault` = Super Admin (bypasses all permission checks).
- **Permissions/modules:** `src/lib/module.ts` is the **single source of truth** for module keys, paths, and permission keys. Sidebar (`components/main/app-sidebar.tsx`), breadcrumbs (`__main/route.tsx`), role matrix (`components/form/form-module-map.tsx`), and route checks (`src/lib/permission.tsx`) all derive from `MODULES`. To add a module, follow the checklist in module.ts (entry, i18n namespaces, route file, icon in `lib/module-icons.tsx`).
- **Forms:** TanStack Form + zod, wrapped in `src/components/form/form-*.tsx` (select, switch, tags, gallery, searchable-select, etc.).
- **UI:** shadcn/ui ("radix-nova" style, `components.json`) in `src/components/ui/`; Tailwind CSS v4 configured via `@tailwindcss/vite`, theme in `src/styles.css`; icons via `lucide-react`; toasts via `sonner`.
- **i18n:** i18next/react-i18next. Translations in `src/locales/{en,de,nl}/translation.json`; language persisted in `localStorage['app-language']`. All user-facing strings use `useTranslation()`.

## Conventions
- Path aliases: `@/*` and `#/*` both map to `./src/*` (tsconfig + package.json imports).
- TypeScript is `strict` with `verbatimModuleSyntax` → **use `import type` for type-only imports**, `noUnusedLocals`/`noUnusedParameters` enforced.
- 4-space indentation; Prettier + ESLint (TanStack config, `eslint.config.js` disables import order/cycle rules). Files use **CRLF line endings** (Windows).
- Use existing shadcn/ui components and `lib/utils.ts` (`cn()`) instead of reinventing styles. API modules follow the `base.ts` `request()` pattern.
- `resolveImage()` handles backend-hosted images — use it rather than raw URLs.
- Route guards: throw `redirect()` from `beforeLoad` (see `__main/route.tsx` and `permission.tsx`).

## Gotchas
- Dev server runs on **port 3020**; don't assume 5173.
- `VITE_APP_SERVER` env var is required; 401 responses clear the session (redirect to `/signin`).
- `vercel.json` rewrites everything to `index.html` (SPA fallback); `vite.config.ts` allows `owner.bookingisyours.com` as a preview host.
- Adding a new page requires it to be registered in `src/lib/module.ts` for sidebar/permissions/breadcrumbs to pick it up.
- Windows dev machine — use POSIX-style paths in bash (`/`, not `\`).
