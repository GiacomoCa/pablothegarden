# Pablo The Garden — Website Design Document

**Project:** pablothegarden.com — 4th Edition "Sweet Edition" (2026)
**Date:** February 14, 2026
**Status:** Ready for Development
**Timeline:** ASAP — Target go-live within 3–4 weeks

---

## 1. Project Overview

### 1.1 Context

Pablo The Garden is an electronic music festival held annually in the garden of a private villa in Morrovalle (MC), Italy. The 4th edition — themed "Candies / Sweet" — takes place August 15–16, 2026. Previous themes were: Parrot (2023), Jungle (2024), Flowers (2025). The event attracts 6,500+ attendees with national/international DJ sets, food trucks, fun zones, immersive scenography, and inflatable gadgets.

### 1.2 Goals

The website must:

1. **Inform** — Event dates, location, lineup/timetable, and entry rules
2. **Convert** — Drive ticket purchases via external link to Clappit
3. **Showcase** — Photos and videos from past editions (link to Instagram)
4. **Attract sponsors** — Visible sponsor area + contact form for potential partners
5. **Tell the story** — History of the organizing group and the festival's evolution
6. **Engage** — Blog/news section for announcements, lineup reveals, and updates

### 1.3 Constraints

| Constraint | Decision |
|---|---|
| Budget | < €500 total (dev + 1st year hosting) |
| Team | In-house developers |
| Timeline | Live within 3–4 weeks |
| Content mgmt | Markdown files in Git repo (no external CMS) |
| Ticketing | External redirect to Clappit |
| Domain | Already owned |
| Languages | Italian (primary) + English |

---

## 2. Information Architecture

### 2.1 Sitemap

```
pablothegarden.com/
├── / ...................... Homepage (hero, dates, lineup preview, sponsors, CTA)
├── /lineup ............... Full lineup with artist cards + bios (filterable by day)
├── /tickets .............. Ticket info, pricing tiers, CTA → Clappit
├── /gallery .............. Photo/video highlights + Instagram embed/link
├── /blog ................. News & updates (lineup reveals, announcements)
│   └── /blog/[slug] ...... Individual blog post
├── /about ................ Festival history timeline + team story
├── /rules ................ Entry rules, prohibited items, practical info
├── /contact .............. Partner/sponsor inquiry form
└── /[locale]/... ......... All routes duplicated under /it/ and /en/
```

### 2.2 Navigation Structure

**Primary Nav (header):**
Lineup · Tickets · Gallery · Blog · About

**Secondary Nav (footer):**
Rules · Contact · Privacy Policy · Instagram · Facebook

**Floating CTA (always visible):**
"Get Tickets" button — sticky on mobile, fixed position on desktop. Smart behavior: if one release is active, opens a mini ticket selector modal/drawer with 3 buttons (Full Pass / Day 1 / Day 2) for the current release, each linking to Clappit. If all sold out, shows "Sold Out" state.

---

## 3. Page-by-Page Functional Design

### 3.1 Homepage `/`

The homepage is the main landing page and must immediately communicate the event's identity, dates, and "sweet" theme.

**Sections (top to bottom):**

1. **Hero Section**
   - Full-screen visual with candy/sweet-themed artwork or video background
   - Festival logo (Pablo The Garden — Sweet Edition)
   - Dates: "15–16 Agosto 2026"
   - Location: "Morrovalle (MC)"
   - Primary CTA: "Acquista Biglietti" → opens ticket selector modal (Full Pass / Day 1 / Day 2 for current active release)
   - If tickets not yet on sale: CTA reads "Biglietti in Arrivo" (Coming Soon) with a muted/teaser style
   - Secondary CTA: "Scopri il Lineup"
   - Animated candy/confetti particles or subtle sweet-themed motion

2. **Countdown Timer**
   - Days/Hours/Minutes/Seconds to event start
   - Styled with candy-themed visual treatment

3. **Lineup Preview**
   - Adapts to the current reveal phase:
     - *Coming Soon phase:* Teaser banner with "Lineup Coming Soon" + mystery card silhouettes + Instagram CTA
     - *Revealing phase:* Shows the latest 4–6 revealed artists with "NEW" badges + remaining mystery slots
     - *Complete phase:* Top 4–6 headliners with photos in a horizontal scroll or grid
   - "Vedi Lineup Completo →" link (all phases)
   - Sourced from `/content/lineup/` markdown files + `/content/lineup/config.json`

4. **Experience Section**
   - 3–4 cards: Music · Food & Drink · Fun Zone · Scenography
   - Short descriptions with icons or illustrations
   - Communicates "not just music, it's an experience"

5. **Edition History Carousel**
   - Visual strip showing: 2023 (Parrot) → 2024 (Jungle) → 2025 (Flowers) → 2026 (Sweet)
   - Each with a key visual/illustration from that year

