/*
 * Psiphon Access
 * Copyright (C) 2026  Psiphon Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  composite,
  contrastRatio,
  isOpaque,
  toHex,
  type Color,
  type OpaqueColor,
} from './color';
import {
  CONTRAST_PAIRS,
  SEPARATION_RULES,
  type ContrastPair,
  type SeparationRule,
} from './pairs';
import { getResolvedThemeColors } from './themeColors';

/**
 * Record for a known contrast or separation failure baseline entry.
 * The floor never moves; this records an existing defect that will be fixed by
 * a specific design decision from docs/psiphon-access/design/2026-08-17-theme-token-mapping.md.
 */
export interface BaselineEntry {
  /** Unique descriptor matching ContrastPair.id or SeparationRule.id */
  readonly id: string;
  /** Foreground / first token path */
  readonly tokenA: string;
  /** Surface / second token path */
  readonly tokenB: string;
  /** Measured contrast ratio or separation ratio at baseline recording */
  readonly measuredRatio: number;
  /** Required WCAG floor or separation minDelta */
  readonly floor: number;
  /** Mapping document decision that fixes this defect (e.g., 'D4', 'D12', 'D17'), or 'None' */
  readonly decision: string;
  /** Stated reason for the baseline entry */
  readonly reason: string;
}

/**
 * Explicit, dated baseline of known contrast and separation failures in the un-adapted Teleport inherited theme.
 * Measured against commit ddefc7b22c5 on 2026-08-18.
 * The baseline can only shrink over time (ratchet rule).
 */
