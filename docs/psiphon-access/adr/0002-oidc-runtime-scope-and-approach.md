# ADR 0002. Scope and approach for the fork OIDC runtime

**Status: accepted. The decision holds. The supporting text is historical.**

This record chose Approach 1, reuse the OIDC connector model and add a localized
server runtime, and chose to deliver browser login and CLI login together. The
fork does both today.

Read it for WHY the scope is what it is. Do not read it for WHERE code goes. Its
"expected touched existing files" and "candidate new files" sections list a
seventeen-file layout that was abandoned. The layout the fork actually uses is in
`../design/2026-08-08-minimal-divergence.md`.

The admin UX scope it defers is still deferred. There is no web UI for editing a
Google connector, and `tctl` remains the way to create one. The `tctl` Google
preset it discusses was never built.

---


## Goal and constraints

The goal is **not** merely to make Google login work once.
The goal is to choose the path with the best long-term maintenance profile:

- keep the merge/rebase surface as small as possible
- localize as much new behavior as possible in **new files**
- reuse upstream abstractions that already exist in the AGPL tree
- avoid building a large fork-only UI/admin surface unless it is truly needed
- use the visible GitHub flow as a reference for wiring patterns, not necessarily as a feature model to duplicate wholesale

## Key observation

The browser and `tsh` clients already look more generic than the visible server-side implementation.

### Browser side is already generic enough

The login UI already knows how to:

- read OIDC providers from `/web/config.js`
- build `/v1/webapi/oidc/login/web?...` URLs
- perform identifier-first matching against OIDC connectors

Relevant files:

- `lib/web/apiserver.go` → `getWebConfig`, `getUserMatchedAuthConnectors`
- `api/client/webclient/webconfig.go`
- `web/packages/teleport/src/Login/useLogin.ts`
- `web/packages/teleport/src/config.ts`
- `web/packages/teleport/src/components/FormLogin/FormIdentifierFirst.tsx`

### `tsh` is also already generic enough

The CLI login path already posts to a generic connector-type route:

- `lib/client/sso.go` → `POST /webapi/<connectorType>/login/console`

That means `tsh` likely does **not** need a fork-specific Google client implementation if the proxy exposes the expected OIDC console-login endpoint.

### The missing surface is mostly server-side

The biggest gaps visible in this AGPL checkout are on the server side:

- no visible OIDC proxy routes for web login / callback / console login
- no visible auth HTTP validation route for OIDC callback validation
- no visible non-test `OIDCService` runtime implementation

So the smallest-maintenance path is likely:

1. reuse the **existing OIDC connector model**
2. reuse existing browser / `tsh` generic behavior
3. add the **minimum missing proxy/auth runtime wiring**
4. avoid large frontend/admin changes at first

## Delivery scopes: expected surface

## Scope A: web login only

This is the smaller initial slice.

Expected work areas:

- allow creating/updating OIDC connectors in the fork (at least via `tctl`)
- add proxy route for `/webapi/oidc/login/web`
- add proxy route for `/webapi/oidc/callback`
- add auth HTTP callback-validation endpoint if needed by `authclient.HTTPClient`
- provide an `OIDCService` implementation that can:
  - create the auth request
  - redirect to Google
  - validate callback
  - mint a web session

What this avoids initially:

- `/webapi/oidc/login/console`
- CLI callback/cert response handling
- any need to prove `tsh` login works in v1

Expected difficulty: **medium-high**

Why it is still not “small”:

- the hard part is not the browser redirect
- the hard part is the missing server-side OIDC runtime

## Scope B: web login + `tsh` / CLI login

This is the user-desired end state.

Incremental work beyond web-only:

- add proxy route for `/webapi/oidc/login/console`
- support OIDC callback responses that return SSH/TLS cert material, host signers, and client options
- ensure client redirect validation is correct for CLI callback URLs
- ensure the auth runtime can handle both:
  - `CreateWebSession=true` browser logins
  - certificate-returning console logins

What is encouraging here:

- the client side appears largely ready already
- `lib/client/sso.go` is generic
- existing helper paths like `ConstructSSHResponse(...)` and `ValidateClientRedirect(...)` already exist

Expected difficulty: **high**, but only **moderately** larger than web-only if the OIDC runtime is built correctly.

In other words:

- if you have to build the OIDC runtime anyway, the incremental CLI work is meaningful but not a completely separate project
- the primary cost driver remains the missing server-side OIDC implementation

## Scope C: web + CLI + full web admin UX for OIDC connectors

This is larger than it first appears.

Expected additional work:

- OIDC/SAML connector CRUD web handlers analogous to GitHub ones
- frontend resource-service coverage for OIDC/SAML connectors
- OIDC/SAML editor screens and templates
- default-connector handling in the OSS UI where entitlements currently assume OIDC/SAML are locked
- likely more entitlements/UI cleanup

Expected difficulty: **high to very high**

