# Psiphon Access theme token mapping

**Status: COMPLETE for ref-rvu4.1 and ref-rvu4.2 scope. All 21 of 21 role groups decided, 174 of 174 leaves mapped** (145 mapped in ref-rvu4.1, and terminal 23 and editor 6 decided in ref-rvu4.2 under ADR 0005 and `2026-08-19-terminal-editor-values.md`). Light
values only. The operator approved D1 to D18 on 2026-08-17. The operator
delegated the four remaining colour choices on 2026-08-18, and D19 to D28 were
made under that delegation. ADR 0005 approved the terminal and editor rules on
2026-08-19.

This document is the contract the theme implementations follow. `ref-rvu4.6`
implements the Chakra config from it. Nothing implements a colour that is not in
this table.

The file is dated for the day it was written. `ref-rvu4.1` names a
`2026-08-13` path, which was the day the issue was raised.

## What this document does not do

It does not carry a second table for the older styled-components layer, because
that layer holds no colour of its own. `web/packages/design/src/theme/themes/types.ts:69`
declares `ThemeDefinition = Omit<Theme, 'colors'>`, so a theme definition cannot
hold colours at all. `resolveTheme.ts:38` then returns one constant,
`LEGACY_THEME_COLORS`, for every theme. Measured at `caceda7b573`, that constant
holds 476 leaves in 55 groups, and all 476 are `var(--teleport-*)` references
with no literal value. The styled-components layer is therefore a pointer layer
into the CSS variables that the Chakra config emits. Author the Chakra side and
the older components follow.

It authors no dark value. It does not restate the Psiphon primitives, which live
with their source lines in
[`2026-08-17-psiphon-primitive-inventory.md`](2026-08-17-psiphon-primitive-inventory.md).
It takes nothing from `psix-v2`.

## Floors and method

WCAG 2.1 AA. 4.5:1 for normal text, 3:1 for large text and for non-text such as
borders, focus rings, icons and chart ink. Each row names the floor that applies.

Disabled controls are exempt under WCAG 1.4.3, so a disabled value is reported
with its ratio and marked exempt rather than failed.

Ratios use the sRGB relative luminance formula. A value with alpha is composited
over the named surface before measurement, because a ratio against a transparent
colour is meaningless. Where a token appears on more than one surface, the worst
surface decides.

The numbers here came from a scratch script at `/tmp/theme-inv/contrast.py`.
`ref-rvu4.4` owns the permanent gate, and it must reproduce every ratio in this
document from the theme values themselves. A gate that reads a copy of this table
would report success about the wrong data.

## Decisions

### D1. The primary interactive colour is black, not the accent

`lib/design/theme/theme.dart:758-769` builds `ColorScheme.light` with
`primary: primaryBlack`, `onPrimary: primaryWhite`, `outline: primaryBlack`. The
four brand colours are absent from the colour scheme. They live in a separate
`AccentColors` extension at `:770-780`.

So the fork's solid primary is black with a white label, at 21:1.

### D2. The accent is decorative, and keeps its exact brand value

`brand` is `#FF703C`, unchanged from `tokens.dart:83`. Two limits follow from
measurement, and both are rules for implementers rather than value changes:

- It must not carry a label. White on `#FF703C` is 2.75:1 and fails. Black on it
  is 7.63:1, but a black label on orange is not a pattern this UI uses elsewhere.
- It must not be functional ink. `#FF703C` is 2.75:1 on white and 2.35:1 on the
  deep surface, against a 3:1 floor.

Decorative use in large graphics is unaffected, which is what the app does with
it in the connection orb.

### D3. Functional accent ink is a separate, named, derived token

Where the interface needs accent-coloured ink that carries meaning, it uses a
derived value of `#D95F33`, obtained by scaling each channel of `#FF703C` by 0.85.
It measures 3.73:1 on white and 3.18:1 on the deep surface, so it clears the 3:1
non-text floor on both. It does not clear 4.5:1, so it is not a text colour.

`#D95F33` is exactly the value `psix-v2` uses. That is a coincidence of method,
not a source: a 15 percent channel scale is the obvious way to reach the data-ink
floor. The distinction that matters is that psix propagated `#D95F33` **as the
brand accent**, which distorts the brand. Here `brand` stays `#FF703C` and this
value is a separate token whose name says it is derived.

### D4. The greys map by role, and one pairing is forbidden

The app gives both greys a job. `darkGrey #5C5C5C` is `onSurfaceVariant`, which is
secondary text. `mediumGrey #757575` is `subtleText`, which is tertiary. The brand
file's "Dark Grey" label is `#757575` and disagrees with the app's naming; the app
wins, and the conflict is recorded in the inventory.

**Forbidden pairing.** `#757575` on the deep surface `#EDEDED` is 3.94:1 and fails.
Tertiary text is not permitted on the deep surface. Use `#5C5C5C` there, at
5.71:1. The app never makes this pairing either, because it uses `lightGrey` as a
fill with black on it.