6. **Sponsors Bar**
   - Logo grid of current sponsors (5–10 logos)
   - Each logo links to sponsor's website
   - "Diventa Partner →" CTA linking to /contact
   - Sourced from `/content/sponsors/` markdown or JSON

7. **Instagram Feed Preview**
   - Embed latest 4–6 posts or a styled link block to @pablo_thegarden
   - Alternatively: curated photo grid linking to Instagram

8. **Footer**
   - Logo, social links, secondary nav, legal info
   - Newsletter signup (optional — can use Mailchimp free tier)
   - Language switcher (IT/EN)

---

### 3.2 Lineup Page `/lineup`

**Purpose:** Full artist roster with bios, filterable by day — with a **progressive reveal system** to build hype before the event.

#### 3.2.1 Progressive Lineup Reveal System

The lineup page goes through distinct phases, controlled by a simple `status` field on each artist's content file:

**Phase 1 — "Coming Soon" (no artists announced)**
- The page displays a full-width teaser graphic with the "Sweet Edition" candy theme
- Heading: "Lineup Coming Soon" / "Lineup in Arrivo"
- A grid of mystery cards (e.g., 8–12 cards) — each showing a candy-wrapped silhouette or a "?" icon with a swirl animation
- CTA: "Follow us on Instagram to be the first to know" + email signup for lineup alerts
- Countdown to the first reveal date (optional)

**Phase 2 — Progressive Reveals (artists announced one by one or in batches)**
- As artists are announced, their mystery card "unwraps" — replaced by the real artist card with photo, name, and genre
- Unrevealed slots remain as mystery cards with text like "Coming Soon..." or "Chi sarà?" (Who will it be?)
- Each new reveal can be accompanied by a blog post or Instagram teaser
- The most recently revealed artist gets a "NEW" or "Just Announced" badge with a subtle glow/pulse animation
- Visual effect: a candy "unwrapping" transition (CSS animation) when a card goes from hidden to revealed

**Phase 3 — Full Lineup (all artists revealed)**
- Standard lineup page with all artist cards visible
- Mystery cards disappear; full grid with day filter active

#### 3.2.2 How It Works (Content-Driven)

Each artist's markdown file has a `revealed` field:

```yaml
---
name: "DJ Example"
slug: "dj-example"
day: 1
time: "22:00 - 23:30"
genre: "Techno"
photo: "/images/lineup/dj-example.jpg"
bio: "Short artist biography..."
revealed: true           # false = mystery card, true = visible
revealDate: "2026-04-15" # date the artist was announced (for "NEW" badge logic)
order: 1
social:
  instagram: "https://instagram.com/djexample"
  spotify: "https://open.spotify.com/artist/..."
  soundcloud: "https://soundcloud.com/djexample"
---
```

A global config file `/content/lineup/config.json` controls the overall phase:

```json
{
  "phase": "revealing",
  "totalSlots": 12,
  "newBadgeDays": 7,
  "comingSoonMessage": {
    "it": "Lineup in arrivo... seguici per non perderti nulla!",
    "en": "Lineup coming soon... follow us to stay in the loop!"
  },
  "mysteryCardMessage": {
    "it": "Chi sarà?",
    "en": "Who's next?"
  }
}
```

- `phase`: `"coming_soon"` | `"revealing"` | `"complete"`
- `totalSlots`: how many cards to show in the grid (mix of revealed + mystery)
- `newBadgeDays`: how many days after `revealDate` the "NEW" badge stays visible

**To reveal an artist:** simply change `revealed: false` → `revealed: true` in their markdown file and push to `main`. The site rebuilds in ~60 seconds and the artist card appears.

#### 3.2.3 Full Lineup Layout (Phase 3)

- Day tabs/filter: "Venerdì 15 Agosto" / "Sabato 16 Agosto" / "Tutti"
- Artist cards in a responsive grid (3 cols desktop, 2 tablet, 1 mobile)

**Each Artist Card contains:**
- Artist photo (square, consistent aspect ratio)
- Name
- Subgenre tag (e.g., "Techno", "House", "Melodic")
- Time slot (e.g., "22:00 – 23:30")
- On click/tap: expands to show bio, social links (Instagram, Soundcloud, Spotify)

**Mystery Card contains:**
- Candy-wrapped silhouette or "?" graphic (themed to Sweet Edition)
- Subtle shimmer/pulse animation
- "Chi sarà?" / "Who's next?" text
- No click action

---

### 3.3 Tickets Page `/tickets`

**Purpose:** Ticket info + redirect to Clappit, with a **release-based pricing system** that creates urgency and rewards early buyers.

#### 3.3.1 Ticket Release Structure

There are **3 sequential releases**, each with **3 ticket types**:

| Release | Description | Availability |
|---|---|---|
| 🎟️ **1st Release — Early Bird** | Limited quantity, lowest price. Rewards loyal fans. | Opens first, sells out fast |
| 🎟️ **2nd Release — Promo** | Mid-tier pricing, larger allocation. | Opens when Early Bird sells out |
| 🎟️ **3rd Release — Regular** | Full price, final availability. | Opens when Promo sells out (or at a set date) |

