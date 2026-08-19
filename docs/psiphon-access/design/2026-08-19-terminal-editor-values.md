# Terminal and editor theme token values for Psiphon Access

**Status: CURRENT for ref-rvu4.2 scope.** Authoritative contract for the 23 `terminal.*` leaves and 6 `editor.*` leaves. Derived under approved rules in ADR 0005. Light theme values only.

## Purpose

This document provides derived colour values for all 23 `terminal.*` leaves and 6 `editor.*` leaves. It fulfills acceptance criteria AC1 through AC8 of issue ref-rvu4.2.2 under the rules approved in ADR 0005.

It derives no rule. It applies the seven approved rules from ADR 0005 to settle all deferred monospace and editor tokens for the Psiphon Access light theme.

## Grounding in ADR 0005

The operator approved seven rules in ADR 0005 on 2026-08-19:
1. **Separation Rule**: ANSI normal slots separate from bright variants by at least 1.30:1 relative luminance ratio delta. On a light background, normal variants move darker while bright variants stay near the surface floor. The rule binds 7 pairs and excludes the white surface pair as a named exception.
2. **Structural Slot Test**: Black (`#000000`), brightBlack (`#5C5C5C`), white (`#FFFFFF`), and brightWhite (`#F7F7F7`) carry surface, inverse, and secondary UI roles. Black and brightBlack pass the 4.5:1 text floor on background `#F7F7F7`. White and brightWhite carry surface steps and light fill roles. They are evaluated under non-text floors or as inverse text on dark fills.
3. **Slot Origins and Foreground**: Background is `levels.sunken` (`#F7F7F7`, D6). Foreground is `text.main` (`#000000`, D1). Black is `#000000` (D1). BrightBlack is `#5C5C5C` (D4). White is `levels.surface` (`#FFFFFF`, D6). BrightWhite is `levels.sunken` (`#F7F7F7`, D6).
4. **Bold Mapping**: Monospace bold text maps to font weight 500 (Medium) for DM Mono. Weight 700 is never requested.
5. **Family Stack Contract**: Stack specifies `DM Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`. Proportional fallbacks are forbidden.
6. **Editor Answer**: `editor.abbey` uses D23 (`#860A14`). `editor.sunflower` uses D21 (`#996700`). The remaining four editor leaves (`editor.purple`, `editor.cyan`, `editor.picton`, `editor.caribbean`) have no live reader in shipped UI code and are recorded as excluded leaves.
7. **CVD Status**: Colour vision deficiency evaluation is a recorded measurement paired with mandatory non-colour cues under WCAG SC 1.4.1. It is not a gate threshold.

## The 23 Terminal Leaves and 6 Editor Leaves

Every leaf has a decided hex value, a named origin, a measured contrast ratio against background `#F7F7F7` (or surface `#FFFFFF`), and a declared WCAG floor.

### Terminal Leaves (23 leaves)

