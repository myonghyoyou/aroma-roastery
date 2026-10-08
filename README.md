# aroma roastery web

The homepage for aroma coffee roastery & showroom (마곡). It is built with Next.js 16 (App Router, TypeScript, Tailwind CSS 4) and deployed on Vercel. Content will come from Notion.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
```

## Structure

- `src/app/page.tsx`: the main page. Its markup and look come from the approved design (draft 06, "grain field").
- `src/components/home/GrainStage.tsx`: a client shell that mounts the fixed WebGL field behind the server-rendered page.
- `src/lib/grain-field/`: the field engine and its shaders.
  - Scroll choreography uses GSAP ScrollTrigger and Lenis.
  - `mountGrainField` returns a cleanup function, so client navigation leaves nothing behind.
  - Texture slots:
    - 0: hero passage
    - 1: store
    - 2 to 5: the first four posts on the main page
- `src/lib/content.ts`: the only place pages get content from.
  - `getSiteSettings()` returns store info and hours.
  - `getPosts()` returns archive and news posts.
  - It returns sample data today. The Notion source plugs in here: a `posts` database and a `site settings` page.
- `src/app/globals.css`: the design CSS, ported from the draft, plus Tailwind theme tokens.
- `public/assets/`: photos, the pouring and steaming videos, and logo SVGs.

## Fonts

Both fonts are self-hosted through `next/font/local`:

- SUIT (OFL) for Korean and body text.
- General Sans (Indian Type Foundry, free for commercial use via Fontshare) for the hero slogan.

## Status

- This is a private MVP for the 2026-10-17 meeting, so search indexing is turned off in `layout.tsx`.
- Still to do:
  - Notion integration
  - archive and news pages
  - Vercel deployment
