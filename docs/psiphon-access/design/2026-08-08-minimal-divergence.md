# Minimal divergence design for fork Google Workspace OIDC

**Status: implemented, with the differences below.**

This was written on 2026-08-08 as a target, before the code existed. The three
seams it chose are the seams the fork uses, and the divergence target was beaten.
The reasoning is still the best account of WHY the fork is shaped this way, so
the document is kept as written rather than rewritten in the past tense.

Where it no longer matches the code, the code wins. The differences, measured on
2026-08-11:

| This document says | What shipped |
|---|---|
| Three modified upstream Go files | **Two**: `lib/auth/oidc.go` and `tool/teleport/common/teleport.go` |
| `lib/auth/sso_mfa.go` is patched | **Not patched.** The bug it describes is real and still unfixed upstream. See ref-sojc. Do not read this table as a claim that the fork is protected |
| `tool/teleport-fork/main.go` | `tool/teleport-google/main.go` |
| `lib/googleoidc/restrictions.go` | `lib/googleoidc/policy/connector.go`, with the policy rules in the `policy` subpackage |
| `tool/bootstrap-oidc-validator/`, `bootstrap-oidc-local.sh` | Never built. They belonged to the prototype and do not exist |
| `docs/oidc-google/`, `THIS_FORK.md` | Replaced by `docs/psiphon-access/`. `THIS_FORK.md` is gone |
| Transitive Cloud Identity group lookup | **Direct lookup only.** Transitive mode and its fallback were removed. See ref-6z4d |

The fork also gained a product identity after this was written: it is Psiphon
Access, and the branding surface is not covered here at all.

> **Amendment, 2026-08-17. The counts in this document are no longer targets.**
> The operator replaced the numeric cap with a standing goal: keep the modified
> upstream surface small, and justify every addition with a churn measurement.
> The root `README.md` holds the current statement and the commands.
>
> Under that goal the shipped Go count moved from two to three. A telemetry
> audit found that the auth server read the upstream github releases api about
> every 24 hours, which disclosed the egress address of the deployment to a
> third party and could not be turned off by configuration.
> `lib/versioncontrol/github/github.go` now refuses that request. The file takes
> about 5 commits every three years, and every one of them was mechanical, so
> the rebase tax is small and the request is gone. See ref-opqi.

---

## Goal

Track upstream Teleport as closely as possible. Keep the smallest reasonable
divergence that adds Google Workspace OIDC login with PKCE, and group
membership, without domain-wide delegation.

Every changed line in a file that upstream also changes is a permanent rebase
tax. The design moves divergence out of busy files and into fork-only files.

## Measured churn

Upstream changed these files in the 1642 commits between the current fork base
and `upstream/master`. Churn decides where a patch is cheap and where it is
expensive.

| File | Upstream commits | Fork patches it today |
|---|---|---|
| `lib/auth/auth_with_roles.go` | 75 | yes |
| `lib/web/apiserver.go` | 25 | yes |
| `lib/auth/init.go` | 21 | yes |
| `lib/auth/apiserver.go` | 15 | yes |
| `lib/services/local/users.go` | 5 | yes |
| `lib/auth/sso_mfa.go` | 3 | yes |
| `tool/tctl/sso/configure/oidc.go` | 1 | yes |
| `lib/oidc/caching_token_validator.go` | 1 | yes |
| `lib/services/identity.go` | 0 | yes |
| `lib/auth/oidc.go` | 0 | no |

`lib/auth/oidc.go` is the OIDC seam file and upstream did not change it once.
It is the cheapest possible patch site.

## Decisions

### D1. Bootstrap through a fork main

The fork ships its own `main`. It calls `modules.SetModules` with the fork
modules wrapper, sets `cfg.PluginRegistry`, then starts the process.

`servicecfg.Config` exposes `PluginRegistry plugin.Registry` at
`lib/service/servicecfg/config.go:255`. `modules.SetModules` at
`lib/modules/modules.go:325` is public and mutex-guarded.

Cost for the modules half: zero upstream files. Proven by spike.

Cost for the plugin half: 4 to 6 lines in `tool/teleport/common/teleport.go`.
The spike found the hole. `servicecfg.Config.PluginRegistry` is a config field
and not a global. `lib/service/service.go:1266` creates an empty registry when
the field is nil, and nothing can add a plugin afterwards.
`tool/teleport/common/teleport.go:707` builds the config with
`servicecfg.MakeDefaultConfig()`, and `common.Options` at line 72 carries only
`Args` and `InitOnly`. Add a `PluginRegistry` field to `Options` and assign it
after `MakeDefaultConfig()`. That file has 10 upstream commits, against 51 for
`lib/service/service.go`. The change is small and generic, so offer it upstream.

