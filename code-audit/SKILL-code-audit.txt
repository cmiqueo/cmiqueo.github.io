---
name: code-audit
description: "Use this skill ONLY when the user explicitly invokes it as '/code-audit'. Orchestrates the project's code audits: prompts whether to run the CSS audit (less/), the JS audit (react/src/js/), or both, delegates to the css-audit and js-audit skills, then (re)generates the audit/index.html dashboard so it links every report in audit/. Do not trigger on general mentions of auditing, linting, CSS, or JavaScript."
---

# Code Audit

A wrapper that runs the CSS and/or JS audits and keeps the `audit/index.html` dashboard in sync. Only runs on explicit `/code-audit`; it delegates the actual auditing to the `css-audit` and `js-audit` skills and owns the dashboard.

## Steps

1. Ask the user (AskUserQuestion) which audit(s) to run: **CSS only**, **JavaScript only**, or **Both**.
2. For each selected audit, invoke the corresponding skill (via the Skill tool) and complete its full workflow, one at a time:
   - CSS → the `css-audit` skill — it asks its own naming standard (BEM / SUIT / baseline) and writes `audit/<base>.md` + `audit/<base>.html`.
   - JS → the `js-audit` skill — it asks its own lens (baseline / Airbnb-ESLint / modern-React) and writes `audit/<base>.md` + `audit/<base>.html`.
   Let each sub-skill own its standard/lens prompt and its overwrite-vs-numbered file handling — do not duplicate that logic here.
3. After the selected audit(s) finish, (re)generate `audit/index.html` per the Dashboard spec below so it reflects **every** report currently in `audit/` — including reports from earlier runs that weren't regenerated this time.
4. Print a one-paragraph summary: which audits ran, the report paths produced, and the dashboard path.

## Dashboard (`audit/index.html`)

Rebuild a single **self-contained** HTML dashboard (no external CSS/JS/CDN — inline everything) that indexes the reports in `audit/`. Enumerate `audit/*.md` / `audit/*.html` to discover what exists; a report "pair" shares a base name (e.g. `css-report-suit.md` + `.html`). Structure:

- **Header** — title "Audit Dashboard", the project name, a combined scope line (LESS under `less/` and/or JS/JSX under `react/src/js/`, per what's present), the date, and a count of audits indexed.
- **Overview** — one short paragraph per domain present, **JavaScript first, then CSS**.
- **Report cards** — a **JavaScript Reports** section first, then a **CSS Reports** section. Each card shows the standard/lens, a one-line description, a status breakdown (Consistent / Minor issues / Inconsistent / N/A counts read from that report), a proportional bar, and links to the report's HTML and Markdown.
- **All files table** — every report file in `audit/` with Domain, Standard/Lens, and Format columns, each linked.

Rules:
- **JavaScript section before CSS section** (established preference).
- Use color-coded status pills/dots (green = Consistent, amber = Minor, red = Inconsistent, grey = N/A). Clean system-font styling, light background, rounded cards.
- Keep every link relative to `audit/` (the dashboard lives inside that directory).
- **Derive counts from the reports themselves** — read each report's per-file status column / scorecards. Never fabricate numbers; if a report can't be parsed, still link it in the All files table but omit its scorecard.
- Only include a section/card for a domain that actually has a report in `audit/`. If just one domain was ever audited, show only that section.
