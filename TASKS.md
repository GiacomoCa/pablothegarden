# Pablo The Garden — Task Board

> **Project:** pablothegarden.com — Sweet Edition 2026
> **Design Doc:** `docs/DESIGN.md`
> **Status:** Each task should be marked ✅ when complete

---

## Agent: `foundation`

Scaffolds the project, design system, layout shell, content utilities, and i18n.
All other agents depend on this agent completing first.

### F1 — Project Scaffolding ✅
- **Priority:** 🔴 Critical (blocks everything)
- **Description:** Initialize Next.js 14+ App Router project with TypeScript, Tailwind CSS v4, Framer Motion, and next-intl. Configure `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`. Install all dependencies.
- **Acceptance criteria:**
  - `npm run dev` starts without errors
  - App Router with `[locale]` dynamic segment works
  - Tailwind classes render correctly
  - TypeScript strict mode enabled
- **Output:** Root project files, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx` (placeholder)

### F2 — Design System & Theme ✅
- **Priority:** 🔴 Critical
- **Dependencies:** F1
- **Description:** Implement the "Sweet Edition" candy theme in Tailwind config. Define CSS variables, color palette, typography with self-hosted fonts (Fredoka One or Baloo 2 for display, DM Sans or Nunito for body via `next/font`). Create global styles in `globals.css`.
- **Color palette:**
  - Primary: `#FF6B9D` (Candy Pink), Primary Dark: `#E8457A`
  - Secondary: `#FFB347` (Orange Cream)
  - Accent 1: `#87CEEB` (Cotton Candy Blue), Accent 2: `#DDA0DD` (Bubblegum Purple), Accent 3: `#98FB98` (Mint Green)
  - Background Dark: `#1A0A2E` (Deep Night Purple), Background Light: `#FFF5F8`
  - Text Primary: `#2D1B40`, Surface: `#FFFFFF`
- **Typography:** Rounded, playful display font + clean body font. Self-hosted, no Google Fonts CDN requests (GDPR).
- **Acceptance criteria:**
  - Tailwind theme extended with custom colors, fonts, border-radius tokens
  - Fonts load correctly via `next/font/google` or `next/font/local`
  - A test page renders all theme colors and font weights correctly

### F3 — Layout Components ✅
- **Priority:** 🔴 Critical
- **Dependencies:** F2
- **Description:** Build the persistent layout shell used by every page.
- **Components to build:**
  - `Header.tsx` — Logo, primary nav (Lineup · Tickets · Gallery · Blog · About), language switcher, mobile hamburger menu with slide-out drawer
  - `Footer.tsx` — Logo, secondary nav (Rules · Contact · Privacy Policy), social links (Instagram, Facebook), language switcher, copyright
  - `Navigation.tsx` — Shared nav link list, active state highlighting
  - `LanguageSwitcher.tsx` — IT/EN toggle, uses `next-intl` locale routing
  - `FloatingTicketCTA.tsx` — Sticky "Acquista Biglietti" / "Get Tickets" button. On click: opens `TicketSelectorModal` (a bottom drawer on mobile, centered modal on desktop) showing 3 buttons for the current active release (Full Pass / Day 1 / Day 2), each linking to the corresponding Clappit URL. Reads from `/content/tickets.json`. If all tickets sold out, shows disabled "Sold Out" state.
- **Acceptance criteria:**
  - Header responsive: horizontal nav on desktop, hamburger on mobile
  - Language switch navigates between `/it/...` and `/en/...` preserving the current path
  - Floating CTA visible on all pages, does not overlap content
  - Footer renders social links and secondary nav

### F4 — Content Utilities ✅
- **Priority:** 🔴 Critical
- **Dependencies:** F1
- **Description:** Build TypeScript utilities to read and parse Markdown/MDX/JSON content files at build time.
- **Files to create:**
  - `src/lib/content.ts` — Functions: `getLineup()`, `getLineupConfig()`, `getBlogPosts(locale)`, `getBlogPost(slug, locale)`, `getSponsors()`, `getTickets()`, `getRules(locale)`, `getAbout(locale)`, `getFaq(locale)`
  - `src/lib/types.ts` — TypeScript interfaces for Artist, BlogPost, Sponsor, TicketRelease, TicketConfig, FAQ, LineupConfig, etc.
  - `src/lib/utils.ts` — Date formatting, locale helpers, "NEW" badge calculator (based on `revealDate` + `newBadgeDays`)
