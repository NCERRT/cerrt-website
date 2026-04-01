# CERRT — Next.js Rebuild

## Project overview

This is a Next.js rebuild of the NITDA CERRT (Computer Emergency Readiness & Response Team) department
website, previously running on WordPress. The goal is a faster, better-looking, easier-to-maintain site
with a headless CMS for content updates.

The site is primarily informational — staff publish advisories (PDFs/docs), news posts, and images.
Visitors browse public content, download advisories, and contact the department.

---

## Tech stack

| Layer         | Tool                 | Notes                                      |
| ------------- | -------------------- | ------------------------------------------ |
| Framework     | Next.js (App Router) | Use React Server Components where possible |
| Styling       | Tailwind CSS         | Use CSS variables for brand tokens         |
| CMS           | Sanity.io            | Blog posts, advisories, gallery images     |
| Forms / email | Resend               | Contact form submissions                   |
| Media         | Sanity CDN           | Images served via Sanity's image pipeline  |
| Hosting       | Vercel               | Auto-deploys on push to main               |
| Language      | TypeScript           | Strict mode on                             |

---

## Site pages

| Route            | Type          | Content source                        |
| ---------------- | ------------- | ------------------------------------- |
| `/`              | Static        | Hardcoded — hero, mission, highlights |
| `/about`         | Static        | Hardcoded — org description, mandate  |
| `/services`      | Static or CMS | Programs / services offered           |
| `/advisories`    | Dynamic       | Sanity — list of advisory docs        |
| `/kids-advisory` | Dynamic       | Sanity — list of kids advisory        |
| `/contact`       | Static + API  | Form → Resend email                   |

---

## Folder structure

```
cerrt/
├── app/
│   ├── layout.tsx               ← Root layout (Navbar + Footer)
│   ├── page.tsx                 ← Home
│   ├── about/
│   │   └── page.tsx
│   ├── services/
│   │   └── page.tsx
│   ├── advisories/
│   │   └── page.tsx
│   ├── kids-advisory/
│   │   └── page.tsx
│   ├── gallery/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── api/
│       └── contact/
│           └── route.ts         ← Form handler
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/                      ← Reusable primitives (Button, Badge, Card)
│   └── sections/                ← Page-specific sections (Hero, AdvisoryCard, etc.)
├── lib/
│   ├── sanity.ts                ← Sanity client + fetch helpers
│   └── utils.ts                 ← Shared utilities
├── sanity/
│   ├── schemaTypes/             ← Content schemas
│   │   ├── post.ts
│   │   ├── advisory.ts
│   │   └── galleryImage.ts
│   └── env.ts
├── public/
│   └── images/                  ← Static assets (logo, og image, etc.)
└── types/
    └── index.ts                 ← Shared TypeScript types
```

---

## Design direction

The current WordPress site is functional but visually dated. The rebuild should feel like a credible,
modern government/research department — authoritative, clean, and trustworthy — without being sterile.

### Visual identity goals

- Professional and institutional but not bureaucratic
- Clean typography with clear hierarchy
- Restrained color palette with one strong accent
- Generous whitespace
- Fast and lightweight — no heavy animations

### Typography

- Use Google Fonts — pair a strong sans-serif display font with a readable body font
- Avoid Inter, Roboto, Arial — pick something with more character
- Suggestions: **DM Sans + DM Serif Display**, or **Sora + Source Serif 4**, or **Plus Jakarta Sans + Lora**

### Color palette

Define these as CSS variables in `globals.css` based on the screenshots.

### Component style

- Cards with subtle border + very light shadow (no heavy drop shadows)
- Buttons: solid primary for main CTAs, outlined secondary
- Section dividers: whitespace and subtle top borders, not heavy rules
- Advisory cards: should look like document cards — show filename, date, a download icon

---

## Key patterns

### Fetching from Sanity

Always use `generateStaticParams` + `revalidate` for CMS-driven pages. Example:

```ts
// lib/sanity.ts
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: true,
});
```

### Contact form

The `/api/contact` route receives form data and sends an email via Resend. Always validate
input server-side before sending. Return clear error messages to the client.

### Image handling

Use `next/image` for all images. For Sanity images, use the `@sanity/image-url` builder
to generate optimised URLs. Never use raw `<img>` tags.

---

## Environment variables

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
RESEND_API_KEY=
```

---

## Build order (follow this sequence)

1. Project scaffold — This has already been done
2. Layout shell — Navbar + Footer with logo placeholder and nav links
3. Home page — Hero section, mission statement, quick-links to key sections
4. About page — Static content
5. Services page — Static content
6. Contact page — Form UI + API route
7. Sanity setup — Install SDK, define schemas, connect client
8. Advisories page — Fetch + display advisory docs from Sanity
9. Kids Advisories page — Fetch + display images for kids
10. Polish — Typography refinement, spacing, hover states, mobile responsiveness
11. Deploy to Vercel — Add env vars, connect domain

---

## Visual reference

Screenshots of the current WordPress site are in `/reference/screenshots/`.
Use them as content and main color palette reference only — not as design reference. The new site should look
significantly better. When rebuilding a page, check the screenshot to ensure no content
is missed, but feel free to reorganise the layout for clarity and visual quality.

---

## Conventions

- All components are functional, typed with TypeScript
- Use `async` server components for data fetching — avoid `useEffect` for CMS data
- Keep pages thin — extract repeated UI into `/components/sections/`
- Use Tailwind utility classes directly; avoid custom CSS except for brand tokens in `globals.css`
- All dates formatted with `Intl.DateTimeFormat` — no external date libraries needed
- Mobile-first responsive design — design for small screens first, scale up with `md:` and `lg:`

---

## Notes for Claude Code

- When building a new page, always check `/reference/screenshots/` first for content reference
- Prioritise semantic HTML — use `<article>`, `<section>`, `<nav>`, `<main>` appropriately
- Every page needs a proper `<title>` and `<meta description>` via Next.js `metadata` export
- When in doubt about content, use realistic placeholder text relevant to an emergency response / risk org
- The advisory download flow: Sanity stores the file, the card shows title + date + file type badge,
  clicking opens/downloads the file via its Sanity CDN URL
- Do not install unnecessary packages — keep dependencies lean
