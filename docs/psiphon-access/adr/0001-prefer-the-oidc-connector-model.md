# ADR 0001. Prefer the upstream OIDC connector model over a GitHub-style clone

**Status: accepted. The decision holds. The supporting text is historical.**

This record was written before the code existed, so it argues in the future tense
and names files that were never built. The decision it records is the one the
fork implements today, and that is why the record is kept.

What the fork built, and where to check the decision against the code:

- The fork reuses the upstream OIDC connector resource. It adds no Google
  connector type.
- The runtime lives in the fork-owned package `lib/googleoidc`.
- Exactly two upstream Go files are modified: `lib/auth/oidc.go` and
  `tool/teleport/common/teleport.go`.
- The seams that made this possible are recorded in
  `../design/2026-08-08-minimal-divergence.md`, which supersedes this record on
  every question of mechanism.

Two statements below are now wrong. Group membership uses DIRECT Cloud Identity
lookup only, because transitive lookup and its fallback were removed. The `tctl`
Google preset was never built and does not exist.

> **Amendment, 2026-08-17.** The third bullet above is superseded. The fork
> modifies three upstream Go files, not two. The third is
> `lib/versioncontrol/github/github.go`, which now refuses the request the auth
> server made to the upstream github releases api about every 24 hours.
>
> The count is also no longer a rule. The operator replaced the cap with a
> standing goal: keep the modified upstream surface small, and justify each
> addition with a churn measurement. The decision this record holds, to reuse
> the upstream OIDC connector, is unaffected. See ref-opqi and the root
> `README.md`.

---


## Purpose of this document

This document explains the reasoning behind the current preferred direction for this fork:

- **do not** build Google auth by copy-pasting the GitHub implementation and renaming it
- **do** prefer the existing OIDC connector model plus a localized server-side OIDC runtime

The goal here is not persuasion for its own sake.
The goal is to make the decision process legible, reviewable, and teachable for future maintainers.

## Decision statement

For this fork, the most maintainable long-term approach appears to be:

1. keep Google support on top of the existing **OIDC** abstraction
2. reuse the existing **OIDC connector resource model** and `tctl` workflow
3. add only the missing **server-side OIDC runtime and route wiring** in as few existing files as possible
4. keep most fork-specific logic in **new files**
5. defer full OIDC/SAML web CRUD UI unless it later proves worth the maintenance cost

## What problem we are actually solving

The problem is **not** only “how do we make Google login work?”

The problem is:

- how do we make Google login work in a fork
- while keeping the rebase surface small
- while minimizing duplicated security-critical code
- while staying aligned with upstream abstractions where possible
- while avoiding a fork-only subsystem that must be carried forever

Those constraints strongly affect what counts as a “good” implementation.

## Design principles used for this decision

These are the principles that drove the conclusion.

### 1. Prefer existing abstractions over fork-only ones

If the codebase already has a stable abstraction that matches the protocol or behavior we need, the default should be to extend or complete that abstraction rather than create a parallel one.

### 2. Prefer protocol-level modeling over provider-level cloning

Google Workspace login is fundamentally an **OIDC** problem with some Google-specific enrichment behavior.
That is a better conceptual fit for the existing OIDC model than for the GitHub-specific model.

### 3. Concentrate fork-specific behavior in new files and narrow seams

The best fork changes are the ones where:

- core logic lives in new files
- existing-file edits are mostly route registration, startup wiring, or narrow gates
- upstream refactors remain easier to merge

### 4. Avoid duplicating security-sensitive logic unless there is no alternative

SSO login flows are full of security-critical behavior:

- redirect handling
- CSRF/state validation
- callback validation
- certificate/session issuance
- claim validation
- role mapping

Duplicating these behaviors into a second path increases the odds that future fixes land in one path but not the other.

### 5. Separate admin UX scope from auth runtime scope

Getting login to work and getting a polished OSS web admin UI for OIDC connectors are different problems.
If the goal is minimal maintenance, those problems should not be coupled unnecessarily.

