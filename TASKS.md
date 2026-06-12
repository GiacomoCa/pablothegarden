# Pablo The Garden — Task Board

> **Project:** pablothegarden.com — Sweet Edition 2026
> **Design Doc:** `docs/DESIGN.md`
> **Benchmark Reference:** `docs/BENCHMARK.md`
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
- **Description:** Implement the "Sweet Edition" candy theme in Tailwind config. Define CSS variables, color palette, typography with self-hosted fonts (Fredoka One o Baloo 2 per il display, DM Sans o Nunito per il body via `next/font`). Create global styles in `globals.css`.
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
  - `Header.tsx` — Logo, primary nav (Lineup · Tickets · Gallery · About), language switcher, mobile hamburger menu con slide-out drawer. **Nav massimo 4 voci** (lesson da benchmark: nav ultra-minimale)
  - `Footer.tsx` — Logo, secondary nav (Rules · Contact · Privacy Policy), social links (Instagram first, Facebook), language switcher, copyright
  - `Navigation.tsx` — Shared nav link list, active state highlighting
  - `LanguageSwitcher.tsx` — IT/EN toggle, uses `next-intl` locale routing
  - `FloatingTicketCTA.tsx` — Sticky "Acquista Biglietti" / "Get Tickets" button. On click: opens `TicketSelectorModal` (bottom drawer on mobile, centered modal on desktop) showing 3 buttons for the current active release (Full Pass / Day 1 / Day 2), each linking to the corresponding Clappit URL. Reads from `/content/tickets.json`. If all tickets sold out, shows disabled "Sold Out" state.
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
  - `src/lib/content.ts` — Functions: `getLineup()`, `getLineupConfig()`, `getBlogPosts(locale)`, `getBlogPost(slug, locale)`, `getSponsors()`, `getTickets()`, `getRules(locale)`, `getAbout(locale)`, `getFaq(locale)`, `getStats()`
  - `src/lib/types.ts` — TypeScript interfaces per Artist, BlogPost, Sponsor, TicketRelease, TicketConfig, FAQ, LineupConfig, FestivalStats, etc.
  - `src/lib/utils.ts` — Date formatting, locale helpers, "NEW" badge calculator (based on `revealDate` + `newBadgeDays`), animated counter utilities
- **Acceptance criteria:**
  - All content functions return typed data from the `/content/` directory
  - MDX files compile correctly with frontmatter extraction
  - Functions work at build time (compatible with `generateStaticParams`)

