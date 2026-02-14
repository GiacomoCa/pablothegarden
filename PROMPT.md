# Initial Prompt for Claude Code

Copy and paste the following into Claude Code to start the project.

---

## Prompt

```
We are building the website for Pablo The Garden, an electronic music festival. This is an empty GitHub repo that needs to be built from scratch.

Before you do anything, read these files to understand the full project:

1. `CLAUDE.md` — Project overview, tech stack, agent structure, and quality standards
2. `TASKS.md` — Complete task list organized by agent, with priorities, dependencies, and acceptance criteria
3. `docs/DESIGN.md` — Full functional and technical design: page specs, content schemas, architecture, design system

The project uses 5 custom subagents defined in `.claude/agents/`:
- `foundation` — Project scaffolding, design system, layout, content utils, i18n (tasks F1–F5)
- `pages` — All page components: Homepage, Lineup, Tickets, Gallery, Blog, About, Rules, Contact (tasks P1–P8)
- `polish` — Animations, candy theme effects, mobile optimization (tasks X1–X2)
- `content` — All content files: translations, markdown, JSON, placeholder media (tasks C1–C10)
- `infra` — Vercel, DNS, SEO, analytics, accessibility & performance audits (tasks I1–I6)

Start by reading all three docs, then execute tasks in this order:

**Phase 1 (parallel):**
- Delegate F1 to the foundation agent (project scaffolding)
- Delegate C1, C5, C6 to the content agent (Italian UI strings, lineup config, tickets JSON)
- Delegate I1 to the infra agent (Git setup)

**Phase 2 (after F1 is done):**
- Delegate F2 → F3, F4, F5 to the foundation agent (F4 and F5 can parallel after F2)
- Delegate C2, C3, C4 to the content agent

**Phase 3 (after F1–F5 all done):**
- Delegate P1, P2, P3 to the pages agent (these can run in parallel — they're independent)
- Delegate C7, C8, C9, C10 to the content agent

**Phase 4 (after P1–P3 done):**
- Delegate X1 to the polish agent
- Delegate P4, P5, P6, P7, P8 to the pages agent (these can parallel)

**Phase 5 (after all P tasks done):**
- Delegate X2 to the polish agent (mobile optimization)
- Delegate I3, I4, I5, I6 to the infra agent (SEO, analytics, audits)

After each task completes, update TASKS.md marking it ✅.
Use conventional commits: feat(agent-name): task-id description

Maximize parallelism. Multiple subagents can work simultaneously on independent tasks.
```

---

## Notes for the Human Operator

- **Before running:** Make sure `CLAUDE.md`, `TASKS.md`, `docs/DESIGN.md`, and `.claude/agents/*.md` are all committed to the repo.
- **During execution:** You can intervene at any point to provide real content (artist names, photos, actual Clappit URLs, sponsor logos) by editing files in `/content/` and pushing.
- **Monitoring:** Watch for dependency violations — if an agent tries to start a task before its dependencies are marked ✅, intervene.
- **Cost control:** The `foundation` and `pages` agents use Opus (more capable, more expensive) because they write complex React code. The `content`, `polish`, and `infra` agents use Sonnet (fast, cheaper) because their tasks are more straightforward. You can change this in each `.claude/agents/*.md` file under the `model:` field.
- **Resuming:** If a session breaks, re-run the prompt above but tell Claude which tasks are already ✅ in `TASKS.md`.