Each release offers **3 ticket types:**

| Ticket Type | Description |
|---|---|
| **Full Pass (2 Days)** | Entry for both August 15 + 16, includes drink card for both nights |
| **Day 1 — Venerdì 15 Agosto** | Single-day entry for Friday, includes drink card |
| **Day 2 — Sabato 16 Agosto** | Single-day entry for Saturday, includes drink card |

This gives a total of **9 ticket SKUs** (3 releases × 3 types). Each SKU has its own status and Clappit URL.

#### 3.3.2 Page Layout

**Sections (top to bottom):**

1. **Hero / Current Release Banner**
   - Highlights which release is currently active with a prominent badge
   - If Early Bird: "🔥 Early Bird — Posti Limitati!" with urgency styling (animated border, countdown if applicable)
   - If Promo: "⚡ Promo Release — Disponibile Ora"
   - If Regular: "🎟️ Regular Release — Ultime Disponibilità"
   - Shows a mini progress bar: `Early Bird (Sold Out) → Promo (Active) → Regular (Coming Soon)`

2. **Ticket Grid — Current Active Release**
   - 3 cards side by side (desktop) or stacked (mobile):

   **Full Pass Card:**
   - "Abbonamento 2 Giorni" / "Full Pass 2 Days"
   - Price (e.g., "€25" for Early Bird)
   - "15 + 16 Agosto"
   - Includes: entry both nights + drink card
   - CTA button → Clappit URL for this specific SKU
   - Status badge: Available / Sold Out / Coming Soon

   **Day 1 Card:**
   - "Venerdì 15 Agosto" / "Friday August 15"
   - Price
   - Includes: entry + drink card
   - CTA button → Clappit URL
   - Status badge

   **Day 2 Card:**
   - "Sabato 16 Agosto" / "Saturday August 16"
   - Price
   - Includes: entry + drink card
   - CTA button → Clappit URL
   - Status badge

   Visual treatment per status:
   - **Available:** Vibrant candy-themed card, animated CTA button with pulse effect
   - **Sold Out:** Greyed out / muted with "Sold Out" stamp overlay, no CTA
   - **Coming Soon:** Teaser styling with blurred price, "Coming Soon" badge, optional notify CTA

3. **Release Comparison Table**
   - Shows all 3 releases in a comparison matrix so visitors can see what they missed and what's coming
   - Columns: Early Bird / Promo / Regular
   - Rows: Full Pass price, Day 1 price, Day 2 price, Status
   - Sold-out releases have strikethrough prices to show the deal people missed (creates FOMO)

4. **Practical Info**
   - Drink card system explanation
   - Age restrictions
   - What the ticket includes
   - Wristband pickup instructions

5. **FAQ Accordion**
   - "Can I get a refund?"
   - "What's the difference between releases?"
   - "Can I upgrade from a single day to a full pass?"
   - "Is there a dress code?"
   - "Can I bring food/drinks?"
   - etc.

#### 3.3.3 Floating CTA Behavior

The **sticky "Get Tickets" button** (visible on all pages) should be smart:
- If only one release is active → links directly to the Clappit page for that release
- If multiple options are available → opens a **mini ticket selector modal/drawer** with the 3 ticket type buttons for the current release
- If everything is sold out → changes to "Sold Out — Join Waitlist" or "Sold Out" (disabled)

#### 3.3.4 Content Source

`/content/tickets.json`:

