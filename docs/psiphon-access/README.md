# Psiphon Access fork documents

This directory holds the documents that belong to this fork. Everything else
under `docs/` comes from upstream Teleport and is not fork material.

The fork adds Google Workspace OIDC login and Cloud Identity group membership,
and rebrands the product as Psiphon Access. It keeps the modified upstream
surface as small as the available seams allow. That surface has no fixed size,
and on 2026-08-17 it is 3 Go files, 9 other files, and 8 files added inside
upstream directories. Every addition to it needs a reason and a churn
measurement, which the root `README.md` explains. The rest of the fork lives in
`lib/googleoidc` and `tool/teleport-google`.

## What is here

| Document | Kind | Status |
|---|---|---|
| [`design/2026-08-19-type-scale-mapping.md`](design/2026-08-19-type-scale-mapping.md) | Design | **Current.** Recorded type scale mapping between Teleport font sizes, named typography roles, and Psiphon brand steps. |
| [`design/2026-08-19-terminal-editor-values.md`](design/2026-08-19-terminal-editor-values.md) | Design | **Current.** Authoritative contract for the 23 terminal leaves and 6 editor leaves, derived under ADR 0005. |
| [`design/2026-08-19-dm-mono-metrics.md`](design/2026-08-19-dm-mono-metrics.md) | Design | **Current.** Proof that the DM Mono grid holds when bold maps to Medium 500, with the metric measurements, the xterm.js contract and the licence finding. |
| [`design/2026-08-18-contrast-baseline.md`](design/2026-08-18-contrast-baseline.md) | Design | **Current.** Recorded contrast and separation baseline for the inherited Teleport theme measured against commit ddefc7b22c5. |
| [`design/2026-08-17-theme-token-mapping.md`](design/2026-08-17-theme-token-mapping.md) | Design | **Current.** The theme contract. All 21 role groups decided, 174 of 174 tokens, each with a measured contrast ratio. The implementations follow it and add nothing to it. |
| [`design/2026-08-17-psiphon-primitive-inventory.md`](design/2026-08-17-psiphon-primitive-inventory.md) | Design | Current. What the Psiphon design language defines, with a source line for every value. An inventory, not a mapping. Read it before touching the theme. |
| [`design/2026-08-08-minimal-divergence.md`](design/2026-08-08-minimal-divergence.md) | Design | Implemented. Read this first. It explains why the fork is shaped the way it is, and lists where the shipped code differs from the plan. |
| [`adr/0001-prefer-the-oidc-connector-model.md`](adr/0001-prefer-the-oidc-connector-model.md) | Decision | Accepted. Why the fork reuses the upstream OIDC connector instead of cloning the GitHub connector. Supporting text is historical. |
| [`adr/0002-oidc-runtime-scope-and-approach.md`](adr/0002-oidc-runtime-scope-and-approach.md) | Decision | Accepted. Why browser and CLI login ship together and admin UI does not. Supporting text is historical. |
| [`adr/0003-author-a-full-token-set.md`](adr/0003-author-a-full-token-set.md) | Decision | Accepted. Why the fork authors a complete token set rather than merging values over Teleport config. |
| [`adr/0004-bundle-inter-font-assets.md`](adr/0004-bundle-inter-font-assets.md) | Decision | Accepted. Why the fork bundles Inter font assets instead of referencing host fonts. |
| [`adr/0005-terminal-rule-set.md`](adr/0005-terminal-rule-set.md) | Decision | Accepted. Terminal and editor theme rules governing structural slots, separation, font weights and CVD status. `ref-rvu4.2.2` and `ref-rvu4.2.3` derive values under it and may not add a rule. |
| [`source-provenance.md`](source-provenance.md) | Licence record | Current. What this fork is built from, and how its notices work. |
| [`runbook/google-oidc-first-deployment.md`](runbook/google-oidc-first-deployment.md) | Runbook | **History. Do not follow it.** It describes the replaced prototype. Rewrite tracked as ref-qnnq. |

## What is not here, on purpose

**Implementation plans and task lists.** They live in the issue tracker. Four
plan documents were deleted on 2026-08-11 because they had drifted into
describing an architecture the fork no longer has, which is worse than having no
document. Their surviving facts were moved into the issues that own the work.

**The build recipe.** It lives in the script that performs it,
`tool/teleport-google/assets/build-ui.sh`, so that it cannot drift from what
actually runs.

**Operating procedure for the live test cluster.** It is outside this repository,
in `/home/op/oidc-local/`.

## Reading a document here

Two of these documents were written before the code existed and argue in the
future tense. Each one now carries a status header that says what shipped and
where it differs. Trust the code over any document. When they disagree, the
document is the defect.