### D5. Disabled text uses the app's own opacity

`OpacityToken.disabled` is 0.38 (`tokens.dart:239`). Black at 0.38 over white is
`#9E9E9E` at 2.68:1, which is exempt. Teleport's current 0.36 is almost the same
value, so this costs nothing and is brand-sourced.

### D6. The elevation ramp derives one neutral step

The app has two surfaces, white and `#EDEDED`. Teleport wants five. The ends come
from the app and one intermediate neutral is derived at `#F7F7F7`.

Teleport's current ramp is blue-tinted, `#E6E9EA` through `#FBFBFC`. Psiphon's
greys are pure neutral, so the fork's ramp is neutral. This is visible and
intended.

Adjacent steps separate by only 1.07:1 to 1.17:1. That is inherent to a light
theme and matches Teleport's own spacing. Elevation is carried by shadow, for
which the app supplies `SurfaceTokens.glass`.

### D7. The alert family keeps Teleport's amber, with a black label

The brand defines no warning colour. `warmSecondary #FCB569` was considered and
refused, because the inventory establishes that the four brand colours are stops
of a radial gradient rather than categorical semantics. Using a gradient stop as a
semantic category is the same error this fork refused when it rejected the psix
chart palette.

So `interactive.solid.alert.*` keeps `#FFAB00` and its ramp, and its label is
black at 11.08:1. White on amber is 1.90:1 and must never be used.

This was the one item the operator did not receive an explicit recommendation for.
The choice above was made for consistency with D2 and D3 and is open to reversal.

### D8. The informational family keeps Teleport's blue

The brand defines no blue. The app's `system` names the Flutter SDK constant
`Colors.blue` and carries no Psiphon value, so there is nothing to adopt.
Teleport's `#0073BA` is kept deliberately. It measures 5.05:1 both as a fill under
a white label and as ink on white.

### D9. The primary tonal fills keep the accent, because black collides

A black-based tonal fill collides with the neutral tonal fill. Measured over
white, black at 0.18 gives `#D1D1D1`, and the existing `interactive.tonal.neutral.2`
at 0.18 gives `#D1D1D1`. They are the same colour.

So `interactive.tonal.primary.*` uses `#FF703C` at the existing 0.1, 0.18 and 0.25
alphas. This is decorative tinting, which D2 permits, and it keeps the brand
visible in an interface whose controls are otherwise black, white and grey. Text
on those tints is far above the floor: black measures 19.00:1, 17.52:1 and 16.30:1
over white, and 16.41:1, 15.27:1 and 14.33:1 over the deep surface.

### D10. The button border meets the non-text floor

`buttons.border.border` was `rgba(0,0,0,0.36)`, which composites to `#A3A3A3` at
2.52:1 and fails the 3:1 floor for a control boundary. It becomes alpha 0.42,
`#949494`, at 3.04:1.

This fixes an inherited Teleport defect rather than expressing a brand choice. The
rule that no floor is lowered to fit a colour cuts both ways: an inherited value
that fails is corrected, not carried.

### D11. The warning ink ramp shifts one step darker

Teleport's warning ink fails on white at two of its three steps: `#FFAB00` is
1.90:1 and `#CC8900` is 2.94:1, against a 3:1 ink floor and a 4.5:1 text floor.
Only `#996700` passes, at 4.89:1.

So the ink ramp shifts: `warning.main` `#996700` 4.89:1, `warning.hover` `#7A5200`
6.92:1, `warning.active` `#5C3E00` 9.79:1, the last two by the same 0.8 and 0.6
channel scale Teleport uses.

This does not contradict D7. D7 keeps amber `#FFAB00` as a solid FILL under a black
label, at 11.08:1. D11 governs amber as INK. A colour can be legible as a fill and
illegible as ink, and the two roles need different values.

### D12. The tooltip inverse link uses the kept blue

`tooltip.inverseLinkDefault` was `#009EFF`, which measures 2.77:1 on the inverse
background `#FBFBFB` and fails. It becomes `#0073BA` at 5.05:1, which is a colour
the fork already keeps for a reason.

### D13. Two Material leftovers derive from the kept blue

`notice.background` and `highlightedNavigationItem` resolve to `blue.50 #E3F2FD`
and `blue.200 #90CAF9`, which are Material palette values with no fork source.
They become the kept blue `#0073BA` at 0.1 and 0.2 over white, giving `#E6F1F8`
and `#CCE3F1`. Black text measures 18.30:1 and 15.83:1. This ties them to D8
instead of leaving two orphans.

### D14. The `action` group is dead, and stays untouched

`colors.action.*` has no reader. A search of every web package finds no property
access and no token string for any of its five leaves. Its values are white
alphas, which suggests a dark surface that no longer exists.

All five keep Teleport's values. Do not spend judgement on them. If something
starts reading them, the gate in `ref-rvu4.4` will measure them then.

### D15. Progress ink is the 0.8 accent step, and the track alpha is pinned

