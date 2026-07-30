---
name: css-audit
description: "Use this skill ONLY when the user explicitly invokes it as '/css-audit'. Audits the project's authored LESS stylesheets under less/ for consistency in naming semantics, formatting, and coding standards against a naming standard chosen by the user (BEM, SUIT CSS, or the codebase's existing convention as baseline), then writes a markdown and a self-contained HTML report to the audit/ directory. Do not trigger on general mentions of CSS, styling, or LESS."
---

# CSS Audit

Audits the authored LESS stylesheets in this project for internal consistency and adherence to the codebase's established conventions, then writes a findings report. This skill only runs when the user explicitly calls `/css-audit`.

## Scope

- **Include:** all authored `.less` files under `less/` (e.g. `less/app.less`, `less/components/**`, `less/references/**`, `less/utils/**`).
- **Exclude:** generated output (`dist/`), third-party stylesheets (`dependencies/`), and `node_modules/`.
- Files containing only variables, mixins, or keyframes (no class selectors meant for direct use) are marked **N/A**, not scored.

## Standard to measure against

Before auditing, ask the user which naming standard to measure against (see Steps, step 1). The three options and their rules:

**A. BEM**
| Part | Convention | Example |
|---|---|---|
| Block | kebab-case | `.filters-info` |
| Element | double underscore | `.filters-info__button` |
| Modifier | double hyphen | `.filters-info--active` |

**B. SUIT CSS**
| Part | Convention | Example |
|---|---|---|
| Component | PascalCase | `.FiltersInfo` |
| Descendant | single hyphen, camelCase | `.FiltersInfo-btnSelected` |
| Modifier | double hyphen, camelCase | `.FiltersInfo--withFilters` |
| State | `is-` prefix, camelCase | `.is-active` |

**C. Existing convention (baseline)** — do not impose an external spec; reconstruct the codebase's own established pattern instead. Combine parent blocks with nested `&-x` / `&--y` fragments before judging them. Unless the files show otherwise, the pattern already in use looks like:

| Part | Convention | Example |
|---|---|---|
| Block | `consonant-PascalCase` | `.consonant-FiltersInfo` |
| Element | single hyphen, camelCase | `&-btnSelected` |
| Modifier | double hyphen, camelCase | `&--withFilters` |

Whichever option is selected, flag **deviations from that standard**, not the standard itself.

## Steps

1. Ask the user which standard to audit against — **BEM**, **SUIT CSS**, or **existing convention (baseline)** — using the AskUserQuestion tool. If baseline is chosen, first skim a handful of representative files to confirm/derive the actual pattern in use (the table under Option C is only a default) before proceeding.
2. Enumerate every `.less` file in scope (per Scope above) — verify: the count roughly matches the files under `less/`, with `dist/`, `dependencies/`, and `node_modules/` excluded.
3. Read each file and reconstruct its effective selectors through `&` nesting before evaluating.
4. Check each file against the checklist below, applying the selected standard's rules, and record concrete findings (file path + selector/line + issue).
5. Classify each file: **Consistent**, **Minor issues**, or **Inconsistent**, and capture systemic/recurring patterns that span multiple files.
6. Ensure an `audit/` directory exists at the project root (create it with `mkdir -p audit` if not) — the report is written there, never loose in the project root.
7. Decide the output base name. The default is `css-report`. Before writing anything, check whether `audit/css-report.md` or `audit/css-report.html` already exists. If either exists, ask the user (AskUserQuestion) whether to **overwrite** the existing report(s) or **write a numbered variant** — `css-report-1`, then `css-report-2`, … choosing the lowest suffix not already taken by a `.md` or `.html` in `audit/`. Use the *same* base name for both files so the markdown and HTML stay paired. If neither exists, use `css-report`.
8. Write the markdown report to `audit/<base>.md` using the Output Format below — verify: the file exists and lists every in-scope file's status.
9. Write a self-contained HTML report to `audit/<base>.html` (see HTML Report below) — verify: the file exists and its per-file table row count matches the markdown table.
10. Print a one-paragraph summary in chat with the headline finding and both report paths (`audit/<base>.md` and `audit/<base>.html`). Do not apply any fixes.

## Checklist

**Naming semantics**
- Selectors follow the block/element/modifier shape of the *selected standard* (see the table for BEM, SUIT CSS, or baseline above).
- No separators that belong to a different standard than the one selected (e.g. flag stray `__` double-underscore elements when auditing against SUIT CSS or baseline, since those are BEM-only; flag single-hyphen elements when auditing strictly against BEM).
- Class names are descriptive/structural, not presentational (avoid `.red`, `.mt10`, `.left`).
- No chained/over-nested element names that break the block-element-modifier shape.

**Formatting**
- Consistent indentation and brace/spacing style matching neighboring files.
- Consistent use of `&` nesting rather than repeating full selectors.
- Consistent quoting, units, color casing (e.g. lowercase hex), and no trailing whitespace.

**Standards**
- Reuse LESS variables (e.g. from `variables.less`/`theme.less`) instead of hardcoded colors, spacing, or breakpoints ("magic numbers").
- Media queries use the shared breakpoint variables/patterns rather than ad-hoc values.
- RTL and accessibility concerns are handled through the established files/patterns, not one-off overrides.
- No dead, duplicated, or commented-out rule blocks.

## Output Format

Write `audit/<base>.md` with this structure:

```
# CSS Audit Report

**Project:** <project name>
**Scope:** Authored LESS stylesheets under `less/`
**Date:** <date>
**Standard:** <BEM | SUIT CSS | Established project convention> (as selected by the user)

## 1. Summary
<Headline finding in 2-3 sentences: overall consistency and the most important systemic issues.>

## 2. Systemic & Recurring Issues
1. <Issue> — <where it recurs, with a couple of example selectors/files>
2. ...

## 3. Per-File Findings
| File | Status | Notes |
|---|---|---|
| less/components/consonant/... | Consistent / Minor / Inconsistent / N/A | <specific findings> |

## 4. Recommendations
<Prioritized, concrete fixes — most impactful first.>
```

## HTML Report

Also emit a **self-contained** `audit/<base>.html` (no external CSS/JS/CDN — inline everything) carrying the same content as the markdown, so it can be opened or shared as a single file. It must include:

- A **header** with project, scope, date, and the selected standard.
- A **scorecard row** with the counts of Consistent / Minor issues / Inconsistent / N/A files.
- The **Summary** and **Systemic & Recurring Issues** prose.
- The **per-file table** with a color-coded status pill per row (green = Consistent, amber = Minor, red = Inconsistent, grey = N/A) and small filter buttons that show/hide rows by status (a few lines of inline vanilla JS — no framework).
- The **Recommendations**, grouped by priority.

Keep the styling clean and legible (system font stack, a light neutral background, rounded cards). Do not pull in Tailwind, Bootstrap, or any CDN. The HTML row count under "per-file findings" must match the markdown table exactly — every in-scope file appears in both.