- **Acceptance criteria:**
  - All content functions return typed data from the `/content/` directory
  - MDX files compile correctly with frontmatter extraction
  - Functions work at build time (compatible with `generateStaticParams`)

### F5 — i18n Setup ✅
- **Priority:** 🔴 Critical
- **Dependencies:** F1
- **Description:** Configure `next-intl` for Italian (default) and English. Set up locale routing, translation file structure, and middleware.
- **Files:**
  - `messages/it.json` — All Italian UI strings (nav labels, button text, section headings, form labels, error messages, CTA text, etc.)
  - `messages/en.json` — English translations of the above
  - `src/middleware.ts` — Locale detection, default locale redirect
  - `src/i18n.ts` — next-intl configuration
- **Acceptance criteria:**
  - Visiting `/` redirects to `/it/`
  - All UI strings come from translation files, no hardcoded text in components
  - Locale switching works on all pages

---

## Agent: `pages`

Builds all individual page components. Depends on `foundation` completing F1–F5.

### P1 — Homepage ✅
- **Priority:** 🔴 Critical
- **Dependencies:** F1–F5
- **Description:** Build the full homepage composed of these sections (top to bottom):
  1. **Hero** — Full-screen candy-themed background (image or gradient + particles), festival logo, dates "15–16 Agosto 2026", location "Morrovalle (MC)", primary CTA (opens TicketSelectorModal), secondary CTA "Scopri il Lineup". Animated candy confetti particles using Framer Motion.
  2. **Countdown** — Days/Hours/Minutes/Seconds to Aug 15, 2026 18:00 CEST. Candy-styled number cards with flip animation.
  3. **Lineup Preview** — Phase-aware: if `coming_soon` → teaser banner with mystery silhouettes + Instagram CTA; if `revealing` → latest revealed artists with "NEW" badge + mystery slots; if `complete` → top 6 headliners. "Vedi Lineup Completo →" link.
  4. **Experience Cards** — 3–4 cards: Music · Food & Drink · Fun Zone · Scenography. Short text + icons/illustrations.
  5. **Edition Timeline** — Horizontal scroll strip: 2023 (Parrot) → 2024 (Jungle) → 2025 (Flowers) → 2026 (Sweet). Each with a key visual.
  6. **Sponsors Bar** — Logo grid from `sponsors.json`, each linked. "Diventa Partner →" CTA.
  7. **Instagram Section** — Styled link block to @pablo_thegarden or curated photo grid.
- **Components:** `Hero.tsx`, `Countdown.tsx`, `LineupPreview.tsx`, `ExperienceCards.tsx`, `EditionTimeline.tsx`, `SponsorsBar.tsx`, `InstagramFeed.tsx`
- **Acceptance criteria:**
  - All 7 sections render correctly and are responsive
  - Countdown timer updates in real-time client-side
  - Lineup preview adapts to the phase set in `config.json`
  - Scroll animations (Framer Motion) on section entry

### P2 — Lineup Page ✅
- **Priority:** 🔴 Critical
- **Dependencies:** F4, F5
- **Description:** Build the lineup page with the progressive reveal system.
- **Components:** `LineupPhaseManager.tsx`, `ArtistGrid.tsx`, `ArtistCard.tsx`, `MysteryCard.tsx`, `DayFilter.tsx`, `NewBadge.tsx`
- **Phase behaviors:**
  - `coming_soon`: Full-width teaser graphic, grid of mystery cards (candy-wrapped silhouette with shimmer animation), "Lineup in Arrivo" heading, Instagram CTA
  - `revealing`: Mix of revealed ArtistCards + MysteryCards. Revealed cards show photo, name, genre. Recently revealed artists (within `newBadgeDays`) get animated "NEW" / "Appena Annunciato" badge. Mystery cards show "Chi sarà?" with pulse animation.
  - `complete`: Standard grid with day filter tabs (Venerdì 15 / Sabato 16 / Tutti). Artist cards expandable to show bio + social links.
