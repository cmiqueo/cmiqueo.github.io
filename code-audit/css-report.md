# CSS Audit Report

**Project:** Adobe CaaS (Consonant Card Collection)
**Scope:** Authored LESS stylesheets under `less/` (68 files; `dist/`, `dependencies/`, `node_modules/` excluded)
**Date:** 2026-07-28
**Standard:** SUIT CSS — component `PascalCase` (namespacing allowed, e.g. `ns-Component`), descendant single-hyphen camelCase (`Component-descendant`), modifier double-hyphen camelCase (`Component--modifier`), state `is-` prefix (`.is-active`), utility `u-` prefix (`.u-hidden`).

## 1. Summary

Measured against **SUIT CSS, the codebase is largely compliant** — this is effectively the standard the project already follows. The `consonant-` prefix is a valid SUIT namespace, and blocks like `.consonant-FiltersInfo`, descendants like `&-btnSelected`, modifiers like `&--withLightText`, and states like `.is-active` map directly onto SUIT's component/descendant/modifier/state grammar. The infobits, filters, the core widgets (bookmarks, filters-info, load-more, loader, search, tooltip, etc.), and the original card infrastructure (card, card-footer, link-blocker) are **Consistent**. Deviations cluster in three places: (1) **kebab-case variant classes chained onto `.consonant-Card`** (`.three-fourths`, `.one-half`, `.full-card`, `.news-card`…) that SUIT would model as `--camelCase` modifiers; (2) the **legacy `references/` and `utils/` helper libraries**, which use presentational, un-prefixed class names (`.left`, `.no-margin`, `.NoMarginTop`) instead of SUIT `u-` utilities; and (3) **newer bolt-on features** (`.modern-carousel`, `categories.less`, `blade`/`editorial`/`flex` cards) with presentational names, hardcoded colors, and raw-px breakpoints. Standard-agnostic issues (magic numbers, dead code, and several genuine selector bugs) round out the findings.

**Bottom line:** unlike the BEM run (a wholesale mismatch), SUIT produces an actionable punch-list — the naming spine is already SUIT-shaped, so fixes are targeted: promote chained variants to modifiers, move legacy helpers behind the `u-` prefix, and de-presentational-ize the newest files.

## 2. Systemic & Recurring Issues

1. **Kebab variant classes chained on the block instead of `--camelCase` modifiers.** Card variants are bare kebab classes stacked on the component: `.consonant-Card.three-fourths`, `.one-half`, `.full-card`, `.news-card`, `.text-card`, `.half-height`, `.double-wide`, `.product`, `.icon-card`, `.blog-card`. SUIT wants `.consonant-Card--threeFourths` etc. Consistent internally, but a systematic SUIT deviation across every card file. (Also `.one-half`/`.half-height` re-appear in `localeOverrides.less`, `.one-half` in `cards-grid.less`.)

2. **Legacy utilities ignore the SUIT `u-` prefix.** The codebase _does_ use SUIT utilities correctly in one place (`.consonant-u-themeLight` in theme.less), but `references/` and `utils/` define presentational, un-prefixed helpers instead: `.left`, `.center`, `.no-margin`, `.full-width`, `.hide-all`, `.no-font`, `.NoMargin`/`.NoMarginTop` (also PascalCase, so they read as components, not utilities). These should be `u-*`.

3. **Presentational class names** (SUIT, like BEM, wants structural names): `.modern-carousel`, `.card-hover-grow`, `.light-text`, `.reverse`, `.transparent`, `.text-left/-center/-right`, `&.lightText` (pagination — should be `.is-*` or `--`), `&.sort-by-Select` (select), `.filters-category`/`.filter-group-title` (categories, kebab not PascalCase), and `.Categories` (PascalCase but drops the `consonant-` namespace used everywhere else).

4. **Hardcoded hex/rgba colors instead of tokens.** `cards-carousel.less` `.modern-carousel` (~15), `categories.less` (~14), `cards/blade.less`, `cards/editorial.less`, `cards/button.less`, `cards/flex.less` (`#333`/`#666`), `pagination.less`/`select.less` (`#999`/`#ccc`/`#aaa`), `accessibility.less` (`#dedede`), `filters/left/panel.less` (`#eaeaea`/`#fff`), `filters/top/*` (literal white/`rgba(80,80,80,0.101)`).