## What “copy-paste GitHub and change it to Google” usually means

That phrase can mean a few different things in practice. All of them increase drift in different ways.

## Variant A: create a new Google-specific connector/resource type

This is the most literal GitHub clone.
It typically implies some combination of:

- new `google` connector kind
- new Google-specific auth request type and response handling
- new `/webapi/google/...` routes
- new web-config provider type or special-case routing
- new web CRUD/editor support if you want parity with GitHub admin UX

This is the highest-drift version.

## Variant B: keep Google semantically separate, but hide it behind custom OIDC-like glue

This version avoids a new public resource type, but still builds a bespoke Google flow that only superficially resembles OIDC.

Typical signs:

- copying GitHub callback/request logic as the primary runtime shape
- building Google-specific code paths that bypass OIDC helper concepts
- duplicating generic redirect/callback/cert issuance patterns in a Google-only flow

This still creates meaningful drift, even if it uses fewer new public types.

## Variant C: use GitHub only as a wiring reference, while staying on OIDC

This is the version being recommended.

Here, GitHub is treated as an example for:

- route registration shape
- auth request creation shape
- callback handling shape
- web-vs-console branching
- audit/error handling patterns

But the **feature** remains modeled as OIDC, not as a new provider family.

This creates the least drift.

## Why a GitHub-style Google clone drifts more

## 1. It duplicates an abstraction the repo already has

The AGPL tree already contains a meaningful OIDC abstraction:

- OIDC connector resource type: `api/types/oidc.go`
- OIDC auth request type: `api/types/oidc.go`
- OIDC auth-service interface: `lib/auth/oidc.go`
- OIDC web-config provider type: `api/client/webclient/webconfig.go`
- generic browser login initiation through OIDC URLs
- generic `tsh` connector-type-based initiation in `lib/client/sso.go`

If Google is implemented as a GitHub-style clone, you effectively create a second abstraction for something the repo already knows how to describe as OIDC.

That means future maintainers now have to understand:

- “real OIDC”
- and “Google, which is OIDC but is implemented like GitHub for fork reasons”

That is conceptual drift before any code drift.

## 2. It creates new cross-cutting type surfaces

Today, many layers already understand the auth-provider universe in terms of:

- `oidc`
- `saml`
- `github`
- `local`

Examples:

- `api/client/webclient/webconfig.go`
- `lib/web/apiserver.go`
- `lib/web/ui/auth_connectors.go`

A real Google-clone path would push pressure into multiple layers:

- new provider type handling
- new route templates
- new UI behavior
- new auth-preference/default-connector behavior
- possibly new CRUD/editor behavior

By contrast, staying on OIDC means most of those layers already conceptually know what Google is: an OIDC provider.

## 3. It duplicates security-sensitive flow logic

GitHub’s visible implementation is helpful because it shows a complete flow.
But copying it structurally would duplicate security-sensitive behavior into a second long-lived branch.

Security-critical areas include:

- client redirect validation
- callback parameter validation
- state token handling
- session vs certificate issuance branching
- audit logging for success/failure

The repo already contains evidence that these flows evolve over time. For example, the changelog contains an OIDC-specific security fix for callback verification behavior.

That matters because duplicated logic tends to diverge like this:

- upstream fixes generic/OIDC path
- fork forgets to port fix into Google-clone path
- forked path becomes the less secure path

Even if the initial copy is correct, duplicated auth logic ages badly.

## 4. It makes Google-specific behavior harder to isolate

Google-specific logic is real, but it is not the whole flow.
It is usually a subset layered onto the larger OIDC flow, such as:

- service-account-backed group lookup
- Cloud Identity API vs Directory API behavior
- Google admin impersonation behavior

If the whole login flow becomes “Google-by-copy-of-GitHub”, then Google-specific concerns are mixed with:

- provider redirect initiation
- callback validation
- session/cert issuance
- login-rule/user creation logic