- **MysteryCard design:** Candy-wrapper shape or rounded card with "?" icon, sprinkle texture, subtle shimmer CSS animation.
- **ArtistCard design:** Square photo, name overlay, genre tag pill, time slot. On click: expand inline or modal with bio + social links (Instagram, Spotify, Soundcloud).
- **Acceptance criteria:**
  - All 3 phases render correctly based on `config.json`
  - Day filter works in `complete` phase
  - Artist cards expand/collapse smoothly
  - Mystery cards have candy-themed animation
  - "NEW" badge appears on recently revealed artists and disappears after `newBadgeDays`

### P3 — Tickets Page ✅
- **Priority:** 🔴 Critical
- **Dependencies:** F3 (FloatingTicketCTA), F4
- **Description:** Build the ticket page with release-based pricing.
- **Components:** `ReleaseBanner.tsx`, `ReleaseSection.tsx`, `TicketCard.tsx`, `ReleaseComparison.tsx`, `TicketSelectorModal.tsx`, `FAQ.tsx`
- **Sections:**
  1. **Release Banner** — Current active release badge + progress bar: `Early Bird (Sold Out) → Promo (Active) → Regular (Coming Soon)`
  2. **Active Release Cards** — 3 cards: Full Pass / Day 1 (Fri 15) / Day 2 (Sat 16). Each shows: label, price, included items, status badge, CTA → Clappit URL. Visual states: Available (vibrant + pulse CTA), Sold Out (greyed + stamp), Coming Soon (blurred price + teaser).
  3. **Release Comparison Table** — Matrix: rows = ticket types, columns = Early Bird / Promo / Regular. Sold-out prices shown with strikethrough (FOMO effect).
  4. **Practical Info** — Drink card explanation, age restrictions, wristband info.
  5. **FAQ Accordion** — Expandable Q&A items.
- **TicketSelectorModal** — Reusable modal/drawer triggered by the floating CTA on any page. Shows 3 buttons for current release. Smart: if all sold out, shows "Sold Out" message.
- **Data source:** `/content/tickets.json` (9 SKUs: 3 releases × 3 types)
- **Acceptance criteria:**
  - Release progress bar reflects correct statuses
  - Each ticket card links to correct Clappit URL
  - Sold out cards are visually distinct (greyed, no CTA)
  - Comparison table shows strikethrough on sold-out prices
  - FAQ accordion expands/collapses smoothly
  - TicketSelectorModal works from any page via FloatingTicketCTA

### P4 — Gallery Page
- **Priority:** 🟡 Medium
- **Dependencies:** F4
- **Description:** Photo gallery showcasing past editions.
- **Components:** `GalleryGrid.tsx`, `Lightbox.tsx`
- **Layout:**
  - Edition filter tabs: 2023 (Parrot) / 2024 (Jungle) / 2025 (Flowers)
  - Masonry or CSS grid of curated photos (10–15 per edition)
  - Click to open in lightbox with prev/next navigation
  - "Segui su Instagram →" prominent CTA
- **Images:** Served from `/public/images/gallery/{year}/`, metadata in `/content/gallery.json`
- **Acceptance criteria:**
  - Filter tabs switch editions
  - Lightbox opens/closes, supports keyboard navigation (arrows, escape)
  - Responsive grid (3 cols desktop, 2 tablet, 1 mobile)
  - Images lazy-loaded via `next/image`

### P5 — Blog
- **Priority:** 🟡 Medium
- **Dependencies:** F4, F5
- **Description:** Blog list page + individual post page.
- **List page (`/blog`):** Reverse-chronological grid of post cards. Each card: featured image, title, date, excerpt. Pagination or "load more".
- **Post page (`/blog/[slug]`):** Full MDX rendering, featured image, share buttons (Instagram, WhatsApp, copy link), "Back to all posts" link.
- **Components:** `PostList.tsx`, `PostCard.tsx`
- **Content source:** `/content/blog/{locale}/YYYY-MM-DD-slug.mdx`
- **Acceptance criteria:**
  - Blog list shows posts for current locale only
  - MDX renders custom components (if any), images, links
  - Share buttons work
  - `generateStaticParams` generates all post routes at build time