5. **Two competing color-variable systems.** `cards/icon.less` and `cards/horizontal.less` use the static `@consonantLightGrey*`/`@consonantDarkGrey*` palette instead of the themeable `@consonantGray*`/`@consonantBaseColor` set, so they silently ignore light/dark theming.

6. **Raw-px / arithmetic media queries** bypass the named-query set (`@consonant-*-up`): `cards-carousel.less` (`599px + 1`), `cards-grid.less` (320/600), `categories.less` (480), `cards/blade.less` (1200/600). `utils/hide.less` references two **undefined** vars (`@for-tablet-portrait-up`, `@for-desktop-up`).

7. **Duplicated helpers & dead code.** `.no-font`/`.margin-auto`/`.full-width`/`.hide-all` defined in both `utils/`/`references/` and `components/consonant/utils.less`; `.hide-all` 3× in `hide.less`; dead commented blocks in `lineclamp.less:15-37`, `utils.less`, `filters/left/item.less:476`.

8. **Genuine selector bugs (standard-agnostic).** `&-descendant` misuse inside variant scopes producing broken selectors — `cards/three-fourth.less:90`, `cards/text.less:87`, `cards/double-wide.less:136,140,150,154`, `cards/editorial.less:22-26`; bare `:only-child` descendants in `cards/half-height.less:92,143` & `cards/double-wide.less:51,87`; missing comma in `search.less:57-59` transition; selector typos `wrapper.less --83PercentContainier`, `rtl.less:170 &-selctedItemsQty`; mis-scoped rules leaking to all cards in `cards/news.less:26-51` & `cards/three-fourth.less:241`.

9. **Formatting drift** in the category/nested-filter feature: `filters/left/item.less` and `filters/top/item.less` use `//` comments (vs `/* */`), near-empty placeholder rule bodies, and a raw `&-categoryIcon` hardcoding font props instead of the `.font()` mixin.

## 3. Per-File Findings