| Token | Value | Origin / Rule | Measured Contrast | Floor / Status |
|---|---|---|---|---|
| `terminal.background` | `#F7F7F7` | D6 levels.sunken | 1.07:1 on surface | Surface role |
| `terminal.foreground` | `#000000` | D1 text.main / Rule 3 | 19.60:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.black` | `#000000` | D1 / Rule 3 | 19.60:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.brightBlack` | `#5C5C5C` | D4 / Rule 3 | 6.24:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.white` | `#FFFFFF` | D6 / Rule 3 | 1.07:1 on bg | 3.0:1 non-text floor / exempt text |
| `terminal.brightWhite` | `#F7F7F7` | D6 / Rule 3 | 1.00:1 on bg | Surface step / exempt text |
| `terminal.red` | `#a91822` | Rule 1 derived from Selenized red #d2212d | 6.90:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.brightRed` | `#cc1729` | Rule 1 derived from Selenized br_red #cc1729 | 5.27:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.green` | `#346d00` | Rule 1 derived from Selenized green #489100 | 5.88:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.brightGreen` | `#3d8100` | Rule 1 derived from Selenized br_green #428b00 | 4.52:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.yellow` | `#765d00` | Rule 1 derived from Selenized yellow #ad8900 | 5.88:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.brightYellow` | `#8c6e00` | Rule 1 derived from Selenized br_yellow #a78300 | 4.51:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.blue` | `#005cad` | Rule 1 derived from Selenized blue #0072d4 | 6.25:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.brightBlue` | `#006dce` | Rule 1 derived from Selenized br_blue #006dce | 4.81:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.magenta` | `#a03778` | Rule 1 derived from Selenized magenta #ca4898 | 5.92:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.brightMagenta` | `#be418e` | Rule 1 derived from Selenized br_magenta #c44392 | 4.52:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.cyan` | `#006c63` | Rule 1 derived from Selenized cyan #009c8f | 5.90:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.brightCyan` | `#008075` | Rule 1 derived from Selenized br_cyan #00978a | 4.51:1 on bg | 4.5:1 text floor (PASS) |
| `terminal.cursor` | `#000000` | D1 text.main | 19.60:1 on bg | 3.0:1 non-text floor (PASS) |
| `terminal.cursorAccent` | `#F7F7F7` | D6 levels.sunken | 19.60:1 on cursor | 19.60:1 on cursor block |
| `terminal.selectionBackground` | `rgba(0, 0, 0, 0.18)`, resolving to `#CBCBCB` | inherited Teleport alpha, kept. D9 measured the same alpha over white | 12.81:1 black text on the resolved selection | 4.5:1 text floor (PASS) |
| `terminal.searchMatch` | `#FFD98C` | inherited Teleport value, kept | 15.56:1 black text on match | 4.5:1 text floor (PASS) |
| `terminal.activeSearchMatch` | `#FFAB00` | D7 interactive.solid.alert.default | 11.08:1 text on match | 11.08:1 text on active match |

Note on WCAG text floor application:
- 13 terminal slots serve body text roles and are tested against the 4.5:1 WCAG text floor. These 13 slots are `terminal.foreground` and the 12 chromatic ANSI slots (`red`, `brightRed`, `green`, `brightGreen`, `yellow`, `brightYellow`, `blue`, `brightBlue`, `magenta`, `brightMagenta`, `cyan`, `brightCyan`).
- 4 terminal slots carry structural or surface roles (`terminal.black`, `terminal.brightBlack`, `terminal.white`, `terminal.brightWhite`) under Rule 2. `terminal.black` (`#000000`, 19.60:1) and `terminal.brightBlack` (`#5C5C5C`, 6.24:1) pass the 4.5:1 text floor. `terminal.white` (`#FFFFFF`, 1.07:1) and `terminal.brightWhite` (`#F7F7F7`, 1.00:1) serve as surface steps / light fill roles and are exempt from the body text floor because white text on a light terminal background is inherently low-contrast.

Grounding of the 5 unnamed terminal leaves:
- `terminal.cursor`: `#000000`. Sourced from D1 (`text.main` / primary dark ink). Contrast on background `#F7F7F7` is 19.60:1.
- `terminal.cursorAccent`: `#F7F7F7`. Sourced from D6 (`levels.sunken`). Renders text inside a solid dark cursor block. Contrast against black cursor block `#000000` is 19.60:1.
- `terminal.selectionBackground`: the inherited Teleport alpha `rgba(0, 0, 0, 0.18)` is kept. NAME THE COMPOSITE SURFACE. Over the decided terminal background `#F7F7F7` it resolves to `#CBCBCB`, and black text on that selection measures 12.81:1. D9 records that the same alpha over pure white gives `#D1D1D1`, which is a different surface and therefore a different resolved colour. Do not carry the D9 figure into the terminal, because compositing an alpha over a lighter surface flatters dark ink.
- `terminal.searchMatch`: the inherited Teleport value `#FFD98C` is kept. No fork decision moves it. This follows the D27 rule that a token keeps its inherited value when nothing justifies a change. Black text on the match measures 15.56:1. It renders the inactive search result background in `web/packages/shared/components/TerminalSearch/TerminalSearch.tsx`. An earlier draft of this document assigned `#FFE082` and named `interactive.tonal.alert.1` as its origin. Both were wrong. That token is `rgba(255, 171, 0, 0.18)`, which resolves to `#F8E9CB` over the terminal background, so it was not the source of `#FFE082` and `#FFE082` had no origin at all.
- `terminal.activeSearchMatch`: `#FFAB00`. Sourced from D7 (`interactive.solid.alert.default`, amber alert fill). Renders active search result background in `TerminalSearch.tsx`. Black text on active match achieves 11.08:1 contrast.