### P6 — About Page
- **Priority:** 🟡 Medium
- **Dependencies:** F4
- **Description:** Festival history and team story.
- **Sections:**
  1. **The Story** — Origin narrative, "Pablo" the parrot mascot origin
  2. **Edition Timeline** — Interactive/visual: 2023 (Parrot) → 2024 (Jungle) → 2025 (Flowers) → 2026 (Sweet). Each entry: key visual, description, stats. Animated on scroll with Framer Motion.
  3. **The Team** — Group or individual photos with short descriptions
  4. **Mission** — What the festival stands for
- **Content source:** `/content/about/{locale}.md`
- **Acceptance criteria:**
  - Timeline animates on scroll
  - Responsive layout
  - Content renders from markdown per locale

### P7 — Rules Page
- **Priority:** 🟢 Low
- **Dependencies:** F4
- **Description:** Entry rules and behavioral guidelines rendered from markdown.
- **Content:** Entry requirements, prohibited items, behavior policy, safety info, sustainability.
- **Content source:** `/content/rules/{locale}.md`
- **Acceptance criteria:**
  - Clean, readable prose rendering
  - Responsive, uses the design system typography

### P8 — Contact Page
- **Priority:** 🟡 Medium
- **Dependencies:** F3
- **Description:** Partner/sponsor inquiry form + contact info.
- **Sections:**
  1. **Contact Form** — Fields: Name, Email, Company, Type (Sponsor / Media / Vendor / Other), Message. Handled by Formspree (free tier) or Web3Forms. Client-side validation. Success/error feedback states.
  2. **Direct Contact** — Email, Instagram DM link, location map (static image or embedded)
  3. **Sponsor CTA** — "Diventa Partner" messaging
- **Components:** `ContactForm.tsx`
- **Acceptance criteria:**
  - Form submits successfully to external service
  - Validation on required fields, email format
  - Success and error states display correctly
  - No backend required

---

## Agent: `polish`

Animations, sweet-themed visual effects, mobile optimization, and final UX refinements.
Runs after `pages` has completed the core page structure.

### X1 — Sweet Theme Animations & Effects
- **Priority:** 🟡 Medium
- **Dependencies:** P1–P3
- **Description:** Add candy-themed visual polish across the site.
  - Hero: animated candy/confetti particles (Framer Motion or CSS)
  - Scroll-triggered section reveals (fade up, stagger)
  - Page transitions (subtle fade/slide between routes)
  - Hover effects on cards (slight lift, glow)
  - Candy-themed decorative elements: lollipop dividers, sprinkle patterns as section backgrounds, rounded blob shapes
- **Acceptance criteria:**
  - Animations are smooth (60fps), don't cause layout shift
  - Respects `prefers-reduced-motion` media query
  - Decorative elements enhance but don't distract

### X2 — Mobile Optimization Pass
- **Priority:** 🔴 Critical
- **Dependencies:** P1–P8
- **Description:** Ensure every page works flawlessly on mobile.
  - Touch-friendly tap targets (min 44px)
  - Hamburger menu smooth open/close
  - Horizontal scrolling carousels work with swipe
  - Floating CTA doesn't overlap critical content
  - Images appropriately sized per viewport
  - No horizontal overflow on any page
- **Acceptance criteria:**
  - All pages pass manual review on iPhone SE, iPhone 14, Android mid-range viewport sizes
  - No horizontal scroll, no overlapping elements
  - Touch interactions feel native

---

## Agent: `content`

Prepares all content files, translations, and media assets.
Can work in parallel with `foundation` from the start.

### C1 — Italian UI Strings ✅
- **Priority:** 🔴 Critical
- **Description:** Create `/messages/it.json` with all Italian UI text.
  - Nav labels, button text, section headings, form labels, form validation messages, error messages, CTA text, footer text, meta descriptions, 404 page text, accessibility labels (aria-labels), etc.