| File                                           | Status       | Notes                                                                                                                                                         |
| ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| less/app.less                                  | N/A          | Single `@import`.                                                                                                                                             |
| less/components/consonant/main.less            | N/A          | Import manifest only.                                                                                                                                         |
| less/components/consonant/variables.less       | N/A          | Variable definitions only.                                                                                                                                    |
| less/components/consonant/theme.less           | N/A          | Theme-generation mixins; correctly emits SUIT `.consonant-u-theme*` utilities. Generator/token file.                                                          |
| less/components/consonant/media-queries.less   | N/A          | Named-query definitions.                                                                                                                                      |
| less/components/consonant/animations.less      | N/A          | `@keyframes` only.                                                                                                                                            |
| less/utils/lineclamp.less                      | N/A          | Single `.lineclamp()` mixin; dead commented block L15-37.                                                                                                     |
| less/components/consonant/modal.less           | N/A          | Vendor `.dexter-*` (`stylelint-disable`), single-`_` separators; generated, out of scope.                                                                     |
| less/components/consonant/scaffolding.less     | Consistent   | `.consonant-Wrapper` + `&-btn`; valid SUIT namespaced component/descendant.                                                                                   |
| less/…/cards/card.less                         | Minor issues | SUIT-compliant base component; but malformed `border: 2px` (L83) and magic `7px`/`14px`.                                                                      |
| less/…/cards/card-footer/card-footer.less      | Consistent   | SUIT model file — `&-row/&-cell` descendants, `&--divider/--left/--center/--right` modifiers, themed vars.                                                    |
| less/…/cards/link-blocker/link-blocker.less    | Consistent   | Clean `&-LinkBlocker` descendant under `.consonant`.                                                                                                          |
| less/…/cards/one-half.less                     | Minor issues | Chained kebab variant `.one-half` (should be `--oneHalf` modifier); `&--2up..5up` modifiers otherwise SUIT-valid.                                             |
| less/…/cards/full.less                         | Minor issues | Chained variant `.full-card`; scrim `rgba(0,0,0,…)` acceptable; `& img` (L156).                                                                               |
| less/…/cards/product-card.less                 | Minor issues | Chained variant `.product`; nit `min-height:222px`.                                                                                                           |
| less/…/cards/blog.less                         | Minor issues | Chained variant `.blog-card`; nit `font-weight:500`.                                                                                                          |
| less/…/cards/button.less                       | Minor issues | `.consonant-ButtonCard-link` SUIT-valid; hardcoded `#dedede`/`#000`/`rgba(0,0,0,0.5)`; magic px.                                                              |
| less/…/cards/three-fourth.less                 | Inconsistent | Chained variant + broken `&-title` under `.three-fourths` (L90); mis-scoped `&--5up` header (L241); magic 384/344px; badge block duplicated.                  |
| less/…/cards/half-height.less                  | Inconsistent | Chained variant + hardcoded `#fff` (L25); bare `:only-child` bug (L92,143); magic `140px`/`40px`.                                                             |
| less/…/cards/double-wide.less                  | Inconsistent | Chained variant + broken `&-img`/`&-content` under `.double-wide` (L136,140,150,154); bare `:only-child` (L51,87).                                            |
| less/…/cards/text.less                         | Inconsistent | Chained variant + broken `&-title` under `.text-card` (L87).                                                                                                  |
| less/…/cards/icon.less                         | Inconsistent | Chained variant + non-themeable `@consonantLightGrey*`/`@consonantDarkGrey*`; omits `.no-font`.                                                               |
| less/…/cards/news.less                         | Inconsistent | Title/label nested under grid not `.news-card` (L26-51) → leaks to all cards.                                                                                 |
| less/…/cards/blade.less                        | Inconsistent | `//` comments; hardcoded hex; raw-px breakpoints; presentational `.reverse/.light-text/.transparent`; `!important` spam.                                      |
| less/…/cards/horizontal.less                   | Inconsistent | Non-themeable `@consonantDarkGrey800` (L8,41); redundant `font-size:18px`+`.font()`; magic widths.                                                            |
| less/…/cards/editorial.less                    | Inconsistent | Broken self-nesting selector (L22-26); hardcoded font sizes; `.consonant-editorial--open` drops the `consonant-Card` component base.                          |
| less/…/cards/flex.less                         | Inconsistent | Presentational `.text-left/-center/-right`; non-prefixed `.product-info*`; `#333`/`#666`.                                                                     |
| less/…/infobits/button.less                    | Consistent   | `consonant-BtnInfobit` + `&-ico`, `&--cta`; colors via vars. SUIT-clean.                                                                                      |
| less/…/infobits/price.less                     | Consistent   | `&-price/&-term`; SUIT-clean.                                                                                                                                 |
| less/…/infobits/icon-with-text.less            | Consistent   | SUIT-clean; computed `1rem * 2` is the house norm.                                                                                                            |
| less/…/infobits/link-with-icon.less            | Minor issues | Component `LinkWithIco` vs var `LinkWithIcon` naming mismatch.                                                                                                |
| less/…/infobits/rating.less                    | Consistent   | `&--negMargin`, `&-stars`; SUIT-clean.                                                                                                                        |
| less/…/infobits/bookmark.less                  | Consistent   | `.is-active`/`.is-disabled` — valid SUIT states.                                                                                                              |
| less/…/infobits/date.less                      | Consistent   | Single-component, uses mixins.                                                                                                                                |
| less/…/infobits/progress.less                  | Consistent   | SUIT-clean; nit `letter-spacing:0.14px`.                                                                                                                      |
| less/…/infobits/text.less                      | Consistent   | `consonant-TextInfobit`.                                                                                                                                      |
| less/…/infobits/icon.less                      | Consistent   | `& + &` sibling nesting; SUIT-clean.                                                                                                                          |
| less/…/infobits/link.less                      | Consistent   | Complex `:not()` selector; colors via vars.                                                                                                                   |
| less/…/filters/left/panel.less                 | Minor issues | SUIT naming + `.is-opened` state fine; hardcoded `#eaeaea`/`#fff` (L69,71); `z-index:10000`.                                                                  |
| less/…/filters/left/item.less                  | Minor issues | SUIT naming fine; `//` comments; empty `--category` placeholders; raw `&-categoryIcon`; `!important` L281; dead comment L476.                                 |
| less/…/filters/left/chosen-item.less           | Consistent   | `consonant-ChosenFilter`; `:before`/`:after`; vars.                                                                                                           |
| less/…/filters/top/panel.less                  | Minor issues | SUIT naming + `&--withLightText`; literal `rgba(255,255,255,1/0)` (L131-132).                                                                                 |
| less/…/filters/top/item.less                   | Minor issues | SUIT naming fine; `rgba(80,80,80,0.101)` (L485); `//` comments; empty `--category` placeholders; `!important` L511.                                           |
| less/…/cards-carousel.less                     | Inconsistent | Presentational `.modern-carousel`/`.modern-carousel--light`; ~15 hardcoded hex; raw/arithmetic breakpoints; duplicated inline SVGs.                           |
| less/…/cards-grid.less                         | Inconsistent | Raw-px `@media (max-width:320px/600px)`; presentational `.card-hover-grow`/`.one-half`; `!important`; stale doc comment.                                      |
| less/…/bookmarks.less                          | Consistent   | Exemplar: `&-itemBadge`, `.is-selected` state, named query, vars.                                                                                             |
| less/…/categories.less                         | Inconsistent | Kebab `.filters-category`/`.filter-group-title` (not PascalCase) + un-namespaced `.Categories`; "should be moved" TODO; ~14 hardcoded colors; raw-px `480px`. |
| less/…/consonant-search-result.less            | Consistent   | `&-SearchResult`; var-driven.                                                                                                                                 |
| less/…/filters-info.less                       | Consistent   | SUIT exemplar — `&-btnSelected`, `&--withLightText`.                                                                                                          |
| less/…/load-more.less                          | Consistent   | `&--overBg &-btn`; named queries, vars.                                                                                                                       |
| less/…/loader.less                             | Consistent   | `&--absolute/--medium/--big`; vars.                                                                                                                           |
| less/…/no-results-view.less                    | Consistent   | `&--withLightText`; nit "modificators" comment typo.                                                                                                          |
| less/…/pagination.less                         | Minor issues | Presentational `&.lightText` (should be `.is-*`/`--`); `#999 !important` (L91).                                                                               |
| less/…/search.less                             | Minor issues | SUIT-clean naming; likely bug: `transition` list missing comma (L57-59).                                                                                      |
| less/…/search-ico.less                         | Consistent   | `consonant-SearchIco`; `fade()` on var.                                                                                                                       |
| less/…/select.less                             | Minor issues | `.is-*` states fine; presentational `&.sort-by-Select`; `#ccc`/`#aaa !important` (L104-105); magic `13px`.                                                    |
| less/…/tooltip.less                            | Consistent   | `consonant-Tooltip`; `[data-tooltip-wrapper]` attribute scope; nit `left:-72px`.                                                                              |
| less/components/consonant/wrapper.less         | Minor issues | SUIT naming; `.is-loading` fine; presentational/magic modifiers `--1200MaxWidth`/`--83PercentContainier` (typo); font-family literal repeated.                |
| less/components/consonant/rtl.less             | Minor issues | SUIT-style selectors; typo `&-selctedItemsQty` (L170); repeated full selectors instead of `&`.                                                                |
| less/components/consonant/accessibility.less   | Minor issues | Presentational `.lightText`; hardcoded `#dedede !important` (L19).                                                                                            |
| less/components/consonant/localeOverrides.less | Minor issues | Kebab variant classes `.one-half`/`.half-height` (should be modifiers); magic `font-size:15px`, `line-height:1.275rem`.                                       |
| less/components/consonant/utils.less           | Inconsistent | Unprefixed presentational helpers (should be `u-*`) duplicating `utils/`; hardcoded `rgba(0,0,0,0.16/0.35)`; dead commented code.                             |
| less/utils/misc.less                           | Minor issues | Utilities lack SUIT `u-` prefix (`.full-width`/`.position-absolute-0`); `.fullViewportWidth()` camelCase mixin.                                               |
| less/utils/hide.less                           | Inconsistent | Utilities lack `u-` prefix (`.hide-all`, `.visually-hidden`); `.hide-all` defined 3×; two **undefined** `@for-*` breakpoint vars.                             |
| less/utils/margin.less                         | Inconsistent | `.NoMargin`/`.NoMarginTop` PascalCase (read as components, should be `u-*` utilities); inconsistent `!important`; mixed with kebab `.no-margin`.              |
| less/references/main.less                      | Inconsistent | Presentational un-prefixed `.left/.center/.right/.top/.bottom`; malformed `outline: thin dotted #cdcdcd 2px` (L31); hardcoded `#cdcdcd`.                      |
| less/references/flex.less                      | Inconsistent | Presentational kebab helpers; camelCase+kebab duplicates (`.sizeOnAxis`/`.size-on-axis`); no `u-` prefix; magic `33.333%`.                                    |
| less/references/type.less                      | Inconsistent | Presentational `.bold/.italic/.sans/.serif`; invalid `font-weight: light` (L27); font-family stack duplicated.                                                |