For a maintenance-focused fork, this is likely **not** the right v1.

## Approach 1 — Recommended: reuse OIDC connector model, add localized server runtime, use `tctl` for admin flow

## Summary

Use the existing OIDC connector resource and Google preset.
Do the smallest amount of work needed to make:

- Google-backed OIDC connector creation work via `tctl`
- browser login work
- `tsh` login work

But **do not** add full OIDC/SAML connector management to the OSS web UI in v1.

This gives the smallest long-term merge surface while staying aligned with upstream abstractions.

## Why this is the best fit for the stated goal

It maximizes reuse of what already exists:

- existing OIDC connector resource type
- existing Google-specific connector fields
- existing `tctl sso configure oidc --preset google`
- existing web-config provider discovery
- existing generic browser login flow
- existing generic `tsh` SSO initiation flow
- existing redirect-validation helpers

And it avoids the biggest unnecessary fork surface:

- new resource kinds
- new frontend CRUD/editor flows
- custom Google-only UI concepts

## What GitHub should be used for here

Use the GitHub implementation as a **wiring template**, not as a reason to create a separate Google connector model.

GitHub is useful as an example for:

- proxy route shapes in `lib/web/apiserver.go`
- auth callback-validation HTTP handler shape in `lib/auth/apiserver.go`
- authz pattern in `lib/auth/auth_with_roles.go`
- request creation, state-token persistence, TTL handling, and callback branching in `lib/auth/github.go`
- web-vs-console branching after callback validation

GitHub is **not** the right thing to copy at the feature-model level, because:

- GitHub has its own connector type and CRUD/UI already present in OSS
- OIDC already has a resource model, CLI preset, request type, and browser integration points
- duplicating GitHub’s resource/UI pattern for Google would enlarge fork divergence unnecessarily

## Expected touched existing files

These are the files most likely to require **small, surgical** edits.

### Likely existing-file edits

- `lib/web/apiserver.go`
  - add OIDC route registrations only
- `lib/auth/apiserver.go`
  - add OIDC callback-validation route registration only
- `lib/auth/auth_with_roles.go`
  - narrow OIDC entitlement/gating behavior for the fork
- `lib/service/service.go`
  - or equivalent auth startup path, to register a local `OIDCService`

### Candidate new files to contain most of the fork logic

- `lib/web/oidc.go`
  - OIDC web login / callback / console handlers
- `lib/auth/apiserver_oidc.go`
  - OIDC auth HTTP validation handler
- `lib/auth/oidc_local.go`
  - fork-local `OIDCService` implementation / entrypoint
- `lib/auth/oidc_google.go`
  - Google-specific group enrichment / provider behavior if needed
- `lib/auth/oidc_options.go` or similar
  - server option / registration helper if useful

This is the main reason the approach is attractive:

- the required existing-file edits are mostly route registration, auth wiring, and narrow gates
- the larger logic can be isolated into new files

## What can likely be deferred in v1

- OIDC connector CRUD/editor support in `web/packages/teleport/src/AuthConnectors`
- OIDC/SAML entitlements/UI cleanup
- broad changes to `web/packages/teleport/src/services/resources/resource.ts`
- making the OSS auth-connectors page behave like Enterprise

## Risks

### Risk 1: the missing OIDC runtime is larger than it first appears

The AGPL tree shows the interfaces and request/response types, but not the concrete runtime.
That means you may end up rebuilding a substantial chunk of upstream enterprise behavior.

### Risk 2: Google group resolution may be the true complexity driver

Basic OIDC login is one thing.
Google Workspace group mapping with service-account impersonation, Cloud Identity vs Directory API behavior, and nested-group handling can be much more complex.

### Risk 3: SSO MFA and advanced OIDC features may exist in assumptions you do not want to partially reimplement

The connector model includes features like:

- MFA settings
- PKCE mode
- request object mode
- allowed client redirect settings

A minimal implementation should be clear about which subset is actually supported.

### Risk 4: entitlement changes can accidentally broaden the fork surface

If you “solve” this by broadly enabling OIDC/SAML entitlements in modules/UI, you may wake up a lot more web UI behavior than you intended.
That is likely a worse maintenance profile than narrowly changing only the auth paths you need.

## Difficulty

- Architecture fit: **strong**
- Initial implementation complexity: **high**
- Ongoing merge surface: **best of the realistic options**
- Recommendation: **best primary path**

## Approach 2 — Same architecture, but stage web first and CLI second

## Summary

Use the same OIDC-connector-based design as Approach 1, but intentionally defer `tsh` support until browser login is working and verified.

## Why this may be attractive

It gives a lower-risk proving path:

1. prove connector creation works in the fork
2. prove browser OIDC redirect + callback work
3. prove Google identity/group mapping works
4. only then add console-login/cert-return path

## Expected surface

### Phase 1: web only