The playback progress fill and the timeline playhead use `#CC5A30`, the 0.8 channel
scale of the brand accent.

D3's `#D95F33` was proposed first and refused by measurement. It clears 3:1 on
white at 3.73:1, but a progress fill is read against its own track, not against the
page, and on the 0.1 neutral track it measures **2.99:1**. A progress fill is a part
of a graphic required to understand the content, so 3:1 applies.

`#CC5A30` measures 3.32:1 on the 0.1 track and 3.14:1 on a 0.12 track. **The track
alpha is therefore load-bearing and must stay at 0.10, and never exceed 0.12.** At
0.15 the fill fails again at 2.93:1. Anyone darkening the track must re-measure the
fill.

### D16. The risk scale separates by luminance, and colour is never the only cue

Four steps: low `#03830E`, medium `#7A5200`, high `#860A14`, critical `#000000`.

The first proposal used the D11 warning ink `#996700` for medium. It was refused:
`#03830E` against `#996700` measures **1.01:1**, so green and amber sat at
effectively identical luminance and differed only in hue. Green against amber is the
classic deuteranopia confusion, so that pair would have been unreadable for some
users and indistinguishable in greyscale for everyone. Moving medium to `#7A5200`
raises the pair to 1.40:1.

Teleport's own scale is no better. Its high against critical, `#CC372D` against
`#A32C24`, measures 1.41:1.

**Four steps cannot be separated by colour alone at any values available here.** So
the risk level must also carry a non-colour cue, which WCAG 1.4.1 requires in any
case. A label, an icon or a shape. The same rule applies to
`sessionRecording.user` against `sessionRecording.resource`, which separate by only
2.09:1 and rely on hue.

Pairwise separations of the chosen scale: low to medium 1.40:1, medium to high
2.08:1, high to critical 2.07:1, and 4.26:1 to 4.29:1 from low and medium to
critical.

### D17. Timeline ink that carries information meets the non-text floor

Four inherited values sat below 3:1 on the timeline surface and are raised to alpha
0.42, `#949494`, at 3.04:1: `cursor` was 0.4 at 2.85:1, `timeMarks.secondary` was
0.36 at 2.52:1, `frameBorder` was 0.2 at 1.61:1, and `border.default` was the
off-palette `#4c516e`. `border.hover` becomes `#5C5C5C` at 6.69:1.

`frameBorder` is arguably decorative structure rather than a control boundary, and
keeping it was considered. The operator raised it on 2026-08-17, on the reasoning
that a frame boundary a user relies on to read the timeline is information.

`timeMarks.primary` at 4.59:1 and `timeMarks.absolute` at 16.07:1 already pass and
keep their values.

### D18. Chip text is fully opaque

Two inherited chip labels failed because they were translucent over a coloured
chip. `events.join.text` was white at 0.8 over the kept blue and measured 3.80:1; it
becomes pure white at 5.05:1. `events.inactivity.text` was black at 0.6 over the
tint and measured 3.12:1; it becomes pure black at 11.42:1.

The general rule: a label on a coloured chip is opaque. Translucency saves nothing
and costs legibility.

### D19. The dataVisualisation tier structure is vestigial

13 of the 21 leaves have no reader in web/packages. Only caribbean and picton survive in more than one live tier. No three-tier ramp remains to protect. Each live leaf takes the value its role demands. Preserve the tier lightness ordering where it costs nothing. Never distort a brand-sourced value to satisfy a derived constraint.

### D20. tertiary.caribbean uses the app success green

Role: status success accent border and icon, plus LatencyDiagnostic Ok text. Value: `#03830E`, from the app success primitive. Contrast: 3.22:1 on interactive.tonal.success.1 against a 3:1 non-text floor, 4.77:1 on levels.surface, 4.93:1 on levels.elevated against a 4.5:1 text floor.

### D21. tertiary.sunflower uses the D11 warning ink

Role: status warning accent border and icon, plus LatencyDiagnostic Error text. Value: `#996700`, from D11. Contrast: 3.54:1 on interactive.tonal.alert.2 against a 3:1 non-text floor, 4.73:1 on levels.surface, 4.89:1 on levels.elevated against a 4.5:1 text floor.

### D22. tertiary.purple uses pure black from D1

Role: status primary accent border and icon. Value: `#000000`, following D1. Contrast: 14.66:1 on interactive.tonal.primary.0, 20.31:1 on levels.surface against a 3:1 floor.

### D23. tertiary.abbey uses the app failure red

Role: outline-danger label text in Label.tsx, plus LatencyDiagnostic Warn text. Value: `#860A14`, from the app failure primitive. Contrast: 8.47:1 on interactive.tonal.danger.0, 10.16:1 on levels.elevated against a 4.5:1 text floor.

### D24. picton steps move to active and hover steps of the blue ramp

