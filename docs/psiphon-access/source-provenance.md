# Source provenance

This record says what Psiphon Access is built from, and how the licence notices
in it work. It is a factual record. It is not legal review. Get review from a
qualified professional if any licence or notice question is uncertain.

Measured on 2026-08-11.

## What this fork is built from

| Item | Value |
|---|---|
| Upstream project | `gravitational/teleport`, the public repository |
| Fork point | `e0d3c67924a946fb1a779467610cd882c952716c`, 2026-08-07 |
| Fork commits on top of that | 38 |
| Upstream licence | AGPL-3.0, in `LICENSE` at the repository root |

The `api/` directory is separately versioned and Apache-2.0 licensed upstream.
This fork does not modify it.

## Operator source statement

The operator confirms that no Teleport Enterprise source was consulted or copied.
This fork uses only the public Teleport repository and its public history.

## How the fork is licensed

Psiphon Access is a modified version of Teleport and is distributed under the
same licence, AGPL-3.0. Nothing in this fork is relicensed and nothing is
proprietary.

Two copyrights coexist, and both are stated in the root `README.md`:

- Gravitational, Inc. holds copyright in Teleport.
- Psiphon Inc. holds copyright in the modifications this fork adds.

## Fork-original files

70 files are fork-original. Measured on 2026-08-19 against the fork base
`e0d3c67924a`. 53 sit in `lib/googleoidc/`, `tool/teleport-google/` and
`docs/psiphon-access/`. The other 17 sit inside upstream directories, because
the code they serve lives there:

- `web/packages/teleport/src/psiphonTheme.ts`, the authored theme.
- `web/packages/teleport/src/psiphonContrast/`, eight files, the contrast gate.
- `web/packages/teleport/src/accessBuild.ts`, the generated build stamp.
- `web/packages/teleport/src/productName.ts`, the product name constant.
- `web/packages/design/src/assets/images/psiphon-*`, six brand assets.

Count them with:

```sh
git diff --name-status e0d3c67924a..HEAD | awk '$1=="A"' | wc -l
```

This section said 42 files in the three directories before 2026-08-19. That
count was low, and it also missed every fork-original file that sits inside an
upstream directory. Every fork-authored source file carries the same header:

```text
Psiphon Access
Copyright (C) 2026  Psiphon Inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
...
```

There are no placeholder attributions left. An earlier version of this record
described files carrying a `Teleport fork contributors` placeholder that a human
had to resolve before publication. Those files belonged to the replaced
prototype and no longer exist. Confirm with:

```sh
grep -rh 'Copyright' lib/googleoidc tool/teleport-google | sort -u
```

## No adapted Apache-2.0 file remains

An earlier version of this record described two files, `lib/auth/oidc_local.go`
and `lib/auth/oidc_local_test.go`, adapted from a public Apache-2.0 snapshot of
`lib/auth/oidc.go`, each preserving a Gravitational Apache-2.0 notice alongside
an AGPL modifications notice.

**Neither file exists.** Both belonged to the seventeen-file prototype that the
fork replaced. The fork now reaches the same behaviour through upstream seams
rather than by copying upstream code, so no Apache-2.0 text was carried across
and no dual-notice file exists. Confirm with:

```sh
grep -rl 'Apache License' lib/googleoidc tool/teleport-google
```

That returns nothing today. If it ever returns a file, this section is wrong and
must be rewritten before that build is published.

## Modified upstream files

These keep their existing upstream AGPL notices. Do not add a Psiphon copyright
line to a file the fork only edits.

READ THIS AS TWO COUNTS, not as one total. 27 upstream files are modified: **4 Go
files** and **23 non-Go files**. Measured on 2026-08-21 against the fork base
`e0d3c67924a`.

The two counts answer different questions and must not be added together in
planning. The original "keep the modified upstream surface small" rule was about
GO files and rebase risk, because Go is where upstream churn is heavy and a
conflict is expensive. An asset, a lockfile entry or a line of web copy carries
almost no rebase cost. A single total of 27 hides the number the rule was
defending, which is 4.

Four Go files are modified:

- `lib/auth/oidc.go`
- `lib/versioncontrol/github/github.go`
- `tool/teleport/common/teleport.go`
- `tool/teleport/main.go`

`tool/teleport/main.go` is the server entrypoint. The fork calls
`googleoidc.Activate` there so the binary is named `teleport` and the Helm
chart, the operator, and `make` all build the same thing. The file is 40 lines
and took 0 commits in the 97 that currently sit on upstream master. The
activation stays behind `TELEPORT_ENABLE_GOOGLE_OIDC`.

