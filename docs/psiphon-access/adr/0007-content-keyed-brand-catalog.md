# ADR 0007. Content-keyed brand catalog for Psiphon Access

**Status: accepted, 2026-08-19.**

The operator accepted the catalog, the failing gate and the scope of 196
reachable phrases on 2026-08-19. Later the same day the operator chose option 1,
the build-time transform. The committed source keeps upstream wording.

Three corrections are pending against this record. A planning pass found them
within an hour of it being written. See "Corrections" at the end.

This record specifies a format and a gate. It writes no catalog data, no
plugin and no test.


## Question

The web UI shows 232 distinct phrases that contain the word `Teleport`. 196 of
them reach a user. How does the fork replace them, in a way that survives an
upstream rebase, and what build step fails when the replacement is incomplete?


## Decision

### Accepted on 2026-08-19

1. The fork holds one **content-keyed catalog**. Each entry names an exact
   source phrase and its replacement. No entry names a file, a line or a
   context.
2. The catalog **never holds a regular expression**, and never holds the bare
   word `Teleport`. The entry type has no pattern field, so no entry can
   express such a rule.
3. A **failing gate** proves the catalog stays complete and honest. The gate
   fails on an unknown phrase, on a count mismatch and on a catalog entry that
   matches nothing.
4. Bucket B is in scope. The admin, Discover and Integrations routes count as
   reachable.
5. The 136 `goteleport.com` documentation URLs stay as they are. The fork will
   not host a documentation site. A broken link is worse than an
   upstream-branded one.

### Also accepted on 2026-08-19

6. The substitution happens at **build time**, in a vite plugin. The committed
   source keeps upstream wording. See "Where the substitution happens". The
   operator chose this option after reading the measured rebase exposure: about
   97 modified upstream files and 190 upstream commits a year under committed
   source edits, against 1 file and 12 commits a year under the transform.


## Why a patch stack was rejected

The parent issue settled this before this record. It is repeated here because a
later reader will ask.

A patch is keyed on a file path, a line position and a context. A catalog is
keyed on string content. Upstream moves code often and rewrites user-visible
copy rarely, so a patch stack breaks on exactly the events that do not change
the brand. A patch stack also loses three-way merge context, `git rerere`,
`git blame` and `git log -S`.

The same reason forbids a `file` or a `line` field inside the catalog. Such a
field would put the rejected key back into the accepted format.


## Why no regular expression over the bare word

The word `Teleport` appears in identifiers, in import paths, in documentation
links and in test fixtures. A blanket rewrite produces a build that compiles
and a product that fails to authenticate.

Three measured examples make the danger concrete:

- `web/packages/teleport/src/services/api/api.ts:29` sets
  `MFA_HEADER = 'Teleport-Mfa-Response'`. The proxy reads that header name.
- `web/packages/teleport/src/services/joinToken/joinToken.ts:34` sets
  `TeleportTokenNameHeader = 'X-Teleport-TokenName'`.
- `web/packages/teleport/src/Discover/Shared/PingTeleportContext.tsx:135`
  reads the identifier `pingTeleportContext`.

The format prevents the rule instead of warning against it. The `source` field
has the TypeScript type `string`, the entry type declares no `pattern` field
and no `regex` field, and the matcher uses exact string comparison. A catalog
that cannot hold a pattern cannot apply one.


## The three tiers

The parent epic set these tiers. Every catalog entry carries one.

| Tier | Covers | Rule |
|---|---|---|
| `render` | User-visible copy. | Rename freely. |
| `interface` | CLI names, flags and help text. | Rename only with a compatibility alias. |
| `protocol` | Resource kinds, audit event types, certificate and CA fields, config keys, Go import paths. | Never rename. |

This record extends `protocol` to cover an identifier that names a resource in
an external system. Three visible strings fall under that extension, and a
user reads all three:

- The AWS RDS tag key `TeleportDatabaseName`, cited at
  `web/packages/teleport/src/Discover/Database/CreateDatabase/useCreateDatabase.ts:275`.
- The generated IAM policy name `TeleportDatabaseAccess`, cited at
  `web/packages/teleport/src/Discover/Database/DeployService/AutoDeploy/AutoDeploy.tsx:75`
  and at line 445 of the same file.
- The generated IAM policy name `TeleportDatabaseAccess_${resourceName}`,
  cited at
  `web/packages/teleport/src/Discover/Database/IamPolicy/useIamPolicy.ts:62`.

The two protocol headers above are also `protocol` tier. A user can read them
in a browser network panel, so this record re-opened both lines and confirmed
them. Neither is copy.

The catalog carries all five as explicit immutable entries. It does not omit
them. The gate must be able to tell "deliberately unchanged" from "forgotten".


## The catalog format

### File format

