# Psiphon type scale mapping record

**Status: Current, 2026-08-19.**

This document records the mapping between Teleport font sizes, named typography roles, and Psiphon brand steps. No code was changed and no numeric font size value was altered. No automated test covers a type scale in this repository.


## Verification of brand steps and Teleport typography

We read `docs/psiphon-access/design/2026-08-17-psiphon-primitive-inventory.md` at lines 72 to 78. The brand JSON inventory defines 6 brand steps:

1. Hero: 48px size, 56px line height (`tokens.dart:48-49`)
2. Display: 32px size, 40px line height (`tokens.dart:45-46`)
3. Headline: 24px size, 32px line height (`tokens.dart:42-43`)
4. Body II: 16px size, 20px line height (`tokens.dart:36-37`)
5. Body I: 14px size, 18px line height (`tokens.dart:33-34`)
6. Micro: 12px size, 16px line height (`tokens.dart:30-31`)

Title (18px size, 24px line height) exists in primary app tokens (`tokens.dart:39-40`) but is marked absent in the brand JSON inventory. Therefore, 6 brand steps exist in the brand inventory.

We read `web/packages/design/src/theme/typography.ts` at line 26. The array `fontSizes` contains 11 numbers: `[10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 34]`.

We read `web/packages/design/src/theme/typography.ts` at lines 30 to 117. The default export `typography` defines 13 named roles from `body1` to `dropdownTitle`. The planner brief estimated 15 named roles. Direct file inspection confirms 13 named roles.


## Section 1: Teleport font sizes and brand step mapping

This table lists each of the 11 font sizes from `web/packages/design/src/theme/typography.ts:26`. Each row shows the size, the corresponding brand step, line height pairing where provided, or the reason for no mapping.

| Size | Status | Line height pairing | Reason if unmapped |
|---|---|---|---|
| 10 | unmapped | N/A | No brand step exists at 10px. Rounding up to Micro 12px would change font size by 2px. |
| 12 | Micro | 16px | Brand step Micro provides 12px font size with 16px line height. |
| 14 | Body I | 18px | Brand step Body I provides 14px font size with 18px line height. |
| 16 | Body II | 20px | Brand step Body II provides 16px font size with 20px line height. |
| 18 | unmapped | N/A | No brand step exists at 18px in the brand JSON inventory. Rounding down to Body II 16px or up to Headline 24px would change font size by 2px or 6px. Title 18/24 exists in app tokens but is absent from brand JSON. |
| 20 | unmapped | N/A | No brand step exists at 20px. Rounding down to Body II 16px or up to Headline 24px would change font size by 4px. |
| 22 | unmapped | N/A | No brand step exists at 22px. Rounding down to Body II 16px or up to Headline 24px would change font size by 6px or 2px. |
| 24 | Headline | 32px | Brand step Headline provides 24px font size with 32px line height. |
| 26 | unmapped | N/A | No brand step exists at 26px. Rounding down to Headline 24px or up to Display 32px would change font size by 2px or 6px. |
| 28 | unmapped | N/A | No brand step exists at 28px. Rounding down to Headline 24px or up to Display 32px would change font size by 4px. |
| 34 | unmapped | N/A | No brand step exists at 34px. Rounding down to Display 32px would change a heading size by 2px. |


## Section 2: Named typography roles

This table lists all 13 named typography roles in `web/packages/design/src/theme/typography.ts` default export. Each row gives the role name, font size, line height, font weight, letter spacing (if defined), and the mapped brand step.

| Role | Size | Line height | Weight | Letter spacing | Mapped brand step |
|---|---|---|---|---|---|
| `body1` | 16px | 24px | 300 | 0.08px | Body II (16px / line height 20px in brand inventory) |
| `body2` | 14px | 24px | 300 | 0.035px | Body I (14px / line height 18px in brand inventory) |
| `body3` | 12px | 20px | 400 | 0.015px | Micro (12px / line height 16px in brand inventory) |
| `body4` | 10px | 16px | 400 | 0.013px | unmapped (no brand step at 10px) |
| `h1` | 24px | 32px | 500 | N/A | Headline (24px / line height 32px in brand inventory) |
| `h2` | 18px | 24px | 500 | N/A | unmapped (no brand step at 18px in brand JSON inventory) |
| `h3` | 14px | 20px | 600 | N/A | Body I (14px / line height 18px in brand inventory) |
| `h4` | 12px | 20px | 500 | 0.03px (uppercase) | Micro (12px / line height 16px in brand inventory) |
| `subtitle1` | 16px | 24px | 400 | 0.024px | Body II (16px / line height 20px in brand inventory) |
| `subtitle2` | 14px | 20px | 400 | 0.014px | Body I (14px / line height 18px in brand inventory) |
| `subtitle3` | 12px | 20px | 600 | 0.012px | Micro (12px / line height 16px in brand inventory) |
| `table` | 14px | 20px | 300 | 0.035px | Body I (14px / line height 18px in brand inventory) |
| `dropdownTitle` | 14px | 20px | 600 | N/A | Body I (14px / line height 18px in brand inventory) |

Note on role count: The brief estimated 15 named roles. Direct file inspection of `web/packages/design/src/theme/typography.ts` confirms exactly 13 named roles.


## Section 3: Authoring location for typography

We opened and verified all involved theme configuration files:

1. `node_modules/@gravitational/design-system/themes/teleport/theme.js` at line 7 defines `config`:
   ```javascript
   const config = defineConfig({ theme: { semanticTokens: { colors } } });
   ```
   This file confirms that Chakra theme configuration carries colors only and no typography properties.

2. `web/packages/design/src/theme/themes/types.ts` at line 64 defines `ThemeDefinition`:
   ```typescript
   export type ThemeDefinition = Omit<Theme, 'colors'>;
   ```
   This type definition excludes `colors` from `Theme`, while retaining `SharedStyles`. `SharedStyles` includes `typography`, `font`, `fonts`, `fontWeights`, and `fontSizes`.

3. `web/packages/design/src/theme/themes/sharedStyles.ts` at lines 81 to 85 assigns typography properties into `sharedStyles`:
   ```typescript
   typography,
   font: fonts.sansSerif,
   fonts: fonts,
   fontWeights,
   fontSizes,
   ```
   Lines 81 to 85 place typography definitions in the shared style block.

Consequence: The Psiphon Access fork can author custom typography in its own theme definition (such as `psiphonLegacyTheme`) inside `web/packages/teleport/src/psiphonTheme.ts` without modifying upstream files `web/packages/design/src/theme/typography.ts` or `sharedStyles.ts`.


## Section 4: Recommendation on numeric values

Recommendation: Do not change any numeric font size value in `web/packages/design/src/theme/typography.ts`. Changing any Teleport font size value would alter component layouts across the user interface without a brand step mapping for 7 of the 11 sizes. [NEEDS OPERATOR APPROVAL]


## Source code changes and testing statement

No source code was changed. No numeric value was changed. No automated test covers a type scale in this repository.