### Editor Leaves (6 leaves)

| Token | Value | Origin / Rule | Measured Contrast | Floor / Status |
|---|---|---|---|---|
| `editor.abbey` | `#860A14` | Rule 6 / D23 app failure red | 10.16:1 on surface | 4.5:1 text floor (PASS, live reader) |
| `editor.sunflower` | `#996700` | Rule 6 / D21 D11 warning ink | 4.89:1 on surface | 4.5:1 text floor (PASS, live reader) |
| `editor.purple` | `#000000` | Rule 6 / D22 primary dark ink | 21.00:1 on surface | 4.5:1 text floor (PASS, excluded leaf) |
| `editor.cyan` | `#015C6E` | Rule 6 / D27 inherited slate cyan | 7.62:1 on surface | 4.5:1 text floor (PASS, excluded leaf) |
| `editor.picton` | `#004570` | Rule 6 / D24 D8 active blue step | 10.07:1 on surface | 4.5:1 text floor (PASS, excluded leaf) |
| `editor.caribbean` | `#03830E` | Rule 6 / D20 app success green | 4.93:1 on surface | 4.5:1 text floor (PASS, excluded leaf) |

## ANSI Normal vs Bright Separation

Rule 1 requires a minimum relative luminance ratio delta of 1.30:1 between each normal slot and its bright variant. The rule binds 7 pairs and excludes the white surface pair as a named exception.