Role: tertiary.picton is info status accent border and icon. secondary.picton is ProgressBar fill in ManagedUpdates/shared.tsx. D8 default `#0073BA` measures 3.00:1 on interactive.tonal.informational.2 and sits on the floor limit. Assign tertiary.picton to the active step `#004570`. It measures 5.98:1 on interactive.tonal.informational.2 and 9.74:1 on levels.surface. Assign secondary.picton to the hover step `#005C95`. It measures 3.84:1 on the worst-case track interactive.tonal.neutral.2 against a 3:1 floor. This preserves tier lightness ordering because secondary is lighter than tertiary. It costs nothing because D8 blue is a kept Teleport value.

### D25. primary.sunflower moves to the D11 hover step for label text

Role: outline-warning label text in Label.tsx. Main warning ink `#996700` measures 4.43:1 on interactive.tonal.alert.0 and fails the 4.5:1 text floor. Assign primary.sunflower to the D11 hover step `#7A5200`. It measures 6.27:1 on interactive.tonal.alert.0 and passes. A colour can be legible as a fill and illegible as text.

### D26. secondary.caribbean uses the 0.8 scaled success step

Role: ProgressBar fill in ManagedUpdates/shared.tsx. Value: `#02690B`, the app success green scaled by 0.8. Contrast: 3.76:1 on the worst-case track interactive.tonal.neutral.2 against a 3:1 floor. Tier ordering is deliberately not preserved here. Preserving it would mean darkening tertiary.caribbean purely to sit below secondary.caribbean. That choice would distort a brand-sourced value to satisfy a derived constraint. Record this lightness inversion between secondary and tertiary caribbean.

### D27. Seven dataVisualisation leaves have no reader and six serve theme references

Seven dataVisualisation leaves have no reader in shipped UI code. They keep inherited Teleport values. Six dataVisualisation leaves have no component reader, but the theme itself references them for terminal or editor. They also keep inherited Teleport values until ref-rvu4.2 decides terminal and editor. All 13 leaves are listed in `EXCLUDED_LEAVES` in `pairs.ts` with their evidence.

The six leaves and their theme references are:
- `primary.purple`: referenced by `terminal.brightMagenta`
- `primary.abbey`: referenced by `terminal.brightRed`
- `primary.cyan`: referenced by `terminal.brightCyan`
- `primary.caribbean`: referenced by `terminal.brightGreen`
- `primary.picton`: referenced by `terminal.brightBlue`
- `tertiary.cyan`: referenced by `terminal.cyan` and `editor.cyan`

The seven leaves with no reader are: `primary.wednesdays`, `secondary.purple`, `secondary.wednesdays`, `secondary.sunflower`, `secondary.abbey`, `secondary.cyan`, and `tertiary.wednesdays`.

### D28. LatencyDiagnostic.tsx maps worst latency to sunflower and middle to abbey

`LatencyDiagnostic.tsx:42-51` maps the worst latency threshold to tertiary.sunflower and the middle threshold to tertiary.abbey. Error is the `l >= ERROR_THRESHOLD` branch. With these token assignments that renders amber for the worst state and red for the middle state. That mapping is inverted from visual convention. The fork preserves this component mapping and records it. Do not edit the component.

## The table

`brand`, 1 leaf.

| Token | Teleport now | Psiphon | Source | Measured |
|---|---|---|---|---|
| `brand` | `#512FC9` | `#FF703C` | app `tokens.dart:83` | decorative only, D2 |

`levels`, 5 leaves.

| Token | Teleport now | Psiphon | Source | Black text |
|---|---|---|---|---|
| `levels.popout` | `#FFFFFF` | `#FFFFFF` | app `surface` | 21.00:1 |
| `levels.elevated` | `#FFFFFF` | `#FFFFFF` | app `surface` | 21.00:1 |
| `levels.surface` | `#FBFBFC` | `#FFFFFF` | app `surface` | 21.00:1 |
| `levels.sunken` | `#F1F2F4` | `#F7F7F7` | derived, D6 | 19.60:1 |
| `levels.deep` | `#E6E9EA` | `#EDEDED` | app `tokens.dart:74` | 17.94:1 |

`text`, 5 leaves. Ratios are against white, then against the deep surface.

| Token | Teleport now | Psiphon | Source | Measured |
|---|---|---|---|---|
| `text.main` | `#000000` | `#000000` | app `onSurface` | 21.00:1, 17.94:1 |
| `text.slightlyMuted` | `rgba(0,0,0,0.72)` | `#5C5C5C`, or black at alpha 0.639 | app `onSurfaceVariant` | 6.69:1, 5.71:1 |
| `text.muted` | `rgba(0,0,0,0.54)` | unchanged, now sourced as `#757575` | app `subtleText` | 4.61:1, **3.94:1 forbidden, D4** |
| `text.disabled` | `rgba(0,0,0,0.36)` | black at alpha 0.38 | app `OpacityToken.disabled` | 2.68:1 exempt |
| `text.primaryInverse` | `#FFFFFF` | `#FFFFFF` | app `onPrimary` | on black 21.00:1 |