```json
{
  "activeRelease": "promo",
  "releases": {
    "earlybird": {
      "label": { "it": "Early Bird", "en": "Early Bird" },
      "description": { "it": "Posti limitati, prezzo speciale!", "en": "Limited spots, special price!" },
      "status": "sold_out",
      "tickets": {
        "fullpass": {
          "label": { "it": "Abbonamento 2 Giorni", "en": "Full Pass 2 Days" },
          "price": 25,
          "currency": "EUR",
          "status": "sold_out",
          "url": "https://www.clappit.com/biglietti/pablo-earlybird-fullpass"
        },
        "day1": {
          "label": { "it": "Venerdì 15 Agosto", "en": "Friday August 15" },
          "price": 15,
          "currency": "EUR",
          "status": "sold_out",
          "url": "https://www.clappit.com/biglietti/pablo-earlybird-day1"
        },
        "day2": {
          "label": { "it": "Sabato 16 Agosto", "en": "Saturday August 16" },
          "price": 15,
          "currency": "EUR",
          "status": "sold_out",
          "url": "https://www.clappit.com/biglietti/pablo-earlybird-day2"
        }
      }
    },
    "promo": {
      "label": { "it": "Promo", "en": "Promo" },
      "description": { "it": "Seconda release disponibile!", "en": "Second release available!" },
      "status": "active",
      "tickets": {
        "fullpass": {
          "label": { "it": "Abbonamento 2 Giorni", "en": "Full Pass 2 Days" },
          "price": 30,
          "currency": "EUR",
          "status": "available",
          "url": "https://www.clappit.com/biglietti/pablo-promo-fullpass"
        },
        "day1": {
          "label": { "it": "Venerdì 15 Agosto", "en": "Friday August 15" },
          "price": 18,
          "currency": "EUR",
          "status": "available",
          "url": "https://www.clappit.com/biglietti/pablo-promo-day1"
        },
        "day2": {
          "label": { "it": "Sabato 16 Agosto", "en": "Saturday August 16" },
          "price": 18,
          "currency": "EUR",
          "status": "available",
          "url": "https://www.clappit.com/biglietti/pablo-promo-day2"
        }
      }
    },
    "regular": {
      "label": { "it": "Regular", "en": "Regular" },
      "description": { "it": "Ultima release!", "en": "Final release!" },
      "status": "coming_soon",
      "tickets": {
        "fullpass": {
          "label": { "it": "Abbonamento 2 Giorni", "en": "Full Pass 2 Days" },
          "price": 35,
          "currency": "EUR",
          "status": "coming_soon",
          "url": "https://www.clappit.com/biglietti/pablo-regular-fullpass"
        },
        "day1": {
          "label": { "it": "Venerdì 15 Agosto", "en": "Friday August 15" },
          "price": 22,
          "currency": "EUR",
          "status": "coming_soon",
          "url": "https://www.clappit.com/biglietti/pablo-regular-day1"
        },
        "day2": {
          "label": { "it": "Sabato 16 Agosto", "en": "Saturday August 16" },
          "price": 22,
          "currency": "EUR",
          "status": "coming_soon",
          "url": "https://www.clappit.com/biglietti/pablo-regular-day2"
        }
      }
    }
  }
}
```

**To open a new release:** edit `tickets.json` — update `activeRelease`, change the release's `status` to `"active"`, update individual ticket statuses. Push to `main`.

---

### 3.4 Gallery Page `/gallery`

**Purpose:** Showcase past editions, drive Instagram engagement.

**Layout:**
- Edition filter tabs: 2023 (Parrot) / 2024 (Jungle) / 2025 (Flowers)
- Masonry or grid layout of curated photos
- Each photo opens in a lightbox
- "Segui su Instagram per tutti i contenuti →" prominent CTA
- Optional: embedded Instagram feed (using an embed script or curated static images)

**Content source:**
- Static images stored in `/public/images/gallery/2023/`, `/2024/`, `/2025/`
- Metadata in `/content/gallery.json` (captions, edition, order)

**Note:** To avoid hosting hundreds of high-res images, consider: a curated selection (10–15 per edition) on-site + a strong CTA to Instagram for the full archive.

---

### 3.5 Blog Page `/blog`

**Purpose:** Announcements, lineup reveals, event updates.

**List View (`/blog`):**
- Reverse-chronological list/grid of posts
- Each post card: featured image, title, date, excerpt
- Pagination or "load more"

**Post View (`/blog/[slug]`):**
- Full article with MDX support (can embed components, videos, etc.)
- Featured image
- Share buttons (Instagram, WhatsApp, copy link)
- "Back to all posts" link

**Content source:** `/content/blog/YYYY-MM-DD-slug.mdx` with frontmatter:
```yaml
---
title: "Lineup Day 1 Revealed!"
date: "2026-05-15"
excerpt: "The first headliners for Sweet Edition are here..."
image: "/images/blog/lineup-reveal.jpg"
tags: ["lineup", "announcement"]
locale: "it" # or "en"
---
```

---

### 3.6 About Page `/about`

**Purpose:** Tell the story of Pablo The Garden and the organizing team.

**Sections:**

1. **The Story**
   - Origin story: how the group of friends started the festival
   - The name "Pablo" and the parrot mascot

2. **Edition Timeline**
   - Visual, interactive timeline:
     - 2023 — Pablo Edition (the parrot mascot, 1st edition)
     - 2024 — Jungle Edition (the parrot migrates)
     - 2025 — Flower Edition (the garden blooms)
     - 2026 — Sweet Edition (candies & sweetness)
   - Each entry: key visual, short description, main stats (attendees, headliner)

3. **The Team**
   - Group photo or individual photos
   - Short bios or a collective description
   - Roles (if desired)

4. **Mission / Vision**
   - What the festival stands for
   - Community, music as art, local territory enhancement

**Content source:** `/content/about.md`

---

### 3.7 Rules Page `/rules`

**Purpose:** Practical entry rules and behavioral guidelines.

**Content (suggested structure):**

- **Entry Requirements:** Valid ID, minimum age (if applicable), ticket + wristband
- **Prohibited Items:** Glass bottles, drugs, weapons, professional cameras (if applicable), pets
- **Behavior:** Zero tolerance for harassment, respect the garden/property, noise curfew
- **Safety:** First aid location, emergency exits, designated drivers info
- **Sustainability:** Waste disposal, reusable cups (if applicable)

