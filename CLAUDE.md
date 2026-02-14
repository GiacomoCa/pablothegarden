# Pablo The Garden — Website Project

## Project Overview

You are building the website for **Pablo The Garden**, an electronic music festival held in Morrovalle (MC), Italy. The 4th edition — **"Sweet Edition"** (candy/dolci theme) — takes place **August 15–16, 2026**.

The site must be live ASAP (target: 3–4 weeks).

## Key Files

| File | Purpose |
|---|---|
| `TASKS.md` | Master task list organized by agent. Each task has an ID, priority, dependencies, description, and acceptance criteria. This is the source of truth for what needs to be built. |
| `docs/DESIGN.md` | Full functional and technical design document. Contains page-by-page specs, content schemas, architecture diagrams, design system details, and data models. Consult this for detailed requirements. |

## Repository State

This is a **fresh, empty GitHub repository**. There is no existing code. You are starting from scratch.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router, Static Export / SSG) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Content | MDX / Markdown / JSON files in `/content/` directory |
| i18n | next-intl (Italian default + English) |
| Contact Form | Formspree or Web3Forms (free tier, no backend) |
| Hosting | Vercel (free tier) |
| Fonts | Self-hosted via next/font (GDPR: no external Google Fonts CDN) |

## Agents

This project uses **custom subagents** defined in `.claude/agents/`. Each agent is responsible for a specific domain:

| Agent | Role | Task IDs |
|---|---|---|
| `foundation` | Project scaffolding, design system, layout, content utilities, i18n | F1–F5 |
| `pages` | Individual page components (Homepage, Lineup, Tickets, Gallery, Blog, About, Rules, Contact) | P1–P8 |
| `polish` | Animations, sweet theme effects, mobile optimization | X1–X2 |
| `content` | All content files: translations, markdown, JSON data, placeholder media | C1–C10 |
| `infra` | Vercel, DNS, SEO, analytics, accessibility & performance audits | I1–I6 |

## How to Work

1. **Read `TASKS.md`** to understand what needs to be built and in what order.
2. **Read `docs/DESIGN.md`** for detailed specs on any page, component, or data model.
3. **Delegate tasks to the appropriate subagent** by matching task IDs to agents.
4. **Respect dependencies** — check each task's dependencies before starting it.
5. **Mark tasks as ✅** in `TASKS.md` when complete.
6. **Use git commits** with conventional format: `feat(agent-name): task-id description` (e.g., `feat(foundation): F1 project scaffolding`).

## Parallelism

The following can run in parallel from day one:
- `foundation` (F1 → F2 → F3/F4/F5)
- `content` (C1–C10, no code dependencies)
- `infra` I1 (Git + Vercel setup)

Once `foundation` completes, `pages` can start. Multiple pages can be built in parallel (P1, P2, P3 are independent of each other).

`polish` starts after core pages (P1–P3) are done. `infra` SEO/audits (I3–I6) run last.

## Content Directory Convention

All editable content lives in `/content/`. The site reads this at build time — no external CMS.

```
content/
├── lineup/
│   ├── config.json        # Reveal phase: coming_soon | revealing | complete
│   └── *.md               # One file per artist (revealed: true/false)
├── blog/
│   ├── it/*.mdx           # Italian blog posts
│   └── en/*.mdx           # English blog posts
├── sponsors/
│   └── sponsors.json      # [{name, logo, url, tier}]
├── tickets.json            # 9 SKUs: 3 releases × 3 types
├── rules/
│   ├── it.md
│   └── en.md
├── about/
│   ├── it.md
│   └── en.md
├── faq/
│   ├── it.json
│   └── en.json
└── gallery.json            # Photo metadata by edition
```

## Quality Standards

- TypeScript strict mode, no `any` types
- All components must be responsive (mobile-first)
- Self-hosted fonts only (GDPR)
- No hardcoded user-visible strings — everything through `next-intl`
- Images via `next/image` for automatic optimization
- Semantic HTML5, WCAG 2.1 AA accessible
- Lighthouse target: 90+ on all metrics