That is the wrong separation of concerns.

The cleaner split is:

- **generic OIDC runtime** handles protocol ceremony and Teleport integration
- **Google-specific adapter/enrichment** handles Google-only behavior

That is both cleaner and more robust.

## 5. It encourages a second admin/UI track

The visible OSS admin UI in this checkout is GitHub-centric:

- `web/packages/teleport/src/AuthConnectors/AuthConnectors.tsx`
- `web/packages/teleport/src/services/resources/resource.ts`
- `lib/web/resources.go`

A GitHub-style Google implementation naturally nudges the fork toward:

- new Google connector CRUD routes
- new resource-service methods
- new editor/template screens
- more entitlement/UI adjustments

That expands the merge surface far beyond “make login work.”

If the fork instead uses:

- existing OIDC connector model
- `tctl` / YAML for admin flow

then the auth runtime can be delivered without signing up for that whole UI surface immediately.

## 6. It underuses what browser and `tsh` already know how to do

The clients already appear to be more generic than the visible server runtime.

### Browser

The browser already:

- receives OIDC providers from `/web/config.js`
- builds `/v1/webapi/oidc/login/web?...`
- supports identifier-first matching of OIDC connectors

### `tsh`

`tsh` already posts to:

- `POST /webapi/<connectorType>/login/console`

That is a generic shape.

If Google is kept on OIDC, the client side likely needs little or no conceptual expansion.
If Google is turned into its own GitHub-like provider family, then the client layers must learn a new special case unnecessarily.

## Why the OIDC-based approach is the better long-term choice

## 1. It matches the protocol boundary correctly

Google Workspace in this context is an OIDC provider with Google-specific extras.

That means the clean architecture is:

- **OIDC** is the stable boundary
- **Google** is a provider-specific specialization within that boundary

This is better than making Google its own top-level auth family, because protocol-level behavior then has one home.

## 2. It reuses the strongest existing assets in the AGPL tree

The OIDC-based approach directly reuses:

- `api/types/oidc.go`
- `tool/tctl/sso/configure/oidc.go`
- `lib/services/oidc.go`
- `lib/client/sso.go`
- browser provider discovery via `webconfig.go`
- identifier-first matching across OIDC connectors

This is exactly the kind of reuse that keeps fork maintenance down.

## 3. It localizes the missing work to the server side

The visible gap is mostly server-side runtime and routing.
That is good news from a maintenance perspective, because those gaps can often be filled with:

- a few narrow edits to existing files
- new files containing most of the logic

That is a much better fork shape than a change that forces synchronized edits across:

- API surface
- backend auth runtime
- proxy handlers
- frontend config/provider types
- frontend CRUD/admin UX

## 4. It keeps generic improvements generic

If the fork stays on OIDC, then future changes in areas like these remain conceptually reusable:

- redirect handling
- callback validation
- auth request shape
- provider settings like PKCE / MFA / request-object modes
- identifier-first matching
- multi-proxy redirect URL selection

Even if upstream implementation details differ, the fork remains structurally aligned with the same abstraction.

## 5. It gives Google OIDC capabilities “for free” at the model level

The OIDC connector model already includes useful concepts that a GitHub-style clone would have to rediscover, port, or ignore.

Examples visible in `api/types/oidc.go` include:

- multiple `redirect_url` values
- `claims_to_roles`
- `user_matchers`
- `client_redirect_settings`
- PKCE mode
- OIDC MFA settings
- request object mode
- `allow_unverified_email`
- provider-specific knobs like Google service-account/admin-email fields

A Google-clone path must choose one of three bad options for each of these:

1. duplicate the feature into the clone
2. partially support it and create behavioral mismatches
3. ignore it and make Google less capable than OIDC in the same repo

None of those is attractive.

## 6. It preserves the option to stay CLI-first / YAML-first on admin UX

The maintenance-focused path does not require immediate parity in the OSS web UI.