Rejected: a 3 to 5 line hook in `lib/service/service.go`, because that file has
51 upstream commits. Rejected: a fork main that rebuilds the whole CLI to avoid
`common.Run`, because it would duplicate config file and flag parsing.

### D2. Connector validation through a small patch in `lib/auth/oidc.go`

The fork must reject `google_service_account`, `google_service_account_uri`,
and `google_admin_email` when a connector is written. Connector create, update,
and upsert do not pass through `OIDCService`, so the runtime cannot see them.

Add one validation call to each of `CreateOIDCConnector`,
`UpdateOIDCConnector`, and `UpsertOIDCConnector` in `lib/auth/oidc.go`. The
validator itself lives in the fork package. The patch is about three lines.

Cost: one upstream file with zero measured churn.

Rejected options and why:
- Inject a wrapped `InitConfig.Identity`. Not reachable. `servicecfg.Config`
  has no `Backend` field, and `lib/auth/auth.go:258` builds the identity
  service from `cfg.Backend` inside the process.
- Swap `Server.Services.IdentityInternal` after construction from the plugin.
  It compiles, because `Server` embeds `*Services`. It is rejected because the
  cache and other components may already hold the original reference, so the
  result depends on construction order and is invisible to a reader.
- Validate only at auth-request and callback time. Zero upstream change, but a
  connector that uses domain-wide delegation can then be stored. The operator
  learns at first login instead of at write. This fails the "cleanly and
  reliably" requirement.
- Validate only in `tctl`. Any direct API client bypasses it.

### D3. Routes through the plugin registry

Upstream OSS has no OIDC login route, no callback route, and no
`requests/validate` route. The fork registers them through
`plugin.Registry`:

- `RegisterAuthWebHandlers` at `lib/auth/apiserver.go:186` for
  `/:version/oidc/requests/validate`.
- `RegisterProxyWebHandlers` at `lib/web/apiserver.go:830` for
  `/webapi/oidc/login/web` and `/webapi/oidc/callback`.

`Handler` embeds `httprouter.Router`, so the fork can add routes. The wrappers
`WithRedirect` and `WithMetaRedirect` take an unexported named type, but a
function literal from another package is still assignable to it, so this
compiles from outside the package.

Cost: zero upstream files. It removes patches in two files with 25 and 15
upstream commits.

PROVEN by spike on branch `spike/oidc-seams`, report
`~/oidc-review-2026-08-08/12-seam-spike.md`. `RegisterProxyWebHandlers`
receives `*web.Handler` and `RegisterAuthWebHandlers` receives
`*auth.APIServer`. Both embed `httprouter.Router` as an exported field, so
route registration is reachable. `WithRedirect` and `WithMetaRedirect` both
compile and run from outside `lib/web`, so the fork can complete web and
console login with exported symbols only. The redirect shape an OIDC login
needs is available, not only a plain JSON handler.

## Target file manifest

### Fork-only files, no rebase cost

| Path | Holds |
|---|---|
| `lib/googleoidc/service.go` | `auth.OIDCService` implementation, three methods |
| `lib/googleoidc/request.go` | auth request creation, PKCE, nonce, state |
| `lib/googleoidc/callback.go` | callback validation, claim mapping, user create and update |
| `lib/googleoidc/restrictions.go` | connector rules: no DWD, issuer pin, Workspace domain binding |
| `lib/googleoidc/groups.go` | Cloud Identity lookup with the user token, namespace checked |
| `lib/googleoidc/transport.go` | Google endpoint allow-list composed over `lib/oidc.OIDCRoundTripper` |
| `lib/googleoidc/state.go` | single-use state in a fork-owned backend keyspace |
| `lib/googleoidc/audit.go` | audit events and failure classes |
| `lib/googleoidc/modules.go` | modules wrapper that enables `entitlements.OIDC`, gated on fork config |
| `lib/googleoidc/plugin.go` | `plugin.Plugin` implementation and route registration |
| `lib/googleoidc/webhandlers.go` | proxy login and callback handlers |
| `lib/googleoidc/*_test.go` | the test corpus, moved from `lib/auth` |
| `tool/teleport-fork/main.go` | fork main: set modules, set plugin registry, start the process |
| `tool/bootstrap-oidc-validator/` | already fork-only |
| `bootstrap-oidc-local.sh` | already fork-only |
| `docs/oidc-google/`, `THIS_FORK.md` | already fork-only |

### Upstream files still modified

| File | Lines | Churn | Why it cannot be avoided |
|---|---|---|---|
| `lib/auth/oidc.go` | about 3 | 0 commits | Connector CRUD does not pass through `OIDCService`, and write-time rejection is required. See D2. |
| `tool/teleport/common/teleport.go` | 4 to 6 | 10 commits | Nothing can install a plugin after `service.NewTeleport`. `common.Options` carries no registry field. See D1. Offer this upstream. |
| `lib/auth/sso_mfa.go` | about 2 | 3 commits | The empty-token comparison is an upstream security bug, not a fork feature. Report it upstream and drop the patch when it merges. |