### F5 — i18n Setup ✅
- **Priority:** 🔴 Critical
- **Dependencies:** F1
- **Description:** Configure `next-intl` for Italian (default) and English. Set up locale routing, translation file structure, and middleware.
- **Files:**
  - `messages/it.json` — All Italian UI strings (nav labels, button text, section headings, form labels, error messages, CTA text, **brand tagline**, section "Sweet World", sezione stats, etc.)
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
- **Description:** Build the full homepage. Struttura sezioni dall'alto al basso:

  **1. Hero (video full-screen)**
  Il benchmark (elrow, Awakenings, Sonus) conferma: l'hero è sempre un **video in autoplay muto**, mai un'immagine statica. Il video mostra la folla, le luci, le scenografie delle edizioni passate. Sopra il video: logo festival, **brand tagline** (vedi sotto), date "15–16 Agosto 2026", location "Morrovalle (MC)", CTA primaria (apre TicketSelectorModal), CTA secondaria "Scopri il Lineup". Confetti candy animati via Framer Motion.
  - **Componente:** `Hero.tsx`
  - **Nota video:** Se non disponibile, fallback su gradient + foto HD. Il video va preparato dal team con le clip delle edizioni 2023–2025.

  **2. Brand Tagline Block** *(nuovo — da benchmark)*
  Sezione dedicata al claim del brand, **prima del countdown**. Ispirata a elrow ("The kind of craziness this world needs") e Sonus ("Your ultimate Festival Vacation"). Una singola frase memorabile che posiziona Pablo The Garden come identità, non come evento.
  - **Testo suggerito:** *"Una notte. Un giardino. Un altro mondo."* (da confermare con il team)
  - **Visual:** Typography grande, centrata, sfondo dark, animazione fade-in su scroll
  - **Componente:** `BrandTagline.tsx`

  **3. Countdown**
  Days/Hours/Minutes/Seconds to Aug 15, 2026 18:00 CEST. Candy-styled number cards with flip animation.
  - **Componente:** `Countdown.tsx`

  **4. Sweet World Section** *(nuovo — da benchmark)*
  Sezione dedicata al mondo visivo della Sweet Edition. Ispirata al pattern di elrow che tratta ogni "tema" come un prodotto a sé con una pagina dedicata. Qui si racconta l'universo candy: colori, scenografie, atmosfera attesa.
  - **Contenuto:** Heading "Entra nella Sweet Edition", sottotitolo descrittivo (da `content/sweetworld/it.md`), 3–4 immagini teaser delle scenografie candy (anticipazioni o moodboard), piccolo testo narrativo
  - **Visual:** Sfondo con pattern caramelle/sprinkles, colori accesi (candy pink + orange), illustrazioni o foto mockup
  - **Componente:** `SweetWorldSection.tsx`
  - **Content source:** `/content/sweetworld/{locale}.md`

  **5. Lineup Preview**
  Phase-aware: if `coming_soon` → teaser banner + Instagram CTA; if `revealing` → ultimi artisti rivelati con badge "NEW" + mystery slots; if `complete` → top 6 headliners. "Vedi Lineup Completo →" link.
  - **Componente:** `LineupPreview.tsx`

  **6. Experience Cards**
  3–4 cards: Music · Food & Drink · Fun Zone · Scenography. Short text + icons/illustrations.
  - **Componente:** `ExperienceCards.tsx`

  **7. Edition Timeline**
  Horizontal scroll strip: 2023 (Parrot) → 2024 (Jungle) → 2025 (Flowers) → 2026 (Sweet). Each with key visual.
  - **Componente:** `EditionTimeline.tsx`

  **8. Pablo Stats Counter** *(nuovo — da benchmark)*
  Sezione con counter animati. Ispirata a "Planet Elrow" (680 shows · 3.8M attendees · 48 countries) ma scalata alla dimensione di Pablo. I numeri raccontano una storia di crescita e di radici locali.
  - **Stats suggerite:** `4 Edizioni` · `1 Giardino` · `15.000+ Presenze` · `1 Estate Marchigiana`
  - **Visual:** Counter che si animano quando entrano nel viewport (Intersection Observer + Framer Motion), sfondo dark candy, numeri grandi e colorati
  - **Componente:** `StatsCounter.tsx`
  - **Data source:** `/content/stats.json`

  **9. Sponsors Bar**
  Logo grid from `sponsors.json`, each linked. "Diventa Partner →" CTA.
  - **Componente:** `SponsorsBar.tsx`

  **10. Instagram Section**
  Styled link block to @pablo_thegarden o curated photo grid.
  - **Componente:** `InstagramFeed.tsx`

- **Acceptance criteria:**
  - Tutte le 10 sezioni renderizzano correttamente e sono responsive
  - L'hero usa video se disponibile, fallback su immagine
  - Il brand tagline è visibile e animato correttamente
  - La Sweet World section mostra il contenuto da file markdown
  - Il countdown aggiorna in real-time client-side
  - Il lineup preview si adatta alla fase in `config.json`
  - I counter si animano quando entrano nel viewport
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
- **MysteryCard design:** Candy-wrapper shape o rounded card con "?" icon, sprinkle texture, subtle shimmer CSS animation.
- **ArtistCard design:** Square photo, name overlay, genre tag pill, time slot. On click: expand inline o modal with bio + social links (Instagram, Spotify, Soundcloud).
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
  2. **Active Release Cards** — 3 cards: Full Pass / Day 1 (Fri 15) / Day 2 (Sat 16). Visual states: Available (vibrant + pulse CTA), Sold Out (greyed + stamp), Coming Soon (blurred price + teaser).
  3. **Release Comparison Table** — Matrix con prezzi barrati sulle release esaurite (FOMO effect).
  4. **Practical Info** — Drink card explanation, age restrictions, wristband info.
  5. **FAQ Accordion** — Expandable Q&A items.
- **TicketSelectorModal** — Reusable modal/drawer triggered by the floating CTA on any page.
- **Data source:** `/content/tickets.json` (9 SKUs: 3 releases × 3 types)
- **Acceptance criteria:**
  - Release progress bar reflects correct statuses
  - Each ticket card links to correct Clappit URL
  - Sold out cards are visually distinct (greyed, no CTA)
  - Comparison table shows strikethrough on sold-out prices
  - FAQ accordion expands/collapses smoothly
  - TicketSelectorModal works from any page via FloatingTicketCTA

### P4 — Gallery Page ✅
- **Priority:** 🟡 Medium
- **Dependencies:** F4
- **Description:** Photo gallery showcasing past editions.
- **Components:** `GalleryGrid.tsx`, `Lightbox.tsx`
- **Layout:**
  - Edition filter tabs: 2023 (Parrot) / 2024 (Jungle) / 2025 (Flowers)
  - Masonry o CSS grid (10–15 foto per edizione)
  - Click to open in lightbox con prev/next navigation
  - "Segui su Instagram →" prominent CTA