export const CONTRAST_BASELINE: readonly BaselineEntry[] = [
  // --- 22 CONTRAST PAIR KNOWN FAILURES ---
  {
    id: 'text-muted-on-sunken',
    tokenA: 'text.muted',
    tokenB: 'levels.sunken',
    measuredRatio: 4.48,
    floor: 4.5,
    decision: 'D4',
    reason: 'Text muted on sunken surface fails 4.5:1 body text floor',
  },
  {
    id: 'text-muted-on-deep',
    tokenA: 'text.muted',
    tokenB: 'levels.deep',
    measuredRatio: 4.38,
    floor: 4.5,
    decision: 'D4',
    reason:
      'Text muted on deep surface fails 4.5:1 floor (forbidden pairing in D4)',
  },
  {
    id: 'text-main-on-brand',
    tokenA: 'text.main',
    tokenB: 'brand',
    measuredRatio: 2.6,
    floor: 4.5,
    decision: 'D2',
    reason:
      'Black text on brand accent fails 4.5:1 floor (brand accent is decorative per D2)',
  },
  {
    id: 'interactive-solid-alert-active',
    tokenA: 'text.main',
    tokenB: 'interactive.solid.alert.active',
    measuredRatio: 4.29,
    floor: 4.5,
    decision: 'D7',
    reason: 'Black text on active alert fill #996700 fails 4.5:1 floor',
  },
  {
    id: 'buttons-border-border-on-surface',
    tokenA: 'buttons.border.border',
    tokenB: 'levels.surface',
    measuredRatio: 2.5,
    floor: 3,
    decision: 'D10',
    reason:
      'Button border alpha 0.36 fails 3:1 non-text control boundary floor',
  },
  {
    id: 'buttons-border-border-on-deep',
    tokenA: 'buttons.border.border',
    tokenB: 'levels.deep',
    measuredRatio: 2.47,
    floor: 3,
    decision: 'D10',
    reason: 'Button border alpha 0.36 on deep surface fails 3:1 non-text floor',
  },
  {
    id: 'tooltip-inverseLinkDefault-on-inverseBackground',
    tokenA: 'tooltip.inverseLinkDefault',
    tokenB: 'tooltip.inverseBackground',
    measuredRatio: 2.72,
    floor: 4.5,
    decision: 'D12',
    reason: 'Inverse tooltip link #009EFF fails 4.5:1 text floor',
  },
  {
    id: 'error-main-on-deep',
    tokenA: 'error.main',
    tokenB: 'levels.deep',
    measuredRatio: 4.14,
    floor: 4.5,
    decision: 'None',
    reason:
      'Error main ink #CC372D on deep surface fails the 4.5:1 floor. No numbered decision covers it. The mapping document maps error.main to the app failure colour #860A14 in its small groups table, which is far darker, so the value that lands is expected to clear the floor.',
  },
  {
    id: 'success-main-on-deep',
    tokenA: 'success.main',
    tokenB: 'levels.deep',
    measuredRatio: 4.15,
    floor: 4.5,
    decision: 'None',
    reason: 'Success main ink #007D6B on deep surface fails 4.5:1 floor',
  },
  {
    id: 'warning-main-on-surface',
    tokenA: 'warning.main',
    tokenB: 'levels.surface',
    measuredRatio: 1.83,
    floor: 4.5,
    decision: 'D11',
    reason: 'Warning main ink #FFAB00 on surface fails 4.5:1 floor',
  },
  {
    id: 'warning-main-on-deep',
    tokenA: 'warning.main',
    tokenB: 'levels.deep',
    measuredRatio: 1.55,
    floor: 4.5,
    decision: 'D11',
    reason: 'Warning main ink #FFAB00 on deep surface fails 4.5:1 floor',
  },
  {
    id: 'warning-hover-on-surface',
    tokenA: 'warning.hover',
    tokenB: 'levels.surface',
    measuredRatio: 2.84,
    floor: 4.5,
    decision: 'D11',
    reason: 'Warning hover ink #CC8900 on surface fails 4.5:1 floor',
  },
  {
    id: 'warning-hover-on-deep',
    tokenA: 'warning.hover',
    tokenB: 'levels.deep',
    measuredRatio: 2.41,
    floor: 4.5,
    decision: 'D11',
    reason: 'Warning hover ink #CC8900 on deep surface fails 4.5:1 floor',
  },
  {
    id: 'warning-active-on-deep',
    tokenA: 'warning.active',
    tokenB: 'levels.deep',
    measuredRatio: 4.01,
    floor: 4.5,
    decision: 'D11',
    reason: 'Warning active ink #996700 on deep surface fails 4.5:1 floor',
  },
  {
    id: 'link-on-deep',
    tokenA: 'link',
    tokenB: 'levels.deep',
    measuredRatio: 4.14,
    floor: 4.5,
    decision: 'D8',
    reason: 'Link ink #0073BA on deep surface fails 4.5:1 floor',
  },
  {
    id: 'sessionRecording-progress-on-trackBg',
    tokenA: 'sessionRecording.player.progressBar.progress',
    tokenB: 'sessionRecording.player.progressBar.background',
    measuredRatio: 1.9,
    floor: 3,
    decision: 'D15',
    reason:
      'Progress bar fill #9F85FF on track background fails 3:1 non-text floor',
  },
  {
    id: 'sessionRecording-seeking-on-surface',
    tokenA: 'sessionRecording.player.progressBar.seeking',
    tokenB: 'levels.surface',
    measuredRatio: 1.42,
    floor: 3,
    decision: 'None',
    reason: 'Seeking bar fill #D5D5D6 on surface fails 3:1 non-text floor',
  },
  {
    id: 'sessionRecording-risk-medium-on-surface',
    tokenA: 'sessionRecording.riskLevels.medium',
    tokenB: 'levels.surface',
    measuredRatio: 1.83,
    floor: 4.5,
    decision: 'D16',
    reason: 'Risk medium ink #FFAB00 on surface fails 4.5:1 floor',
  },
  {
    id: 'timeline-frameBorder-on-background',
    tokenA: 'sessionRecordingTimeline.frameBorder',
    tokenB: 'sessionRecordingTimeline.background',
    measuredRatio: 1.6,
    floor: 3,
    decision: 'D17',
    reason: 'Timeline frame border #C9C9CA fails 3:1 non-text floor',
  },
  {
    id: 'timeline-cursor-on-background',
    tokenA: 'sessionRecordingTimeline.cursor',
    tokenB: 'sessionRecordingTimeline.background',
    measuredRatio: 2.82,
    floor: 3,
    decision: 'D17',
    reason: 'Timeline cursor #979797 fails 3:1 non-text floor',
  },
  {
    id: 'timeline-events-join-text-on-bg',
    tokenA: 'sessionRecordingTimeline.events.join.text',
    tokenB: 'sessionRecordingTimeline.events.join.background',
    measuredRatio: 3.8,
    floor: 4.5,
    decision: 'D18',
    reason: 'Translucent join event text #CCE3F1 on #0073BA fails 4.5:1 floor',
  },
  {
    id: 'timeline-events-default-text-on-bg',
    tokenA: 'sessionRecordingTimeline.events.default.text',
    tokenB: 'sessionRecordingTimeline.events.default.background',
    measuredRatio: 3.93,
    floor: 4.5,
    decision: 'None',
    reason:
      'Black text on translucent default event background over deep surface fails 4.5:1 floor',
  },
  {
    id: 'timeline-timeMarks-secondary-on-bg',
    tokenA: 'sessionRecordingTimeline.timeMarks.secondary',
    tokenB: 'sessionRecordingTimeline.background',
    measuredRatio: 2.5,
    floor: 3,
    decision: 'D17',
    reason: 'TimeMarks secondary tick #A1A1A1 fails 3:1 non-text floor',
  },
  {
    id: 'dataVis-secondary.picton-on-interactive.tonal.neutral.2',
    tokenA: 'dataVisualisation.secondary.picton',
    tokenB: 'interactive.tonal.neutral.2',
    measuredRatio: 2.02,
    floor: 3,
    decision: 'None',
    reason:
      'ProgressBar fill secondary.picton #0089DE on tonal neutral 2 #D1D1D1 fails 3:1 non-text floor',
  },
  {
    id: 'dataVis-secondary.caribbean-on-interactive.tonal.neutral.2',
    tokenA: 'dataVisualisation.secondary.caribbean',
    tokenB: 'interactive.tonal.neutral.2',
    measuredRatio: 2,
    floor: 3,
    decision: 'None',
    reason:
      'ProgressBar fill secondary.caribbean #009681 on tonal neutral 2 #D1D1D1 fails 3:1 non-text floor',
  },

  // --- 46 SEPARATION RULE KNOWN FAILURES ---
  // Primary tier dataVisualisation series separation failures (16 rules)
  {
    id: 'dataVis-sep-primary.purple-primary.wednesdays',
    tokenA: 'dataVisualisation.primary.purple',
    tokenB: 'dataVisualisation.primary.wednesdays',
    measuredRatio: 1.2,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary purple vs wednesdays fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.wednesdays-primary.picton',
    tokenA: 'dataVisualisation.primary.wednesdays',
    tokenB: 'dataVisualisation.primary.picton',
    measuredRatio: 1.14,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary wednesdays vs picton fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.wednesdays-primary.sunflower',
    tokenA: 'dataVisualisation.primary.wednesdays',
    tokenB: 'dataVisualisation.primary.sunflower',
    measuredRatio: 1.15,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary wednesdays vs sunflower fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.wednesdays-primary.caribbean',
    tokenA: 'dataVisualisation.primary.wednesdays',
    tokenB: 'dataVisualisation.primary.caribbean',
    measuredRatio: 1.12,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary wednesdays vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.wednesdays-primary.abbey',
    tokenA: 'dataVisualisation.primary.wednesdays',
    tokenB: 'dataVisualisation.primary.abbey',
    measuredRatio: 1.15,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary wednesdays vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.wednesdays-primary.cyan',
    tokenA: 'dataVisualisation.primary.wednesdays',
    tokenB: 'dataVisualisation.primary.cyan',
    measuredRatio: 1.12,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary wednesdays vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.picton-primary.sunflower',
    tokenA: 'dataVisualisation.primary.picton',
    tokenB: 'dataVisualisation.primary.sunflower',
    measuredRatio: 1.0,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary picton vs sunflower fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.picton-primary.caribbean',
    tokenA: 'dataVisualisation.primary.picton',
    tokenB: 'dataVisualisation.primary.caribbean',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary picton vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.picton-primary.abbey',
    tokenA: 'dataVisualisation.primary.picton',
    tokenB: 'dataVisualisation.primary.abbey',
    measuredRatio: 1.0,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary picton vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.picton-primary.cyan',
    tokenA: 'dataVisualisation.primary.picton',
    tokenB: 'dataVisualisation.primary.cyan',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary picton vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.sunflower-primary.caribbean',
    tokenA: 'dataVisualisation.primary.sunflower',
    tokenB: 'dataVisualisation.primary.caribbean',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary sunflower vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.sunflower-primary.abbey',
    tokenA: 'dataVisualisation.primary.sunflower',
    tokenB: 'dataVisualisation.primary.abbey',
    measuredRatio: 1.0,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary sunflower vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.sunflower-primary.cyan',
    tokenA: 'dataVisualisation.primary.sunflower',
    tokenB: 'dataVisualisation.primary.cyan',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary sunflower vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.caribbean-primary.abbey',
    tokenA: 'dataVisualisation.primary.caribbean',
    tokenB: 'dataVisualisation.primary.abbey',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary caribbean vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.caribbean-primary.cyan',
    tokenA: 'dataVisualisation.primary.caribbean',
    tokenB: 'dataVisualisation.primary.cyan',
    measuredRatio: 1.0,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary caribbean vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-primary.abbey-primary.cyan',
    tokenA: 'dataVisualisation.primary.abbey',
    tokenB: 'dataVisualisation.primary.cyan',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis primary abbey vs cyan fails 1.3:1 separation',
  },

  // Secondary tier dataVisualisation series separation failures (15 rules)
  {
    id: 'dataVis-sep-secondary.wednesdays-secondary.picton',
    tokenA: 'dataVisualisation.secondary.wednesdays',
    tokenB: 'dataVisualisation.secondary.picton',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary wednesdays vs picton fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.wednesdays-secondary.sunflower',
    tokenA: 'dataVisualisation.secondary.wednesdays',
    tokenB: 'dataVisualisation.secondary.sunflower',
    measuredRatio: 1.03,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary wednesdays vs sunflower fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.wednesdays-secondary.caribbean',
    tokenA: 'dataVisualisation.secondary.wednesdays',
    tokenB: 'dataVisualisation.secondary.caribbean',
    measuredRatio: 1.01,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary wednesdays vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.wednesdays-secondary.abbey',
    tokenA: 'dataVisualisation.secondary.wednesdays',
    tokenB: 'dataVisualisation.secondary.abbey',
    measuredRatio: 1.0,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary wednesdays vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.wednesdays-secondary.cyan',
    tokenA: 'dataVisualisation.secondary.wednesdays',
    tokenB: 'dataVisualisation.secondary.cyan',
    measuredRatio: 1.01,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary wednesdays vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.picton-secondary.sunflower',
    tokenA: 'dataVisualisation.secondary.picton',
    tokenB: 'dataVisualisation.secondary.sunflower',
    measuredRatio: 1.01,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary picton vs sunflower fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.picton-secondary.caribbean',
    tokenA: 'dataVisualisation.secondary.picton',
    tokenB: 'dataVisualisation.secondary.caribbean',
    measuredRatio: 1.01,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary picton vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.picton-secondary.abbey',
    tokenA: 'dataVisualisation.secondary.picton',
    tokenB: 'dataVisualisation.secondary.abbey',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary picton vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.picton-secondary.cyan',
    tokenA: 'dataVisualisation.secondary.picton',
    tokenB: 'dataVisualisation.secondary.cyan',
    measuredRatio: 1.01,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary picton vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.sunflower-secondary.caribbean',
    tokenA: 'dataVisualisation.secondary.sunflower',
    tokenB: 'dataVisualisation.secondary.caribbean',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary sunflower vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.sunflower-secondary.abbey',
    tokenA: 'dataVisualisation.secondary.sunflower',
    tokenB: 'dataVisualisation.secondary.abbey',
    measuredRatio: 1.03,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary sunflower vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.sunflower-secondary.cyan',
    tokenA: 'dataVisualisation.secondary.sunflower',
    tokenB: 'dataVisualisation.secondary.cyan',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary sunflower vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.caribbean-secondary.abbey',
    tokenA: 'dataVisualisation.secondary.caribbean',
    tokenB: 'dataVisualisation.secondary.abbey',
    measuredRatio: 1.01,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary caribbean vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.caribbean-secondary.cyan',
    tokenA: 'dataVisualisation.secondary.caribbean',
    tokenB: 'dataVisualisation.secondary.cyan',
    measuredRatio: 1.0,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary caribbean vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-secondary.abbey-secondary.cyan',
    tokenA: 'dataVisualisation.secondary.abbey',
    tokenB: 'dataVisualisation.secondary.cyan',
    measuredRatio: 1.01,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis secondary abbey vs cyan fails 1.3:1 separation',
  },

  // Tertiary tier dataVisualisation series separation failures (15 rules)
  {
    id: 'dataVis-sep-tertiary.purple-tertiary.wednesdays',
    tokenA: 'dataVisualisation.tertiary.purple',
    tokenB: 'dataVisualisation.tertiary.wednesdays',
    measuredRatio: 1.07,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary purple vs wednesdays fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.purple-tertiary.picton',
    tokenA: 'dataVisualisation.tertiary.purple',
    tokenB: 'dataVisualisation.tertiary.picton',
    measuredRatio: 1.18,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary purple vs picton fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.purple-tertiary.caribbean',
    tokenA: 'dataVisualisation.tertiary.purple',
    tokenB: 'dataVisualisation.tertiary.caribbean',
    measuredRatio: 1.22,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary purple vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.purple-tertiary.abbey',
    tokenA: 'dataVisualisation.tertiary.purple',
    tokenB: 'dataVisualisation.tertiary.abbey',
    measuredRatio: 1.24,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary purple vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.wednesdays-tertiary.picton',
    tokenA: 'dataVisualisation.tertiary.wednesdays',
    tokenB: 'dataVisualisation.tertiary.picton',
    measuredRatio: 1.27,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary wednesdays vs picton fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.picton-tertiary.sunflower',
    tokenA: 'dataVisualisation.tertiary.picton',
    tokenB: 'dataVisualisation.tertiary.sunflower',
    measuredRatio: 1.14,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary picton vs sunflower fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.picton-tertiary.caribbean',
    tokenA: 'dataVisualisation.tertiary.picton',
    tokenB: 'dataVisualisation.tertiary.caribbean',
    measuredRatio: 1.03,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary picton vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.picton-tertiary.abbey',
    tokenA: 'dataVisualisation.tertiary.picton',
    tokenB: 'dataVisualisation.tertiary.abbey',
    measuredRatio: 1.05,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary picton vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.picton-tertiary.cyan',
    tokenA: 'dataVisualisation.tertiary.picton',
    tokenB: 'dataVisualisation.tertiary.cyan',
    measuredRatio: 1.16,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary picton vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.sunflower-tertiary.caribbean',
    tokenA: 'dataVisualisation.tertiary.sunflower',
    tokenB: 'dataVisualisation.tertiary.caribbean',
    measuredRatio: 1.1,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary sunflower vs caribbean fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.sunflower-tertiary.abbey',
    tokenA: 'dataVisualisation.tertiary.sunflower',
    tokenB: 'dataVisualisation.tertiary.abbey',
    measuredRatio: 1.09,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary sunflower vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.sunflower-tertiary.cyan',
    tokenA: 'dataVisualisation.tertiary.sunflower',
    tokenB: 'dataVisualisation.tertiary.cyan',
    measuredRatio: 1.02,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary sunflower vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.caribbean-tertiary.abbey',
    tokenA: 'dataVisualisation.tertiary.caribbean',
    tokenB: 'dataVisualisation.tertiary.abbey',
    measuredRatio: 1.01,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary caribbean vs abbey fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.caribbean-tertiary.cyan',
    tokenA: 'dataVisualisation.tertiary.caribbean',
    tokenB: 'dataVisualisation.tertiary.cyan',
    measuredRatio: 1.13,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary caribbean vs cyan fails 1.3:1 separation',
  },
  {
    id: 'dataVis-sep-tertiary.abbey-tertiary.cyan',
    tokenA: 'dataVisualisation.tertiary.abbey',
    tokenB: 'dataVisualisation.tertiary.cyan',
    measuredRatio: 1.11,
    floor: 1.3,
    decision: 'None',
    reason: 'DataVis tertiary abbey vs cyan fails 1.3:1 separation',
  },
];