**Content source:** `/content/rules.md`

---

### 3.8 Contact Page `/contact`

**Purpose:** Partner/sponsor inquiries and general contact.

**Sections:**

1. **Contact Form**
   - Fields: Name, Email, Company/Organization, Type (Sponsor / Media / Vendor / Other), Message
   - Form submissions handled by Formspree (free tier: 50 submissions/month) or Resend
   - Sends to the organizers' email
   - Success/error states with feedback

2. **Direct Contact Info**
   - Email address
   - Instagram DM link
   - Location map (embedded Google Maps or static map image)

3. **Sponsor CTA**
   - "Want to partner with Pablo The Garden? Get in touch and let's create something sweet together."

**Tech:** Form handled client-side with a free form backend (Formspree, Web3Forms, or Netlify Forms)

---

## 4. Technical Architecture

### 4.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     VISITORS                             │
│              (Desktop / Mobile / Tablet)                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  CDN / EDGE NETWORK                      │
│              (Vercel / Cloudflare Pages)                  │
│         Static assets cached globally                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              NEXT.JS APPLICATION                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Static Pages │  │  MDX Content │  │    i18n       │  │
│  │  (SSG at     │  │  (lineup,    │  │  (next-intl)  │  │
│  │   build time)│  │   blog,      │  │  IT / EN      │  │
│  │              │  │   sponsors)  │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Tailwind CSS│  │  Framer      │  │  Image        │  │
│  │  + Custom    │  │  Motion      │  │  Optimization │  │
│  │  Theme       │  │  (animations)│  │  (next/image) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
           ┌───────────┼───────────────┐
           ▼           ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│  Formspree   │ │  Instagram   │ │   Clappit        │
│  (contact    │ │  (embeds /   │ │   (ticket        │
│   form)      │ │   links)     │ │    redirect)     │
│  FREE TIER   │ │              │ │                  │
└──────────────┘ └──────────────┘ └──────────────────┘
```

### 4.2 Tech Stack

| Layer | Technology | Why | Cost |
|---|---|---|---|
| **Framework** | Next.js 14+ (App Router) | SSG, great DX, image optimization, i18n, MDX | Free |
| **Language** | TypeScript | Type safety, better DX | Free |
| **Styling** | Tailwind CSS v4 | Rapid development, consistent design system | Free |
| **Animations** | Framer Motion | Smooth scroll animations, page transitions, candy effects | Free |
| **Content** | MDX files in repo | Zero cost, Git-versioned, flexible | Free |
| **i18n** | next-intl | Mature Next.js i18n library, supports App Router | Free |
| **Contact Form** | Formspree or Web3Forms | No backend needed, free tier sufficient | Free |
| **Analytics** | Plausible Cloud or Umami (self-hosted) | Privacy-friendly, lightweight | Free (Umami) or ~€9/mo (Plausible) |
| **Hosting** | Vercel (free tier) | Automatic deployments from Git, global CDN, HTTPS | Free |
| **Domain** | Already owned | Point DNS to Vercel | ~€10/yr renewal |
| **Email** | Existing email | Contact form sends to team email | Free |
| **Images** | next/image + sharp | Automatic optimization, lazy loading, WebP | Free |
| **Fonts** | Self-hosted via next/font | No GDPR cookie issues with Google Fonts | Free |

**Estimated annual cost: €10–20 (domain renewal only)**

### 4.3 Repository Structure

```
pablo-the-garden/
├── public/
│   ├── images/
│   │   ├── lineup/           # Artist photos (square, optimized)
│   │   ├── gallery/
│   │   │   ├── 2023/
│   │   │   ├── 2024/
│   │   │   └── 2025/
│   │   ├── sponsors/          # Sponsor logos (SVG preferred)
│   │   ├── blog/              # Blog featured images
│   │   ├── about/             # Team/edition photos
│   │   └── hero/              # Hero backgrounds/videos
│   ├── fonts/                 # Self-hosted font files
│   └── favicon.ico
│
├── content/                   # ALL EDITABLE CONTENT LIVES HERE
│   ├── lineup/
│   │   ├── config.json            # Reveal phase settings (phase, totalSlots, etc.)
│   │   ├── dj-example.md
│   │   └── another-artist.md
│   ├── blog/
│   │   ├── it/
│   │   │   └── 2026-02-15-first-announcement.mdx
│   │   └── en/
│   │       └── 2026-02-15-first-announcement.mdx
│   ├── sponsors/
│   │   └── sponsors.json      # [{name, logo, url, tier}]
│   ├── tickets.json           # Ticket tiers, prices, URLs
│   ├── rules/
│   │   ├── it.md
│   │   └── en.md
│   ├── about/
│   │   ├── it.md
│   │   └── en.md
│   └── faq/
│       ├── it.json
│       └── en.json
│
├── messages/                  # i18n translation files
│   ├── it.json                # Italian UI strings
│   └── en.json                # English UI strings
│
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx     # Root layout with locale
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── lineup/
│   │   │   │   └── page.tsx
│   │   │   ├── tickets/
│   │   │   │   └── page.tsx
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── rules/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── FloatingTicketCTA.tsx
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   ├── Countdown.tsx
│   │   │   ├── LineupPreview.tsx
│   │   │   ├── ExperienceCards.tsx
│   │   │   ├── EditionTimeline.tsx
│   │   │   ├── SponsorsBar.tsx
│   │   │   └── InstagramFeed.tsx
│   │   ├── lineup/
│   │   │   ├── ArtistCard.tsx
│   │   │   ├── MysteryCard.tsx        # "?" candy-wrapped placeholder card
│   │   │   ├── ArtistGrid.tsx         # Handles mix of revealed + mystery cards
│   │   │   ├── DayFilter.tsx
│   │   │   ├── LineupPhaseManager.tsx  # Renders correct phase (coming_soon/revealing/complete)
│   │   │   └── NewBadge.tsx           # "Just Announced" animated badge
│   │   ├── tickets/
│   │   │   ├── TicketCard.tsx         # Individual ticket type card (Full Pass / Day 1 / Day 2)
│   │   │   ├── ReleaseSection.tsx     # Groups 3 ticket cards for the active release
│   │   │   ├── ReleaseBanner.tsx      # Current release badge + progress bar
│   │   │   ├── ReleaseComparison.tsx  # Comparison table across all 3 releases
│   │   │   ├── TicketSelectorModal.tsx # Mini modal/drawer triggered by floating CTA
│   │   │   └── FAQ.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx
│   │   │   └── Lightbox.tsx
│   │   ├── blog/
│   │   │   ├── PostCard.tsx
│   │   │   └── PostList.tsx
│   │   ├── contact/
│   │   │   └── ContactForm.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── SectionHeading.tsx
│   │       ├── CandyParticles.tsx  # Sweet theme animated particles
│   │       └── SEO.tsx
│   │
│   ├── lib/
│   │   ├── content.ts         # MD/MDX parsing utilities
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── utils.ts           # Shared utilities
│   │
│   └── styles/
│       └── theme.ts           # Tailwind theme extensions (candy palette)
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 4.4 Content Editing Workflow