Teleport's `rgba(0,0,0,0.54)` composites over white to exactly `#757575`, so
`text.muted` keeps its value and gains a brand source.

`interactive`, 33 leaves. Solid ramps carry a white label unless stated.

| Token | Teleport now | Psiphon | Source | Label ratio |
|---|---|---|---|---|
| `interactive.solid.primary.default` | `#512FC9` | `#000000` | app `primary` | 21.00:1 |
| `interactive.solid.primary.hover` | `#4126A1` | `#262626` | derived, lightened | 15.13:1 |
| `interactive.solid.primary.active` | `#311C79` | `#404040` | derived, lightened | 10.37:1 |
| `interactive.solid.danger.default` | `#CC372D` | `#860A14` | app `failure` | 10.16:1 |
| `interactive.solid.danger.hover` | `#A32C24` | `#6B0810` | derived, 0.8 scale | 12.59:1 |
| `interactive.solid.danger.active` | `#7A211B` | `#50060C` | derived, 0.6 scale | 15.30:1 |
| `interactive.solid.success.default` | `#007D6B` | `#03830E` | app `success` | 4.93:1 |
| `interactive.solid.success.hover` | `#006456` | `#02690B` | derived, 0.8 scale | 6.94:1 |
| `interactive.solid.success.active` | `#004B40` | `#024F08` | derived, 0.6 scale | 9.88:1 |
| `interactive.solid.alert.*` | `#FFAB00` ramp | unchanged, D7 | deliberate keep | black label 11.08:1 |
| `interactive.solid.accent.*` | `#0073BA` ramp | unchanged, D8 | deliberate keep | 5.05:1 |
| `interactive.tonal.primary.0/1/2` | purple at 0.1/0.18/0.25 | `#FF703C` at the same alphas | D9 | black on tint 19.00, 17.52, 16.30:1 |
| `interactive.tonal.success.0/1/2` | teal at 0.1/0.18/0.25 | `#03830E` at the same alphas | app `success` | to measure in ref-rvu4.4 |
| `interactive.tonal.danger.0/1/2` | red at 0.1/0.18/0.25 | `#860A14` at the same alphas | app `failure` | to measure in ref-rvu4.4 |
| `interactive.tonal.alert.0/1/2` | amber at 0.1/0.18/0.25 | unchanged, D7 | deliberate keep | to measure in ref-rvu4.4 |
| `interactive.tonal.informational.0/1/2` | blue at 0.1/0.18/0.25 | unchanged, D8 | deliberate keep | to measure in ref-rvu4.4 |
| `interactive.tonal.neutral.0/1/2` | black at 0.06/0.13/0.18 | unchanged | matches app `selectedTint` 0.06 | to measure in ref-rvu4.4 |

The hover and active values for `danger` and `success` follow Teleport's own
pattern of scaling each channel by 0.8 and 0.6. The primary ramp cannot follow it,
because black has nothing left to darken, so it lightens instead. That inversion
is a fork decision and the app cannot answer it, since the app has no hover state.

`buttons`, 23 leaves.

| Token | Teleport now | Psiphon | Source | Measured |
|---|---|---|---|---|
| `buttons.text` | `#000000` | unchanged | app `onSurface` | 21.00:1 on white |
| `buttons.textDisabled` | `rgba(0,0,0,0.3)` | alpha 0.38, `#9E9E9E` | D5 applied | 2.68:1 exempt |
| `buttons.bgDisabled` | `rgba(0,0,0,0.12)` | unchanged | no brand value | fill only |
| `buttons.primary.text` | `#FFFFFF` | unchanged | app `onPrimary` | 21.00:1 on black |
| `buttons.primary.default` | `#512FC9` | `#000000` | D1 | 21.00:1 |
| `buttons.primary.hover` | `#4126A1` | `#262626` | D1, lightened | 15.13:1 |
| `buttons.primary.active` | `#311C79` | `#404040` | D1, lightened | 10.37:1 |
| `buttons.secondary.default` | `rgba(0,0,0,0.07)` | unchanged, re-sourced | composites to `#EDEDED`, the app's `secondary` | black label 17.94:1 |
| `buttons.secondary.hover` | `rgba(0,0,0,0.13)` | unchanged | `#DEDEDE` | fill |
| `buttons.secondary.active` | `rgba(0,0,0,0.18)` | unchanged | `#D1D1D1` | fill |
| `buttons.border.default` | `rgba(255,255,255,0)` | unchanged | transparent | not applicable |
| `buttons.border.hover` | `rgba(0,0,0,0.07)` | unchanged | fill, not a boundary | not applicable |
| `buttons.border.active` | `rgba(0,0,0,0.13)` | unchanged | fill, not a boundary | not applicable |
| `buttons.border.border` | `rgba(0,0,0,0.36)` | alpha 0.42, `#949494` | D10 | 3.04:1, floor 3.0 |
| `buttons.warning.text` | `#FFFFFF` | unchanged | app `onError` | see the row below |
| `buttons.warning.default` | `#CC372D` | `#860A14` | app `failure` | white label 10.16:1 |
| `buttons.warning.hover` | `#A32C24` | `#6B0810` | derived, 0.8 scale | 12.59:1 |
| `buttons.warning.active` | `#7A211B` | `#50060C` | derived, 0.6 scale | 15.30:1 |
| `buttons.trashButton.default` | `rgba(0,0,0,0.07)` | unchanged | neutral fill | the icon carries the meaning |
| `buttons.trashButton.hover` | `rgba(0,0,0,0.13)` | unchanged | neutral fill | the icon carries the meaning |
| `buttons.link.default` | `#0073BA` | unchanged | D8 | 5.05:1 |
| `buttons.link.hover` | `#005C95` | unchanged | D8 | darker than default |
| `buttons.link.active` | `#004570` | unchanged | D8 | darker than hover |