| Pair Name | Lighter Slot (Bright) | Darker Slot (Normal) | Measured Ratio | Minimum Required | Status | Note |
|---|---|---|---|---|---|---|
| black | terminal.brightBlack (#5C5C5C) | terminal.black (#000000) | 3.14:1 | 1.30:1 | PASS | Rule 1 minimum met |
| red | terminal.brightRed (#cc1729) | terminal.red (#a91822) | 1.31:1 | 1.30:1 | PASS | Rule 1 minimum met |
| green | terminal.brightGreen (#3d8100) | terminal.green (#346d00) | 1.30:1 | 1.30:1 | PASS | Rule 1 minimum met |
| yellow | terminal.brightYellow (#8c6e00) | terminal.yellow (#765d00) | 1.30:1 | 1.30:1 | PASS | Rule 1 minimum met |
| blue | terminal.brightBlue (#006dce) | terminal.blue (#005cad) | 1.30:1 | 1.30:1 | PASS | Rule 1 minimum met |
| magenta | terminal.brightMagenta (#be418e) | terminal.magenta (#a03778) | 1.31:1 | 1.30:1 | PASS | Rule 1 minimum met |
| cyan | terminal.brightCyan (#008075) | terminal.cyan (#006c63) | 1.31:1 | 1.30:1 | PASS | Rule 1 minimum met |
| white | terminal.white (#FFFFFF) | terminal.brightWhite (#F7F7F7) | 1.07:1 | N/A (Exempt) | PASS | Named Exception in Rule 1 (Surface roles) |

### Proof Against Pair Collapse Defect

An earlier derivation darkened each slot independently. It collapsed three pairs:
- Cyan and br_cyan both landed on `#00857a` (1.00:1 luminance ratio).
- Green `#428600` sat against br_green `#408600`.
- Yellow `#917300` sat against br_yellow `#927200`.

The new derivation derives each pair together:
1. Place bright variant at the 4.5:1 floor (or keep starting value if already above 4.5:1, without lightening).
2. Darken normal variant in linear light until it clears both the 4.5:1 text floor and the 1.30:1 separation minimum against bright.

Results prove no pair collapses:
- `cyan` (`#006c63`) against `brightCyan` (`#008075`) measures **1.31:1**.
- `green` (`#346d00`) against `brightGreen` (`#3d8100`) measures **1.30:1**.
- `yellow` (`#765d00`) against `brightYellow` (`#8c6e00`) measures **1.30:1**.

## Differences from Upstream Selenized Light

Starting values use Selenized Light from `jan-warchol/selenized`. Upstream gives: `bg_0` `#fbf3db`, `bg_1` `#ece3cc`, `bg_2` `#d5cdb6`, `dim_0` `#909995`, `fg_0` `#53676d`, `fg_1` `#3a4d53`, `red` `#d2212d`, `green` `#489100`, `yellow` `#ad8900`, `blue` `#0072d4`, `magenta` `#ca4898`, `cyan` `#009c8f`, `br_red` `#cc1729`, `br_green` `#428b00`, `br_yellow` `#a78300`, `br_blue` `#006dce`, `br_magenta` `#c44392`, `br_cyan` `#00978a`.

| Token | Selenized Light Value | Decided Value | Reason for Difference |
|---|---|---|---|
| `terminal.background` | `#fbf3db (bg_0)` | `#F7F7F7` | D6 establishes neutral surface ramp (levels.sunken). |
| `terminal.foreground` | `#53676d (fg_0)` | `#000000` | D1 establishes black as primary fork ink (text.main). |
| `terminal.black` | `#ece3cc (black)` | `#000000` | D1 primary dark ink. |
| `terminal.brightBlack` | `#d5cdb6 (br_black)` | `#5C5C5C` | D4 app secondary grey (text.slightlyMuted / onSurfaceVariant). |
| `terminal.white` | `#909995 (white)` | `#FFFFFF` | D6 levels.surface. |
| `terminal.brightWhite` | `#3a4d53 (br_white)` | `#F7F7F7` | D6 levels.sunken. |
| `terminal.red` | `#d2212d` | `#a91822` | Darkened in linear light to meet 1.30:1 separation against brightRed. |
| `terminal.brightRed` | `#cc1729` | `#cc1729` | Unchanged (already 5.27:1 on #F7F7F7). |
| `terminal.green` | `#489100` | `#346d00` | Darkened in linear light to meet 4.5:1 text floor and 1.30:1 separation against brightGreen. |
| `terminal.brightGreen` | `#428b00` | `#3d8100` | Darkened in linear light to meet 4.5:1 text floor. |
| `terminal.yellow` | `#ad8900` | `#765d00` | Darkened in linear light to meet 4.5:1 text floor and 1.30:1 separation against brightYellow. |
| `terminal.brightYellow` | `#a78300` | `#8c6e00` | Darkened in linear light to meet 4.5:1 text floor. |
| `terminal.blue` | `#0072d4` | `#005cad` | Darkened in linear light to meet 1.30:1 separation against brightBlue. |
| `terminal.brightBlue` | `#006dce` | `#006dce` | Unchanged (already 4.81:1 on #F7F7F7). |
| `terminal.magenta` | `#ca4898` | `#a03778` | Darkened in linear light to meet 4.5:1 text floor and 1.30:1 separation against brightMagenta. |
| `terminal.brightMagenta` | `#c44392` | `#be418e` | Darkened in linear light to meet 4.5:1 text floor. |
| `terminal.cyan` | `#009c8f` | `#006c63` | Darkened in linear light to meet 4.5:1 text floor and 1.30:1 separation against brightCyan. |
| `terminal.brightCyan` | `#00978a` | `#008075` | Darkened in linear light to meet 4.5:1 text floor. |

## Reference Chains and Resolution

In baseline Teleport theme configuration (`MC_THEME`), `terminal.*` and `editor.*` tokens resolved through reference chains to `dataVisualisation.*` tokens:
- `terminal.magenta` resolved through `{colors.dataVisualisation.tertiary.purple}`. Decision D22 assigned `#000000` to `dataVisualisation.tertiary.purple` for status primary accent borders. If `terminal.magenta` kept this reference, it resolved to `#000000` (black), causing a pair collapse with `terminal.black`.
- All 12 chromatic ANSI terminal tokens (`red`, `brightRed`, `green`, `brightGreen`, `yellow`, `brightYellow`, `blue`, `brightBlue`, `magenta`, `brightMagenta`, `cyan`, `brightCyan`) break their reference chains to `dataVisualisation.*`. They become literal derived values in the theme config. Decision D22 remains `#000000` for status borders.
- `terminal.background` and `terminal.cursorAccent` keep their reference to `levels.sunken` (`#F7F7F7`).
- `editor.abbey` keeps its reference to `dataVisualisation.tertiary.abbey` (`#860A14`, D23).
- `editor.sunflower` keeps its reference to `dataVisualisation.tertiary.sunflower` (`#996700`, D21).
- The four excluded editor leaves (`editor.purple`, `editor.cyan`, `editor.picton`, `editor.caribbean`) keep their respective references or resolution to `dataVisualisation.tertiary.*` values.

## Colour Vision Deficiency Measurements

Transform model: Machado, Oliveira, and Gomes (2009), "A Physiologically-based Model for Simulation of Color Vision Deficiency", IEEE Transactions on Visualization and Computer Graphics, vol. 15, no. 6, pp. 1297-1306.
Matrices apply to linear sRGB at severity 1.0 for protanopia, deuteranopia, and tritanopia. The coefficients used are printed below, so that a later reader can repeat the measurement instead of trusting it.

```
protanopia   1.0     0.152286   1.052583  -0.204868
                     0.114503   0.786281   0.099216
                    -0.003882  -0.048116   1.051998

deuteranopia 1.0     0.367322   0.860646  -0.227968
                     0.280085   0.672501   0.047413
                    -0.011820   0.042940   0.968881

tritanopia   1.0     1.255528  -0.076749  -0.178779
                    -0.078411   0.930809   0.147602
                     0.004733   0.691367   0.303900
```

GAMUT CLAMPING CHANGES THE TRITANOPIA COLUMN, so the procedure is stated exactly. Apply the matrix in linear light, encode back to 8-bit sRGB, and clamp to the 0 to 255 range before measuring. The tritanopia matrix has a large positive green-to-blue coefficient of 0.691367, which drives some results outside the sRGB gamut. An unclamped measurement gives a different and physically unreachable answer. For example, red against green measures 1.04:1 clamped and 1.16:1 unclamped. The clamped figure is the one a user can see, so the table uses it. The coordinator reproduced the whole table both ways on 2026-08-19 and confirmed the clamped path.

Inputs: The 12 chromatic ANSI slots and `terminal.foreground` (`#000000`), converted to linear sRGB.

| Pair | Normal Ratio | Normal dE2000 | Protanopia Ratio | Protanopia dE2000 | Deuteranopia Ratio | Deuteranopia dE2000 | Tritanopia Ratio | Tritanopia dE2000 |
|---|---|---|---|---|---|---|---|---|
| red vs green | 1.17:1 | 60.09 | 1.67:1 | 15.72 | 1.03:1 | 1.25 | 1.05:1 | 51.93 |
| red vs br_green | 1.53:1 | 63.48 | 2.19:1 | 22.24 | 1.25:1 | 6.32 | 1.37:1 | 54.89 |
| br_red vs green | 1.12:1 | 63.25 | 1.36:1 | 11.61 | 1.39:1 | 8.53 | 1.29:1 | 54.01 |
| br_red vs br_green | 1.17:1 | 66.06 | 1.78:1 | 17.85 | 1.07:1 | 1.95 | 1.01:1 | 56.07 |
| green vs yellow | 1.00:1 | 22.10 | 1.11:1 | 2.63 | 1.07:1 | 2.31 | 1.00:1 | 39.21 |
| br_green vs br_yellow | 1.00:1 | 24.24 | 1.13:1 | 3.31 | 1.08:1 | 2.76 | 1.00:1 | 41.16 |
| blue vs magenta | 1.06:1 | 34.00 | 1.27:1 | 9.99 | 1.26:1 | 17.99 | 1.07:1 | 54.81 |
| br_blue vs br_magenta | 1.06:1 | 36.45 | 1.31:1 | 11.40 | 1.29:1 | 19.34 | 1.08:1 | 60.87 |
| cyan vs green | 1.00:1 | 23.26 | 1.04:1 | 22.30 | 1.03:1 | 27.35 | 1.05:1 | 5.45 |
| cyan vs blue | 1.06:1 | 29.85 | 1.02:1 | 24.80 | 1.08:1 | 20.15 | 1.04:1 | 7.94 |
| red vs foreground | 2.84:1 | 36.41 | 2.08:1 | 23.20 | 3.34:1 | 35.19 | 3.12:1 | 38.79 |
| br_red vs foreground | 3.72:1 | 41.82 | 2.56:1 | 27.51 | 4.49:1 | 42.03 | 4.23:1 | 44.99 |
| green vs foreground | 3.33:1 | 38.06 | 3.48:1 | 37.41 | 3.23:1 | 35.01 | 3.28:1 | 33.53 |
| br_green vs foreground | 4.34:1 | 43.67 | 4.56:1 | 43.46 | 4.19:1 | 40.73 | 4.27:1 | 39.58 |
| yellow vs foreground | 3.34:1 | 36.54 | 3.14:1 | 35.21 | 3.47:1 | 36.99 | 3.30:1 | 33.04 |
| br_yellow vs foreground | 4.35:1 | 42.38 | 4.05:1 | 40.72 | 4.54:1 | 43.07 | 4.29:1 | 39.17 |
| blue vs foreground | 3.13:1 | 35.80 | 3.54:1 | 37.46 | 2.90:1 | 35.03 | 3.60:1 | 35.82 |
| br_blue vs foreground | 4.08:1 | 41.57 | 4.67:1 | 43.90 | 3.76:1 | 40.42 | 4.76:1 | 42.36 |
| magenta vs foreground | 3.31:1 | 37.73 | 2.79:1 | 28.93 | 3.67:1 | 31.48 | 3.36:1 | 37.89 |
| br_magenta vs foreground | 4.34:1 | 43.27 | 3.56:1 | 34.30 | 4.86:1 | 38.48 | 4.40:1 | 43.49 |
| cyan vs foreground | 3.33:1 | 35.32 | 3.61:1 | 30.09 | 3.14:1 | 27.28 | 3.46:1 | 35.97 |
| br_cyan vs foreground | 4.34:1 | 41.20 | 4.75:1 | 36.92 | 4.08:1 | 33.36 | 4.54:1 | 42.05 |

### Analysis of Residual Risk and Mitigation

Measurements show that dichromat readers lose hue contrast between specific ink pairs:
- Red against green under deuteranopia drops to 1.03:1 luminance ratio and 1.25 dE2000.
- Bright red against bright green under deuteranopia drops to 1.07:1 luminance ratio and 1.95 dE2000.
- Green against yellow under normal vision and protanopia/deuteranopia sits at 1.00:1 to 1.11:1 luminance ratio.

Residual Risk: A terminal application cannot enforce non-colour cues on external CLI programs. If a remote program uses colour alone to convey meaning (such as red for failure and green for success), a dichromat user will experience reduced legibility.

Mitigation: Under Rule 7 and WCAG SC 1.4.1, all fork-authored UI components must pair colour with text labels, icons, or visual markers.

## Gate Delta for ref-rvu4.6

The implementation issue `ref-rvu4.6` will apply the following updates to `web/packages/teleport/src/psiphonContrast/pairs.ts`:

1. **28 Deferred Pairs Become Live**:
   - 22 terminal pairs (`terminal-foreground-on-bg`, `terminal-black-on-bg`, `terminal-brightBlack-on-bg`, 12 chromatic pairs, `terminal-white-on-bg`, `terminal-brightWhite-on-bg`, `terminal-cursor-on-bg`, `terminal-cursorAccent-on-bg`, `terminal-selectionBackground-on-bg`, `terminal-searchMatch-on-bg`, `terminal-activeSearchMatch-on-bg`) change `deferred: true` to `deferred: false`.
   - 6 editor pairs (`editor-abbey-on-surface`, `editor-sunflower-on-surface`, `editor-purple-on-surface`, `editor-cyan-on-surface`, `editor-picton-on-surface`, `editor-caribbean-on-surface`) change `deferred: true` to `deferred: false`.

2. **8 Deferred Separation Rules Become Live**:
   - The 8 ANSI normal vs bright separation rules (`terminal-ansi-sep-black`, `terminal-ansi-sep-red`, `terminal-ansi-sep-green`, `terminal-ansi-sep-yellow`, `terminal-ansi-sep-blue`, `terminal-ansi-sep-magenta`, `terminal-ansi-sep-cyan`, `terminal-ansi-sep-white`) change `deferred: true` to `deferred: false`.

3. **20 DEFERRED_REFERENCE_EDGES Entries Removed**:
   - All 20 entries in `DEFERRED_REFERENCE_EDGES` are removed from `pairs.ts` because terminal and editor tokens no longer inherit unresolved references.

4. **Theme Configuration**:
   - `web/packages/teleport/src/psiphonTheme.ts` applies literal derived values for the 12 chromatic ANSI slots and sets references for structural, cursor, search, selection, and editor leaves.