export type PairVerdict =
  | 'PASS'
  | 'FAIL'
  | 'BASELINE'
  | 'RATCHET_FAIL'
  | 'EXEMPT'
  | 'NOT_BOUNDARY'
  | 'DEFERRED';

export interface PairResult {
  readonly pair: ContrastPair;
  readonly fgHex: string;
  readonly bgHex: string;
  readonly measuredRatio: number;
  readonly floor: number;
  readonly verdict: PairVerdict;
  readonly failureMessage?: string;
}

export type SeparationVerdict =
  | 'PASS'
  | 'FAIL'
  | 'BASELINE'
  | 'RATCHET_FAIL'
  | 'DEFERRED';

export interface SeparationResult {
  readonly rule: SeparationRule;
  readonly tokenAHex: string;
  readonly tokenBHex: string;
  readonly measuredRatio: number;
  readonly minDelta: number;
  readonly verdict: SeparationVerdict;
  readonly failureMessage?: string;
}

export interface GateEvaluation {
  readonly leafCount: number;
  readonly pairResults: PairResult[];
  readonly separationResults: SeparationResult[];
  readonly unhandledFailures: string[];
  readonly ratchetFailures: string[];
  readonly separationFailures: string[];
  readonly counts: {
    readonly totalLeaves: number;
    readonly totalPairs: number;
    readonly pass: number;
    readonly baseline: number;
    readonly exempt: number;
    readonly notBoundary: number;
    readonly deferred: number;
    readonly fail: number;
    readonly ratchetFail: number;
    readonly separationTotal: number;
    readonly separationPass: number;
    readonly separationBaseline: number;
    readonly separationFail: number;
    readonly separationRatchetFail: number;
    readonly separationDeferred: number;
  };
}

