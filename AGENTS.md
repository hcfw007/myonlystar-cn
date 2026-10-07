# AGENTS.md

Personal Chinese blog "Notebook" (Nan). AstroPaper v6 on Astro 6 + TS + Tailwind v4, static output for Cloudflare Pages. Posts live in `src/content/posts/<slug>/index.md`; UI is `zh-CN`.

## Commands

Package manager **pnpm**; Node `>=22.12.0` (`.nvmrc`); CI uses Node 24. No test suite.

- `pnpm dev` — dev server at `localhost:4321`
- `pnpm build` — `astro check && astro build && pagefind --site dist && cp -r dist/pagefind public/`
- `pnpm preview`, `pnpm sync`, `pnpm lint`, `pnpm format:check`, `pnpm format`

CI order (`.github/workflows/ci.yml`): `lint` → `format:check` → `build`. `pnpm build` is the only real verification: `astro check` blocks on type errors and invalid frontmatter.

## Non-obvious gotchas

- **Search is empty unless you run a full `pnpm build`.** Pagefind indexes `dist/` after `astro build`; `public/pagefind/` is generated and gitignored. Dev/preview without a prior build has no search index.
- **Always import config from `@/config`, never `astro-paper.config` directly.** `astro-paper.config.ts` is only user input; `src/config.ts` resolves defaults (`ogImage`, `timezone`, feature flags).
- **`pubDatetime` in the future is hidden.** `postFilter` drops posts newer than now + 15 min (`scheduledPostMargin`). Use past timestamps with `+08:00` offset.
- **No `console.log`** — `no-console` is an ESLint error; use `astro check`/build output.
- Git to GitHub needs the local proxy `127.0.0.1:7890` (direct connections fail).
- Prettier auto-sorts Tailwind classes and formats `.astro`; run `pnpm format` after edits.

## Layout

- `astro-paper.config.ts` (user config) vs `src/config.ts` (resolved) vs `astro.config.ts` (Astro/fonts/i18n/markdown). Path alias `@/*` → `src/*`, plus `@/astro-paper.config`.
- `src/content.config.ts` — `posts` and `pages` collections via glob; files prefixed `_` are ignored. Subdirectories under `posts/` become part of the URL.
- Post pipeline in `src/utils/`: `getSortedPosts`, `postFilter`, `getPostPaths`, `getUniqueTags`, `slugify`.
- Routing: `src/pages/posts/[...page].astro` (index), `posts/[...slug]/index.astro` + `index.png.ts` (post + dynamic OG), `tags/`, `archives/`, `search.astro`.
- `analytics.cloudflare` beacon is injected only in production builds (`import.meta.env.PROD`, see `src/layouts/Layout.astro`).

## Writing posts

- One directory per post; images sit alongside and are referenced relatively (`ogImage: "./cover.jpg"`).
- Frontmatter: Chinese `title`, short English `description` (recent: "On <topic>"), `pubDatetime` with `+08:00`, `author: Nan`, `tags` (e.g. `football`, `esports`), optional `featured`/`draft`/`ogImage`.
- Commit style: Conventional Commits; new posts as `feat: 🎸 On <topic>`.
- Before writing/editing posts, read `.workbuddy/memory/MEMORY.md` (Nan's voice/style notes).