Since content lives in Markdown/JSON files in the repo:

1. **To update lineup:** Add/edit a `.md` file in `/content/lineup/`
2. **To publish a blog post:** Add an `.mdx` file in `/content/blog/[locale]/`
3. **To update sponsors:** Edit `/content/sponsors/sponsors.json`
4. **To change ticket info:** Edit `/content/tickets.json`
5. **To update rules:** Edit `/content/rules/it.md` or `en.md`

Every push to `main` triggers an automatic build + deploy on Vercel (takes ~30–60 seconds). No manual deployment needed.

---

## 5. Design System — "Sweet Edition" Theme

### 5.1 Color Palette

```
Primary:          #FF6B9D (Candy Pink)
Primary Dark:     #E8457A (Deep Rose)
Secondary:        #FFB347 (Orange Cream / Caramella)
Accent 1:         #87CEEB (Cotton Candy Blue)
Accent 2:         #DDA0DD (Bubblegum Purple)
Accent 3:         #98FB98 (Mint Green)
Background Dark:  #1A0A2E (Deep Night Purple — for hero/dark sections)
Background Light: #FFF5F8 (Soft Pink White)
Text Primary:     #2D1B40 (Dark Purple)
Text Light:       #FFFFFF
Surface:          #FFFFFF
Surface Elevated: #FFF0F5
```

### 5.2 Typography

| Use | Font | Weight | Source |
|---|---|---|---|
| Display / Headings | **Fredoka One** or **Baloo 2** | 700 | Self-hosted (Google Fonts download) |
| Body | **DM Sans** or **Nunito** | 400, 600 | Self-hosted |
| Accent / Labels | Display font at smaller size | 700 | — |

These fonts feel playful and "sweet" without sacrificing readability. They should be self-hosted via `next/font` for GDPR compliance (no external Google Fonts requests).

### 5.3 Visual Elements

- **Candy illustrations:** Lollipops, gummy bears, wrapped candies as decorative elements
- **Rounded shapes:** Pill buttons, rounded corners on cards, blob shapes
- **Gradients:** Soft candy gradients (pink → orange, blue → purple)
- **Particles:** Subtle animated confetti/candy particles on hero section
- **Textures:** Subtle sprinkle/confetti pattern as page backgrounds
- **Photos:** Vibrant, high-saturation treatment on event photos

### 5.4 Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single column, stacked nav (hamburger) |
| Tablet | 768px – 1024px | 2-column grids, compact nav |
| Desktop | > 1024px | Full layout, horizontal nav, 3+ column grids |

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **Lighthouse score target:** 90+ on all metrics
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- All images optimized via `next/image` (WebP, lazy loading)
- Fonts preloaded, subset to Latin characters
- Zero JavaScript for static content pages (rules, about)