**A naming trap.** `buttons.warning.*` is Teleport's DESTRUCTIVE button and its
values are red, while `warning.*` is the amber advisory ink. They are different
roles with confusingly similar names. `buttons.warning.*` maps to the app's
`failure`, and `warning.*` maps to the amber ramp of D11. Do not map by name.

The small groups, 27 leaves.

| Token | Teleport now | Psiphon | Source | Measured |
|---|---|---|---|---|
| `error.main` | `#CC372D` | `#860A14` | app `failure` | 10.16:1 as ink on white |
| `error.hover` | `#A32C24` | `#6B0810` | derived, 0.8 scale | 12.59:1 |
| `error.active` | `#7A211B` | `#50060C` | derived, 0.6 scale | 15.30:1 |
| `success.main` | `#007D6B` | `#03830E` | app `success` | 4.93:1 |
| `success.hover` | `#006456` | `#02690B` | derived, 0.8 scale | 6.94:1 |
| `success.active` | `#004B40` | `#024F08` | derived, 0.6 scale | 9.88:1 |
| `warning.main` | `#FFAB00` | `#996700` | D11 | 4.89:1 |
| `warning.hover` | `#CC8900` | `#7A5200` | D11, 0.8 scale | 6.92:1 |
| `warning.active` | `#996700` | `#5C3E00` | D11, 0.6 scale | 9.79:1 |
| `accent.main`, `.hover`, `.active` | `#0073BA` ramp | unchanged | D8 | 5.05:1, then darker |
| `link` | `#0073BA` | unchanged | D8 | 5.05:1 |
| `progressBarColor` | `#007D6B` | `#03830E` | app `success` | 4.93:1, ink floor 3.0 |
| `notice.background` | `blue.50 #E3F2FD` | `#E6F1F8` | D13 | black text 18.30:1 |
| `highlightedNavigationItem` | `blue.200 #90CAF9` | `#CCE3F1` | D13 | black text 15.83:1 |
| `tooltip.background` | `color-mix(black 80%, sunken)` | unchanged expression | follows D6 | resolves to `#313131`, white text 12.93:1 |
| `tooltip.inverseBackground` | `color-mix(white 50%, sunken)` | unchanged expression | follows D6 | resolves to `#FBFBFB`, black text 20.29:1 |
| `tooltip.inverseLinkDefault` | `#009EFF` | `#0073BA` | D12 | 5.05:1, was 2.77:1 |
| `spotBackground.0`, `.1`, `.2` | `tonal.neutral.*` references | unchanged expressions | follow D9's neutral | fills only |
| `action.*`, 5 leaves | white alphas | unchanged | D14, unused | not measured, no reader |

`sessionRecording`, 9 leaves.

| Token | Teleport now | Psiphon | Source | Measured |
|---|---|---|---|---|
| `player.progressBar.background` | `rgba(0,0,0,0.1)` | unchanged, **pinned** | D15 | track for the fill below |
| `player.progressBar.seeking` | `rgba(0,0,0,0.15)` | unchanged | neutral fill | not information |
| `player.progressBar.progress` | `#9F85FF` | `#CC5A30` | D15 | 3.32:1 on the track |
| `resource` | `#004570` | unchanged | D8's darkest blue | 10.07:1 on white |
| `user` | `#311C79` | `#000000` | D1 | 21.00:1 on white |
| `riskLevels.low` | `#007D6B` | `#03830E` | app `success` | 4.93:1 on white |
| `riskLevels.medium` | `#FFAB00` | `#7A5200` | D16 | 6.92:1 on white |
| `riskLevels.high` | `#CC372D` | `#860A14` | app `failure` | 10.16:1 on white |
| `riskLevels.critical` | `#A32C24` | `#000000` | D16 | 21.00:1 on white |

`sessionRecordingTimeline`, 21 leaves.

