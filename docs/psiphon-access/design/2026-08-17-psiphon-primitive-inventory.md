# Psiphon design primitives, with provenance

**Status: current. This is an inventory, not a decision.** It records what the
Psiphon design language defines and where each value comes from. It maps nothing
onto Teleport and settles no conflict. The mapping is ref-rvu4.1.

Every value below was read from a source and checked against it. A value with no
source line is marked absent instead of being filled in from memory.

## Sources and how to read them again

| Tier | Source | How it was read |
|---|---|---|
| PRIMARY | Psiphon app, commit `4c580622` | `git --git-dir=$HOME/src/psiphon4-app/.git show 4c580622:<path>`. The container holds no worktree, so read blobs directly. Do not check anything out. |
| SUPPLEMENTAL | `~/src/design/psiphon-brand-docs/psiphon/design-tokens/` | `psiphon_tokens_json_colors_v1.json`, `psiphon_tokens_json_typography_v1.json` |
| REFUSED | `~/src/psix-v2` | Not read, not cited. It darkened the accent from `FF703C` to `D95F33` and darkened the four gradient stops by 40 percent to pass its own chart gates. |

PRIMARY files: `lib/design/tokens.dart` (8503 bytes), `lib/design/theme/theme.dart`
(32835 bytes), `lib/design/DESIGN_SYSTEM_LAYERS.md` (15496 bytes).

The brand JSON holds **9 colour entries and nothing else**. It is a reduced set.
Where the two tiers disagree, this document reports both.

## Colours

All values are mode-independent. The app defines no dark value.

| App name | Value | PRIMARY line | Brand name | Brand key |
|---|---|---|---|---|
| `primaryBlack` | `#000000` | `tokens.dart:68` | Primary Black | `colors."Primary Black"` |
| `primaryWhite` | `#FFFFFF` | `tokens.dart:69` | Primary White | `colors."Primary White"` |
| `darkGrey` | `#5C5C5C` | `tokens.dart:72` | absent | — |
| `mediumGrey` | `#757575` | `tokens.dart:73` | Dark Grey | `colors."Dark Grey"` |
| `lightGrey` | `#EDEDED` | `tokens.dart:74` | Light Grey | `colors."Light Grey"` |
| `overlay20` | `rgba(0,0,0,0.2)` | `tokens.dart:78` | Overlays | `colors.Overlays`, alpha 0.2 |
| `glassEffectFill` | `rgba(255,255,255,0.9)` | `tokens.dart:79` | absent | — |
| `glassEffectShadow` | `rgba(204,204,204,0.4)` | `tokens.dart:80` | absent | — |
| `warmPrimary` | `#FF703C` | `tokens.dart:83` | Bright Orange | `colors.Gradient."Bright Orange"` |
| `warmSecondary` | `#FCB569` | `tokens.dart:84` | Light Orange | `colors.Gradient."Light Orange"` |
| `coldPrimary` | `#EFD4C2` | `tokens.dart:85` | Psiphon Peach | `colors.Gradient."Psiphon Peach"` |
| `coldSecondary` | `#AFBADA` | `tokens.dart:86` | Lavender | `colors.Gradient.Lavender` |
| `success` | `#03830E` | `tokens.dart:87` | absent | — |
| `failure` | `#860A14` | `tokens.dart:88` | absent | — |
| `system` | Flutter `Colors.blue` | `tokens.dart:89` | absent | — |

`success` and `failure` are written as `Color.fromARGB(255, 3, 131, 14)` and
`Color.fromARGB(255, 134, 10, 20)`. `system` names a Flutter SDK constant, so the
brand supplies **no literal value** for it.

### The four brand colours are a gradient, and the source proves it

`GradientToken` at `tokens.dart:162-187` uses the four colours as stops of a
`RadialGradient`, twice. `orbGradient` carries stops `[0.0, 0.0, 0.1543, 1.0]`, a
radius of 1.1368, a centre of `(1.2772, -0.053)` and a 135 degree rotation.
`orbBackgroundBlurGradient` carries stops `[0.0871676, 0.384377, 0.611703, 1.0]`.

Uneven stops and a rotation are the signature of a continuous ramp for one
graphic, the connection orb. They are not four categorical series. Any use of
these four as chart categories is a new decision by this fork, and it belongs to
the `dataVisualisation` judgement in ref-rvu4.1.

## Typography

The family is **Inter** at every step. There is **no Psiphon monospace**:
`tokens.dart:61-62` sets `monospaceFontFamily = 'monospace'` with the fallback
list `['Courier New', 'Courier', 'monospace']`, which is a system default rather
than a brand face. This is why ref-rvu4.2 has to decide a face instead of looking
one up.