Twenty-three further upstream files are modified. Of those, 20 are under `web/`
and 3 are neither Go nor web.

Branding and licence text:

- `README.md`
- `web/packages/teleport/src/Login/Login.tsx`
- `web/packages/teleport/src/Login/Login.test.tsx`
- `web/packages/teleport/src/components/Onboard/OnboardFooter.tsx`
- `web/packages/teleport/src/components/Onboard/OnboardFooter.test.tsx`
- `web/packages/teleport/index.html`
- `web/packages/teleport/src/components/Router/Router.tsx`
- `web/packages/teleport/src/components/Router/Router.test.tsx`
- `web/packages/teleport/src/AuthConnectors/templates/github.yaml`

The last one is edited directly in source, unlike the rest of the brand copy,
which the build-time transform rewrites. The file reaches the bundle through a
`?raw` import, so neither the layer 1 scan set nor the transform can see it. A
direct edit is the only way to reach that string.

Theme and terminal:

- `web/packages/teleport/src/ThemeProvider.tsx`
- `web/packages/teleport/src/lib/term/terminal.ts`
- `web/packages/teleport/src/SessionRecordings/view/player/tty/TtyPlayer.ts`
- `web/packages/teleport/src/SessionRecordings/view/Xterm/Xterm.tsx`

Build and tooling, for the brand catalog transform:

- `web/packages/build/vite/config.ts`
- `web/packages/teleport/package.json`
- `tsconfig.node.json`
- `pnpm-lock.yaml`

ADR 0007 estimated that the build-time transform would modify ONE upstream
file. It modifies four. The plugin registration is one line in the vite config.
The other three follow from it: two declared dependencies, a lockfile importer
entry, and five lines of `include` in the node tsconfig project. The estimate
was low, and four is still far below the roughly 97 files that committed source
edits would have modified. Record the measured number, not the estimate.

Image assets:

- `web/packages/design/src/assets/images/agpl-dark.svg`
- `web/packages/design/src/assets/images/agpl-light.svg`
- `web/packages/teleport/public/app/favicon-dark.png`
- `web/packages/teleport/public/app/favicon-light.png`
- `web/packages/teleport/public/app/logo-dark.svg`
- `web/packages/teleport/public/app/logo-light.svg`

The last four are generated by `tool/teleport-google/assets/derive-logo.py`. Do
not edit them by hand.

The two `agpl-*.svg` files carry the deliberate asset seam, and it is recorded
here because nothing else records it. The logo is NOT wired by patching the
Makefile. These two files hold Psiphon artwork and are byte-identical to
`psiphon-light.svg` and `psiphon-dark.svg`. `ensure-webassets`, at
`Makefile:1938-1943`, branches on `GITHUB_REPOSITORY_OWNER`. This fork is not
`gravitational`, so the build takes the `else` branch and copies the `agpl-*`
files into `public/app/logo-*.svg`. The build therefore ships Psiphon artwork by
design.

Do not "fix" this by patching the Makefile. That file took 126 commits in the
last two years and is one of the worst patch sites in the tree. Replacing two
asset files costs nothing on rebase. Patching a high-churn Makefile costs a
conflict every release cycle.

This list said eleven files before 2026-08-19, and it was wrong by six. Three
terminal files had been modified for the theme work and were never added. Three
more arrived with the browser tab title. A stale divergence record understates
rebase cost, so measure the list. Do not extend it by hand.

List every modified upstream file, and keep this record in step with what it
prints:

```sh
git diff --name-status e0d3c67924a..HEAD \
  | awk '$1=="M"{print $2}' \
  | grep -v 'lib/googleoidc\|tool/teleport-google\|docs/psiphon-access'
```

It must print 27 paths: the four Go files and the twenty-three files above, and
nothing else. Verified on 2026-08-21, when it printed exactly those 27.

Neither number is a cap. The fork keeps the modified upstream surface small as a
goal, and the root `README.md` states how an addition is justified. If the
command prints a file this list does not name, add the file and say why it was
modified. Do not adjust the sentence above to match a number you did not run.

## Third-party dependencies the fork added

Audited on 2026-08-21 against the fork base `e0d3c67924a`, at `848d1057b32`.

The fork adds no Go dependency. `go.mod` and `go.sum` are byte-identical to the
base. Measure it again with this command, which must print nothing:

```
git diff e0d3c67924a..HEAD -- go.mod go.sum
```