### 6.2 SEO

- Server-rendered meta tags per page (title, description, og:image)
- Structured data (JSON-LD) for Event schema
- `sitemap.xml` auto-generated
- `robots.txt` configured
- Canonical URLs for locale variants (`hreflang` tags)
- Open Graph images for social sharing (custom per page)

### 6.3 Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML5 elements
- Keyboard navigable
- Color contrast ratios ≥ 4.5:1 for text
- Alt text on all images
- Focus indicators on interactive elements

### 6.4 GDPR / Privacy

- No third-party cookies by default
- Self-hosted fonts (no Google Fonts external requests)
- Analytics: Plausible (cookieless) or Umami (self-hosted)
- Cookie banner only if embedding external content (Instagram, Google Maps)
- Privacy policy page (link in footer)
- Contact form: minimal data, clear purpose, no storage beyond email delivery

---

## 7. Task Breakdown & Assignment

### Phase 1: Foundation (Week 1)

| ID | Task | Assignee | Estimate | Dependencies |
|---|---|---|---|---|
| F1 | Project scaffolding: Next.js + TypeScript + Tailwind + next-intl | Frontend | 4h | — |
| F2 | Design system implementation: colors, typography, Tailwind config, global styles | Frontend | 4h | F1 |
| F3 | Layout components: Header, Footer, Navigation, LanguageSwitcher, FloatingCTA | Frontend | 6h | F2 |
| F4 | Content utilities: MD/MDX parser, type definitions, content loader functions | Frontend | 4h | F1 |
| F5 | i18n setup: locale routing, translation files structure (it.json, en.json) | Frontend | 3h | F1 |
| I1 | Vercel project setup, domain DNS configuration, Git repo + CI/CD | Infra | 2h | — |
| I2 | Image optimization pipeline: define sizes, formats, compression settings | Infra | 2h | I1 |
| C1 | Collect + prepare all Italian UI strings for translation file | Content | 3h | — |
| C2 | Write About page content (IT + EN): story, team, mission | Content | 3h | — |
| C3 | Write Rules page content (IT + EN) | Content | 2h | — |

### Phase 2: Core Pages (Week 2)

| ID | Task | Assignee | Estimate | Dependencies |
|---|---|---|---|---|
| F6 | Homepage: Hero section with animations, countdown timer | Frontend | 6h | F2, F3 |
| F7 | Homepage: Reveal-aware lineup preview (adapts to phase), Experience cards, Edition timeline | Frontend | 6h | F4, F6, F9 |
| F8 | Homepage: Sponsors bar, Instagram section, full assembly | Frontend | 4h | F7 |
| F9 | Lineup page: Progressive reveal system — LineupPhaseManager, MysteryCard with candy animation, "NEW" badge, config-driven phases | Frontend | 8h | F4 |
| F9b | Lineup page: Full layout — Artist cards, grid, day filter, expand/modal (Phase 3 complete view) | Frontend | 5h | F9 |
| F10 | Tickets page: Release banner + progress bar, TicketCard × 3 for active release, status-driven styling (available/sold out/coming soon) | Frontend | 6h | F4 |
| F10b | Tickets page: Release comparison table, FAQ accordion, smart floating CTA with TicketSelectorModal | Frontend | 5h | F10, F3 |
| F11 | Blog: List page + individual post page (MDX rendering) | Frontend | 5h | F4, F5 |
| C4 | Prepare lineup content files (artist bios, photos, metadata) | Content | 4h | — |
| C5 | Prepare sponsor logos (SVG) + sponsors.json | Content | 2h | — |
| C6 | Write first 2–3 blog posts (IT + EN) | Content | 4h | — |
| C7 | Prepare tickets.json: prices for all 3 releases × 3 types (9 SKUs), Clappit URLs, initial statuses | Content | 2h | — |

### Phase 3: Remaining Pages + Polish (Week 3)

| ID | Task | Assignee | Estimate | Dependencies |
|---|---|---|---|---|
| F12 | Gallery page: Grid/masonry layout, lightbox, edition filter | Frontend | 5h | F4 |
| F13 | About page: Story section, interactive edition timeline, team section | Frontend | 5h | F4, C2 |
| F14 | Rules page: Styled content rendering | Frontend | 2h | F4, C3 |
| F15 | Contact page: Form (Formspree integration), validation, success/error states | Frontend | 4h | F3 |
| F16 | Sweet theme polish: Candy particle effects, scroll animations, page transitions | Frontend | 6h | F6–F15 |
| F17 | Mobile optimization pass: All pages responsive, touch interactions, performance | Frontend | 4h | F6–F15 |
| C8 | Curate gallery photos (10–15 per edition), optimize and place in repo | Content | 3h | — |
| C9 | English translations: all UI strings + content pages | Content | 4h | C1–C7 |
| C10 | Prepare OG images for social sharing (1 per page minimum) | Content | 2h | — |