## 4. Recommendations

Because the codebase is already SUIT-shaped, these are targeted fixes rather than a migration — ordered by impact.

**Priority 1 — Correctness (broken/dead rules; fix regardless of standard):**

- Fix `&-descendant`-in-variant selectors: `cards/three-fourth.less:90`, `cards/text.less:87`, `cards/double-wide.less:136,140,150,154`, `cards/editorial.less:22-26` (use the full `.consonant-Card-x`).
- Fix bare `:only-child` (add `&`) in `cards/half-height.less:92,143` and `cards/double-wide.less:51,87`.
- Fix the missing comma in `search.less:57-59` transition list.
- Re-scope `cards/news.less:26-51` and `cards/three-fourth.less:241` so they don't leak to all cards.
- Fix selector typos: `wrapper.less --83PercentContainier`, `rtl.less:170 &-selctedItemsQty`.
- Define or remove the undefined `@for-*` vars in `utils/hide.less`.
- Correct invalid values: `references/type.less:27 font-weight:light`, `references/main.less:31` outline shorthand, `cards/card.less:83 border:2px`.

**Priority 2 — SUIT naming alignment:**

- Promote the chained kebab card variants to `--camelCase` modifiers: `.consonant-Card.three-fourths` → `.consonant-Card--threeFourths`, and likewise `one-half`, `full-card`, `news-card`, `text-card`, `half-height`, `double-wide`, `product`, `icon-card`, `blog-card`. (Note: coordinate with the JS/AEM markup that applies these classes — this is a cross-surface rename.)
- Move legacy `references/`/`utils/` helpers behind the SUIT `u-` prefix (`.u-hidden`, `.u-fullWidth`, `.u-marginAuto`…) and drop presentational names (`.left`, `.NoMarginTop`).
- Rename presentational classes to states/modifiers: `&.lightText`→`.is-*` or `--withLightText` (pagination), `.light-text`/`.reverse`/`.transparent` (blade), `.text-*` (flex), `&.sort-by-Select` (select); namespace `.Categories` and PascalCase `.filters-category` in categories.less.

**Priority 3 — Theming & breakpoints:**

- Move `cards/icon.less` and `cards/horizontal.less` onto themeable `@consonantGray*`/`@consonantBaseColor`.
- Replace hardcoded hex/rgba in `cards-carousel`, `categories`, `blade`, `editorial`, `button`, `flex`, `filters/*`, `pagination`, `select`, `accessibility` with tokens.
- Replace raw-px/arithmetic media queries in `cards-carousel`, `cards-grid`, `categories`, `blade` with named `@consonant-*-up` queries.

**Priority 4 — Hygiene:**

- De-duplicate helpers across `utils/`/`references/`/`components/consonant/utils.less`.
- Unify the category/nested-filter block in `filters/left/item.less` and `filters/top/item.less`: `/* */` comments, remove empty placeholder rules, use `.font()` for `&-categoryIcon`.
- Remove dead commented blocks (`lineclamp.less:15-37`, `utils.less`, `filters/left/item.less:476`); resolve the `categories.less` "should be moved" TODO; exclude vendor `modal.less` from future audits.
