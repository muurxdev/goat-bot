# GOATbot Project Directives & Mandatory Skills

This repository has 9 specialized skills active in `.agents/skills/`. The agent must prioritize and actively apply these skills during development, testing, and debugging.

## Active Skills & Activation Rules

1. **playwright** (`.agents/skills/playwright/SKILL.md`)
   - Activate whenever creating, debugging, or running E2E browser tests, scraping, or UI verification.
   - Use web-first assertions, user-centric locators (`getByRole`), and test isolation.

2. **supabase & supabase-postgres-best-practices** (`.agents/skills/supabase/SKILL.md`)
   - Activate whenever touching Supabase database, Auth, Storage, Edge Functions, or Postgres migrations.
   - Enforce RLS, secure JWT claims, and review Postgres performance advisors.

3. **strix** (`.agents/skills/strix/SKILL.md`)
   - Activate whenever evaluating security, performing audits, checking authentication/authorization, or mitigating OWASP Top 10 vulnerabilities.

4. **skill-ui** (`.agents/skills/skill-ui/SKILL.md`)
   - Activate whenever developing interactive UI components, design systems, modals, tables, or generative UI widgets.
   - Handle all 8 interactive states and maintain WCAG 2.1 AA accessibility.

5. **context7** (`.agents/skills/context7/SKILL.md`)
   - Activate whenever consulting external library APIs, indexing codebase dependencies, or preventing hallucinations.
   - Ground all implementation in verified documentation and type contracts.

6. **frontend-design** (`.agents/skills/frontend-design/SKILL.md`)
   - Activate whenever styling views, choosing color palettes, configuring typography, or refining UX aesthetics.
   - Adhere to the 60-30-10 color rule, 4px/8px spatial rhythm, and fluid responsive layouts.

7. **bug-hunter** (`.agents/skills/bug-hunter/SKILL.md`)
   - Activate whenever investigating unexpected behavior, exceptions, race conditions, memory leaks, or tricky bugs.
   - Follow the 5-stage scientific debugging protocol and write regression guards.

8. **headroom** (`.agents/skills/headroom/SKILL.md`)
   - Activate across all operations to preserve token headroom (30-40% buffer), distill verbose logs, and optimize context usage.

9. **find-skills** (`.agents/skills/find-skills/SKILL.md`)
   - Activate to map, audit, and recommend new or missing domain-specific skills for the project.