- **Acceptance criteria:** Every user-visible string in the UI has a corresponding key in `it.json`

### C2 — English UI Strings ✅
- **Priority:** 🔴 Critical
- **Dependencies:** C1
- **Description:** Create `/messages/en.json` — English translations of all keys in `it.json`.
- **Acceptance criteria:** Every key in `it.json` exists in `en.json` with a proper English translation

### C3 — About Page Content ✅
- **Priority:** 🟡 Medium
- **Description:** Write `/content/about/it.md` and `/content/about/en.md`.
  - Festival origin story, team description, mission statement.
  - Reference: the festival started in 2023 in Morrovalle (MC), organized by a group of friends, themed editions each year (Parrot → Jungle → Flowers → Sweet), 6,500+ attendees, promotes electronic music as art, enhances local territory.
- **Acceptance criteria:** Both locale files written, factually accurate, compelling narrative

### C4 — Rules Page Content ✅
- **Priority:** 🟡 Medium
- **Description:** Write `/content/rules/it.md` and `/content/rules/en.md`.
  - Entry requirements, prohibited items, behavior policy, safety, sustainability.
- **Acceptance criteria:** Both locale files written, clear and comprehensive

### C5 — Lineup Placeholder Content ✅
- **Priority:** 🔴 Critical
- **Description:** Create lineup content structure:
  - `/content/lineup/config.json` — Set to `phase: "coming_soon"`, `totalSlots: 12`, `newBadgeDays: 7`
  - At least 2 sample artist `.md` files with `revealed: false` (as templates for real artists later)
- **Acceptance criteria:** Config file valid JSON, sample artist files have correct frontmatter schema

### C6 — Tickets Content ✅
- **Priority:** 🔴 Critical
- **Description:** Create `/content/tickets.json` with all 9 SKUs (3 releases × 3 types).
  - Use placeholder Clappit URLs (to be replaced with real ones later)
  - Set Early Bird as `active`, Promo and Regular as `coming_soon`
  - Include realistic placeholder prices
- **Acceptance criteria:** Valid JSON, all 9 SKUs present, schema matches what the tickets page expects

### C7 — Sponsors Placeholder ✅
- **Priority:** 🟢 Low
- **Description:** Create `/content/sponsors/sponsors.json` with 3–5 placeholder sponsor entries.
  - Each entry: name, logo filename, URL, tier (gold/silver/bronze)
  - Add placeholder SVG logos to `/public/images/sponsors/`
- **Acceptance criteria:** Valid JSON, placeholder logos render

### C8 — Sample Blog Posts ✅
- **Priority:** 🟢 Low
- **Description:** Create 2 sample blog posts:
  - `/content/blog/it/2026-02-14-sweet-edition-announcement.mdx` — First announcement of 2026 Sweet Edition
  - `/content/blog/en/2026-02-14-sweet-edition-announcement.mdx` — English version
  - Include frontmatter: title, date, excerpt, image, tags, locale
- **Acceptance criteria:** MDX files valid, frontmatter correct, renders in blog list and post pages

### C9 — FAQ Content ✅
- **Priority:** 🟢 Low
- **Description:** Create `/content/faq/it.json` and `/content/faq/en.json` with 6–8 common questions.
  - Topics: refunds, age restrictions, dress code, food/drink policy, release differences, accessibility, parking, drink card system.
- **Acceptance criteria:** Valid JSON arrays, questions and answers in both locales

### C10 — Gallery Placeholder ✅
- **Priority:** 🟢 Low
- **Description:** Create `/content/gallery.json` with metadata structure and add 3–4 placeholder images per edition year (2023, 2024, 2025) to `/public/images/gallery/{year}/`.
- **Acceptance criteria:** JSON file valid, images load on gallery page

---

## Agent: `infra`

Infrastructure, deployment, SEO, and monitoring.
Can start I1 in parallel with `foundation`. Other tasks run at the end.