That is important because the visible web admin surface is not yet generically OIDC-focused.
If the fork can use:

- `tctl sso configure oidc --preset google`
- YAML resources

then it can achieve real operator value without also taking on a broad frontend fork.

## Decision matrix

Scoring guide:

- **5** = best / lowest cost / strongest fit
- **1** = worst / highest cost / weakest fit

| Approach | Reuse existing OIDC model | New abstraction drift | Existing-file churn | New-file localization | Client/browser reuse | Security-logic duplication risk | Admin/UI expansion pressure | Long-term maintenance | Overall fit for this fork |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GitHub-style Google clone | 1 | 1 | 2 | 2 | 2 | 1 | 1 | 1 | 1 |
| OIDC-based runtime, web only | 5 | 4 | 4 | 4 | 5 | 4 | 5 | 4 | 4 |
| OIDC-based runtime, web + `tsh` | 5 | 4 | 4 | 4 | 5 | 4 | 5 | 5 | 5 |
| OIDC-based runtime + full OIDC web CRUD/admin UX | 5 | 4 | 2 | 3 | 5 | 4 | 2 | 3 | 3 |

## Matrix interpretation

### Why the GitHub-style clone scores poorly

It scores poorly because it:

- introduces the most conceptual duplication
- creates the most cross-cutting type pressure
- risks duplicating security-sensitive flow code
- is most likely to drag the fork into extra web/admin work
- gives the worst rebase shape over time

### Why OIDC web+CLI scores highest

It scores highest because it:

- stays aligned with the right abstraction
- reuses existing browser and CLI initiation behavior
- keeps most fork-specific work on the server side
- allows new logic to live in new files
- avoids committing to broad OIDC/SAML web CRUD work in v1

### Why full web CRUD scores lower than OIDC web+CLI

Not because it is architecturally wrong, but because it expands the fork surface significantly beyond the login/runtime need.
That may still be worth doing later, but it is a separate tradeoff.

## What to copy from GitHub vs what not to copy

## Safe to imitate from GitHub

Use the GitHub implementation as a **wiring stencil** for:

- route registration pattern in `lib/web/apiserver.go`
- auth HTTP validation route shape in `lib/auth/apiserver.go`
- authz gate placement in `lib/auth/auth_with_roles.go`
- callback branching structure:
  - web session path
  - console/cert path
- audit/error handling structure
- startup/service registration style

## Not safe to copy structurally from GitHub

Do **not** use GitHub as the core feature model for:

- connector kind / resource design
- role mapping model
- provider type taxonomy
- web CRUD/editor expectations
- provider-specific claim acquisition assumptions

GitHub is special because it is implemented around GitHub’s own org/team API semantics.
Google Workspace in this repo is already represented as an OIDC provider.
Those are not the same design center.

## Practical consequence for implementation planning

If a human were to plan the smallest-maintenance implementation, the preferred shape would be:

### Narrow edits to existing files

Likely only for:

- route registration
- auth/server startup wiring
- narrow OIDC entitlement/gate decisions

### Most fork logic in new files

Candidate examples:

- `lib/web/oidc.go`
- `lib/auth/apiserver_oidc.go`
- `lib/auth/oidc_local.go`
- `lib/auth/oidc_google.go`

Whether those exact filenames are right is less important than the principle:

- put the bulk of the new runtime in new files
- avoid large edits to unrelated existing code

## Final rationale

The core reason for the choice is simple:

> **GitHub is the best reference for how to wire a provider into Teleport, but OIDC is the right abstraction for how Google should live in this fork.**

That leads to the most learnable, least surprising, and least divergent design:

- use GitHub as a **pattern reference**
- keep Google on **OIDC semantics**
- minimize edits to existing files
- keep fork logic localized
- avoid unnecessary UI/admin expansion in v1

That is why the current recommendation is not “copy GitHub and rename it.”
It is “complete the OIDC path locally, and use GitHub only to guide the wiring.”