| Token | Teleport now | Psiphon | Source | Measured |
|---|---|---|---|---|
| `background` | `#FBFBFC` | `#FFFFFF` | D6 | black text 21.00:1 |
| `headerBackground` | `rgba(0,0,0,0.05)` | unchanged | neutral fill | not information |
| `frameBorder` | `rgba(0,0,0,0.2)` | alpha 0.42, `#949494` | D17 | 3.04:1, was 1.61:1 |
| `progressLine` | `#E53E3E` | `#CC5A30` | D15 | 3.32:1 on the track |
| `border.default` | `#4c516e` | `#949494` | D17 | 3.03:1 |
| `border.hover` | `#5f659e` | `#5C5C5C` | D17 | 6.69:1 |
| `cursor` | `rgba(0,0,0,0.4)` | alpha 0.42, `#949494` | D17 | 3.04:1, was 2.85:1 |
| `events.inactivity.background` | `rgba(81,47,201,0.25)` | black at 0.25, `#BFBFBF` | neutral reads as absence, not alert | black text 11.42:1 |
| `events.inactivity.text` | `rgba(0,0,0,0.6)` | `#000000` | D18 | 11.42:1, was 3.12:1 |
| `events.resize.semiBackground` | `rgba(0,0,0,0.8)` | unchanged | overlay, resolves to `#333333` | white text 12.63:1 |
| `events.resize.background` | `#86c4ed` | `#B2D5EA` | kept blue at 0.30, D13 pattern | black text 13.60:1 |
| `events.resize.border` | `#26323c` | `#000000` | replaces an off-palette slate | 21.00:1 |
| `events.resize.text` | `#26323c` | `#000000` | replaces an off-palette slate | 13.60:1 on the chip |
| `events.join.background` | `#0073BA` | unchanged | D8 | white text 5.05:1 |
| `events.join.text` | `rgba(255,255,255,0.8)` | `#FFFFFF` | D18 | 5.05:1, was 3.80:1 |
| `events.default.background` | `rgba(0,0,0,0.54)` | unchanged, `#757575` | matches the app's `subtleText` value | black text 4.56:1 |
| `events.default.text` | `#000` | unchanged | D1 | 4.56:1, passes but marginal |
| `timeMarks.primary` | `rgba(0,0,0,0.54)` | unchanged | already passes | 4.59:1 |
| `timeMarks.secondary` | `rgba(0,0,0,0.36)` | alpha 0.42, `#949494` | D17 | 3.04:1, was 2.52:1 |
| `timeMarks.absolute` | `rgba(0,0,0,0.87)` | unchanged | already passes | 16.07:1 |
| `timeMarks.text` | `rgba(0,0,0,0.87)` | unchanged | already passes | 16.07:1 |

`dataVisualisation`, 21 leaves.

| Token | Teleport now | Psiphon | Source | Measured |
|---|---|---|---|---|
| `dataVisualisation.primary.purple` | `#5531D4` | unchanged | D27, theme reference | referenced by terminal.brightMagenta |
| `dataVisualisation.primary.wednesdays` | `#A70DAF` | unchanged | D27, no reader | dead leaf, teleterm only |
| `dataVisualisation.primary.picton` | `#006BB8` | unchanged | D27, theme reference | referenced by terminal.brightBlue |
| `dataVisualisation.primary.sunflower` | `#8F5F00` | `#7A5200` | D25, D11 hover step | Label.tsx outline-warning text, 6.27:1 on alert.0 |
| `dataVisualisation.primary.caribbean` | `#007562` | unchanged | D27, theme reference | referenced by terminal.brightGreen |
| `dataVisualisation.primary.abbey` | `#BF372E` | unchanged | D27, theme reference | referenced by terminal.brightRed |
| `dataVisualisation.primary.cyan` | `#007282` | unchanged | D27, theme reference | referenced by terminal.brightCyan |
| `dataVisualisation.secondary.purple` | `#6F4CED` | unchanged | D27, no reader | dead leaf, teleterm only |
| `dataVisualisation.secondary.wednesdays` | `#DC37E5` | unchanged | D27, no reader | dead leaf, teleterm only |
| `dataVisualisation.secondary.picton` | `#0089DE` | `#005C95` | D24, D8 hover step | ManagedUpdates/shared.tsx ProgressBar fill, 3.84:1 on neutral.2 |
| `dataVisualisation.secondary.sunflower` | `#B27800` | unchanged | D27, no reader | dead leaf, no reader |
| `dataVisualisation.secondary.caribbean` | `#009681` | `#02690B` | D26, 0.8 success scale | ManagedUpdates/shared.tsx ProgressBar fill, 3.76:1 on neutral.2 |
| `dataVisualisation.secondary.abbey` | `#D4635B` | unchanged | D27, no reader | dead leaf, no reader |
| `dataVisualisation.secondary.cyan` | `#1792A3` | unchanged | D27, no reader | dead leaf, teleterm only |
| `dataVisualisation.tertiary.purple` | `#3D1BB2` | `#000000` | D22, D1 black | statusColors.ts primary accent, 14.66:1 on primary.0, 20.31:1 on surface |
| `dataVisualisation.tertiary.wednesdays` | `#690274` | unchanged | D27, no reader | dead leaf, teleterm only |
| `dataVisualisation.tertiary.picton` | `#004B89` | `#004570` | D24, D8 active step | statusColors.ts info accent, 5.98:1 on informational.2, 9.74:1 on surface |
| `dataVisualisation.tertiary.sunflower` | `#704B00` | `#996700` | D21, D11 warning ink | statusColors.ts warning accent & LatencyDiagnostic Error text, 3.54:1 on alert.2, 4.73:1 on surface, 4.89:1 on elevated |
| `dataVisualisation.tertiary.caribbean` | `#005742` | `#03830E` | D20, app success | statusColors.ts success accent & LatencyDiagnostic Ok text, 3.22:1 on success.1, 4.77:1 on surface, 4.93:1 on elevated |
| `dataVisualisation.tertiary.abbey` | `#9D0A00` | `#860A14` | D23, app failure | Label.tsx outline-danger text & LatencyDiagnostic Warn text, 8.47:1 on danger.0, 10.16:1 on elevated |
| `dataVisualisation.tertiary.cyan` | `#015C6E` | unchanged | D27, theme reference | referenced by terminal.cyan & editor.cyan |