`google.golang.org/api` is often named as a fork addition, because the Cloud
Identity group lookup uses it. That is wrong. Upstream already requires it at
`go.mod:266`, version `v0.286.0`. The fork imports a package upstream already
carried.

The fork adds no web package either. It PROMOTES two packages from transitive
to declared, both as `devDependencies` of `web/packages/teleport`:

| Package | Version | Licence | Used by |
|---|---|---|---|
| `@babel/parser` | `^7.29.7` | MIT | `psiphonBrand/brandMatcher.ts:29` |
| `magic-string` | `^0.30.21` | MIT | `psiphonBrand/brandPlugin.ts:35` |

The promotion adds no third-party code to the tree. `pnpm-lock.yaml` gains six
lines, and all six are importer entries that name a version the lock already
resolved. The `packages:` section gains nothing. A declared dependency that was
already present transitively introduces no new licence obligation, because the
code was already here.

MIT is compatible with AGPL-3.0 distribution. An AGPL-3.0 work may incorporate
MIT code as long as the MIT notice is preserved with it.

### Neither package reaches a distributed artifact

Both run inside the Node build process and neither is part of the browser
bundle. Two independent checks agree.

The import graph reaches them only from build code. `psiphonBrand` is named by
`web/packages/build/vite/config.ts:30` and `:134`, by its own two test files,
and by nothing else. No application module imports it.

The emitted bundle holds no trace of them. Decompress `app.js.br` and count:
`MagicString` 0, `magic-string` 0, `@babel/parser` 0, `sourcemap-codec` 0,
`psiphonBrand` 0, in 4,884,105 bytes.

So no notice for either package needs to travel with the container image. The
image carries the built assets and the Go binary. It does not carry the build
tooling.

### What this audit does not cover

It covers the dependencies the FORK ADDED, and that set is empty. It says
nothing about the dependencies upstream already carried, which the Go binary
statically links and the container image therefore distributes. The repository
root holds `LICENSE` and no `NOTICE` file, and `tool/teleport-google/Dockerfile`
copies no third-party notice. Whether that is a gap is a question about the
upstream dependency set, not about this fork's additions. It is tracked
separately.

This is not legal advice.

## Rendered service footers

Recorded on 2026-08-19.

AGPL sections 4 and 5 govern source-level copyright and licence notices. This
fork preserves those notices in each modified upstream file. That duty is
separate from the footer rendered by the modified network service.

The affected footers now read `© Psiphon Inc. Portions © Gravitational, Inc.`.
The pre-authentication page keeps the fork notice discussed in AGPL section
5(a). It also keeps the Corresponding Source offer discussed in section 13.

Both footers render this copyright line alone. The fork removed their links to
Gravitational's Terms of Service and Privacy Policy. No Terms of Service or
Privacy Policy is published for this internal service. Gravitational's terms do
not govern it. A Psiphon consumer page is for another product. A link that
names the wrong terms is worse than no link. The removal is reversible in one
commit when the operator publishes a real URL.

This is not legal advice.

## Meeting AGPL section 13

Section 13 asks that users who interact with a modified version over a network
be offered its Corresponding Source. The pre-auth login page carries that offer.
It links `https://github.com/Psiphon-Inc/teleport` at the exact revision of the
running build, and shows the build label beside it.

The revision is not hand-maintained. `tool/teleport-google/assets/stamp-build.py`
writes it into `web/packages/teleport/src/accessBuild.ts` on every web build, so
the offer follows the deployed binary instead of drifting to whatever the default
branch holds. A build whose tree carries uncommitted changes is labelled
`-dirty`, because in that state the published commit is not the source running.

The obligation this creates is operational, not textual: **the revision the login
page names must be reachable at that URL before users are given access.** A
deployment whose commit has not been pushed does not satisfy section 13, however
correct the page looks.

## Publication gate

An earlier version of this record blocked publication on an `AGENTS.md` rule
forbidding commits of LLM-authored code or text, and on reconciling two named
commits. The operator has removed that rule, so it is no longer a blocker and the
commit reconciliation it required is moot.

What must still be true before another person is given access to a deployment:

1. The commit the login page names is published and publicly reachable, without
   authentication, at `https://github.com/Psiphon-Inc/teleport`.
2. `LICENSE` is present in that published tree.
3. The build instructions are published with it. They are
   `tool/teleport-google/assets/build-ui.sh` and the `go build` line in the
   root `README.md`.
4. The two checks above, for the Go file count and for the absence of an Apache
   notice, still give the stated answers.
