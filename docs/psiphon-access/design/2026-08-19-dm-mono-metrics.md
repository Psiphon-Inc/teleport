# DM Mono font metrics and terminal bold contract

**Status: Current, 2026-08-19.**

This document proves that DM Mono maintains a consistent monospace grid when bold text maps to Medium 500. It records the font metric measurements, the xterm.js bold option contract for issue ref-rvu4.6, the monospace family stack, and the licence finding.


## Browser execution statement

No browser was run. All measurements and verifications were performed directly on font binaries using fontTools TTX and standard Python XML parsing.


## Monospace grid proof from font binaries

The font files live at `~/src/design/psiphon-brand-docs/fonts/DM_Mono/`. The directory contains `DMMono-Regular.ttf` and `DMMono-Medium.ttf`.

### Measurement method

We dumped font metrics from both font files using the `ttx` binary from fontTools 4.63.0. The exact command was:

```bash
TTX=/nix/store/wxf6jzhkimvjc77yinlp38gixmlk7p5x-python3.14-fonttools-4.63.0/bin/ttx
$TTX -q -t head -t hmtx -t cmap -o /tmp/dm-Regular.ttx ~/src/design/psiphon-brand-docs/fonts/DM_Mono/DMMono-Regular.ttf
$TTX -q -t head -t hmtx -t cmap -o /tmp/dm-Medium.ttx ~/src/design/psiphon-brand-docs/fonts/DM_Mono/DMMono-Medium.ttf
```

We parsed the resulting XML dumps using standard library Python XML tools (`xml.etree.ElementTree`).

### Metric results

The `head` table and `hmtx` table measurements give the following values:

| Metric | DMMono-Regular.ttf | DMMono-Medium.ttf | Match status |
|---|---|---|---|
| `unitsPerEm` | 1000 | 1000 | Identical |
| Total glyph count in `hmtx` | 411 | 411 | Identical |
| Distinct advance widths set | {0, 600} | {0, 600} | Identical |
| Advance width for printable ASCII (32 to 126) | 600 units for all 95 glyphs | 600 units for all 95 glyphs | Identical |
| `.notdef` advance width | 600 units | 600 units | Identical |

### Glyph by glyph comparison

We compared every character in the printable ASCII range (Unicode 32 to 126) between `DMMono-Regular.ttf` and `DMMono-Medium.ttf`. All 95 printable ASCII characters map to identical glyph names and carry an advance width of exactly 600 units in both faces. The difference count over printable ASCII is 0.

We compared all 411 glyphs in the `hmtx` table between `DMMono-Regular.ttf` and `DMMono-Medium.ttf`. Every single glyph has the exact same advance width in both faces. The difference count across the full font is 0.

### Explanation of zero-width glyphs

Both faces contain 16 glyphs with advance width 0. The 16 zero-width glyphs are:

`acutecomb`, `gravecomb`, `tildecomb`, `uni0302`, `uni0304`, `uni0306`, `uni0307`, `uni0308`, `uni030A`, `uni030B`, `uni030C`, `uni030C.alt`, `uni0312`, `uni0326`, `uni0327`, `uni0328`

These 16 glyphs are non-spacing combining marks in the Unicode Combining Diacritical Marks block (U+0300 to U+036F). Non-spacing combining marks MUST have advance width 0 in a monospace font. They render over or under a preceding base character without advancing the cursor. The base character retains its 600-unit column width. Therefore, zero-width combining marks preserve the monospace column grid.

### Grid alignment conclusion

Because `unitsPerEm` is 1000 in both faces and every glyph shares the exact same advance width, `DMMono-Regular` and `DMMono-Medium` share one advance metric. The monospace column grid holds at any font size when switching from Regular 400 to Medium 500.


## Terminal bold mapping and synthetic bold prevention

### Bold mapping rule

Per ADR 0005 rule 4, terminal bold text maps to font weight 500 (Medium). DM Mono ships Light 300, Regular 400, and Medium 500, with an italic for each weight. DM Mono carries no weight 700 (Bold) font file. The terminal must never request font weight 700 for DM Mono.

### Code analysis of terminal instantiations

We read the shipped UI code to inspect xterm option configuration:

1. `web/packages/teleport/src/SessionRecordings/view/Xterm/Xterm.tsx` (lines 62 to 67): passes `el`, `fontFamily`, `fontSize`, and `theme` to `TerminalPlayer`. Option `fontWeightBold` is omitted.
2. `web/packages/teleport/src/lib/term/terminal.ts` (lines 110 to 121): passes `lineHeight`, `fontFamily`, `fontSize`, `scrollback`, `convertEol`, `cursorBlink`, `minimumContrastRatio`, `screenReaderMode`, `theme`, and `allowProposedApi` to `Terminal`. Option `fontWeightBold` is omitted.
3. `web/packages/teleport/src/SessionRecordings/view/player/tty/TtyPlayer.ts` (lines 60 to 66): passes `fontSize`, `fontFamily`, `cols`, `rows`, and `theme` to `Terminal`. Option `fontWeightBold` is omitted.
4. `web/packages/teleterm/src/ui/DocumentTerminal/Terminal/ctrl.ts` (lines 89 to 100): passes `cursorBlink`, `fontFamily`, `fontSize`, `scrollback`, `minimumContrastRatio`, `screenReaderMode`, `rightClickSelectsWord`, `theme`, and `windowsPty` to `Terminal`. Option `fontWeightBold` is omitted.

A search across `web/packages/` for `fontWeightBold` returned zero matches.

### Lockfile and xterm.js default measurement

We inspected the lockfile `./pnpm-lock.yaml` and measured the pinned xterm package:

- Pinned package version: `@xterm/xterm@6.0.0`
- Type definition path: `/home/op/src/teleport/trees/psiphon-access/node_modules/.pnpm/@xterm+xterm@6.0.0/node_modules/@xterm/xterm/typings/xterm.d.ts`
  The file defines `fontWeightBold?: FontWeight;` on interface `ITerminalOptions`.
- JavaScript bundle path: `/home/op/src/teleport/trees/psiphon-access/node_modules/.pnpm/@xterm+xterm@6.0.0/node_modules/@xterm/xterm/lib/xterm.js`
  The file defines `t.DEFAULT_OPTIONS` with `fontWeightBold: "bold"`.

The measured default value for `fontWeightBold` in `@xterm/xterm@6.0.0` is `"bold"`.

### Defect mechanism and rule for ref-rvu4.6

The xterm value `"bold"` requests CSS `font-weight: 700`. Because DM Mono provides no weight 700 font file, the browser synthesizes artificial bolding. Synthetic bolding strokes glyph outlines, alters character bounding boxes, and breaks monospace grid alignment.

Requirement for ref-rvu4.6: ref-rvu4.6 MUST explicitly pass option `fontWeightBold: '500'` (or `500`) when instantiating or configuring `Terminal` and `TerminalPlayer` in all terminal components. Setting `fontWeightBold: '500'` forces xterm to request font weight 500, which renders DM Mono Medium 500 cleanly without browser synthetic bolding.


## Monospace family stack contract

Per ADR 0005 rule 5, the monospace font stack is:

`DM Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

The family stack lists `DM Mono` first. Platform monospace fallbacks follow `DM Mono`. Proportional font fallbacks are prohibited because proportional rendering breaks terminal grid layout.


## Licence position for DM Mono

### Font file location and licence

The borrowed font files live at `~/src/design/psiphon-brand-docs/fonts/DM_Mono/`. The licence file is `OFL.txt` (SIL Open Font License, Version 1.1).

### Copyright line and reserved font name finding

Line 1 of `OFL.txt` reads:

`Copyright 2020 The DM Mono Project Authors (https://www.github.com/googlefonts/dm-mono)`

Clause 3 of the SIL Open Font License 1.1 states:

"No Modified Version of the Font Software may use the Reserved Font Name(s) unless explicit written permission is granted by the corresponding Copyright Holder. This restriction only applies to the primary font name as presented to the users."

Clause 3 requires Reserved Font Names to be specified after the copyright statement. Line 1 carries no "with Reserved Font Name" suffix.

Finding: DM Mono declares no Reserved Font Name. A modified or subsetted version of the font keeps the family name `DM Mono`.

### Licence precedent and bundling owner

This finding applies the same test that ADR 0004 applied to Inter. ADR 0004 settled the font bundling route and named `ref-rvu4.2` as the owner of the monospace font choice.