## The change ratio, which `ref-rvu4.5` needs

Of the 145 leaves mapped across the 19 non-deferred role groups, **72 change and 73 keep Teleport's value**, so a fraction under half. The counts are exact and were taken leaf by leaf. Nothing was altered to move them.

By batch:
- The first four groups (`brand`, `levels`, `text`, `interactive`): 24 changed against 20 kept across 44 leaves.
- The `buttons` group and the small groups: 21 changed against 29 kept across 50 leaves.
- The two session recording groups (`sessionRecording` and `sessionRecordingTimeline`): 19 changed against 11 kept across 30 leaves.
- The `dataVisualisation` group: 8 changed (the 8 leaves with a component reader) against 13 kept (7 leaves with no reader and 6 leaves that only the theme references) across 21 leaves.

Across all 174 leaves in the theme (including the 29 deferred monospace leaves):
- Decided/mapped: 145 leaves (72 changed, 73 kept).
- Deferred to `ref-rvu4.2`: 29 leaves (`terminal` 23, `editor` 6).

Every figure here was counted leaf by leaf.

## Groups decided in ref-rvu4.2

2 groups, 29 leaves: `terminal` 23, `editor` 6.

`terminal` (23 leaves) and `editor` (6 leaves) are decided in `ref-rvu4.2` under ADR 0005. The authoritative values, measurements, and CVD analysis are recorded in [`2026-08-19-terminal-editor-values.md`](2026-08-19-terminal-editor-values.md). All 21 role groups in the theme are now fully decided and mapped.

### Resolution of terminal reference chains and magenta collapse

Decision D22 assigned `#000000` to `dataVisualisation.tertiary.purple` for status primary accent borders. In the baseline theme reference chain, `terminal.magenta` inherited `{colors.dataVisualisation.tertiary.purple}`, which caused `terminal.magenta` to collapse onto `terminal.black` (`#000000`).

Under ADR 0005, all 12 chromatic ANSI terminal tokens break their reference chains to `dataVisualisation.*` and take literal derived values from Selenized Light. Decision D22 remains `#000000` for status borders. `terminal.magenta` takes literal `#a03778`, separating from `brightMagenta` (`#be418e`) by 1.31:1 and resolving the collapse defect.

The table below is HISTORY. It records what the `dataVisualisation` decisions did to six ANSI slots while the reference chains were still live, which is what `ref-f7e8` found. Breaking the chains removed that effect. Keep the table, because it explains why the chains had to be broken.

| ANSI slot | Source token | Decision | Inherited value | Value the chain gave it |
|---|---|---|---|---|
| `terminal.red` | `dataVisualisation.tertiary.abbey` | D23 | `#9D0A00` | `#860A14` |
| `terminal.green` | `dataVisualisation.tertiary.caribbean` | D20 | `#005742` | `#03830E` |
| `terminal.yellow` | `dataVisualisation.tertiary.sunflower` | D21 | `#704B00` | `#996700` |
| `terminal.blue` | `dataVisualisation.tertiary.picton` | D24 | `#004B89` | `#004570` |
| `terminal.magenta` | `dataVisualisation.tertiary.purple` | D22 | `#3D1BB2` | `#000000` |
| `terminal.brightYellow` | `dataVisualisation.primary.sunflower` | D25 | `#8F5F00` | `#7A5200` |

`editor.abbey` (`#860A14`) and `editor.sunflower` (`#996700`) retain their references to dataVisualisation decisions D23 and D21. The four remaining editor leaves (`editor.purple`, `editor.cyan`, `editor.picton`, `editor.caribbean`) have no live reader in shipped UI code and are recorded as excluded leaves.
