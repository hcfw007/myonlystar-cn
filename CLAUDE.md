# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is **Notebook**, Nan's (GitHub: `hcfw007`) personal Chinese-language blog, built on the [AstroPaper](https://github.com/satnaing/astro-paper) v6 theme (Astro 6, TypeScript, TailwindCSS v4). It is deployed as a static site on Cloudflare Pages at `https://myonlystar-cn.pages.dev/`.

The site is localized to `zh-CN` (timezone `Asia/Shanghai`). Posts are personal essays written in Chinese — mostly football (Manchester United, Champions League, World Cup), plus esports and occasional commentary. The About page describes the blog as a public notebook: written for the author, no comment section.

## Commands

Package manager is **pnpm**. Node `>=22.12.0` is required (pinned via `.nvmrc` to `22.12.0`).

| Task | Command |
| --- | --- |
| Dev server (`http://localhost:4321`) | `pnpm dev` |
| Production build (runs `astro check`, builds, then indexes with Pagefind) | `pnpm build` |
| Preview built site | `pnpm preview` |
| Regenerate content collection types | `pnpm sync` |
| Lint | `pnpm lint` |
| Format check / write | `pnpm format:check` / `pnpm format` |

There is no test suite configured. `pnpm build` is the de-facto verification step — it runs `astro check` (type + content schema check) before bundling, so failures there block builds.

Docker: `docker-compose up` runs `npm run dev -- --host 0.0.0.0` on port `4321`. The `Dockerfile` is for production (builds static output and serves via nginx).

## Architecture

### Two-layer configuration

User-facing config is split from internal resolved config:

- **`astro-paper.config.ts`** — User-edited site config (title, author, socials, feature flags, share links). Typed via `defineAstroPaperConfig` from `src/types/config.ts`.
- **`src/config.ts`** — Resolves the user config with defaults and exposes `ResolvedAstroPaperConfig`. **Always import from `@/config` in app code, never from `astro-paper.config` directly** — the resolved object is what guarantees defaults like `ogImage`, `timezone`, `dir`, and feature flags.
- **`astro.config.ts`** — Astro framework config. Reads `astro-paper.config.ts` for `site.url` and sitemap filter. Integrations: `@astrojs/mdx`, `@astrojs/sitemap`. Markdown uses `remark-toc`, `remark-collapse`, and Shiki transformers (custom `transformerFileName` in `src/utils/transformers/`).

Path alias: `@/*` → `src/*`. `@/astro-paper.config` is also aliased (root-level config file).

### Content collections (`src/content.config.ts`)

Two collections defined via Astro's content layer with `glob` loader:

- **`posts`** — `src/content/posts/**/[^_]*.{md,mdx}`. Required frontmatter: `title`, `description`, `pubDatetime`. Optional: `modDatetime`, `featured`, `draft`, `tags` (default `["others"]`), `ogImage`, `canonicalURL`, `hideEditPost`, `timezone`. Subdirectories under `posts/` become part of the post URL.
- **`pages`** — `src/content/pages/**/[^_]*.{md,mdx}`. Looser schema, used for static pages like About.

Files prefixed with `_` are ignored by the glob loader.

### Routing

File-based routing under `src/pages/`:

- `posts/[...page].astro` — Paginated post index (uses `config.posts.perPage`).
- `posts/[...slug]/index.astro` — Individual post; the slug captures subdirectory paths so nested content folders are supported.
- `posts/[...slug]/index.png.ts` — Per-post dynamic OG image (Satori + Sharp) when `features.dynamicOgImage` is enabled.
- `tags/index.astro` + `tags/[tag]/[...page].astro` — Tag index and paginated per-tag listings.
- `archives/index.astro` — Gated by `config.features.showArchives`; also filtered out of the sitemap in `astro.config.ts` when disabled.
- `og.png.ts`, `rss.xml.ts`, `robots.txt.ts` — Generated assets at the site root.

### Post utilities (`src/utils/`)

Centralized post pipeline — reuse these instead of re-implementing filtering/sorting:

- `getSortedPosts.ts` — Sort by `pubDatetime`/`modDatetime` desc, applies `postFilter`.
- `postFilter.ts` — Hides drafts in production and posts whose `pubDatetime` is in the future beyond `posts.scheduledPostMargin`.
- `getPostPaths.ts` — Generates the slug path array used by dynamic routes.
- `getUniqueTags.ts` — Aggregates tags across posts (slugified via `slugify.ts` + `lodash.kebabcase`).
- `getFontPathByWeight.ts` + `resolveDefaultOgImagePath.ts` — Used by the OG image generators.
- `transformers/fileName.ts` — Shiki transformer that extracts a filename comment from the first code-block line.

### Search

Static search via **Pagefind**. It is indexed *after* `astro build` by the `pnpm build` script (`pagefind --site dist && cp -r dist/pagefind public/`). Without running a full build, search will be empty in `pnpm preview`. The search UI lives at `src/pages/search.astro`.

### Styling

TailwindCSS v4 via the Vite plugin (`@tailwindcss/vite`) — no `tailwind.config.js`. Global CSS lives in `src/styles/`. `@tailwindcss/typography` is used for prose. Light/dark mode is gated by `features.lightAndDarkMode`.

### i18n

`src/i18n/` contains a lightweight string table (`lang/`) and formatters (`format.ts`). The site uses `zh-CN`: `astro.config.ts` declares `locales: ["zh-CN"]` with `defaultLocale: "zh-CN"` and `prefixDefaultLocale: false`, and UI strings live in `src/i18n/lang/zh-CN.ts` (the upstream `en.ts` is still present). Adding a locale requires both a new entry under `src/i18n/lang/` and an update to the `i18n.locales` array.

### Analytics

Cloudflare Web Analytics is a custom addition to the theme. It is configured via `analytics.cloudflare.token` in `astro-paper.config.ts` (typed in `src/types/config.ts`). `src/layouts/Layout.astro` injects the beacon script only in production builds (`import.meta.env.PROD`).

## Writing posts

- Each post is a directory: `src/content/posts/<slug>/index.md`, with its images (cover, `ogImage`) stored alongside and referenced relatively (e.g. `ogImage: "./cover.jpg"`). The directory name becomes the URL (`/posts/<slug>/`).
- Frontmatter follows the existing posts: Chinese `title`, a short `description` (recent posts use an English "On <topic>" line), `pubDatetime` with an explicit `+08:00` offset, `author: Nan`, `tags` (e.g. `football`), and optional `featured` / `draft` / `ogImage`.
- `pubDatetime` must not be in the future (beyond the 15-minute `scheduledPostMargin`). Otherwise `postFilter` treats the post as scheduled and hides it from the built site.
- Commit messages for new posts follow the existing pattern: `feat: 🎸 On <topic>`.

## Conventions

- **Commits**: Conventional Commits (config in `cz.yaml`).
- **ESLint**: `no-console: error` is enforced globally. Use `astro check` / build logging instead of `console.log`.
- **Prettier**: Includes `prettier-plugin-astro` and `prettier-plugin-tailwindcss` — class ordering is auto-managed.
- **TypeScript**: Extends `astro/tsconfigs/strict`. Treat type errors from `astro check` as build-blocking.