function resolveOpaqueFg(fgColor: Color, bgOpaque: OpaqueColor): OpaqueColor {
  if (isOpaque(fgColor)) {
    return fgColor;
  }
  return composite(fgColor, bgOpaque);
}

export function evaluateContrastGate(
  theme?: any,
  baseline: readonly BaselineEntry[] = CONTRAST_BASELINE
): GateEvaluation {
  const leaves = getResolvedThemeColors(theme);
  const colorMap = new Map<string, Color>();
  for (const leaf of leaves) {
    colorMap.set(leaf.path, leaf.color);
  }

  const baselineMap = new Map<string, BaselineEntry>();
  for (const entry of baseline) {
    baselineMap.set(entry.id, entry);
  }

  const pairResults: PairResult[] = [];
  const unhandledFailures: string[] = [];
  const ratchetFailures: string[] = [];

  let passCount = 0;
  let baselineCount = 0;
  let exemptCount = 0;
  let notBoundaryCount = 0;
  let deferredCount = 0;
  let failCount = 0;
  let ratchetFailCount = 0;

  for (const pair of CONTRAST_PAIRS) {
    const fgColor = colorMap.get(pair.fgPath);
    if (!fgColor) {
      throw new Error(`Missing leaf color for fgPath "${pair.fgPath}"`);
    }
    const bgColor = colorMap.get(pair.bgPath);
    if (!bgColor) {
      throw new Error(`Missing leaf color for bgPath "${pair.bgPath}"`);
    }

    let bgOpaque: OpaqueColor;
    if (isOpaque(bgColor)) {
      bgOpaque = bgColor;
    } else {
      if (!pair.compositeSurface || !pair.compositeSurfaceReason) {
        throw new Error(
          `Pair "${pair.id}" has alpha-carrying background "${pair.bgPath}" (alpha=${bgColor.alpha}) but does not declare compositeSurface and compositeSurfaceReason.`
        );
      }
      const surfaceColor = colorMap.get(pair.compositeSurface);
      if (!surfaceColor) {
        throw new Error(
          `Missing leaf color for compositeSurface "${pair.compositeSurface}" in pair "${pair.id}"`
        );
      }
      if (!isOpaque(surfaceColor)) {
        throw new Error(
          `compositeSurface "${pair.compositeSurface}" for pair "${pair.id}" is not opaque (alpha=${surfaceColor.alpha})`
        );
      }
      bgOpaque = composite(bgColor, surfaceColor);
    }
    const fgOpaque = resolveOpaqueFg(fgColor, bgOpaque);

    const rawRatio = contrastRatio(fgOpaque, bgOpaque);
    const measuredRatio = Math.round(rawRatio * 100) / 100;
    const fgHex = toHex(fgOpaque);
    const bgHex = toHex(bgOpaque);

    let verdict: PairVerdict;
    let failureMessage: string | undefined;

    if (pair.exempt) {
      verdict = 'EXEMPT';
      exemptCount++;
    } else if (pair.notBoundary) {
      verdict = 'NOT_BOUNDARY';
      notBoundaryCount++;
    } else if (pair.deferred) {
      verdict = 'DEFERRED';
      deferredCount++;
    } else {
      const meetsFloor = measuredRatio >= pair.floor;
      const isBaselined = baselineMap.has(pair.id);

      if (meetsFloor) {
        if (isBaselined) {
          verdict = 'RATCHET_FAIL';
          ratchetFailCount++;
          failureMessage = `Baselined pair "${pair.id}" now meets its floor (${measuredRatio}:1 >= ${pair.floor}:1) and must be removed from the baseline. Token paths: fg=${pair.fgPath} (${fgHex}), bg=${pair.bgPath} (${bgHex}).`;
          ratchetFailures.push(failureMessage);
        } else {
          verdict = 'PASS';
          passCount++;
        }
      } else {
        if (isBaselined) {
          verdict = 'BASELINE';
          baselineCount++;
        } else {
          verdict = 'FAIL';
          failCount++;
          failureMessage = `Contrast failure for pair "${pair.id}": fg=${pair.fgPath} (${fgHex}) on bg=${pair.bgPath} (${bgHex}) measured ratio ${measuredRatio}:1 below floor ${pair.floor}:1.`;
          unhandledFailures.push(failureMessage);
        }
      }
    }

    pairResults.push({
      pair,
      fgHex,
      bgHex,
      measuredRatio,
      floor: pair.floor,
      verdict,
      failureMessage,
    });
  }

  const separationResults: SeparationResult[] = [];
  const separationFailures: string[] = [];
  let separationPass = 0;
  let separationBaseline = 0;
  let separationFail = 0;
  let separationRatchetFail = 0;
  let separationDeferred = 0;

  for (const rule of SEPARATION_RULES) {
    const colorA = colorMap.get(rule.tokenA);
    if (!colorA) {
      throw new Error(`Missing leaf color for tokenA "${rule.tokenA}"`);
    }
    const colorB = colorMap.get(rule.tokenB);
    if (!colorB) {
      throw new Error(`Missing leaf color for tokenB "${rule.tokenB}"`);
    }

    if (!isOpaque(colorA)) {
      throw new Error(
        `Separation rule "${rule.id}" tokenA "${rule.tokenA}" carries alpha (${colorA.alpha}) without a surface.`
      );
    }
    if (!isOpaque(colorB)) {
      throw new Error(
        `Separation rule "${rule.id}" tokenB "${rule.tokenB}" carries alpha (${colorB.alpha}) without a surface.`
      );
    }
    const opaqueA = colorA;
    const opaqueB = colorB;

    const rawRatio = contrastRatio(opaqueA, opaqueB);
    const measuredRatio = Math.round(rawRatio * 100) / 100;
    const tokenAHex = toHex(opaqueA);
    const tokenBHex = toHex(opaqueB);

    let verdict: SeparationVerdict;
    let failureMessage: string | undefined;

    if (rule.deferred) {
      verdict = 'DEFERRED';
      separationDeferred++;
    } else {
      const meetsFloor = measuredRatio >= rule.minDelta;
      const isBaselined = baselineMap.has(rule.id);

      if (meetsFloor) {
        if (isBaselined) {
          verdict = 'RATCHET_FAIL';
          separationRatchetFail++;
          failureMessage = `Baselined separation rule "${rule.id}" now meets its minDelta (${measuredRatio}:1 >= ${rule.minDelta}:1) and must be removed from the baseline. Tokens: tokenA=${rule.tokenA} (${tokenAHex}), tokenB=${rule.tokenB} (${tokenBHex}).`;
          ratchetFailures.push(failureMessage);
        } else {
          verdict = 'PASS';
          separationPass++;
        }
      } else {
        if (isBaselined) {
          verdict = 'BASELINE';
          separationBaseline++;
        } else {
          verdict = 'FAIL';
          separationFail++;
          failureMessage = `Separation failure for rule "${rule.id}": tokenA=${rule.tokenA} (${tokenAHex}) vs tokenB=${rule.tokenB} (${tokenBHex}) measured ratio ${measuredRatio}:1 below minDelta ${rule.minDelta}:1.`;
          separationFailures.push(failureMessage);
        }
      }
    }

    separationResults.push({
      rule,
      tokenAHex,
      tokenBHex,
      measuredRatio,
      minDelta: rule.minDelta,
      verdict,
      failureMessage,
    });
  }

  return {
    leafCount: leaves.length,
    pairResults,
    separationResults,
    unhandledFailures,
    ratchetFailures,
    separationFailures,
    counts: {
      totalLeaves: leaves.length,
      totalPairs: CONTRAST_PAIRS.length,
      pass: passCount,
      baseline: baselineCount,
      exempt: exemptCount,
      notBoundary: notBoundaryCount,
      deferred: deferredCount,
      fail: failCount,
      ratchetFail: ratchetFailCount,
      separationTotal: SEPARATION_RULES.length,
      separationPass,
      separationBaseline,
      separationFail,
      separationRatchetFail,
      separationDeferred,
    },
  };
}

