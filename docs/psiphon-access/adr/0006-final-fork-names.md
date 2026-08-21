# ADR 0006. Final fork names for Psiphon Access

**Status: accepted, 2026-08-19.**

The operator decided these names on 2026-08-10. The operator reconfirmed them on 2026-08-19.


## Question

Which names apply to the visual identity, the product, and the deployment of this fork?


## Decision

The names split by layer. This split prevents a product name from replacing a short code identifier. It also prevents a brand identifier from replacing text for people.

| Layer | Name | Use |
|---|---|---|
| Branding | `psiphon` | Use this lowercase identifier for the web UI theme module, theme name, logo, mark, and favicon assets. |
| Product | Psiphon Access | Use this name in text for people and in fork copyright headers. |
| Deployment | `access.psiphon.io` | Use this domain for the deployment. It is not a code or configuration value in this tree. |

The Psiphon logo and wordmark do not change. When a product name belongs next to the mark, the word `access` follows the wordmark.

Use this attribution text:

`Psiphon Access, based on Teleport by Gravitational, Inc. Not affiliated with or endorsed by Gravitational, Inc.`

This decision supersedes the name `Psiward`. Issue `ref-o74l.1` chose that earlier name. The operator supplied this history for this record. The current tree does not contain independent proof of it.


## Answered questions

### Source offer URL

The AGPL source offer stays at `https://github.com/Psiphon-Inc/teleport`. The URL must name a real server that a user can reach. Do not change it before the operator renames the repository.

File `web/packages/teleport/src/accessBuild.ts` sets `ACCESS_SOURCE_URL` at line 26.

### Build stamp module

The build stamp module is `web/packages/teleport/src/accessBuild.ts`. It defines `ACCESS_SOURCE_URL` at line 26. It defines `ACCESS_REVISION` at line 29. It defines `ACCESS_BUILD` at line 35.

### Asset names

The canonical asset names use `psiphon`, not `psiphon-access`. The assets carry the Psiphon mark. They do not carry the product name.

File `tool/teleport-google/assets/derive-logo.py` writes `psiphon-{mode}.svg` at line 102. It writes `psiphon-mark-{mode}.svg` at line 105. It writes `psiphon-favicon-{mode}.png` at line 123.


## Verification evidence

### Earlier name

These commands ran before this record was added:

```sh
grep -RIni --exclude-dir=node_modules --exclude-dir=.git 'psiward' . | wc -l
find . -path './.git' -prune -o -path '*/node_modules' -prune -o -iname '*psiward*' -print | wc -l
```

Both commands printed `0`. This record now names the superseded name because a decision record must preserve that history.

After this record was added, the content command printed `3`. One line records the old name. Two lines contain the verification commands. The file name command still printed `0`.

### Theme identity

The Go theme name is `psiphon` in `lib/googleoidc/modules.go` at line 58. The TypeScript theme name is `psiphon` in `web/packages/teleport/src/psiphonTheme.ts` at line 29.

The equality test reads the TypeScript source file at `lib/googleoidc/theme_test.go` lines 67 to 69. It extracts the constant with a regular expression at lines 72 to 73. It compares the value with the Go constant at lines 78 to 81.

This command ran on the decided tree:

```sh
go test ./lib/googleoidc/ -run Theme -count=1
```

It printed:

```text
ok  	github.com/gravitational/teleport/lib/googleoidc	0.072s
```

### Product name surfaces

The check covered only the surfaces that this decision names:

1. The theme identity uses the branding name at `lib/googleoidc/modules.go:58` and `web/packages/teleport/src/psiphonTheme.ts:29`.
2. A check found 36 Psiphon copyright headers in fork files. All 36 put `Psiphon Access` on the line before the copyright line. The check found zero other product lines.
3. The root `README.md` uses the product name in its title at line 1. It uses the product name in its main text at lines 3 to 8 and lines 122 to 143. Its attribution at lines 3 to 4 and lines 140 to 143 does not match the decided text.
4. The login page title uses the product name at `web/packages/teleport/src/Login/Login.tsx:86`.
5. The login attribution uses the product name at `web/packages/teleport/src/Login/Login.tsx:125`. Its words do not match the decided attribution text. It uses “is based on” and “nor endorsed by”.
6. The build stamp module uses the product name in its header at `web/packages/teleport/src/accessBuild.ts:2`.

The check does not cover inherited Teleport text in enrolment and integration flows. Issue `ref-o74l.10` measures that surface and decides whether to use a catalogue. Issue `ref-o74l.3` owns changes to user-visible marks.

### Deployment domain

The command below printed `0` before this record was added:

```sh
grep -RIn --exclude-dir=node_modules --exclude-dir=.git 'access\.psiphon\.io' . | wc -l
```

No code or configuration file contains the deployment domain. This record does not create a configuration key for it.

After this record was added, the command printed `1` because the decision table names the domain. The same command printed `0` when it excluded this record.


## Legal status

This record states facts. It is not legal advice. Get review from a qualified professional if any licence or notice question is uncertain.