### I1 — Vercel Project & Git Setup ✅
- **Priority:** 🔴 Critical
- **Description:** Initialize Git repo, configure Vercel project.
  - Create `.gitignore` (node_modules, .next, .env.local, etc.)
  - Configure Vercel project settings (framework: Next.js, build command, output directory)
  - Set up automatic deployments from `main` branch
  - Configure preview deployments for PRs
- **Acceptance criteria:**
  - Push to `main` triggers automatic build + deploy
  - Preview URLs generated for branches/PRs
  - Build completes without errors

### I2 — Domain & DNS
- **Priority:** 🟡 Medium (can be done close to launch)
- **Dependencies:** I1
- **Description:** Point pablothegarden.com DNS to Vercel. Configure HTTPS, www redirect.
- **Acceptance criteria:**
  - `pablothegarden.com` serves the site over HTTPS
  - `www.pablothegarden.com` redirects to apex domain
  - SSL certificate active

### I3 — SEO Configuration
- **Priority:** 🟡 Medium
- **Dependencies:** All P tasks
- **Description:** Implement SEO across all pages.
  - Per-page meta tags (title, description, og:image) via Next.js metadata API
  - JSON-LD structured data (Event schema on homepage)
  - Auto-generated `sitemap.xml` via `next-sitemap` or built-in
  - `robots.txt`
  - `hreflang` alternate links for IT/EN
  - Open Graph images (at least one default, ideally per-page)
- **Acceptance criteria:**
  - All pages have unique title + description
  - Social sharing preview (OG image) works on WhatsApp, Instagram, Twitter
  - `sitemap.xml` lists all pages in both locales
  - JSON-LD validates in Google's Rich Results Test

### I4 — Analytics
- **Priority:** 🟢 Low
- **Dependencies:** I2
- **Description:** Set up privacy-friendly analytics.
  - Option A: Umami (self-hosted, free) — requires a small server or use Umami Cloud free tier
  - Option B: Plausible Cloud (~€9/mo)
  - Option C: Vercel Analytics (free tier)
- **Acceptance criteria:**
  - Page views tracked across all routes
  - No cookies set (GDPR-friendly)
  - Dashboard accessible to team

### I5 — Accessibility Audit
- **Priority:** 🟡 Medium
- **Dependencies:** All P tasks, X1
- **Description:** Run accessibility audit and fix issues.
  - Use `axe-core` or Lighthouse accessibility audit
  - Ensure WCAG 2.1 AA compliance
  - Check: color contrast ≥ 4.5:1, keyboard navigation, focus indicators, alt text, semantic HTML, aria labels
- **Acceptance criteria:**
  - Lighthouse accessibility score ≥ 90
  - No critical or serious axe violations
  - All interactive elements keyboard-accessible

### I6 — Performance Audit
- **Priority:** 🟡 Medium
- **Dependencies:** All P tasks, X1, X2
- **Description:** Run performance audit and optimize.
  - Lighthouse performance score target: 90+
  - Check: FCP < 1.5s, LCP < 2.5s, CLS < 0.1
  - Optimize: image sizes, font loading, JS bundle size, unused CSS
- **Acceptance criteria:**
  - Lighthouse performance score ≥ 90 on mobile and desktop
  - All Core Web Vitals in green

---

## Execution Order & Parallelism

```
Week 1 (Foundation):
  [foundation] F1 → F2 → F3, F4, F5 (F4 and F5 can parallel after F1)
  [content]    C1 → C2, C3, C4, C5, C6 (all content can start day 1)
  [infra]      I1 (Git + Vercel setup)

Week 2 (Core Pages):
  [pages]      P1, P2, P3 (can parallel once foundation is done)
  [content]    C7, C8, C9, C10

Week 3 (Remaining Pages + Polish):
  [pages]      P4, P5, P6, P7, P8 (can parallel)
  [polish]     X1 (once P1-P3 are done)
  [infra]      I2 (DNS)

Week 4 (Launch):
  [polish]     X2 (mobile pass)
  [infra]      I3, I4, I5, I6 (SEO, analytics, audits)
  [all]        Final QA
```
