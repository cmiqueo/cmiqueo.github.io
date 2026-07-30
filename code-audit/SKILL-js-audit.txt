---
name: js-audit
description: "Use this skill ONLY when the user explicitly invokes it as '/js-audit'. Audits the project's authored JavaScript/JSX source files under react/src/js/ for internal consistency and adherence to coding standards, measured against a lens chosen by the user (the repo's existing convention as baseline, the Airbnb/ESLint style guide, or modern React best practices), then writes a markdown and a self-contained HTML report to the audit/ directory. Do not trigger on general mentions of JavaScript, React, linting, or refactoring."
---

# JS Audit

Audits the authored JavaScript/JSX source files in this project for internal consistency and adherence to the codebase's established conventions, then writes a findings report. This skill only runs when the user explicitly calls `/js-audit`.

## Scope

- **Include:** all authored `.js` / `.jsx` files under `react/src/js/**` (components, helpers, hooks, types, contexts, the entry `app.jsx`, etc.).
- **Exclude:** tests (`__tests__/`, `__test__/`, any `*.test.js`), test scaffolding (`Testing/`), generated output (`dist/`), and `node_modules/`.
- Files that only re-export other modules (barrel/index files) or hold nothing but a single constant/config object with no real logic are marked **N/A**, not scored.

## Lens to measure against

Before auditing, ask the user which lens to measure against (see Steps, step 1). The three options:

**A. Existing convention (baseline)** — do not impose an external spec; reconstruct the codebase's own established patterns and judge each file for internal consistency against them. Skim a handful of representative files first to derive the actual patterns in use (component shape, naming, how config/state/constants are handled) before proceeding. This is the default.

**B. Airbnb / ESLint style guide** — the formal guide the project's `.eslintrc` already extends (`airbnb` + `jsx-a11y/strict`, 4-space indent). Flag deviations from Airbnb conventions: `const`/`let` over `var`, arrow-function style, import ordering, no unused vars, prop destructuring, etc. Note where the Consonant subtree's permissive eslint override intentionally relaxes these.

**C. Modern React best practices** — functional components + hooks over classes, correct hook dependency arrays, no side effects in render, keys on lists, memoization where it matters, no direct DOM mutation, accessible JSX.

Whichever lens is selected, flag **deviations from that lens**, not the lens itself. Reconstruct how a file actually behaves (imports, exports, component/hook shape) before judging it.

## Steps

1. Ask the user which lens to audit against — **existing convention (baseline)**, **Airbnb/ESLint**, or **modern React best practices** — using the AskUserQuestion tool. If baseline is chosen, first skim a handful of representative files to confirm/derive the actual patterns in use before proceeding.
2. Enumerate every `.js` / `.jsx` file in scope (per Scope above) — verify: the count roughly matches the authored files under `react/src/js/`, with tests, `Testing/`, `dist/`, and `node_modules/` excluded.
3. Read each file and reconstruct its real behavior (imports/exports, component or hook shape, data flow) before evaluating.
4. Check each file against the checklist below, applying the selected lens's rules, and record concrete findings (file path + symbol/line + issue).
5. Classify each file: **Consistent**, **Minor issues**, or **Inconsistent**, and capture systemic/recurring patterns that span multiple files.
6. Ensure an `audit/` directory exists at the project root (create it with `mkdir -p audit` if not) — all reports are written there, never loose in the project root.
7. Decide the output base name. The default is `js-report`. Before writing anything, check whether `audit/js-report.md` or `audit/js-report.html` already exists. If either exists, ask the user (AskUserQuestion) whether to **overwrite** the existing report(s) or **write a numbered variant** — `js-report-1`, then `js-report-2`, … choosing the lowest suffix not already taken by a `.md` or `.html` in `audit/`. Use the *same* base name for both files so the markdown and HTML stay paired. If neither exists, use `js-report`.
8. Write the markdown report to `audit/<base>.md` using the Output Format below — verify: the file exists and lists every in-scope file's status.
9. Write a self-contained HTML report to `audit/<base>.html` (see HTML Report below) — verify: the file exists and its per-file table row count matches the markdown table.
10. Print a one-paragraph summary in chat with the headline finding and both report paths (`audit/<base>.md` and `audit/<base>.html`). Do not apply any fixes.

## Checklist

**Naming**
- Variables and functions are `camelCase`; React components and classes are `PascalCase`; true constants are `UPPER_SNAKE_CASE`.
- Names are descriptive and structural, not cryptic (`i`/`x` only as trivial loop indices); no misspellings baked into exported symbols.
- File names match the convention of their folder (e.g. `PascalCase.jsx` for components).

**Structure & formatting**
- Component/hook shape matches neighbouring files (functional + hooks vs class) and the folder's established pattern.
- Import order and grouping are consistent (external → internal → relative); no unused or duplicate imports.
- Indentation, quoting, and semicolon style match the surrounding code and the project's eslint config.
- Props are destructured and typed; PropTypes (or the project's `types/` shapes) are present and complete for components.

**Standards**
- No leftover debug artifacts (`console.log`, commented-out code blocks, `debugger`, TODO/FIXME without context, dead branches).
- Config is read through the established getters (`makeConfigGetter` / `getConfig('foo','bar')`) rather than deep `config.foo.bar` access, per the repo's conventions.
- Magic values reuse the shared `Helpers/constants.js` (filter types, breakpoints, layout enums) instead of inline literals.
- Logging goes through the established `lana` helper rather than ad-hoc calls; side-effectful utilities (localStorage, event sanitization, image preloading) go through `Helpers/general.js`.
- No obvious correctness smells: hooks called conditionally, missing dependency arrays, mutated props/state, or unhandled promise rejections.

## Output Format

Write `audit/<base>.md` with this structure:

```
# JS Audit Report

**Project:** <project name>
**Scope:** Authored JavaScript/JSX under `react/src/js/`
**Date:** <date>
**Lens:** <Existing convention | Airbnb/ESLint | Modern React best practices> (as selected by the user)

## 1. Summary
<Headline finding in 2-3 sentences: overall consistency and the most important systemic issues.>

## 2. Systemic & Recurring Issues
1. <Issue> — <where it recurs, with a couple of example files/symbols>
2. ...

## 3. Per-File Findings
| File | Status | Notes |
|---|---|---|
| react/src/js/components/Consonant/... | Consistent / Minor / Inconsistent / N/A | <specific findings> |

## 4. Recommendations
<Prioritized, concrete fixes — most impactful first.>
```

## HTML Report

Also emit a **self-contained** `<base>.html` (no external CSS/JS/CDN — inline everything) carrying the same content as the markdown, so it can be opened or shared as a single file. It must include:

- A **header** with project, scope, date, and the selected lens.
- A **scorecard row** with the counts of Consistent / Minor issues / Inconsistent / N/A files.
- The **Summary** and **Systemic & Recurring Issues** prose.
- The **per-file table** with a color-coded status pill per row (green = Consistent, amber = Minor, red = Inconsistent, grey = N/A) and small filter buttons that show/hide rows by status (a few lines of inline vanilla JS — no framework).
- The **Recommendations**, grouped by priority.

Keep the styling clean and legible (system font stack, a light neutral background, rounded cards). Do not pull in Tailwind, Bootstrap, or any CDN. The HTML row count under "per-file findings" must match the markdown table exactly — every in-scope file appears in both.