Target count: three modified upstream files, against seventeen today. Two of
the three are candidates to upstream, which would leave one.

> **Outcome: two, not three.** The `lib/auth/sso_mfa.go` row was never taken.
> The fork does not patch that file, so the upstream bug named in it is still
> live and the fork still inherits it. It is tracked as ref-sojc, which also
> holds the decision about whether to carry a local patch. Taking that patch
> would move the count back to three.

> **Amendment, 2026-08-17.** A fourth row now belongs in this table:
> `lib/versioncontrol/github/github.go`, about 12 lines of comment and one
> changed statement, 5 commits over three years, all mechanical. It stops the
> auth server reading the upstream github releases api every 24 hours. It is not
> a candidate to upstream, because upstream wants that request. The patch site
> is `Visit`, not `getPage`, which keeps the scraper and its two opt-in
> `TEST_GITHUB_API` tests working and costs no test churn. See ref-opqi.

### Patches that disappear

| Removed patch | Replaced by |
|---|---|
| `lib/auth/auth_with_roles.go`, four gate hunks | modules wrapper, D1 |
| `lib/auth/oidc_gate.go`, fork file | modules wrapper, D1 |
| `lib/auth/init.go` | fork main, D1 |
| `lib/auth/apiserver.go` | plugin registry, D3 |
| `lib/web/apiserver.go` | plugin registry, D3 |
| `lib/oidc/caching_token_validator.go` | upstream `ClientMutator` and `ValidatorKey` |
| fork bounded body reader and Google client | upstream `lib/oidc.OIDCRoundTripper` |
| `lib/services/identity.go`, `lib/services/local/users.go` | fork-owned backend keyspace, D2 rejected list |
| `web/packages/teleport/src/Login/Login.tsx` and its test | dropped. The diff is licence text, footer, and styling, and is unrelated to OIDC. |
| `tool/tctl/sso/configure/oidc.go` | dropped. `bootstrap-oidc-local.sh` already generates the connector, and the runbook documents the YAML. Reinstate only if operators ask for the preset. |

## Defects that this design fixes for free

- The activation gate. The modules wrapper is the config-driven gate, and it
  defaults to off. This is what ref-y0gu.3 asks for, and it also covers the
  callback, because the entitlement is read before every gated path.
- The validator cache key. Upstream `ValidatorKey` is pluggable, so the key can
  carry more than issuer and audience.
- The response size bound. Upstream `OIDCRoundTripper` applies one bound, which
  removes the per-response bound that allowed a paginated lookup to buffer far
  more than intended.

## Defects that this design must carry forward

Do not lose these while restructuring.

- ref-y0gu.10, critical. Request and check `groupKey.namespace`, and constrain
  the group id syntax and domain.
- ref-y0gu.11, P0. Bind the login to an operator-configured Workspace domain
  through the `hd` claim, and reject over-broad role mapping values.
- ref-y0gu.13. The vacuous tests and the two surviving mutants.

## Traps confirmed by the spike

- `Features.Entitlements` is a map. Clone it before writing the OIDC bit, or
  the wrapper mutates shared state. The spike reproduced this: the naive
  wrapper failed against `modulestest.Modules`, and `maps.Copy` fixed it.
  This bug is invisible in an OSS build, because `defaultModules.Features()`
  rebuilds its map on every call. A naive wrapper passes every OSS test and
  corrupts only an implementation that caches features. Keep the clone test.
- `modules.SetModules` must run before `service.NewTeleport`. Called after, it
  silently does nothing, the gate stays closed, and no error is raised. Add a
  startup assertion that the entitlement is live, so this fails loudly.
- A `ClientMutator` must wrap `client.Transport`. If it replaces the transport,
  the response size bound is silently lost.
- The wrapper does not need to override `SetFeatures`, because it is stateless
  and recomputes the entitlement on every `Features()` call.

## Migration order

1. Done. Both seams are proven on branch `spike/oidc-seams`. The entitlement
   wrapper opens the real gate: without it an OIDC connector create returns
   `AccessDenied` with "OIDC is only available in Teleport Enterprise", and
   with it the connector is created.
2. Rebase only `lib/auth/oidc.go` and the fork-only files onto `upstream/master`.
3. Move the runtime into `lib/googleoidc`, adopting the upstream round tripper
   and the upstream validator API as you go.
4. Move the test corpus with the code, and fix the defects in ref-y0gu.13.
5. Build the two carried-forward security fixes into the new package.
6. Delete the superseded patches and the fork gate file.
7. Run the full check set, then measure the final modified-file count.