### Phase 4: Launch (Week 4)

| ID | Task | Assignee | Estimate | Dependencies |
|---|---|---|---|---|
| F18 | SEO: Meta tags, JSON-LD Event schema, sitemap, robots.txt, hreflang | Frontend | 3h | All F |
| F19 | Accessibility audit + fixes | Frontend | 3h | All F |
| F20 | Cross-browser testing (Chrome, Safari, Firefox, mobile browsers) | Frontend | 3h | All F |
| I3 | Production deployment: DNS cutover, HTTPS verification, redirects | Infra | 2h | All |
| I4 | Analytics setup (Plausible or Umami) | Infra | 1h | I3 |
| I5 | Monitoring: Vercel analytics, uptime check (e.g., UptimeRobot free) | Infra | 1h | I3 |
| QA1 | Full QA pass: All pages, all locales, all breakpoints, form submission | All | 4h | All |
| QA2 | Performance audit: Lighthouse, Core Web Vitals, image loading | All | 2h | All |

### Summary by Role

| Role | Total Estimated Hours |
|---|---|
| **Frontend Developer** | ~98h |
| **Infrastructure / DevOps** | ~8h |
| **Content / Editorial** | ~29h |
| **QA (shared)** | ~6h |
| **Total** | ~141h |

---

## 8. Content Update Playbook

Quick reference for common content updates after launch:

| Task | What to do |
|---|---|
| Add an artist to lineup (hidden) | Create `/content/lineup/artist-slug.md` with `revealed: false`, add photo. Push to `main`. Card appears as mystery slot. |
| Reveal an artist | Edit their `.md` file: set `revealed: true` and `revealDate` to today. Push to `main`. The mystery card "unwraps" to show the artist with a "NEW" badge. |
| Change lineup phase | Edit `/content/lineup/config.json` — set `phase` to `"coming_soon"`, `"revealing"`, or `"complete"`. Push to `main`. |
| Publish a blog post | Create `/content/blog/it/YYYY-MM-DD-slug.mdx`. Optionally create EN version. Push to `main`. |
| Update ticket availability | Edit `/content/tickets.json` — change individual ticket `status` to `"available"`, `"sold_out"`, or `"coming_soon"`. Push to `main`. |
| Open a new ticket release | Edit `/content/tickets.json` — set `activeRelease` to the new release (e.g., `"promo"`), set that release's `status` to `"active"`, set its tickets to `"available"`. Mark previous release as `"sold_out"`. Push to `main`. |
| Sell out a specific ticket | Edit `/content/tickets.json` — set that ticket's `status` to `"sold_out"` (e.g., Early Bird Full Pass sold out but Day 1 still available). Push to `main`. |
| Add a sponsor | Add entry to `/content/sponsors/sponsors.json`, add logo SVG to `/public/images/sponsors/`. Push to `main`. |
| Change event dates | Update `messages/it.json` and `messages/en.json` date strings + homepage content. Push to `main`. |
| Update rules | Edit `/content/rules/it.md` and `/content/rules/en.md`. Push to `main`. |

All changes auto-deploy within ~60 seconds of pushing to `main`.

---

## 9. Future Enhancements (Post-Launch)

Items not in scope for the initial launch but worth considering:

1. **Newsletter integration** — Mailchimp or Buttondown free tier for mailing list
2. **Aftermovie page** — Dedicated video page post-event
3. **Timetable view** — Visual schedule grid (like Coachella/Tomorrowland style)
4. **Merchandise shop** — If Pablo merch becomes a thing
5. **PWA support** — Offline-capable for on-site use (schedule, map, rules)
6. **Live updates** — During the event: real-time schedule changes, now playing
7. **AI chatbot** — FAQ answering bot for common questions
8. **Dark mode** — Toggle between light candy theme and dark neon candy theme

---

## 10. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Content not ready in time | Delays launch | Start content tasks in Week 1 parallel to dev; launch with "TBA" placeholders if needed |
| Lineup not finalized | Incomplete lineup page | Design for progressive reveal; "More artists coming soon" section |
| Instagram embed breaks / rate limits | Gallery page looks empty | Use static curated images as fallback, link to Instagram |
| Vercel free tier limits hit | Site goes down | Free tier allows 100GB bandwidth/month — more than enough for this traffic level |
| Clappit URL changes | Broken ticket links | All 9 Clappit URLs centralized in `/content/tickets.json` — single file to update |
| Ticket release timing misalignment | Wrong release shown as active | Clear playbook for release transitions; `activeRelease` field makes it explicit; test before pushing |
| GDPR compliance gaps | Legal risk | Self-host everything possible; minimal cookies; add cookie banner if needed |

---

*Document prepared for Pablo The Garden — Sweet Edition 2026*
*Ready for development kick-off*