- same core server runtime work as Approach 1
- no `/webapi/oidc/login/console` yet
- browser-only validation

### Phase 2: CLI

- add `/webapi/oidc/login/console`
- verify `tsh` callback/cert flow
- tighten client redirect validation / callback handling

## Risks

### Risk 1: the “easy first slice” may not reduce total work much

If the missing OIDC runtime is the hard part, then web-first buys validation confidence more than code savings.

### Risk 2: product expectations may drift

Teams sometimes ship the first slice and never come back for CLI support, even when CLI support is operationally important.

## Difficulty

- Initial complexity: **medium-high**
- Total complexity to reach web+CLI: **close to Approach 1**
- Ongoing merge surface: **also good**
- Recommendation: **good fallback if you want incremental proof before full CLI support**

## Approach 3 — Build a dedicated Google provider path modeled directly on GitHub

## Summary

Instead of leaning on the existing OIDC connector model, build a fork-specific Google login flow that looks more like the visible GitHub implementation.

This would likely mean some combination of:

- a new connector/resource type, or
- a Google-specific runtime and proxy/auth routes that conceptually bypass the existing OIDC abstractions

## Why it is tempting

The GitHub implementation is fully visible in the AGPL tree.
So this path reduces uncertainty about missing hidden runtime.

## Why it is probably the wrong choice

It duplicates abstractions that already exist for OIDC:

- connector model
- CLI generator support
- web provider discovery
- redirect handling concepts
- auth request structure

It also increases long-term divergence because you are no longer “filling in a missing server-side OIDC path.”
You are creating a parallel fork-only auth path.

## Expected surface

Much larger than Approach 1:

- new or heavily forked resource/admin model
- more frontend changes if you want full management UX
- more documentation drift
- more rebase pain every time upstream touches auth connectors, login flows, or SSO assumptions

## Risks

- highest merge/rebase surface
- easiest path to building a permanent fork-only subsystem
- more duplicated logic between GitHub and Google/OIDC paths

## Difficulty

- Initial implementation uncertainty: **medium**
- Long-term maintenance burden: **very high**
- Recommendation: **not recommended unless the existing OIDC model proves unusable**

## Approach 4 — Broadly unlock entitlements/UI first

## Summary

Enable OIDC/SAML broadly in module entitlements/UI and then try to make the existing UX work.

## Why this is not ideal

This broadens the fork surface before the runtime is proven.
You risk touching:

- `lib/modules/modules.go`
- entitlement serialization
- frontend locked-feature logic
- auth-connectors UI behavior
- upsell/CTA assumptions

without yet having a working OIDC runtime.

## Recommendation

Avoid this as the starting move.
If you need broader entitlement/UI changes later, do them **after** the login/runtime path works.

## Human-review hot spots for the recommended path

If a human is reviewing or planning the smallest viable implementation, these are the most important code areas.

## 1. Auth/server runtime

- `lib/auth/oidc.go`
- `lib/auth/auth_with_roles.go`
- `lib/auth/grpcserver.go`
- `lib/services/local/users.go`

Review questions:

- what is the narrowest change needed to permit OIDC connector management in the fork?
- can the fork avoid broad entitlement changes and instead adjust only the required OIDC gate checks?
- what subset of OIDC connector features must the first runtime actually honor?

## 2. Proxy/web wiring

- `lib/web/apiserver.go`
- `lib/auth/apiserver.go`
- `lib/client/sso.go`

Review questions:

- can we add OIDC route registrations only, with logic living in new files?
- do browser and `tsh` already have everything they need once those endpoints exist?
- which callback/redirect helpers are already reusable as-is?

## 3. Server startup / registration

- `lib/service/service.go`
- `lib/auth/init.go`
- `lib/auth/auth.go`

Review questions:

- what is the cleanest way to register a fork-local `OIDCService`?
- can this be done with a new `ServerOption` and one startup-site change?

## 4. Google-specific behavior

- `api/types/oidc.go`
- `tool/tctl/sso/configure/oidc.go`
- `docs/pages/zero-trust-access/sso/integrate-idp/google-workspace.mdx`

Review questions:

- do you need direct groups only, or nested/transitive groups too?
- do you need service-account-file support, embedded-JSON support, or both?
- what is the minimum safe Google behavior for v1?

## Recommendation

For the stated goal — **small merge surface, localized code, minimal maintenance** — the best path is:

1. **Stay on the existing OIDC connector model**
2. **Use `tctl`/YAML as the initial admin workflow**
3. **Add the missing OIDC server-side runtime in new files**
4. **Touch existing files only where route registration, startup wiring, or narrow auth gating requires it**
5. **Ship browser + `tsh` support before attempting OIDC/SAML connector web CRUD**

If you want the lowest-risk execution order while keeping that architecture, use a staged version of the same plan:

- first prove browser login end-to-end
- then add CLI login
- only later decide whether OIDC/SAML connector web management is worth the maintenance cost
