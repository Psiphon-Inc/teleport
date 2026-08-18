# Psiphon Access theme contrast baseline

**Status: CURRENT. Measured baseline for ref-rvu4.4.**

This document records the contrast and separation baseline measured against the inherited Teleport theme. The gate in `web/packages/teleport/src/psiphonContrast/gate.ts` enforces these measurements.

## Measurement details

- **Commit measured:** `ddefc7b22c5`
- **Date:** 2026-08-18
- **Resolved theme leaves:** 174

## Standards and floors

The gate measures compliance with WCAG 2.1 AA standards:

- **Normal text floor:** 4.5:1 relative contrast ratio.
- **Large text and non-text floor:** 3.0:1 relative contrast ratio for UI components, borders, and indicators.
- **Separation rule threshold:** 1.3:1 relative luminance ratio between data visualization series tokens.

The floor values never move. A baseline entry records a known defect. It does not lower a floor or redefine passing.

## Contrast pair summary

Total contrast pairs evaluated: 185.

- **PASS:** 125 pairs meet or exceed their floor.
- **BASELINE (Known Failures):** 22 pairs fail today and are recorded in the baseline.
- **EXEMPT:** 7 pairs are exempt under WCAG 1.4.3 (disabled controls).
- **NOT_BOUNDARY:** 3 pairs are non-structural fill tints rather than component boundaries.
- **DEFERRED:** 28 pairs are deferred to `ref-rvu4.2` (terminal and editor monospace tokens).

## Separation rule summary

Total separation rules evaluated: 71.

- **PASS:** 17 rules meet or exceed the 1.3:1 relative luminance separation threshold.
- **BASELINE (Known Failures):** 46 rules fail today in the inherited data visualization palette.
- **DEFERRED:** 8 rules are deferred to `ref-rvu4.2` (terminal ANSI normal vs bright separation).

## Known contrast pair failures

| Pair ID | Token A | Token B | Measured | Floor | Decision | Reason |
|---|---|---|---|---|---|---|
| `text-muted-on-sunken` | `text.muted` | `levels.sunken` | 4.48:1 | 4.5:1 | D4 | Text muted on sunken surface fails 4.5:1 body text floor. |
| `text-muted-on-deep` | `text.muted` | `levels.deep` | 4.38:1 | 4.5:1 | D4 | Text muted on deep surface fails 4.5:1 floor (forbidden pairing in D4). |
| `text-main-on-brand` | `text.main` | `brand` | 2.60:1 | 4.5:1 | D2 | Black text on brand accent fails 4.5:1 floor (brand accent is decorative per D2). |
| `interactive-solid-alert-active` | `text.main` | `interactive.solid.alert.active` | 4.29:1 | 4.5:1 | D7 | Black text on active alert fill #996700 fails 4.5:1 floor. |
| `buttons-border-border-on-surface` | `buttons.border.border` | `levels.surface` | 2.50:1 | 3.0:1 | D10 | Button border alpha 0.36 fails 3.0:1 non-text control boundary floor. |
| `buttons-border-border-on-deep` | `buttons.border.border` | `levels.deep` | 2.47:1 | 3.0:1 | D10 | Button border alpha 0.36 on deep surface fails 3.0:1 non-text floor. |
| `tooltip-inverseLinkDefault-on-inverseBackground` | `tooltip.inverseLinkDefault` | `tooltip.inverseBackground` | 2.72:1 | 4.5:1 | D12 | Inverse tooltip link #009EFF fails 4.5:1 text floor. |
| `error-main-on-deep` | `error.main` | `levels.deep` | 4.14:1 | 4.5:1 | None | Error main ink #CC372D on deep surface fails the 4.5:1 floor. The mapping document maps `error.main` to the app failure colour #860A14 in its small groups table, which is far darker. |
| `success-main-on-deep` | `success.main` | `levels.deep` | 4.15:1 | 4.5:1 | None | Success main ink #007D6B on deep surface fails 4.5:1 floor. |
| `warning-main-on-surface` | `warning.main` | `levels.surface` | 1.83:1 | 4.5:1 | D11 | Warning main ink #FFAB00 on surface fails 4.5:1 floor. |
| `warning-main-on-deep` | `warning.main` | `levels.deep` | 1.55:1 | 4.5:1 | D11 | Warning main ink #FFAB00 on deep surface fails 4.5:1 floor. |
| `warning-hover-on-surface` | `warning.hover` | `levels.surface` | 2.84:1 | 4.5:1 | D11 | Warning hover ink #CC8900 on surface fails 4.5:1 floor. |
| `warning-hover-on-deep` | `warning.hover` | `levels.deep` | 2.41:1 | 4.5:1 | D11 | Warning hover ink #CC8900 on deep surface fails 4.5:1 floor. |
| `warning-active-on-deep` | `warning.active` | `levels.deep` | 4.01:1 | 4.5:1 | D11 | Warning active ink #996700 on deep surface fails 4.5:1 floor. |
| `link-on-deep` | `link` | `levels.deep` | 4.14:1 | 4.5:1 | D8 | Link ink #0073BA on deep surface fails 4.5:1 floor. |
| `sessionRecording-progress-on-trackBg` | `sessionRecording.player.progressBar.progress` | `sessionRecording.player.progressBar.background` | 2.31:1 | 3.0:1 | D15 | Progress bar fill #9F85FF on track background fails 3.0:1 non-text floor. |
| `sessionRecording-seeking-on-surface` | `sessionRecording.player.progressBar.seeking` | `levels.surface` | 1.42:1 | 3.0:1 | None | Seeking bar fill #D5D5D6 on surface fails 3.0:1 non-text floor. |
| `sessionRecording-risk-medium-on-surface` | `sessionRecording.riskLevels.medium` | `levels.surface` | 1.83:1 | 4.5:1 | D16 | Risk medium ink #FFAB00 on surface fails 4.5:1 floor. |
| `timeline-frameBorder-on-background` | `sessionRecordingTimeline.frameBorder` | `sessionRecordingTimeline.background` | 1.60:1 | 3.0:1 | D17 | Timeline frame border #C9C9CA fails 3.0:1 non-text floor. |
| `timeline-cursor-on-background` | `sessionRecordingTimeline.cursor` | `sessionRecordingTimeline.background` | 2.82:1 | 3.0:1 | D17 | Timeline cursor #979797 fails 3.0:1 non-text floor. |
| `timeline-events-join-text-on-bg` | `sessionRecordingTimeline.events.join.text` | `sessionRecordingTimeline.events.join.background` | 3.80:1 | 4.5:1 | D18 | Translucent join event text #CCE3F1 on #0073BA fails 4.5:1 floor. |
| `timeline-timeMarks-secondary-on-bg` | `sessionRecordingTimeline.timeMarks.secondary` | `sessionRecordingTimeline.background` | 2.50:1 | 3.0:1 | D17 | TimeMarks secondary tick #A1A1A1 fails 3.0:1 non-text floor. |

## Known separation rule failures

The 46 separation rule failures occur in the inherited `dataVisualisation` series tokens. They fail the 1.3:1 relative luminance separation floor within primary, secondary, and tertiary series tiers. None of these tokens are decided in the 2026-08-17 theme token mapping document. They will be derived and resolved in `ref-rvu4.1`.
