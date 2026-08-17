# Psiphon Access theme token mapping

**Status: PARTIAL. 16 of 21 role groups decided, 94 of 174 leaf tokens.** Light
values only. Every decision below was approved by the operator on 2026-08-17. The
remaining groups are listed at the end and are not started.

This document is the contract the theme implementations follow. `ref-rvu4.6`
implements the Chakra config from it. Nothing implements a colour that is not in
this table.

The file is dated for the day it was written. `ref-rvu4.1` names a
`2026-08-13` path, which was the day the issue was raised.

## What this document does not do

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

## The change ratio, which `ref-rvu4.5` needs

Of the 94 leaves decided so far, **45 change and 49 keep Teleport's value**, a 48
percent change rate.

The first four groups ran at 24 changed against 20 kept. The twelve groups added
after them ran at 21 changed against 29 kept, because `buttons` inherits neutral
alphas that already sit on Psiphon values, and because D8 and D14 keep the blue
ramps and the dead `action` group whole.

An earlier estimate of the second batch said 41 changed and 53 kept. The measured
figure is 45 and 49. The estimate was made before `buttons.textDisabled` was
resolved under D5 and before the keeps were counted one by one. The measured figure
stands, and nothing was changed to move it.

## Groups not yet decided

5 groups, 80 leaves: `terminal` 23, `dataVisualisation` 21,
`sessionRecordingTimeline` 21, `sessionRecording` 9, `editor` 6.

`terminal` and `editor` are deferred to `ref-rvu4.2`, which owns the monospace face
and the ANSI palette. That leaves 51 leaves in three groups.

`dataVisualisation` is the hard one. It needs categorical hues, and the brand
supplies a gradient rather than categories, so it needs a derivation with measured
separation between every pair and a colour vision check. Derive it inside the
`ref-rvu4.4` gate, so that both checks are machine-enforced instead of judged by
eye. `ref-rvu4.2` hit exactly that trap when a contrast-only derivation collapsed
two ANSI slots onto the same colour.