The catalog is TypeScript, beside the gate. It is ONE LOGICAL CATALOG HELD IN
SEVERAL FILES. `brandCatalog.ts` holds the types and the aggregate export.
`catalog/` holds seven leaf modules, one per UI area, and each leaf exports its
own entries and its own dated baseline. The aggregator imports all seven and
concatenates them.

The first draft of this record said one physical module. That was corrected on
2026-08-19, as amendment 2. A single 196-entry module puts every authoring
child in one serial domain, which serialises the largest part of the work for
no benefit. Seven leaves let four authoring children run in parallel on
disjoint files. The cost is seven fixed imports in the aggregator, which the
machinery child writes once and no authoring child touches.

Each leaf exports a `readonly` array of typed records. This copies the house
pattern in
`web/packages/teleport/src/psiphonContrast/pairs.ts`, which declares
`ContrastPair` at line 30 and exports typed `readonly` arrays such as
`EXCLUDED_GROUPS` at line 91 and `EXCLUDED_LEAVES` at line 107.

Four reasons choose TypeScript over JSON, YAML or TOML.

1. **The phrases carry every awkward character at once.** A phrase carries a
   backtick, a `${...}` placeholder, an apostrophe and a non-ASCII character.
   A TypeScript **single-quoted** string literal needs no escape for a
   backtick, none for `${`, and none for a non-ASCII character. It escapes
   only `'` and `\`. A template literal would break on a backtick and on
   `${`, so the format bans template literals in the catalog.
2. **The type system enforces the ban on patterns.** `source: string` cannot
   hold a `RegExp`. A JSON file cannot express that constraint at all.
3. **One aggregator serves both readers.** The vite plugin and the jest gate
   import `brandCatalog.ts`, so both see the same seven leaves. A data file
   would need a loader in two runtimes.
4. **The house already does this.** A second format in the same tree costs a
   reader an extra thing to learn.

### The entry

```ts
export interface BrandPhrase {
  readonly source: string;
  readonly replacement: string;
  readonly count: number;
  readonly tier: 'render' | 'interface' | 'protocol';
  readonly immutable: boolean;
  readonly reason: string;
}
```

**`source`.** The exact phrase, as the scanner reads it. This is the key. It is
unique across the catalog, and the gate asserts that.

**`replacement`.** The exact text that replaces it. For an immutable entry the
replacement equals the source.

**`count`.** The expected number of occurrences in the scanned file set. This
field is the drift detector. When upstream adds a fourth copy of a phrase, the
count moves and the gate fails, so a human looks at the new site before the
rewrite reaches it. When upstream deletes the last occurrence, the count falls
to zero and the gate fails, so the entry cannot rot into a stale string. The
format requires `count >= 1`.

**`tier`.** The tier decides what else must change with the phrase. A `render`
phrase changes alone. An `interface` phrase needs a compatibility alias, and
the alias is other work that the tier makes visible. A `protocol` phrase must
never change, so the gate asserts that `tier === 'protocol'` implies
`immutable === true`.

**`immutable`.** This field looks redundant, because `replacement === source`
already says the same thing. It earns its place as a cross-check. A typo that
made a replacement identical to its source would otherwise read as a
deliberate decision. The gate asserts
`immutable === (replacement === source)` and fails when the two disagree.

**`reason`.** One sentence for every entry. The house makes a reason mandatory
on all 179 contrast pairs through `floorReason`, and the same discipline
applies here. For an ordinary rebrand the reason is short. For an immutable
entry the reason states what breaks on a rename. For a replacement that is not
a simple product-name swap the reason states why.

### Fields rejected

- **`id`.** The source phrase is already a unique key. A second key can drift
  out of step with the first. A failure message can truncate a long phrase.
- **`file`, `path`, `line`, `context`.** These are the patch-stack key that
  the parent rejected. The `count` field bounds how many sites a phrase has
  without naming any of them.
- **`pattern`, `regex`.** Forbidden. Their absence is the enforcement.
- **`caseInsensitive`.** Measured evidence forbids it.
  `web/packages/teleport/src/Sessions/Sessions.tsx:79` reads
  `Join Active Sessions With Teleport Enterprise` and
  `web/packages/teleport/src/Sessions/SessionList/SessionJoinBtn.tsx:70` reads
  `Join Active Sessions with Teleport Enterprise`. The two differ by one
  letter. A case-insensitive match would merge them into one entry, and the
  fork would lose the ability to treat them apart or to notice that upstream
  is inconsistent.
- **`kind`, to separate a string literal from a JSX text node.** The scanner
  knows the node kind at each site, so the entry does not need to repeat it.
- **`bucket`, holding the A, B, C or D partition.** The partition sized the
  work once. Nothing reads it after that, and a field nobody reads goes stale.
- **`since` or a date.** `git blame` already carries it.

### Two match modes, and why

The scanner compares a **string literal** exactly. Whitespace inside a literal
is part of the literal.
`web/packages/teleport/src/Discover/Shared/Finished/Finished.tsx:53` opens a
template literal that line 54 closes, and the newline and the six leading
spaces sit inside the string. An entry for that phrase writes the newline and
the spaces as `\n      `.

The scanner **normalises a JSX text node** before it compares. It collapses
each run of whitespace to one space and trims the ends. The rewriter then puts
the original leading and trailing whitespace back.
`web/packages/teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx:192`
to line 194 hold one JSX text node that the formatter wrapped across three
lines. Without normalisation, any change to the line width would break the
entry. That would reintroduce the position dependence that the catalog exists
to remove.

### Longest match first

One catalog source can be a prefix of another. `TeleportDatabaseAccess` at
`AutoDeploy.tsx:75` is a prefix of `TeleportDatabaseAccess_${props.agentMeta.resourceName}`
at `useIamPolicy.ts:62`.

The scanner therefore sorts entries by source length, longest first, and it
consumes each matched region. A shorter entry never matches inside a region
that a longer entry already took. Both the plugin and the gate use the same
sort, so both produce the same counts.


## Worked examples

These seven show the hard cases. `ref-o74l.3` writes the other entries. Every
count below is a proposal for `ref-o74l.3` to measure against the final scan
set, not a measured value of this record.

### E1. A placeholder, and two occurrences in one phrase

`web/packages/teleport/src/SingleLogoutFailed/SingleLogoutFailed.tsx:37`
holds a template literal that a `message` prop receives.

- source: `You have been logged out of Teleport, but we were unable to log you out of ${connectorNameText}. See the Teleport logs for details.`
- replacement: `You have been logged out of Psiphon Access, but we were unable to log you out of ${connectorNameText}. See the Psiphon Access logs for details.`
- tier `render`, `immutable: false`.

The `${connectorNameText}` text is part of the source key, because the scanner
reads the quasis and the expression text as they are written. The catalog
never evaluates the placeholder.

### E2. An embedded newline, and a sentence that must change

`web/packages/teleport/src/Discover/Shared/Finished/Finished.tsx:53` to line 54.

- source: `Resource [${agentMeta.resourceName}] has been successfully added to\n      this Teleport Cluster. ${resourceText}`
- replacement: `Resource [${agentMeta.resourceName}] has been successfully added to\n      this Psiphon Access cluster. ${resourceText}`
- tier `render`, `immutable: false`.

The replacement is not a token swap. Upstream capitalised `Cluster` as part of
a product noun phrase. The fork does not, so the word drops to lower case and
the sentence changes shape.

### E3. A phrase the user reads that no single literal holds

`web/packages/design/src/constants.ts:22` sets the enum member
`IdentitySecurity = 'Teleport Identity Security'`.
`web/packages/teleport/src/Roles/PolicyPlaceholder.tsx:83` renders
`{FeatureName.IdentitySecurity} saves you from mistakes.`
`web/packages/teleport/src/Roles/RoleEditor/RoleEditorVisualizer.test.tsx:46`
asserts the rendered sentence `Teleport Identity Security saves you from mistakes.`

No file holds that sentence. The catalog therefore keys the enum value, not
the rendered sentence.

- source: `Teleport Identity Security`
- replacement: `Identity Security`
- tier `render`, `immutable: false`.
- reason: the fork does not ship this upstream feature, so the fork must not
  attach its own product name to it. Dropping the brand is honest and reads as
  English in every reader.

Note that `web/packages/design/src/constants.ts` sits in a different package
from the catalog. The scan set must cover it. Note also that line 21 of the
same file repeats the phrase inside a documentation comment. The scanner
visits literal and JSX nodes only, so the comment does not count and does not
change.

### E4. One letter apart, and an upstream edition name

`web/packages/teleport/src/Sessions/Sessions.tsx:79` renders the JSX text
`Join Active Sessions With Teleport Enterprise`.
`web/packages/teleport/src/Sessions/SessionList/SessionJoinBtn.tsx:70` renders
`Join Active Sessions with Teleport Enterprise`. Line 112 of the same file
renders `Join as a moderator with Teleport Enterprise`.

These are three entries, not one. The replacement is not a product-name swap.
`Psiphon Access Enterprise` would name an edition that does not exist. ADR 0006
names one product. Each of the three phrases advertises an upstream paid
feature that this build does not ship, so `ref-o74l.3` must decide whether to
rewrite the label or to remove the control. The catalog cannot answer that
alone, and the `reason` field on each entry must say so.

### E5. An immutable identifier, and the overlap rule

`web/packages/teleport/src/Discover/Database/IamPolicy/useIamPolicy.ts:62`
builds `TeleportDatabaseAccess_${props.agentMeta.resourceName}`.

- source: `TeleportDatabaseAccess_${props.agentMeta.resourceName}`
- replacement: the same text
- `count: 1`, tier `protocol`, `immutable: true`.
- reason: the string is the IAM policy name in the customer AWS account. A
  rename orphans an existing deployed policy.

A second entry holds the bare `TeleportDatabaseAccess`, which
`AutoDeploy.tsx:75` and `AutoDeploy.tsx:445` both hold. The longest-match rule
makes the first entry consume line 62 before the second entry counts.

### E6. Visible, but not copy

`web/packages/teleport/src/services/api/api.ts:29` sets
`MFA_HEADER = 'Teleport-Mfa-Response'`.

- source and replacement: `Teleport-Mfa-Response`
- `count: 1`, tier `protocol`, `immutable: true`.
- reason: the proxy reads this header name. A rename breaks MFA.

`web/packages/teleport/src/services/joinToken/joinToken.ts:34` takes the same
shape for `X-Teleport-TokenName`.

### E7. A non-ASCII character, and a sibling product the fork does not ship

`web/packages/teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx:197`
to line 198 hold one JSX text node.

- source, after JSX normalisation: `Once you’ve downloaded Teleport Connect, run the installer to add it to your computer’s applications.`
- tier `render`, `immutable: false`.

The apostrophe is U+2019, not U+0027, so the catalog must carry it as a
literal character. `Teleport Connect` is the upstream desktop application,
which lives in `web/packages/teleterm` and which this fork does not ship. The
replacement is therefore not a product-name swap, and `ref-o74l.3` must decide
whether the whole step disappears.


## Where the substitution happens

### Option 1. A build-time transform

A vite plugin rewrites matching literal and JSX text nodes during the web
build. The committed source keeps upstream wording. Source divergence for the
196 phrases is zero, and every future rebase is clean on them.

### Option 2. Committed source edits

A one-off codemod rewrites the literals in the source tree, and the fork
commits the result. The catalog and the gate exist only to detect drift.

### The seam, measured

A transform seam exists, and the house build already uses one.

- `web/packages/build/vite/config.ts:130` opens the plugin array.
  `guardWasmPlugin()` sits at line 131, `reactPlugin(mode)` at line 132,
  `transformPlugin()` at line 133, `generateAppHashFile(...)` at line 134 and
  `wasm()` at line 135.
- `web/packages/build/vite/guard-wasm.ts:40` defines `guardWasmPlugin`. Its
  `transform` hook opens at line 43, and line 45 returns
  `shim + '\n' + code.replace(/\bWebAssembly\b/g, '__WASM__')`. The house
  therefore already rewrites module text in this build, and it returns a bare
  string with no source map.
- `web/packages/teleport/vite.config.mts:21` imports `createViteConfig`, and
  line 26 calls it. The teleport package owns no separate plugin list, so a
  plugin added at `config.ts:130` reaches the teleport build.
- `Makefile:2073` defines `build-ui`, and line 2074 runs `pnpm build-ui-oss`.
  `package.json:6` maps `build-ui-oss` to
  `pnpm --filter=@gravitational/teleport build`.
  `tool/teleport-google/assets/build-ui.sh:87` calls
  `build-webassets-if-changed.sh` with the `build-ui` target, so the fork's
  own build script reaches the same seam.
- The output lands under `webassets/teleport`, set at
  `web/packages/teleport/vite.config.mts:24`. The entry file name is
  `app/app.js`, set at `web/packages/build/vite/config.ts:36`. In production
  mode `config.ts:171` to line 180 add brotli compression with
  `deleteOriginalAssets: true`, which is why the shipped artefact is
  `app.js.br`.

So the plugin would run inside the module transform stage, before bundling.
A plugin placed at `enforce: 'pre'` sees the raw `.ts` and `.tsx` source, so
it sees JSX text nodes as well as string literals.

Two costs of the seam are real.

**Source maps.** A `transform` hook that returns a plain string supplies no
map, which is what `guard-wasm.ts:45` does for one dependency module. Doing
that across roughly 86 first-party modules would degrade every stack trace in
those files. The plugin must therefore edit through a source-map-preserving
editor. The repository already depends on `typescript` at `package.json:65`,
which supplies the parser, and `magic-string` already appears in
`pnpm-lock.yaml` as a transitive package, so neither adds a new download.

**Storybook does not share the config.** `web/.storybook/vite.config.mts:12`
builds its own plugin list, `[reactPlugin(mode), serveStorybookMockerRuntime()]`,
and it does not call `createViteConfig`. Under option 1 storybook shows
upstream copy unless the plugin is added there too.

### Jest does not go through vite

The root `jest.config.js:51` to line 54 set
`transform: { '\\.[jt]sx?$': 'babel-jest', '\\.mjs$': 'babel-jest' }`. No vite
plugin runs in a jest test. A test that asserts on user-visible copy therefore
sees the upstream string under option 1, and the rebranded string under
option 2.

**Measured: 27 assertion lines in 11 test files assert on shipped copy that
the rebrand changes.** They cover 11 distinct phrases. The counting method is
in the evidence section below.

### The tradeoff, stated plainly

Option 1 makes the fork's divergence on these phrases zero, and it keeps every
one of those 27 assertions passing untouched. It costs two things. What a
developer reads in the source, in storybook and in a jest test differs from
what a user sees. And it moves a correctness property, the name of the
product, into a build step, where the failure is silent. A build that skips
the plugin still succeeds and still ships a product called Teleport.

Option 2 is obvious and greppable. One truth serves the source, the dev
server, storybook, jest and production. It cannot fail silently. It costs the
fork its central discipline. It becomes the single largest source of
divergence in the tree, and it will conflict on rebases.

### Recommendation: option 1, the build-time transform

Three measured facts decide it.

1. **Scale.** 86 non-test source files under `web/packages` carry a quoted or
   JSX-text `Teleport` phrase. With the 11 coupled test files, option 2
   modifies about 97 upstream files. The fork's modified upstream surface on
   2026-08-17 was 3 Go files, 9 other files and 8 added files, as
   `docs/psiphon-access/README.md` records. Option 2 multiplies the modified
   surface by roughly nine. Option 1 modifies one upstream file, and adds one
   line to it.
2. **Rebase exposure.** 172 upstream commits in the last 12 months touched
   those 86 files. 18 more touched the 11 coupled test files. That is 190
   upstream commits per year landing in files that option 2 would modify.
   Under option 1 the exposed file is
   `web/packages/build/vite/config.ts`, which 12 upstream commits touched in
   the same 12 months. Option 1 reduces the exposed commit count by about 16
   times.
3. **The tests stay honest either way, and option 1 keeps them free.** Under
   option 1 the 27 assertions keep asserting upstream copy, and the gate, not
   the assertions, protects the shipped copy. Under option 2 all 27 break at
   once, and the fork must edit 11 more upstream files to fix them.

The two costs of option 1 are answerable, and the gate below answers both. The
gate closes the silent-failure gap with an in-build residual scan of the
emitted bundle. The gate closes the two-truths gap by making the catalog the
one place that states what a user reads, which a developer can read in one
file instead of 86.

### What would overturn this recommendation

- **Evidence that upstream copy churn is high.** A sample of six phrases
  showed 7 content changes in 24 months, and the file-level churn measured
  above concentrates in one hot file. If a wider sample showed that upstream
  rewrites these phrases often, then the catalog would need constant repair
  under both options, and option 2's simplicity would win.
- **A decision to ship storybook or a dev server to a non-developer.** Option 1
  brands only the production bundle. If a person outside the team ever reads
  the dev surface, two truths become a real defect and option 2 wins.
- **A measured source-map regression the plugin cannot fix.** If the
  map-preserving editor does not hold up across the 86 files, then option 1
  degrades every production stack trace, and that cost outweighs the
  divergence saving.
- **A second build path that does not run vite.** If any shipped artefact
  reaches a user without passing `createViteConfig`, option 1 cannot brand it.


## The gate

### What it reuses from the house pattern

The house gate is `web/packages/teleport/src/psiphonContrast/gate.ts` with its
data in `pairs.ts` and its runner in `gate.test.ts`. The brand gate reuses
these properties.

- **A jest test is the runner.** The root `jest.config.js` sets no `testMatch`,
  so jest's default patterns apply and already collect
  `web/packages/teleport/src/**/*.test.ts`. No upstream config changes.
- **Data and evaluator split.** `brandCatalog.ts` holds records.
  `brandGate.ts` holds the evaluator and returns a result object.
  `brandGate.test.ts` asserts the result. `gate.ts:64` and `pairs.ts:30` show
  the same split.
- **A dated baseline.** `gate.ts:61` reads
  `Measured against commit ddefc7b22c5 on 2026-08-18`. The brand baseline
  carries its own commit and date in the same form.
- **The ratchet.** `gate.ts:599` sets `RATCHET_FAIL` when a baselined pair now
  meets its floor, and line 601 builds a message that names the entry and
  demands its removal. The brand gate copies this exactly. A baselined
  unbranded phrase that stops appearing fails the run until someone removes
  the baseline entry, so the baseline can only shrink.
- **A completeness guard in both directions.** `gate.ts:745` fails on a
  declared edge that is absent from the theme, and line 792 fails on an
  undeclared edge that is present. The brand gate applies the same pair of
  rules to catalog entries and to found phrases.
- **A named excluded list as data.** `pairs.ts:91` and `pairs.ts:107` record
  exclusions as typed records with reasons. The brand gate records
  `EXCLUDED_HOSTS` the same way.
- **A non-vacuity proof.** `gate.test.ts` at the test named
  `proves gate is not vacuous` weakens a theme leaf and asserts a named
  failure. The brand gate test does the same with a synthetic unbranded
  phrase.

### What it does not reuse, and why

- **The numeric floor and the measured ratio.** A phrase either matches or it
  does not. There is no continuous metric, so `measuredRatio` and `floor` have
  no analogue.
- **The composite surface machinery.** It solves alpha blending. Nothing here
  blends.
- **A single test process.** The brand gate adds a second layer that runs
  inside the vite build. The house gate has no build-time half, because a
  theme token is fully knowable from source. A shipped phrase is not.

### The algorithm

**Layer 1, the jest gate.** It needs no build.

Inputs: the catalog, the excluded host list, and the scan set. The scan set is
every `.ts` and `.tsx` file under `web/packages/teleport/src`,
`web/packages/design/src` and `web/packages/shared`, excluding `*.test.ts`,
`*.test.tsx`, `*.story.tsx` and any path under `__snapshots__`.

1. **Validate the catalog before reading a file.** Fail when any source is
   empty, when two entries share a source, when `count < 1`, when
   `immutable !== (replacement === source)`, when `tier === 'protocol'` and
   `immutable === false`, or when `reason` is empty.
2. **Parse every file in the scan set** with the TypeScript parser at
   `package.json:65`. Visit only string literals, whole template expressions
   and JSX text nodes. Never visit an identifier, an import specifier, a JSX
   attribute name or a comment.

   A TEMPLATE IS VISITED WHOLE, NOT QUASI BY QUASI. This is amendment 1, made
   on 2026-08-19. The first draft said to visit quasis, and that contradicts
   worked examples E1 and E2, which both key on the complete template text
   including the `${...}` spans. Reconstruct the whole template expression as
   written, match the catalog source against that text, then rewrite only the
   quasis. Never rewrite an expression span, because an expression holds code
   and not copy. This removes the identifier hazard and the
   import-path hazard by structure, with no pattern anywhere.
3. **Match the catalog** against each visited node. Sort entries longest
   source first. Compare a literal exactly. Normalise a JSX text node first.
   Consume each matched region so a shorter entry cannot match inside a longer
   one. Record the found count for each entry.
4. **Find residuals.** In each visited node, find every remaining occurrence of
   the word that no catalog entry consumed. Skip an occurrence when the
   surrounding run of non-whitespace, non-quote characters contains a host
   from `EXCLUDED_HOSTS`, which holds the single literal `goteleport.com`.
   That is a substring test against an explicit host, not a pattern over the
   bare word.
5. **Decide.** The gate fails on any of these, and it reports all of them
   rather than the first:
   - `UNKNOWN_PHRASE`. A residual occurrence survived step 4. The message
     names the file, the line, the enclosing literal text, and the reason no
     entry covered it.
   - `COUNT_MISMATCH`. An entry's found count differs from its `count`. The
     message names the source, the expected count, the found count and every
     file that held a match.
   - `DEAD_ENTRY`. An entry's found count is zero. This is the special case of
     `COUNT_MISMATCH` that the operator named. It gets its own verdict so the
     message can say "this entry matches nothing, remove it or fix it".
   - `RATCHET_FAIL`. A baselined phrase stopped appearing. The message demands
     removal from the baseline.
   - `INVALID_ENTRY`. Step 1 failed.

**Layer 2, the in-build residual scan.** It runs in the vite plugin's
`generateBundle` hook, beside the existing `drop-wasm-assets` plugin that
`web/packages/build/vite/config.ts:118` declares with its `generateBundle`
hook at line 119. It reads the emitted `app/app.js` chunk before the
compression plugin runs, finds any residual occurrence of the word outside an
excluded host, and throws. A throw in `generateBundle` fails the build.

Layer 2 exists only under option 1, and it is what makes option 1 safe. It is
the step that proves the plugin actually ran.

### What the gate reads

The 232 figure came from the shipped bundle, decompressed from
`webassets/teleport/app/app.js.br`. That measurement was right for sizing the
work, because a source count includes identifiers, imports, comments and test
fixtures.

A gate cannot read that bundle in jest. `.gitignore:103` ignores `webassets/`,
and this worktree contains no such directory. A jest gate that required the
bundle would either fail on a clean checkout or skip itself, and a gate that
skips itself is worse than no gate.

The resolution splits the reading by layer.

- **Layer 1 reads source.** It is fast, it needs no build, and it runs on
  every test run. It measures the wrong artefact, and this record states the
  cost rather than hiding it. It cannot see a phrase that only exists after
  composition. The proof is E3: no file holds
  `Teleport Identity Security saves you from mistakes.`, yet a user reads it.
  Layer 1 catches the fragment `Teleport Identity Security` and nothing more.
- **Layer 2 reads the bundle.** It measures what ships. It needs a build, so
  it runs only when the UI is built, which
  `tool/teleport-google/assets/build-ui.sh` performs.

The cost of the split is that a developer can commit an unbranded phrase and
see a green test run, and the failure appears at the next UI build. That is
acceptable, because the fork already builds the UI through one script and the
build is the last step before anything ships. The alternative, a single gate
that reads the bundle, would make the fastest and most frequent check depend
on the slowest step.


## Verification evidence

Every command below ran in this worktree at commit `0c3bab6dac6`, on
2026-08-19. The 232 partition is a prior measurement, taken on 2026-08-19
against the shipped bundle at `d9bd25c4cb6`. This record did not repeat it.

### Tests that assert on a rebranded phrase

The count method, run from `web/packages/teleport/src`:

```sh
grep -rnI -E "(ByText|ByRole|ByLabelText|ByPlaceholderText|ByTitle|toHaveTextContent|toHaveAccessibleName)\(.*Teleport" \
  --include='*.test.ts' --include='*.test.tsx' .
```

It printed 29 lines in 12 files. Two of the 29 do not couple to the rebrand:

- `Discover/Database/DeployService/AutoDeploy/AutoDeploy.test.tsx:143` asserts
  `/TeleportDatabaseAccess/i`, which is an immutable identifier.
- `components/Empty/Empty.test.tsx:33` asserts
  `/Add your first Linux server to Teleport/i`, and line 53 of the same file
  defines that title inside the test's own fixture. The shipped caller declares
  `emptyStateInfo` at `UnifiedResources/UnifiedResources.tsx:404`, and line 405
  sets `title: 'Add Your First Resource'`, which holds no brand word.

That leaves **27 lines in 11 files, covering 11 distinct phrases**. The 11
files are `Welcome/Welcome.test.tsx`,
`Discover/Server/DiscoveryConfigSsm/DiscoveryConfigSsm.test.tsx`,
`Discover/Database/DeployService/AutoDeploy/AutoDeploy.test.tsx`,
`Integrations/Enroll/AwsConsole/IamIntegration/IamIntegration.test.tsx`,
`Sessions/SessionList/SessionJoinBtn.test.tsx`,
`Bots/Add/GitHubActionsSsh/GitHubActionsSsh.test.tsx`,
`Bots/Add/GitHubActionsSsh/Finish.test.tsx`,
`Bots/Add/GitHubActionsK8s/ConfigureAccess.test.tsx`,
`Roles/RoleEditor/RoleEditorVisualizer.test.tsx`,
`Roles/RoleEditor/StandardEditor/AdminRules.test.tsx` and
`Roles/RoleEditor/StandardEditor/StandardEditor.test.tsx`.

The method has three known limits, and they run in the same direction.

1. It only matches a testing-library query or a text matcher on one line. A
   multi-line query would escape it.
2. A search for `(toBe|toEqual|toMatch|toContain|toHaveValue)\([^)]*Teleport`
   in the same file set printed 0 lines, so no non-query assertion adds to the
   count.
3. Exactly one snapshot file under `web/packages/teleport/src` contains the
   word,
   `services/audit/gen-event-reference/__snapshots__/gen-event-reference.test.ts.snap`.
   Its matches are a documentation generator's description field, not UI copy.

The same query pattern printed 0 lines in `web/packages/shared` and 0 in
`web/packages/design`. The directory `e/web` does not exist in this tree.

So 27 is a lower bound. The true figure is 27 or a little more.

### Scan-set size and rebase exposure

```sh
grep -rnI -E "(['\"\`][^'\"\`]*[[:space:]]Teleport[[:space:]]|['\"\`]Teleport[[:space:]]|[[:space:]]Teleport['\"\`.,!?])" \
  --include='*.ts' --include='*.tsx' teleport/src design/src shared \
  | grep -v "\.test\.\|\.story\.\|__snapshots__" | grep -viI "goteleport\.com" \
  | cut -d: -f1 | sort -u
```

Run from `web/packages`, it printed 86 files: 83 under `teleport`, 2 under
`shared`, 1 under `design`. This is a proxy. It looks for the word beside a
space inside a quote, so it over-counts a comment and under-counts a phrase
that starts a JSX line. It is good enough to size the modified surface and it
is not a phrase count.

```sh
git log --oneline --since='12 months ago' -- <those 86 files> | wc -l
```

printed `172`. The same command over the 11 coupled test files printed `18`.
The same command over `web/packages/build/vite/config.ts` printed `12`.

### Content churn of six phrases

```sh
git log --oneline -S"<phrase>" --since='24 months ago' -- web/packages e/web | wc -l
```

| Phrase | Commits |
|---|---|
| `Welcome to Teleport` | 1 |
| `Join as a moderator with Teleport Enterprise` | 0 |
| `Teleport Identity Security` | 3 |
| `Your Bot is Added to Teleport` | 0 |
| `Add Teleport Resource Access` | 2 |
| `Setup Discovery Config for Teleport Discovery Service` | 1 |

`git log -S` counts a commit when the number of occurrences changes, so an
introduction counts too. Seven changes in 24 months across six phrases
supports the parent's claim that upstream rewrites copy rarely.

### Awkward characters

```sh
grep -rhoI "Teleport['’]s" --include='*.ts' --include='*.tsx' .
```

Run from `web/packages/teleport/src`, it printed 11 lines, all with the ASCII
apostrophe. A separate search for a non-ASCII character on a line holding the
word found
`Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx:197`, which uses
U+2019.

A phrase holding markdown backticks exists at
`Integrations/status/AwsOidc/Tasks/Tasks.story.tsx:250`. That file is a
storybook story and sits outside the scan set. This record found no shipped
phrase that holds a backtick, so the backtick requirement rests on the story
file and on the general fact that a template literal is delimited by
backticks.

### Documentation URLs

```sh
grep -rhoI "goteleport\.com" --include='*.ts' --include='*.tsx' . | wc -l
```

Run from `web/packages/teleport/src`, it printed `153`, spread over 58 files.
That is a source-side occurrence count. The prior figure of 136 is a count of
distinct documentation URLs in the shipped bundle. The two measure different
things, and this record does not reconcile them. `ref-o74l.3` does not need to,
because the gate excludes by host, not by count.

### No translation layer

```sh
grep -rlI "i18next\|useTranslation" --include='*.ts' --include='*.tsx' . | wc -l
```

Run from `web/packages/teleport/src`, it printed `0`. The web UI has no
internationalisation runtime, so every placeholder in a phrase is a
template-literal expression and never a translation token.


## What this record could not ground

- **Vite plugin ordering relative to `@vitejs/plugin-react-swc`.** This
  worktree has no `node_modules`, and the instructions forbid an install. This
  record therefore cannot prove from the tree whether the react plugin
  declares `enforce: 'pre'`. The recommendation handles this by requiring the
  brand plugin to declare `enforce: 'pre'` itself, which puts it ahead of any
  plugin that does not. `ref-o74l.3` must confirm the ordering with a real
  build before it trusts the plugin.
- **Whether a JSX text node reaches the plugin as text or as a compiled call
  argument.** The answer follows from the ordering above, and this record
  could not run the build to observe it.
- **Whether the vite plugin covers every shipped surface.** This record
  checked `web/packages/teleport/vite.config.mts` and
  `web/.storybook/vite.config.mts`. It did not enumerate every other build in
  the tree.
- **The exact per-entry counts.** Every count in the worked examples is a
  proposal. The scan set in this record differs from the grep sets used for
  the evidence above, so `ref-o74l.3` must measure each count against the real
  scanner.
- **The 232 partition.** This record cites it as a prior measurement taken
  against `d9bd25c4cb6`. It did not repeat it, because `webassets/` is ignored
  at `.gitignore:103` and absent from this worktree.
- **`web/packages/teleport/src/Login/Login.tsx:183`** holds
  `<H1 mb={2}>Welcome to Teleport</H1>` as read on 2026-08-19. Another agent is
  editing that directory at the time of writing, so the line number may have
  moved. The phrase is the catalog key, and the line number is not.
- **An effort figure.** This record gives none. Any size figure for
  `ref-o74l.3` would be an estimate, and no measurement here supports one.


## Corrections

A planning pass for `ref-o74l.3` read this record within an hour of it being
written and found four defects. The operator approved the first three on
2026-08-19. They are applied above.

1. **Template matching was internally inconsistent.** The algorithm said to
   visit template quasis. Worked examples E1 and E2 key on the complete
   template text. Corrected in "The algorithm".
2. **One physical catalog module blocked parallel authoring.** Corrected in
   "File format". One logical catalog now lives in seven leaf modules behind a
   fixed aggregator.
3. **`magic-string` is transitive only.** Measured on 2026-08-19 by grepping
   every `package.json` in the tree, which found no direct declaration. A
   direct import from the build package needs a declared dependency and a
   lockfile change. `ref-o74l.3.1` owns that.

A FOURTH PROPOSED CORRECTION WAS REJECTED, and the reason matters more than
the correction. The planning pass argued that the catalog needs three immutable
entries rather than five, because the two protocol headers sit in bucket D,
which the rebrand excludes. That confuses two different questions. Bucket
membership decides WHAT GETS REBRANDED. The catalog decides WHAT THE GATE CAN
ACCOUNT FOR. The bundle layer scans the emitted bundle, it will meet
`Teleport-Mfa-Response` and `X-Teleport-TokenName` there, and without an entry
it cannot tell a header it must leave alone from a phrase somebody forgot. The
catalog keeps all five immutable entries.


## Relationship to other records

ADR 0006 fixes the names. The branding identifier is `psiphon` and the product
name is `Psiphon Access`. Every `render` replacement uses the product name
where a human reads it. This record does not restate the reasoning in ADR 0006.