| Step | Size / line height | PRIMARY line | In brand JSON |
|---|---|---|---|
| Hero | 48 / 56 | `tokens.dart:48-49` | yes |
| Display | 32 / 40 | `tokens.dart:45-46` | yes |
| Headline | 24 / 32 | `tokens.dart:42-43` | yes |
| **Title** | **18 / 24** | `tokens.dart:39-40` | **absent** |
| Body II | 16 / 20 | `tokens.dart:36-37` | yes |
| Body I | 14 / 18 | `tokens.dart:33-34` | yes |
| Micro | 12 / 16 | `tokens.dart:30-31` | yes |

Weights, `tokens.dart:52-55`: Regular 400, Medium 500, **SemiBold 600**, Heavy 700.
The brand JSON names only the labels Regular, Medium and Heavy per step and gives
no number, so the numeric mapping is PRIMARY-only. SemiBold exists as a token and
as `TypographyTheme.weightSemiBold`, but no named text style in `buildAppTheme`
applies it.

The app therefore has a **7 step scale**, not the 6 the brand file lists. Note for
anyone comparing with psix: psix was criticised for inventing a Title 18/24 step.
The step is real and comes from the app. The brand file simply omits it.

## Non-colour token families, PRIMARY only

The brand documents cover colour and typography only. Everything here exists in
the app alone.

| Family | Values | Line |
|---|---|---|
| `Spacing` | xxxs 2, xxs 4, xs 8, sm 12, md 16, lg 24, xl 32, xxl 48, xxxl 56, xxxxl 64, icon 18 | `tokens.dart:13-24` |
| `BorderToken` | spinnerWidth 3, spinnerWidthSmall 2, regular 1, thick 2, thicker 3 | `tokens.dart:92-100` |
| `SizeToken` | appButtonHeight 56, turnOnButtonHeight 60, appSlimButtonHeight 32, pLogoHeight 32, orbStartSize 160, orbPrimarySize 250, settingsSheetMaxWidth 640, inlineIndicator 18 | `tokens.dart:102-114` |
| `RadiusToken` | button 8, container 8, small 12, rounded 25, circle 100 | `tokens.dart:116-122` |
| `PaddingToken` | appButtonPadding 12/16, appSlimPadding 12/8, onboarding top 32 bottom 48 sides 16 | `tokens.dart:124-131` |
| `SurfaceTokens.glass` | fill white at 90 percent, shadow `#CCCCCC` at 40 percent offset `(0,-4)` blur 30.4, blurSigma 16 | `tokens.dart:145-160` |
| `DurationToken` | fast 220 ms, medium 280 ms, slow 500 ms, shimmer 3500 ms, spinnerRotation 1 s, transientDisplay 2 s, completionDisplay 3 s, minSpinnerDisplay 600 ms, onboardingGradientCycle 10 s | `tokens.dart:207-220` |

The spacing scale is a 2, 4, 8, 12, 16, 24, 32, 48, 56, 64 ramp. Teleport's own
`space` array is `[0, 4, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80]`
(`web/packages/design/src/theme/themes/sharedStyles.ts:71`). The two agree on 4, 8,
16, 24, 32, 48, 56 and 64 and disagree on 2, 12, 40, 72 and 80. Nothing in scope today
changes spacing, so this is recorded for a later decision only.

## Two conflicts, recorded and unresolved

**The grey names collide across tiers.** The app defines three greys,
`darkGrey #5C5C5C`, `mediumGrey #757575` and `lightGrey #EDEDED`. The brand file
defines two, and it calls `#757575` "Dark Grey". So the brand file's "Dark Grey"
is the app's `mediumGrey`, and the app's own `darkGrey #5C5C5C` is absent from the
brand file. A reader who trusts the label alone will pick the wrong value.

**The brand file defines no semantic state.** A search of the whole colours JSON
for success, failure and error returns nothing. Both states exist only in the app,
which also exposes them through `ColorScheme.error` and `AccentColors`.

## The app is light only, on purpose and with a note

`theme.dart:758` builds `const ColorScheme.light(...)`. There is no dark scheme
and no brightness switch in these files. `theme.dart:19-23` carries an explicit
`TODO(dark mode)` describing what a future dark theme would need. So the fork's
light-only decision omits nothing that exists today.

## What the mapping must still decide

These are open questions, not gaps in this inventory.

1. Which value is "Dark Grey" for the fork: the app's `darkGrey #5C5C5C`, or
   `#757575`, which the app calls `mediumGrey` and the brand file calls Dark Grey.
2. Whether the fork adopts the app's Title 18/24 step or stays with the brand
   file's six steps.
3. Whether the fork needs SemiBold 600, which the app defines and never applies.
4. What value backs `system`, which today is a Flutter SDK colour with no brand
   hex.
5. What `dataVisualisation` gets, given that the four brand colours are gradient
   stops rather than categorical hues.
6. Whether `FF703C` can carry a label at the required contrast, or whether the
   on-accent treatment changes for that role. The accent is a bright orange, so
   this pair is the most likely to fail.