- **Images:** Served from `/public/images/gallery/{year}/`, metadata in `/content/gallery.json`
- **Acceptance criteria:**
  - Filter tabs switch editions
  - Lightbox opens/closes, supports keyboard navigation (arrows, escape)
  - Responsive grid (3 cols desktop, 2 tablet, 1 mobile)
  - Images lazy-loaded via `next/image`

### P5 — Blog ✅
- **Priority:** 🟡 Medium
- **Dependencies:** F4, F5
- **Description:** Blog list page + individual post page.
- **Content source:** `/content/blog/{locale}/YYYY-MM-DD-slug.mdx`
- **Acceptance criteria:**
  - Blog list shows posts for current locale only
  - MDX renders custom components, images, links
  - Share buttons work (Instagram, WhatsApp, copy link)
  - `generateStaticParams` generates all post routes at build time

### P6 — About Page ✅
- **Priority:** 🟡 Medium
- **Dependencies:** F4
- **Description:** Festival history and team story.
- **Sections:**
  1. **The Story** — Origine del festival, nascita del personaggio Pablo il pappagallo
  2. **Edition Timeline** — Interactive: 2023 (Parrot) → 2024 (Jungle) → 2025 (Flowers) → 2026 (Sweet). Ogni entry: key visual, descrizione, stats. Animated on scroll.
  3. **The Team** — Foto e descrizioni
  4. **Mission** — Cosa rappresenta il festival
- **Content source:** `/content/about/{locale}.md`

### P7 — Rules Page ✅
- **Priority:** 🟢 Low
- **Dependencies:** F4
- **Content source:** `/content/rules/{locale}.md`

### P8 — Contact Page ✅
- **Priority:** 🟡 Medium
- **Dependencies:** F3
- **Sections:**
  1. **Contact Form** — Fields: Name, Email, Company, Type (Sponsor / Media / Vendor / Other), Message. Handled by Formspree.
  2. **Direct Contact** — Email, Instagram DM link, location map
  3. **Sponsor CTA** — "Diventa Partner" messaging

---

## Agent: `polish`

Animations, sweet-themed visual effects, mobile optimization, and final UX refinements.

### X1 — Sweet Theme Animations & Effects ✅
- **Priority:** 🟡 Medium
- **Dependencies:** P1–P3
- **Description:** Add candy-themed visual polish across the site.
  - Hero: **video background** con overlay gradient (priorità assoluta — da benchmark tutti i festival top usano video autoplay muto come hero)
  - Candy/confetti particles overlay sull'hero se non c'è video
  - Scroll-triggered section reveals (fade up, stagger) — entry in viewport con Framer Motion
  - Animazione dei counter in `StatsCounter.tsx` (count-up su Intersection Observer)
  - Animated candy "unwrapping" transition per la Sweet World section
  - Page transitions (subtle fade/slide tra routes)
  - Hover effects on cards (slight lift, candy pink glow)
  - Candy decorative elements: lollipop dividers, sprinkle patterns come section backgrounds, blob shapes
- **Acceptance criteria:**
  - Hero video plays automatically, muted, looped, no controls visible
  - Tutti gli altri punti da lista sopra ✅
  - Animations smooth (60fps), no layout shift
  - Rispetta `prefers-reduced-motion` media query

### X2 — Mobile Optimization Pass ✅
- **Priority:** 🔴 Critical
- **Dependencies:** P1–P8
- **Description:** Ensure every page works flawlessly on mobile.
  - Touch-friendly tap targets (min 44px)
  - Hamburger menu smooth open/close
  - Horizontal scrolling carousels work with swipe
  - Floating CTA non copre contenuto critico
  - Images appropriately sized per viewport
  - No horizontal overflow su nessuna pagina
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
  - Nav labels, button text, section headings, form labels, form validation messages, error messages, CTA text, footer text, meta descriptions, 404 page text, accessibility labels (aria-labels)
  - **Aggiungere:** chiave `brandTagline` ("Una notte. Un giardino. Un altro mondo." — da confermare con il team), chiavi per `sweetWorldSection` (heading, sottotitolo, CTA), chiavi per `statsSection` (label di ciascun counter)
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
- **Acceptance criteria:** Both locale files written, factually accurate, compelling narrative

### C4 — Rules Page Content ✅
- **Priority:** 🟡 Medium
- **Description:** Write `/content/rules/it.md` and `/content/rules/en.md`.
- **Acceptance criteria:** Both locale files written, clear and comprehensive

### C5 — Lineup Placeholder Content ✅
- **Priority:** 🔴 Critical
- **Description:** Create lineup content structure:
  - `/content/lineup/config.json` — Set to `phase: "coming_soon"`, `totalSlots: 12`, `newBadgeDays: 7`
  - Almeno 2 sample artist `.md` files con `revealed: false`