export function formatContrastReport(evaluation: GateEvaluation): string {
  const lines: string[] = [];

  lines.push('====================================================');
  lines.push('PSIPHON ACCESS THEME CONTRAST & SEPARATION REPORT');
  lines.push('====================================================');
  lines.push(`Total Theme Leaves Resolved: ${evaluation.leafCount}`);
  lines.push(`Total Pairs Evaluated: ${evaluation.counts.totalPairs}`);
  lines.push(`  - PASS: ${evaluation.counts.pass}`);
  lines.push(`  - BASELINE (Known Failures): ${evaluation.counts.baseline}`);
  lines.push(`  - EXEMPT: ${evaluation.counts.exempt}`);
  lines.push(`  - NOT_BOUNDARY: ${evaluation.counts.notBoundary}`);
  lines.push(`  - DEFERRED: ${evaluation.counts.deferred}`);
  lines.push(`  - UNHANDLED FAIL: ${evaluation.counts.fail}`);
  lines.push(`  - RATCHET FAIL: ${evaluation.counts.ratchetFail}`);
  lines.push('');
  lines.push('--- CONTRAST PAIR RESULTS ---');

  for (const res of evaluation.pairResults) {
    const { pair, fgHex, bgHex, measuredRatio, floor, verdict } = res;
    lines.push(
      `[${verdict}] ${pair.id}: fg=${pair.fgPath} (${fgHex}) on bg=${pair.bgPath} (${bgHex}) -> ${measuredRatio.toFixed(
        2
      )}:1 (floor: ${floor}:1, kind: ${pair.kind})`
    );
  }

  lines.push('');
  lines.push('--- SEPARATION RULE RESULTS ---');
  lines.push(`Total Separation Rules: ${evaluation.counts.separationTotal}`);
  lines.push(`  - PASS: ${evaluation.counts.separationPass}`);
  lines.push(
    `  - BASELINE (Known Failures): ${evaluation.counts.separationBaseline}`
  );
  lines.push(`  - UNHANDLED FAIL: ${evaluation.counts.separationFail}`);
  lines.push(`  - RATCHET FAIL: ${evaluation.counts.separationRatchetFail}`);
  lines.push(`  - DEFERRED: ${evaluation.counts.separationDeferred}`);

  for (const res of evaluation.separationResults) {
    const { rule, tokenAHex, tokenBHex, measuredRatio, minDelta, verdict } =
      res;
    lines.push(
      `[${verdict}] ${rule.id}: tokenA=${rule.tokenA} (${tokenAHex}) vs tokenB=${rule.tokenB} (${tokenBHex}) -> ${measuredRatio.toFixed(
        2
      )}:1 (minDelta: ${minDelta}:1)`
    );
  }

  lines.push('====================================================');
  return lines.join('\n');
}
