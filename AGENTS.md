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
- **`pubDatetime` in the future is hidden in prod only.** `postFilter` skips posts until 15 min before `pubDatetime` (`scheduledPostMargin`), but `import.meta.env.DEV` bypasses the check — `pnpm dev` always shows them. Use past timestamps with `+08:00` offset.
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
- Commit style: Conventional Commits with gitmoji — new posts `feat: 🎸 On <topic>`, doc edits `docs: ✏️`, config tweaks `chore: 🤖`.

## 文风（从实际发文的修订中提炼）

- 第一人称口语，球迷式称呼与绰号：B费、爱美丽、小法、“打手”型后腰；数据点到为止，更看重过程细节（如“这球传的水平很高，不停球绕过了前点的中卫”）。
- 敢下尖锐但具体的判断，包括批评自家核心/名宿（“B费的互爆踢法现在只剩下风险了”），批评必带理由，并给出具体替代设想（“让齐尔克泽、芒特多试试”）。
- 长句铺陈、短句收力（“不好使，没一个好使。”“人齐了，账还是没赢下来。”）；少用工整排比。
- 观点先立再破：先承认对方合理（“我知道卡里克下课也合理，他看起来也是束手无策”），再讲自己的立场。
- 系列文章互相呼应：回收前文梗（“咪一鸠样”）、引用前文结论（“我的态度上个月写过”），赛程、比分、球队状态等细节要与既往文章和真实战报对得上。
- 结尾从分析落到个人情感，不喊口号、不强行总结（“现在，我只希望我能再见证一次。”）。