### C6 — Tickets Content ✅
- **Priority:** 🔴 Critical
- **Description:** Create `/content/tickets.json` with all 9 SKUs (3 releases × 3 types).
  - Early Bird come `active`, Promo e Regular come `coming_soon`

### C7 — Sponsors Placeholder ✅
- **Priority:** 🟢 Low
- **Description:** Create `/content/sponsors/sponsors.json` con 3–5 placeholder sponsor entries.

### C8 — Sample Blog Posts ✅
- **Priority:** 🟢 Low
- **Description:** 2 sample blog posts IT/EN.

### C9 — FAQ Content ✅
- **Priority:** 🟢 Low
- **Description:** Create `/content/faq/it.json` and `/content/faq/en.json` con 6–8 domande.

### C10 — Gallery Placeholder ✅
- **Priority:** 🟢 Low
- **Description:** Create `/content/gallery.json` e placeholder images per year.

### C11 — Sweet World Content *(nuovo)* ✅
- **Priority:** 🟡 Medium
- **Description:** Write `/content/sweetworld/it.md` e `/content/sweetworld/en.md`.
  - Testo narrativo che racconta il mondo visivo della Sweet Edition: colori, atmosfera, scenografie previste, l'idea di "entrare in un mondo di caramelle".
  - Include frontmatter: `heading`, `subtitle`, `ctaLabel`, `ctaUrl`, array `images` con percorsi a 3–4 immagini teaser (moodboard candy, foto delle scenografie in preparazione, o immagini di reference)
- **Acceptance criteria:** Both locale files written, testo coinvolgente e in linea col brand, immagini placeholder presenti

### C12 — Festival Stats *(nuovo)* ✅
- **Priority:** 🟡 Medium
- **Description:** Create `/content/stats.json` con i numeri delle edizioni.
  - Schema: `[{ "value": 4, "label_it": "Edizioni", "label_en": "Editions" }, { "value": 1, "label_it": "Giardino", "label_en": "Garden" }, { "value": 15000, "label_it": "Presenze", "label_en": "Attendees", "suffix": "+" }, { "value": 1, "label_it": "Estate Marchigiana", "label_en": "Marche Summer", "prefix": "" }]`
  - I numeri devono essere verificati con il team prima di pubblicare
- **Acceptance criteria:** Valid JSON, schema corretto, numeri realistici e verificati

---

## Agent: `infra`

Infrastructure, deployment, SEO, and monitoring.
Can start I1 in parallel with `foundation`.

### I1 — Vercel Project & Git Setup ✅
- **Priority:** 🔴 Critical

### I2 — Domain & DNS
- **Priority:** 🟡 Medium
- **Dependencies:** I1

### I3 — SEO Configuration ✅
- **Priority:** 🟡 Medium
- **Dependencies:** All P tasks
- **Description:** Implement SEO across all pages.
  - Per-page meta tags via Next.js metadata API
  - JSON-LD Event schema su homepage
  - Auto-generated `sitemap.xml`
  - `robots.txt`
  - `hreflang` alternate links IT/EN
  - Open Graph images (og:image ottimizzata per WhatsApp, Instagram, Twitter — **fondamentale per condivisione social**)

### I4 — Analytics
- **Priority:** 🟢 Low
- **Dependencies:** I2

### I5 — Accessibility Audit
- **Priority:** 🟡 Medium
- **Dependencies:** All P tasks, X1

### I6 — Performance Audit
- **Priority:** 🟡 Medium
- **Dependencies:** All P tasks, X1, X2

---

## Execution Order & Parallelism

```
Week 1 (Foundation):
  [foundation] F1 → F2 → F3, F4, F5 (F4 e F5 parallel dopo F1)
  [content]    C1 → C2, C3, C4, C5, C6, C11, C12 (tutto content può partire giorno 1)
  [infra]      I1 (Git + Vercel setup)

Week 2 (Core Pages):
  [pages]      P1, P2, P3 (parallel una volta completata foundation)
  [content]    C7, C8, C9, C10

Week 3 (Remaining Pages + Polish):
  [pages]      P4, P5, P6, P7, P8 (parallel)
  [polish]     X1 (dopo P1-P3)
  [infra]      I2 (DNS)

Week 4 (Launch):
  [polish]     X2 (mobile pass)
  [infra]      I3, I4, I5, I6 (SEO, analytics, audit)
  [all]        Final QA
```

---

## Changelog

| Data | Modifica |
|---|---|
| Feb 2026 | Versione iniziale |
| Giu 2026 | Aggiornato da benchmark Tomorrowland / elrow / Awakenings / Sonus: aggiunto brand tagline (P1), Sweet World section (P1 + C11), Stats counter (P1 + C12), spec hero video obbligatorio (X1), nav ridotta a 4 voci (F3) |
