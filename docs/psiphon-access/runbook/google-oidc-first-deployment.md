# First Google OIDC deployment

> **HISTORY. DO NOT FOLLOW THESE STEPS.**
>
> This runbook describes the seventeen-file prototype that the fork replaced. It
> is kept only because it records operator-facing detail that the rewrite will
> need, and it is measurably stale: 24 of its passages name code that does not
> exist.
>
> Specifically dead: every step that runs `tctl sso configure ... --preset
> google`, because the preset was never built; every reference to
> `bootstrap-oidc-local.sh` and `tool/bootstrap-oidc-validator`, because neither
> exists; and every description of transitive Cloud Identity group lookup,
> because the fork does direct lookup only.
>
> The rewrite is tracked as ref-qnnq, which also carries the Google Cloud
> Console steps recovered from the deleted deployment plan. Until that lands,
> the working procedure is the live one in `/home/op/oidc-local/bringup.sh`,
> which is outside this repository.
>
> The earlier banner here blocked publication on an `AGENTS.md` rule forbidding
> LLM-authored text. That rule was removed by the operator, so it is not a
> blocker. The staleness above is.

## When to use this

Use this runbook for the first temporary Google Workspace OIDC test. Run it on the approved workstation. Bind Teleport only to the workstation Tailscale IPv4 address.

Do not use this runbook for a production deployment.

## Placeholders

Replace each placeholder before you run a command.

| Placeholder | Value |
|-------------|-------|
| `<repo>` | Absolute path to the human-verified source tree |
| `<workdir>` | New absolute path outside the source tree |
| `<tailscale-ip>` | Local Tailscale IPv4 address |
| `<machine>.<tailnet>.ts.net` | Local Tailscale DNS name |
| `<cluster-name>` | Temporary Teleport cluster name |
| `<local-os-login>` | Local operating system login for the break-glass user |
| `<operator-tailscale-login>` | Approved operator login in Tailscale status |
| `<test-email>` | Approved Google user for the email, direct-group, and nested-group tests |
| `<direct-group-email>` | Direct Google Group email |
| `<nested-group-email>` | Nested Google Group email |
| `<403-fallback-email>` | Approved mapped user that gets the controlled Cloud Identity HTTP 403 |
| `<403-denied-email>` | Approved unmapped user that gets the controlled Cloud Identity HTTP 403 |
| `<release-commit>` | Human-created 40-character release commit |
| `<release-tag>` | Human-created immutable release tag |
| `<deployment-log-dir>` | New protected log directory outside the work and source trees |

Start a new Bash shell. Disable command tracing. Set a restrictive file mode mask.

```bash
set +x
set +a
set -euo pipefail
umask 077
export LC_ALL=C

REPO='<repo>'
WORKDIR='<workdir>'
DEPLOYMENT_LOG_DIR='<deployment-log-dir>'
TAILSCALE_IP='<tailscale-ip>'
TAILSCALE_DNS='<machine>.<tailnet>.ts.net'
OPERATOR_TAILSCALE_LOGIN='<operator-tailscale-login>'
RELEASE_COMMIT='<release-commit>'
RELEASE_TAG='<release-tag>'
PUBLIC_REPOSITORY_URL='https://github.com/geebee/teleport.git'
PUBLIC_WEB_ROOT='https://github.com/geebee/teleport'
PUBLIC_RAW_ROOT='https://raw.githubusercontent.com/geebee/teleport'
BASELINE_COMMIT='19d0f649f1c6e5ff0b38001adc89a1ea056bfee6'
```

Validate the fixed values and path syntax:

```bash
test "$PUBLIC_REPOSITORY_URL" = 'https://github.com/geebee/teleport.git'
test "$PUBLIC_WEB_ROOT" = 'https://github.com/geebee/teleport'
test "$PUBLIC_RAW_ROOT" = 'https://raw.githubusercontent.com/geebee/teleport'
test "$BASELINE_COMMIT" = '19d0f649f1c6e5ff0b38001adc89a1ea056bfee6'
[[ "$RELEASE_COMMIT" =~ ^[0-9a-f]{40}$ ]]
[[ "$RELEASE_TAG" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$ ]]
for PATH_VALUE in "$REPO" "$WORKDIR" "$DEPLOYMENT_LOG_DIR"; do
  [[ "$PATH_VALUE" =~ ^/[!-~]+$ ]]
  [[ "$PATH_VALUE" != *\\* ]]
done
unset PATH_VALUE
```

The path checks reject whitespace, backslashes, control characters, and non-ASCII characters. Keep both new directories outside the source tree. Do not use a shared or synchronized directory.

## Preconditions

### 1. Check the source publication gate

Stop if a human has not rewritten and verified all prototype implementation and documentation.

Stop if commits `3428533264` and `730fdb0d85` have not had human reconciliation.

Stop if the provenance record has no intended immutable release tag. The current prototype has only a placeholder.

Read the source record. Then assert its release tag mechanically:

```bash
cd "$REPO"
less docs/oidc-google/source-provenance.md
PROVENANCE_RELEASE_TAG=$(
  sed -n 's/^Intended immutable release tag: `\([^`][^`]*\)`$/\1/p' \
    docs/oidc-google/source-provenance.md
)
test "$PROVENANCE_RELEASE_TAG" = "$RELEASE_TAG"
test "$(
  grep -c '^Intended immutable release tag: `[^`][^`]*`$' \
    docs/oidc-google/source-provenance.md
)" -eq 1
```

Confirm that the source tree is clean:

```bash
test -z "$(git status --porcelain=v1 --untracked-files=all)"
```

Create the protected external deployment log directory. Require canonical, separate paths:

```bash
test ! -e "$DEPLOYMENT_LOG_DIR"
mkdir --mode=0700 -- "$DEPLOYMENT_LOG_DIR"
test -d "$DEPLOYMENT_LOG_DIR"
test ! -L "$DEPLOYMENT_LOG_DIR"
test "$(stat -c '%u' -- "$DEPLOYMENT_LOG_DIR")" = "$(id -u)"
test "$(stat -c '%a' -- "$DEPLOYMENT_LOG_DIR")" = 700

CANONICAL_REPO=$(realpath -e -- "$REPO")
CANONICAL_PLANNED_WORKDIR=$(realpath -m -- "$WORKDIR")
CANONICAL_DEPLOYMENT_LOG_DIR=$(realpath -e -- "$DEPLOYMENT_LOG_DIR")
DEPLOYMENT_LOG_DEVICE_INODE=$(stat -c '%d:%i' -- "$DEPLOYMENT_LOG_DIR")
test "$CANONICAL_REPO" = "$REPO"
test "$CANONICAL_PLANNED_WORKDIR" = "$WORKDIR"
test "$CANONICAL_DEPLOYMENT_LOG_DIR" = "$DEPLOYMENT_LOG_DIR"
case "$CANONICAL_DEPLOYMENT_LOG_DIR" in
  "$CANONICAL_REPO"|"$CANONICAL_REPO"/*) exit 1 ;;
  "$CANONICAL_PLANNED_WORKDIR"|"$CANONICAL_PLANNED_WORKDIR"/*) exit 1 ;;
esac
case "$CANONICAL_PLANNED_WORKDIR" in
  "$CANONICAL_REPO"|"$CANONICAL_REPO"/*) exit 1 ;;
  "$CANONICAL_DEPLOYMENT_LOG_DIR"|"$CANONICAL_DEPLOYMENT_LOG_DIR"/*) exit 1 ;;
esac
readonly DEPLOYMENT_LOG_DIR CANONICAL_DEPLOYMENT_LOG_DIR \
  DEPLOYMENT_LOG_DEVICE_INODE
```

The runbook never deletes this external directory. Protect it according to the approved retention policy.

Confirm the local release identity:

```bash
test "$(git rev-parse HEAD)" = "$RELEASE_COMMIT"
test "$(git rev-parse "$RELEASE_TAG^{commit}")" = "$RELEASE_COMMIT"
test "$(git rev-parse "$BASELINE_COMMIT^{commit}")" = "$BASELINE_COMMIT"
git merge-base --is-ancestor "$BASELINE_COMMIT" "$RELEASE_COMMIT"
```

Create an isolated directory for public checks. Do not use repository credentials.

```bash
PUBLIC_CHECK_DIR=$(mktemp -d "${TMPDIR:-/tmp}/teleport-public-check.XXXXXX")
chmod 0700 "$PUBLIC_CHECK_DIR"
remove_public_check_dir() {
  case "${PUBLIC_CHECK_DIR:-}" in
    "${TMPDIR:-/tmp}"/teleport-public-check.*) ;;
    *) return 1 ;;
  esac
  test -d "$PUBLIC_CHECK_DIR"
  test ! -L "$PUBLIC_CHECK_DIR"
  rm -rf --one-file-system -- "$PUBLIC_CHECK_DIR"
  unset PUBLIC_CHECK_DIR PUBLIC_PEELED_COMMIT RUNTIME_SCAN_DIR
}
prestart_exit() {
  status=$?
  trap - EXIT INT TERM
  remove_public_check_dir || :
  exit "$status"
}
trap prestart_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

git init --bare --quiet "$PUBLIC_CHECK_DIR/repository.git"

env -u GH_TOKEN -u GITHUB_TOKEN -u GIT_ASKPASS \
  GIT_TERMINAL_PROMPT=0 \
  git -C "$PUBLIC_CHECK_DIR/repository.git" \
  -c credential.helper= \
  -c core.askPass= \
  -c http.extraHeader= \
  fetch --quiet --no-tags \
  "$PUBLIC_REPOSITORY_URL" \
  "+refs/heads/master:refs/heads/master" \
  "+refs/tags/$RELEASE_TAG:refs/tags/$RELEASE_TAG"
```

Verify the peeled public tag commit. Require an annotated tag so the public remote has a peeled tag reference.

Confirm that a public repository ruleset protects `refs/tags/$RELEASE_TAG`. The ruleset must block tag updates and deletion. The tag must not be movable after publication.

```bash
PUBLIC_PEELED_COMMIT=$(
  env -u GH_TOKEN -u GITHUB_TOKEN -u GIT_ASKPASS \
    GIT_TERMINAL_PROMPT=0 \
    git -c credential.helper= \
    -c core.askPass= \
    -c http.extraHeader= \
    ls-remote --exit-code "$PUBLIC_REPOSITORY_URL" \
    "refs/tags/$RELEASE_TAG^{}" |
    awk 'NF == 2 {print $1}'
)
test "$PUBLIC_PEELED_COMMIT" = "$RELEASE_COMMIT"
test "$(
  git -C "$PUBLIC_CHECK_DIR/repository.git" \
    rev-parse "refs/tags/$RELEASE_TAG^{commit}"
)" = "$RELEASE_COMMIT"
```

The login interface links to the public `master` branch. Require that public `master` contains the release commit at deployment time.

```bash
git -C "$PUBLIC_CHECK_DIR/repository.git" \
  merge-base --is-ancestor "$RELEASE_COMMIT" refs/heads/master
```

Fetch the tag-specific public files without authentication:

```bash
curl -q --fail --silent --show-error --location \
  --output "$PUBLIC_CHECK_DIR/LICENSE" \
  "$PUBLIC_RAW_ROOT/$RELEASE_TAG/LICENSE"
curl -q --fail --silent --show-error --location \
  --output "$PUBLIC_CHECK_DIR/source-provenance.md" \
  "$PUBLIC_RAW_ROOT/$RELEASE_TAG/docs/oidc-google/source-provenance.md"
curl -q --fail --silent --show-error --location \
  --output "$PUBLIC_CHECK_DIR/first-deployment-runbook.md" \
  "$PUBLIC_RAW_ROOT/$RELEASE_TAG/docs/oidc-google/first-deployment-runbook.md"
curl -q --fail --silent --show-error --location \
  --output "$PUBLIC_CHECK_DIR/first-deployment-plan.md" \
  "$PUBLIC_RAW_ROOT/$RELEASE_TAG/docs/oidc-google/google-workspace-first-deployment-plan.md"
curl -q --fail --silent --show-error --location \
  --output "$PUBLIC_CHECK_DIR/bootstrap-oidc-local.sh" \
  "$PUBLIC_RAW_ROOT/$RELEASE_TAG/bootstrap-oidc-local.sh"
curl -q --fail --silent --show-error --location \
  --output "$PUBLIC_CHECK_DIR/Login.tsx" \
  "$PUBLIC_RAW_ROOT/$RELEASE_TAG/web/packages/teleport/src/Login/Login.tsx"
curl -q --fail --silent --show-error --location \
  --output "$PUBLIC_CHECK_DIR/source.tar.gz" \
  "$PUBLIC_WEB_ROOT/archive/refs/tags/$RELEASE_TAG.tar.gz"
```

Check each file against the fetched release commit. Check the required login interface links. Check the source archive without extraction.

```bash
for PUBLIC_PATH in \
  LICENSE \
  docs/oidc-google/source-provenance.md \
  docs/oidc-google/first-deployment-runbook.md \
  docs/oidc-google/google-workspace-first-deployment-plan.md \
  bootstrap-oidc-local.sh \
  web/packages/teleport/src/Login/Login.tsx; do
  EXPECTED_FILE="$PUBLIC_CHECK_DIR/expected-$(printf '%s' "$PUBLIC_PATH" | tr '/' '_')"
  git -C "$PUBLIC_CHECK_DIR/repository.git" \
    show "$RELEASE_COMMIT:$PUBLIC_PATH" >"$EXPECTED_FILE"
  case "$PUBLIC_PATH" in
    LICENSE) DOWNLOADED_FILE="$PUBLIC_CHECK_DIR/LICENSE" ;;
    docs/oidc-google/source-provenance.md)
      DOWNLOADED_FILE="$PUBLIC_CHECK_DIR/source-provenance.md"
      ;;
    docs/oidc-google/first-deployment-runbook.md)
      DOWNLOADED_FILE="$PUBLIC_CHECK_DIR/first-deployment-runbook.md"
      ;;
    docs/oidc-google/google-workspace-first-deployment-plan.md)
      DOWNLOADED_FILE="$PUBLIC_CHECK_DIR/first-deployment-plan.md"
      ;;
    bootstrap-oidc-local.sh)
      DOWNLOADED_FILE="$PUBLIC_CHECK_DIR/bootstrap-oidc-local.sh"
      ;;
    web/packages/teleport/src/Login/Login.tsx)
      DOWNLOADED_FILE="$PUBLIC_CHECK_DIR/Login.tsx"
      ;;
    *) exit 1 ;;
  esac
  test -s "$DOWNLOADED_FILE"
  cmp --silent "$EXPECTED_FILE" "$DOWNLOADED_FILE"
done

test -s "$PUBLIC_CHECK_DIR/source.tar.gz"
grep -Fq 'https://github.com/geebee/teleport' "$PUBLIC_CHECK_DIR/Login.tsx"
grep -Fq 'https://github.com/geebee/teleport/blob/master/LICENSE' "$PUBLIC_CHECK_DIR/Login.tsx"
ARCHIVE_LIST="$PUBLIC_CHECK_DIR/source-archive-list.txt"
tar --quoting-style=escape -tzf "$PUBLIC_CHECK_DIR/source.tar.gz" \
  >"$ARCHIVE_LIST"
test -s "$ARCHIVE_LIST"
ARCHIVE_TOP_DIR=$(
  awk -F/ '
    BEGIN { top = "" }
    {
      if ($0 == "" || substr($0, 1, 1) == "/" ||
          index($0, "\\") != 0 || NF < 2) {
        exit 1
      }
      for (i = 1; i <= NF; i++) {
        if ($i == "." || $i == ".." || ($i == "" && i != NF)) {
          exit 1
        }
      }
      if ($1 !~ /^[A-Za-z0-9][A-Za-z0-9._-]*$/) {
        exit 1
      }
      if (top == "") {
        top = $1
      } else if ($1 != top) {
        exit 1
      }
    }
    END {
      if (top == "") {
        exit 1
      }
      print top
    }
  ' "$ARCHIVE_LIST"
)
[[ "$ARCHIVE_TOP_DIR" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]
for ARCHIVE_PATH in \
  LICENSE \
  docs/oidc-google/source-provenance.md \
  docs/oidc-google/first-deployment-runbook.md \
  docs/oidc-google/google-workspace-first-deployment-plan.md \
  bootstrap-oidc-local.sh \
  web/packages/teleport/src/Login/Login.tsx; do
  EXPECTED_FILE="$PUBLIC_CHECK_DIR/expected-$(printf '%s' "$ARCHIVE_PATH" | tr '/' '_')"
  tar -xOzf "$PUBLIC_CHECK_DIR/source.tar.gz" \
    "$ARCHIVE_TOP_DIR/$ARCHIVE_PATH" |
    cmp --silent "$EXPECTED_FILE" -
done

test "$(
  env -u GH_TOKEN -u GITHUB_TOKEN -u GIT_ASKPASS \
    GIT_TERMINAL_PROMPT=0 \
    git -c credential.helper= \
    -c core.askPass= \
    -c http.extraHeader= \
    ls-remote --exit-code "$PUBLIC_REPOSITORY_URL" \
    "refs/tags/$RELEASE_TAG^{}" |
    awk 'NF == 2 {print $1}'
)" = "$RELEASE_COMMIT"
```

Do not continue unless all public checks pass. Do not put the release commit in a source file. Record it in the protected deployment log.

### 2. Run the release test gate

Use Go 1.25.9 or newer. Use Node.js 24, pnpm, and the project Rust toolchain.

```bash
cd "$REPO"
GO_VERSION=$(go env GOVERSION)
GO_VERSION=${GO_VERSION#go}
test "$(printf '%s\n%s\n' '1.25.9' "$GO_VERSION" | sort -V | head -n 1)" = '1.25.9'
[[ "$(node -p 'process.versions.node')" == 24.* ]]
go version
node --version
pnpm --version
rustc --version
git --version
tailscale version
openssl version
ss --version
jq --version
shellcheck --version
```

Run the exact focused tests, including the bootstrap validator and Google preset tests:

```bash
go test -race -buildvcs=false -count=1 ./lib/auth \
  -run 'TestForkGoogleOIDC|TestCreateOIDCAuthRequestForMFARejected|TestSSOMFAChallenge_Validation|TestCloudIdentityGoogleGroupLookup|TestLocalOIDC'
go test -race -buildvcs=false -count=1 ./lib/web \
  -run 'TestOIDC|TestWithLimiterHandlerFunc'
go test -buildvcs=false -count=1 ./lib/config \
  -run TestBootstrapOIDCLocal
go test -buildvcs=false -count=1 ./tool/tctl/sso/configure \
  -run TestApplyGooglePreset
go test -buildvcs=false -count=1 ./tool/bootstrap-oidc-validator
```

Run the package and vet checks:

```bash
go test -race -buildvcs=false -count=1 ./lib/auth ./lib/web ./lib/oidc
go test -buildvcs=false -count=1 \
  ./lib/config ./tool/tctl/sso/configure ./tool/bootstrap-oidc-validator
go vet \
  ./lib/auth ./lib/web ./lib/oidc ./lib/config \
  ./tool/tctl/sso/configure ./tool/bootstrap-oidc-validator
```

Run the frontend tests, type check, and build:

```bash
pnpm test --runInBand web/packages/teleport/src/Login/Login.test.tsx
pnpm type-check
pnpm build-ui-oss
```

Check the bootstrap script:

```bash
bash -n bootstrap-oidc-local.sh
shellcheck bootstrap-oidc-local.sh
```

Build all smoke-test binaries and verify them:

```bash
mkdir -p build
go build -buildvcs=false -o build/teleport ./tool/teleport
go build -buildvcs=false -o build/tctl ./tool/tctl
go build -buildvcs=false -o build/bootstrap-oidc-validator \
  ./tool/bootstrap-oidc-validator
./build/teleport version
./build/tctl version
./build/bootstrap-oidc-validator --help >/dev/null
```

Stop if a command fails. Recheck the source after all repository-controlled tests and builds:

```bash
test "$(git rev-parse HEAD)" = "$RELEASE_COMMIT"
test "$(git rev-parse "$RELEASE_TAG^{commit}")" = "$RELEASE_COMMIT"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
IGNORED_SOURCE_LIST="$PUBLIC_CHECK_DIR/ignored-source-files.bin"
if ! git ls-files -z --others --ignored --exclude-standard -- \
  '*.go' '*.syso' '*.s' '*.S' '*.sx' \
  '*.c' '*.cc' '*.cpp' '*.cxx' '*.m' \
  '*.h' '*.hh' '*.hpp' '*.hxx' \
  '*.f' '*.F' '*.for' '*.f90' '*.swig' '*.swigcxx' \
  >"$IGNORED_SOURCE_LIST"; then
  printf 'ERROR: Ignored-source enumeration failed.\n' >&2
  false
fi
test ! -s "$IGNORED_SOURCE_LIST"
test -z "$(go env GOFLAGS)"
test -z "$(go env GOWORK)"
```

Record the completed test gate in the protected external deployment log:

```bash
{
  printf 'release_commit=%s\n' "$RELEASE_COMMIT"
  printf 'release_tag=%s\n' "$RELEASE_TAG"
  printf 'test_gate=passed\n'
  printf 'completed_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >"$DEPLOYMENT_LOG_DIR/release-test-gate.txt"
chmod 0600 "$DEPLOYMENT_LOG_DIR/release-test-gate.txt"
```

The ignored-source check permits dependency and build directories. It rejects ignored source files that can change a Go or native build.

### 3. Review the release runtime diff and run the supplemental scan

A human must review the full release diff, including all runtime and dependency changes. Review the complete diff from `$BASELINE_COMMIT` through `$RELEASE_COMMIT`. Do not continue until the human review is complete.

The regex scan below is supplemental. It checks added calls and imports for known prohibited patterns. It does not replace the required human review.

```bash
RUNTIME_SCAN_DIR="$PUBLIC_CHECK_DIR/runtime-scan"
mkdir -m 0700 -- "$RUNTIME_SCAN_DIR"
RUNTIME_SOURCE_LIST="$RUNTIME_SCAN_DIR/source-files.bin"
if ! git diff --no-ext-diff --no-textconv --text \
  --name-only -z --diff-filter=ACMR \
  "$BASELINE_COMMIT" "$RELEASE_COMMIT" -- \
  '*.go' '*.sh' go.mod go.sum >"$RUNTIME_SOURCE_LIST"; then
  printf 'ERROR: Runtime source enumeration failed.\n' >&2
  false
fi
FORBIDDEN_RUNTIME_RE='google[.]golang[.]org/api/(admin|impersonate|iamcredentials)|golang[.]org/x/oauth2/(google|jwt)|admin[.]NewService|FindDefaultCredentials|DefaultClient|CredentialsFromJSON|NewCredentials|WithCredentials(File|JSON)?|impersonate[.]CredentialsTokenSource|ImpersonateCredentials|ServiceAccountTokenCreator|JWTConfigFromJSON|domain.?wide.?delegation|AccessTypeOffline|offline_access|RefreshToken'
RESTRICTION_FIELD_RE='google_service_account(_uri)?|google_admin_email|GoogleServiceAccount(URI)?|GoogleAdminEmail'
RUNTIME_SCAN_FAILED=0

while IFS= read -r -d '' SOURCE_FILE; do
  case "$SOURCE_FILE" in
    *_test.go) continue ;;
  esac

  SOURCE_DIFF="$RUNTIME_SCAN_DIR/source.diff"
  ADDED_FILE="$RUNTIME_SCAN_DIR/added"
  if ! git diff --no-ext-diff --no-textconv --text --unified=0 \
    "$BASELINE_COMMIT" "$RELEASE_COMMIT" -- "$SOURCE_FILE" \
    >"$SOURCE_DIFF"; then
    printf 'ERROR: Runtime diff failed for %s\n' "$SOURCE_FILE" >&2
    RUNTIME_SCAN_FAILED=1
    continue
  fi
  sed -n '/^+++ /d; /^+/s/^+//p' "$SOURCE_DIFF" >"$ADDED_FILE"

  if grep -Eq "$FORBIDDEN_RUNTIME_RE" "$ADDED_FILE"; then
    printf 'ERROR: Forbidden runtime source in %s\n' "$SOURCE_FILE" >&2
    RUNTIME_SCAN_FAILED=1
  else
    GREP_STATUS=$?
    if [[ "$GREP_STATUS" -ne 1 ]]; then
      printf 'ERROR: Runtime source scan failed for %s\n' "$SOURCE_FILE" >&2
      RUNTIME_SCAN_FAILED=1
    fi
  fi

  case "$SOURCE_FILE" in
    lib/auth/oidc_google_restrictions.go|tool/tctl/sso/configure/oidc.go)
      ;;
    *)
      if grep -Eq "$RESTRICTION_FIELD_RE" "$ADDED_FILE"; then
        printf 'ERROR: Restriction field outside its boundary in %s\n' \
          "$SOURCE_FILE" >&2
        RUNTIME_SCAN_FAILED=1
      else
        GREP_STATUS=$?
        if [[ "$GREP_STATUS" -ne 1 ]]; then
          printf 'ERROR: Restriction-field scan failed for %s\n' \
            "$SOURCE_FILE" >&2
          RUNTIME_SCAN_FAILED=1
        fi
      fi
      ;;
  esac
done <"$RUNTIME_SOURCE_LIST"

test "$RUNTIME_SCAN_FAILED" -eq 0
```

The restriction source can name the rejected legacy fields. Automated tests can contain fake-provider sentinels and rejected configuration values. The runtime scan excludes those tests.

The scan does not permit credential loaders, impersonation, domain-wide delegation token sources, service-account token sources, refresh tokens, or `offline_access` in added runtime source.

### 4. Check the Tailscale identity

Show the local Tailscale state, DNS name, addresses, and login:

```bash
tailscale status --json | jq -r '
  "state=\(.BackendState)",
  "dns=\(.Self.DNSName)",
  "ips=\(.Self.TailscaleIPs | join(","))",
  "login=\(.User[(.Self.UserID | tostring)].LoginName)"'
```

Confirm these facts:

- The state is `Running`.
- The login is the approved operator identity.
- The DNS name is `$TAILSCALE_DNS`.
- The only selected IPv4 address is `$TAILSCALE_IP`.
- The IPv4 address is in `100.64.0.0/10`.

Check the values again:

```bash
TAILSCALE_STATUS_FILE=$(mktemp "${TMPDIR:-/tmp}/tailscale-status.XXXXXX")
chmod 0600 "$TAILSCALE_STATUS_FILE"
tailscale status --json >"$TAILSCALE_STATUS_FILE"
jq -e --arg login "$OPERATOR_TAILSCALE_LOGIN" '
  .BackendState == "Running" and
  .User[(.Self.UserID | tostring)].LoginName == $login
' "$TAILSCALE_STATUS_FILE" >/dev/null

test "$(tailscale ip -4)" = "$TAILSCALE_IP"
test "$(
  jq -r '.Self.DNSName | sub("[.]$"; "")' "$TAILSCALE_STATUS_FILE"
)" = "$TAILSCALE_DNS"
test "$(
  "$REPO/build/bootstrap-oidc-validator" \
    tailscale-status "$TAILSCALE_IP" <"$TAILSCALE_STATUS_FILE"
)" = "$(printf '%s\n%s' "$TAILSCALE_IP" "$TAILSCALE_DNS")"
rm -f -- "$TAILSCALE_STATUS_FILE"
```

### 5. Keep the Tailscale policy operator-only

Review the active Tailscale access policy in the admin console. Do not copy the policy into the deployment log.

Before startup, confirm these rules:

- Only the approved operator can reach TCP port `3025` on this node.
- Only the approved operator can reach TCP port `3080` on this node.
- No public ingress feature exposes either port.
- The test node has the expected tags and owner.

Do not grant an approved test user access yet. Grant access only after the listener checks pass.

### 6. Configure Google Cloud

Create a new OAuth client with the **Web application** type. Use the client only for this temporary test.

Register exactly this authorized redirect URI:

```text
https://<machine>.<tailnet>.ts.net:3080/v1/webapi/oidc/callback
```

Do not register a wildcard, HTTP URI, alternate host, alternate port, path variant, query, or fragment.

Enable this API:

```text
cloudidentity.googleapis.com
```

Configure the OAuth consent screen for the approved test users. Use these scopes for the email-only test:

```text
openid
email
```

Add this exact scope for the group tests:

```text
https://www.googleapis.com/auth/cloud-identity.groups.readonly
```

Do not add Admin SDK scopes, `offline_access`, service accounts, or domain-wide delegation. Confirm that the group test user can see the test groups under Google group visibility rules.

Require this exact test topology:

- `<test-email>` is a direct member of `<direct-group-email>`.
- `<direct-group-email>` is a direct member of `<nested-group-email>`.
- `<test-email>` is not a direct member of `<nested-group-email>`.

Verify this topology in the Google Admin console before startup. A direct user membership in the nested group invalidates the nested test.

Identify both controlled HTTP 403 test users before startup. The restriction must be stable and must not require a permission change. If these users are not available, block the release.

## Procedure

### 1. Generate the deployment files

Make sure that `$WORKDIR` does not exist. Make sure that its parent belongs to the current user. The parent must not permit group or other users to write.

Recheck the release source immediately before bootstrap:

```bash
cd "$REPO"
test "$(git rev-parse HEAD)" = "$RELEASE_COMMIT"
test "$(git rev-parse "$RELEASE_TAG^{commit}")" = "$RELEASE_COMMIT"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
```

Run the bootstrap script with the narrow email test role:

```bash
env -u GOOGLE_CLIENT_SECRET \
  REPO="$REPO" \
  WORKDIR="$WORKDIR" \
  CLUSTER_NAME='<cluster-name>' \
  CURRENT_LOGIN='<local-os-login>' \
  OIDC_EMAIL_ROLE='oidc-email-test' \
  bash ./bootstrap-oidc-local.sh
```

Enter the client ID and test email at their prompts. Enter the client secret only at the hidden `Google client secret:` prompt.

Never put the client secret in an environment variable. Never put it in a command argument. Do not paste it into shell history.

The script must finish with `Done. No cluster command was run.`

### 2. Check file modes

Check the protected directories:

```bash
stat -c '%a %U:%G %n' \
  "$WORKDIR" \
  "$WORKDIR/build" \
  "$WORKDIR/certs" \
  "$WORKDIR/data"
```

Each directory must have mode `700` and the current user as owner. Enforce these values:

```bash
CURRENT_UID=$(id -u)
for PROTECTED_DIR in \
  "$WORKDIR" \
  "$WORKDIR/build" \
  "$WORKDIR/certs" \
  "$WORKDIR/data"; do
  test -d "$PROTECTED_DIR"
  test ! -L "$PROTECTED_DIR"
  test "$(stat -c '%u' -- "$PROTECTED_DIR")" = "$CURRENT_UID"
  test "$(stat -c '%a' -- "$PROTECTED_DIR")" = 700
done
```

Check the sensitive files:

```bash
stat -c '%a %U:%G %n' \
  "$WORKDIR/teleport.yaml" \
  "$WORKDIR/google-oidc-smoke.yaml" \
  "$WORKDIR/cluster-auth-preference-oidc.yaml" \
  "$WORKDIR/certs/proxy-cert.pem" \
  "$WORKDIR/certs/proxy-key.pem"
```

Each file must have mode `600` or stricter. Do not print the connector file. It contains the client secret.

Enforce ownership, file type, and no group or other permission bits:

```bash
for PROTECTED_FILE in \
  "$WORKDIR/teleport.yaml" \
  "$WORKDIR/google-oidc-smoke.yaml" \
  "$WORKDIR/cluster-auth-preference-oidc.yaml" \
  "$WORKDIR/certs/proxy-cert.pem" \
  "$WORKDIR/certs/proxy-key.pem"; do
  test -f "$PROTECTED_FILE"
  test ! -L "$PROTECTED_FILE"
  test "$(stat -c '%u' -- "$PROTECTED_FILE")" = "$CURRENT_UID"
  FILE_MODE=$(stat -c '%a' -- "$PROTECTED_FILE")
  [[ "$FILE_MODE" =~ ^[0-7]{3,4}$ ]]
  test "$((8#$FILE_MODE & 8#077))" -eq 0
done
```

Record an immutable shell identity for the work directory. The marker protects the later deletion check.

```bash
CANONICAL_WORKDIR=$(realpath -e -- "$WORKDIR")
test "$CANONICAL_WORKDIR" = "$WORKDIR"
WORKDIR_DEVICE_INODE=$(stat -c '%d:%i' -- "$CANONICAL_WORKDIR")
RUNBOOK_MARKER=$(openssl rand -hex 32)
printf '%s\n' "$RUNBOOK_MARKER" >"$WORKDIR/.runbook-deployment-marker"
chmod 0600 "$WORKDIR/.runbook-deployment-marker"
readonly WORKDIR CANONICAL_WORKDIR WORKDIR_DEVICE_INODE RUNBOOK_MARKER
```

### 3. Validate the certificate and resources

Validate the certificate pair and DNS name:

```bash
env -u SSL_CERT_FILE -u SSL_CERT_DIR \
  "$WORKDIR/build/bootstrap-oidc-validator" certificate \
  "$WORKDIR/certs/proxy-cert.pem" \
  "$WORKDIR/certs/proxy-key.pem" \
  "$TAILSCALE_DNS"
```

Inspect only public certificate data:

```bash
openssl x509 \
  -in "$WORKDIR/certs/proxy-cert.pem" \
  -noout -subject -issuer -dates -ext subjectAltName
```

Confirm that the certificate is valid for `$TAILSCALE_DNS`. Confirm that its validity period covers the test window.

Validate the files:

```bash
"$WORKDIR/build/teleport" configure \
  --test="$WORKDIR/teleport.yaml"

"$WORKDIR/build/bootstrap-oidc-validator" resources \
  "$WORKDIR/google-oidc-smoke.yaml" \
  "$WORKDIR/cluster-auth-preference-oidc.yaml"
```

Both commands must return exit status zero. Stop if either command fails.

### 4. Record build identity

Record binary hashes:

```bash
sha256sum \
  "$WORKDIR/build/teleport" \
  "$WORKDIR/build/tctl" \
  "$WORKDIR/build/bootstrap-oidc-validator" \
  >"$WORKDIR/build-sha256.txt"
chmod 0600 "$WORKDIR/build-sha256.txt"
```

Record binary versions:

```bash
{
  "$WORKDIR/build/teleport" version
  "$WORKDIR/build/tctl" version
  go version
} >"$WORKDIR/build-versions.txt"
chmod 0600 "$WORKDIR/build-versions.txt"
```

Record the release identity outside source code:

```bash
printf '%s\n%s\n' "$RELEASE_COMMIT" "$RELEASE_TAG" \
  >"$WORKDIR/source-release.txt"
chmod 0600 "$WORKDIR/source-release.txt"
```

Copy the source identity, hashes, and versions to the protected external deployment log:

```bash
test -d "$DEPLOYMENT_LOG_DIR"
test ! -L "$DEPLOYMENT_LOG_DIR"
test "$(realpath -e -- "$DEPLOYMENT_LOG_DIR")" = \
  "$CANONICAL_DEPLOYMENT_LOG_DIR"
test "$(stat -c '%d:%i' -- "$DEPLOYMENT_LOG_DIR")" = \
  "$DEPLOYMENT_LOG_DEVICE_INODE"
cp -- "$WORKDIR/source-release.txt" \
  "$DEPLOYMENT_LOG_DIR/source-release.txt"
cp -- "$WORKDIR/build-sha256.txt" \
  "$DEPLOYMENT_LOG_DIR/build-sha256.txt"
cp -- "$WORKDIR/build-versions.txt" \
  "$DEPLOYMENT_LOG_DIR/build-versions.txt"
chmod 0600 "$DEPLOYMENT_LOG_DIR"/*.txt
test -s "$DEPLOYMENT_LOG_DIR/release-test-gate.txt"
test -s "$DEPLOYMENT_LOG_DIR/source-release.txt"
test -s "$DEPLOYMENT_LOG_DIR/build-sha256.txt"
test -s "$DEPLOYMENT_LOG_DIR/build-versions.txt"
```

Remove the public check directory before startup. Remove the pre-start trap only after cleanup succeeds:

```bash
remove_public_check_dir
trap - EXIT INT TERM
```

### 5. Start Teleport and install containment

Require a working systemd user manager and the bounded-command utility. Use one fixed transient unit:

```bash
command -v timeout >/dev/null 2>&1
command -v systemd-run >/dev/null 2>&1
command -v systemctl >/dev/null 2>&1
command -v journalctl >/dev/null 2>&1
systemctl --user show-environment >/dev/null

TELEPORT_UNIT='teleport-google-oidc-first-deployment.service'
test "$TELEPORT_UNIT" = 'teleport-google-oidc-first-deployment.service'
[[ "$TELEPORT_UNIT" =~ ^[a-z0-9][a-z0-9.-]*[.]service$ ]]
TELEPORT_EXE=$(realpath -e -- "$WORKDIR/build/teleport")
TELEPORT_UNIT_STARTED=0
TELEPORT_PID=
TELEPORT_CGROUP=
TELEPORT_CGROUP_DIR=
TELEPORT_INVOCATION_ID=

systemctl --user reset-failed "$TELEPORT_UNIT" >/dev/null 2>&1 || :
test "$(
  systemctl --user show "$TELEPORT_UNIT" --property=LoadState --value
)" = "not-found"
```

Define a unit check. Require exactly one process in the unit control group:

```bash
verify_teleport_unit() {
  local current_invocation
  local current_cgroup
  local current_pid
  local cgroup_proc_file
  local cgroup_proc_list
  local -a cgroup_file_pids
  local -a cgroup_proc_files
  local -a cgroup_pids

  test "$(
    systemctl --user show "$TELEPORT_UNIT" --property=LoadState --value
  )" = "loaded" || return 1
  test "$(
    systemctl --user show "$TELEPORT_UNIT" --property=ActiveState --value
  )" = "active" || return 1
  test "$(
    systemctl --user show "$TELEPORT_UNIT" --property=SubState --value
  )" = "running" || return 1
  test "$(
    systemctl --user show "$TELEPORT_UNIT" --property=KillMode --value
  )" = "control-group" || return 1

  current_pid=$(
    systemctl --user show "$TELEPORT_UNIT" --property=MainPID --value
  )
  [[ "$current_pid" =~ ^[1-9][0-9]*$ ]] || return 1
  current_cgroup=$(
    systemctl --user show "$TELEPORT_UNIT" --property=ControlGroup --value
  )
  [[ "$current_cgroup" =~ ^/[A-Za-z0-9_.@:/-]+$ ]] || return 1
  [[ "$current_cgroup" != *..* ]] || return 1
  current_invocation=$(
    systemctl --user show "$TELEPORT_UNIT" --property=InvocationID --value
  )
  [[ "$current_invocation" =~ ^[0-9a-f]{32}$ ]] || return 1

  if [[ -n "${TELEPORT_INVOCATION_ID:-}" ]]; then
    test "$current_invocation" = "$TELEPORT_INVOCATION_ID" || return 1
  fi
  TELEPORT_PID=$current_pid
  TELEPORT_CGROUP=$current_cgroup
  TELEPORT_CGROUP_DIR=$(realpath -e -- "/sys/fs/cgroup$TELEPORT_CGROUP")
  case "$TELEPORT_CGROUP_DIR" in
    /sys/fs/cgroup/*) ;;
    *) return 1 ;;
  esac

  cgroup_proc_list="$WORKDIR/cgroup-proc-files.bin"
  if ! find "$TELEPORT_CGROUP_DIR" -type f -name cgroup.procs -print0 \
    >"$cgroup_proc_list"; then
    return 1
  fi
  chmod 0600 "$cgroup_proc_list" || return 1
  mapfile -d '' -t cgroup_proc_files <"$cgroup_proc_list"
  test "${#cgroup_proc_files[@]}" -ge 1 || return 1
  cgroup_pids=()
  for cgroup_proc_file in "${cgroup_proc_files[@]}"; do
    mapfile -t cgroup_file_pids <"$cgroup_proc_file" || return 1
    cgroup_pids+=("${cgroup_file_pids[@]}")
  done
  test "${#cgroup_pids[@]}" -eq 1 || return 1
  test "${cgroup_pids[0]}" = "$TELEPORT_PID" || return 1
  test "$(stat -c '%u' -- "/proc/$TELEPORT_PID")" = "$CURRENT_UID" || return 1
  test "$(readlink -e -- "/proc/$TELEPORT_PID/exe")" = "$TELEPORT_EXE" || return 1
  grep -zFxq -- 'start' "/proc/$TELEPORT_PID/cmdline" || return 1
  grep -zFxq -- "--config=$WORKDIR/teleport.yaml" \
    "/proc/$TELEPORT_PID/cmdline" || return 1
}

stop_teleport_unit() {
  local stop_failed=0

  if [[ "${TELEPORT_UNIT_STARTED:-0}" != 1 ]]; then
    return 0
  fi
  if [[ "$(
    systemctl --user show "$TELEPORT_UNIT" --property=LoadState --value
  )" == "not-found" ]]; then
    return 0
  fi
  systemctl --user stop "$TELEPORT_UNIT" || stop_failed=1
  for _ in $(seq 1 30); do
    if ! systemctl --user is-active --quiet "$TELEPORT_UNIT"; then
      break
    fi
    sleep 1
  done
  if systemctl --user is-active --quiet "$TELEPORT_UNIT"; then
    systemctl --user kill --kill-whom=all --signal=KILL \
      "$TELEPORT_UNIT" || stop_failed=1
    systemctl --user stop "$TELEPORT_UNIT" || stop_failed=1
  fi
  systemctl --user is-active --quiet "$TELEPORT_UNIT" && stop_failed=1
  if [[ -n "${TELEPORT_CGROUP_DIR:-}" && -d "$TELEPORT_CGROUP_DIR" ]]; then
    grep -Fxq 'populated 0' "$TELEPORT_CGROUP_DIR/cgroup.events" || \
      stop_failed=1
  fi
  systemctl --user reset-failed "$TELEPORT_UNIT" >/dev/null 2>&1 || :
  test "$stop_failed" -eq 0
}
```

Define cleanup for protected temporary files. The secret pattern file is removed only through this function.

```bash
cleanup_sensitive_temporary_files() {
  if [[ -n "${PATTERN_FILE:-}" ]]; then
    case "$PATTERN_FILE" in
      "$WORKDIR"/secret-patterns.*)
        if [[ -f "$PATTERN_FILE" && ! -L "$PATTERN_FILE" ]]; then
          rm -f -- "$PATTERN_FILE"
        fi
        ;;
    esac
  fi
  unset SECRET_VALUE PATTERN_FILE
}
```

Define the containment handler before startup. It stops the complete unit control group on a failure or signal:

```bash
CONTAINMENT_ARMED=1
CONNECTOR_CREATED=0
RECOVERY_ROLE_CREATED=0
RECOVERY_USER_CREATED=0
containment_exit() {
  status=$?
  trap - EXIT INT TERM
  set +e
  stop_status=0

  if [[ "${CONTAINMENT_ARMED:-0}" == 1 ]]; then
    if [[ "${CONNECTOR_CREATED:-0}" == 1 ]] && verify_teleport_unit; then
      if timeout --signal=TERM --kill-after=5s 10s \
        "$WORKDIR/build/tctl" \
        --config="$WORKDIR/teleport.yaml" \
        get oidc/google >/dev/null 2>&1; then
        timeout --signal=TERM --kill-after=5s 10s \
          "$WORKDIR/build/tctl" \
          --config="$WORKDIR/teleport.yaml" \
          rm oidc/google >/dev/null 2>&1 || :
      fi
    fi
    if verify_teleport_unit; then
      if [[ "${RECOVERY_USER_CREATED:-0}" == 1 ]]; then
        timeout --signal=TERM --kill-after=5s 10s \
          "$WORKDIR/build/tctl" \
          --config="$WORKDIR/teleport.yaml" \
          rm user/teleport-admin >/dev/null 2>&1 || :
      fi
      if [[ "${RECOVERY_ROLE_CREATED:-0}" == 1 ]]; then
        timeout --signal=TERM --kill-after=5s 10s \
          "$WORKDIR/build/tctl" \
          --config="$WORKDIR/teleport.yaml" \
          rm role/oidc-recovery >/dev/null 2>&1 || :
      fi
    fi
    stop_teleport_unit
    stop_status=$?
  fi

  cleanup_sensitive_temporary_files

  if [[ "$stop_status" -ne 0 ]]; then
    printf 'ERROR: Containment could not stop the Teleport unit.\n' >&2
    exit 1
  fi
  exit "$status"
}
trap containment_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
```

Start Teleport as the fixed transient user unit:

```bash
TELEPORT_UNIT_STARTED=1
systemd-run --user \
  --unit="$TELEPORT_UNIT" \
  --property=Type=exec \
  --property=KillMode=control-group \
  --property=TimeoutStopSec=30s \
  --property=StandardOutput=journal \
  --property=StandardError=journal \
  -- "$TELEPORT_EXE" start --config="$WORKDIR/teleport.yaml"
```

The trap now contains every later command failure and signal. Wait for the unit. Then verify and record its identity:

```bash
for _ in $(seq 1 30); do
  if systemctl --user is-active --quiet "$TELEPORT_UNIT"; then
    break
  fi
  sleep 1
done
systemctl --user is-active --quiet "$TELEPORT_UNIT"
TELEPORT_INVOCATION_ID=$(
  systemctl --user show "$TELEPORT_UNIT" --property=InvocationID --value
)
[[ "$TELEPORT_INVOCATION_ID" =~ ^[0-9a-f]{32}$ ]]
verify_teleport_unit
printf '%s\n%s\n%s\n' \
  "$TELEPORT_UNIT" "$TELEPORT_PID" "$TELEPORT_CGROUP" \
  >"$WORKDIR/teleport-unit.txt"
chmod 0600 "$WORKDIR/teleport-unit.txt"
systemctl --user show "$TELEPORT_UNIT" \
  --property=MainPID --property=ControlGroup --property=InvocationID
```

Keep this shell open until rollback is complete.

### 6. Check the exact listeners

Recheck the unit before the socket checks. This check rejects an extra process in the control group:

```bash
verify_teleport_unit
```

Create the exact expected sorted TCP listener list:

```bash
printf '%s\n' \
  "$TAILSCALE_IP:3025" \
  "$TAILSCALE_IP:3080" |
  LC_ALL=C sort >"$WORKDIR/expected-tcp-listeners.txt"
chmod 0600 "$WORKDIR/expected-tcp-listeners.txt"

sudo ss -H -ltnp4 |
  awk -v pid="$TELEPORT_PID" \
    '$0 ~ ("pid=" pid ",") {print $4}' |
  LC_ALL=C sort >"$WORKDIR/actual-tcp-listeners.txt"
chmod 0600 "$WORKDIR/actual-tcp-listeners.txt"

cmp --silent \
  "$WORKDIR/expected-tcp-listeners.txt" \
  "$WORKDIR/actual-tcp-listeners.txt"

sudo ss -H -ltnp4 |
  awk -v ip="$TAILSCALE_IP" \
    '$4 ~ ("^" ip ":") {print $4}' |
  LC_ALL=C sort >"$WORKDIR/all-tailscale-tcp-listeners.txt"
chmod 0600 "$WORKDIR/all-tailscale-tcp-listeners.txt"
cmp --silent \
  "$WORKDIR/expected-tcp-listeners.txt" \
  "$WORKDIR/all-tailscale-tcp-listeners.txt"
```

Reject each IPv6 TCP, IPv4 UDP, and IPv6 UDP listener for the Teleport PID:

```bash
for SS_ARGS in '-ltnp6' '-lunp4' '-lunp6'; do
  SS_OUTPUT=$(sudo ss -H "$SS_ARGS")
  if awk -v pid="$TELEPORT_PID" \
    '$0 ~ ("pid=" pid ",") {found=1} END {exit !found}' \
    <<<"$SS_OUTPUT"; then
    printf 'ERROR: Teleport has a forbidden listener.\n' >&2
    false
  fi
done
unset SS_OUTPUT
```

Recheck the exact unit control group after the socket checks:

```bash
verify_teleport_unit
```

A mismatch causes immediate containment through the installed trap.

### 7. Open the approved Tailscale access

Only after all listener checks pass, edit the Tailscale policy in the admin console.

Keep TCP port `3025` limited to the operator. Permit only the approved test identities to reach TCP port `3080` on this node.

Test TCP port `3080` from one approved node. Test it from one denied node. The approved connection must succeed. The denied connection must fail.

### 8. Create the empty OIDC test roles

Create three roles with no allowed resources, logins, or request permissions:

```bash
cat >"$WORKDIR/oidc-test-roles.yaml" <<'EOF'
kind: role
version: v7
metadata:
  name: oidc-email-test
spec:
  allow: {}
  deny: {}
---
kind: role
version: v7
metadata:
  name: oidc-direct-test
spec:
  allow: {}
  deny: {}
---
kind: role
version: v7
metadata:
  name: oidc-nested-test
spec:
  allow: {}
  deny: {}
EOF
chmod 0600 "$WORKDIR/oidc-test-roles.yaml"

"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  create -f "$WORKDIR/oidc-test-roles.yaml"
```

Confirm the three exact role names:

```bash
for ROLE_NAME in oidc-email-test oidc-direct-test oidc-nested-test; do
  "$WORKDIR/build/tctl" \
    --config="$WORKDIR/teleport.yaml" \
    get "role/$ROLE_NAME" --format=json \
    >"$WORKDIR/role-$ROLE_NAME.json"
  chmod 0600 "$WORKDIR/role-$ROLE_NAME.json"
done

jq -e -s '
  (add | map(.metadata.name) | sort) ==
  ["oidc-direct-test", "oidc-email-test", "oidc-nested-test"] and
  all(add[];
    def empty_permission:
      . == null or . == false or . == "" or
      ((type == "array" or type == "object") and all(.[]; empty_permission));
    (.spec.allow // {} | empty_permission) and
    (.spec.deny // {} | empty_permission))
' "$WORKDIR"/role-oidc-*-test.json >/dev/null
```

Do not use the built-in `access` role for an OIDC mapping or fallback.

### 9. Create and enroll the break-glass user

Do not create the connector yet. Create a narrow temporary recovery role:

```bash
cat >"$WORKDIR/oidc-recovery-role.yaml" <<'EOF'
kind: role
version: v7
metadata:
  name: oidc-recovery
spec:
  allow:
    logins:
      - <local-os-login>
    rules:
      - resources:
          - oidc
          - cluster_auth_preference
        verbs:
          - create
          - read
          - update
          - delete
          - list
  deny: {}
EOF
chmod 0600 "$WORKDIR/oidc-recovery-role.yaml"

"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  create -f "$WORKDIR/oidc-recovery-role.yaml"
RECOVERY_ROLE_CREATED=1
```

This role has only the selected operating system login. Its rules cover only OIDC connectors and the cluster authentication preference. Keep this identity only for the test window.

Create the temporary local recovery user:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  users add teleport-admin \
  --roles=oidc-recovery \
  --logins='<local-os-login>'
RECOVERY_USER_CREATED=1
```

Open the one-time enrollment URL in a private browser window. Enroll the local second factor. Complete a local login.

Close the browser session. Open a new private window. Complete a second local login before you continue.

### 10. Test the email-only login and stable subject

Record the UTC day for the six-scenario audit window. The test must not cross UTC midnight:

```bash
OIDC_SCENARIO_UTC_DAY=$(date -u +%F)
readonly OIDC_SCENARIO_UTC_DAY
```

Create the email-only connector:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  create -f "$WORKDIR/google-oidc-smoke.yaml"
CONNECTOR_CREATED=1
```

Open this exact URL in a new private browser window:

```text
https://<machine>.<tailnet>.ts.net:3080/v1/webapi/oidc/login/web?connector_id=google&redirect_url=%2Fweb
```

Before sign-in, open the browser network and storage tools. Do not export a HAR file. Sign in as `<test-email>`.

Confirm that the final `/web` response has HTTP status 200. In the browser cookie view or response headers, confirm a cookie named `__Host-session`. Confirm that it has `Secure`, `HttpOnly`, `SameSite=Lax`, and `Path=/`. Do not view, copy, or record its value.

The browser must reach `/web`. It must not show an access-denied page. These checks confirm that Teleport created the first web session.

Use `tctl` from the operator shell to verify the exact effective role set:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  get 'user/<test-email>' --format=json \
  >"$WORKDIR/user-email-first.json"
chmod 0600 "$WORKDIR/user-email-first.json"

jq -e '
  length == 1 and
  ((.[0].spec.roles // []) | sort) == ["oidc-email-test"] and
  ([.[0].spec.oidc_identities[] |
    select(.connector_id == "google" and .user_id != "")] | length) == 1
' "$WORKDIR/user-email-first.json"

jq -er '
  .[0].spec.oidc_identities[] |
  select(.connector_id == "google") |
  .user_id
' "$WORKDIR/user-email-first.json" \
  >"$WORKDIR/oidc-subject-before.txt"
chmod 0600 "$WORKDIR/oidc-subject-before.txt"
```

Capture the stable subject now. The first login creates the dynamic user record. A later comparison must use this record, not a value captured before the first login.

Close the browser session. Open the same URL in another private window. Sign in again as `<test-email>`.

Capture the user record after the repeat login:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  get 'user/<test-email>' --format=json \
  >"$WORKDIR/user-email-repeat.json"
chmod 0600 "$WORKDIR/user-email-repeat.json"

jq -e '
  length == 1 and
  ((.[0].spec.roles // []) | sort) == ["oidc-email-test"]
' "$WORKDIR/user-email-repeat.json"

jq -er '
  .[0].spec.oidc_identities[] |
  select(.connector_id == "google") |
  .user_id
' "$WORKDIR/user-email-repeat.json" \
  >"$WORKDIR/oidc-subject-after.txt"
chmod 0600 "$WORKDIR/oidc-subject-after.txt"
cmp --silent \
  "$WORKDIR/oidc-subject-before.txt" \
  "$WORKDIR/oidc-subject-after.txt"
```

Apply the OIDC authentication preference only after local recovery and both email logins work:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  create -f "$WORKDIR/cluster-auth-preference-oidc.yaml"
```

Open the cluster login page in a private window. Confirm that it still offers local login.

Confirm the footer opens these exact public pages:

```text
https://github.com/geebee/teleport
https://github.com/geebee/teleport/blob/master/LICENSE
```

Public `master` already passed the release ancestry check. Do not continue if either link differs or requires authentication.

### 11. Add and test the direct group mapping

Copy the protected connector file:

```bash
GROUP_CONNECTOR="$WORKDIR/google-oidc-groups.yaml"
cp --preserve=mode -- "$WORKDIR/google-oidc-smoke.yaml" "$GROUP_CONNECTOR"
chmod 0600 "$GROUP_CONNECTOR"
```

Stop if `vim` is not available. Do not use a normal editor as a fallback.

```bash
command -v vim >/dev/null 2>&1
VIM_HOME=$(mktemp -d "$WORKDIR/vim-home.XXXXXX")
chmod 0700 "$VIM_HOME"
HOME="$VIM_HOME" \
XDG_CONFIG_HOME="$VIM_HOME" \
XDG_DATA_HOME="$VIM_HOME" \
XDG_STATE_HOME="$VIM_HOME" \
  vim -Nu NONE -n -i NONE --noplugin \
  -c 'set nocompatible secure nomodeline noloadplugins' \
  -c 'set noswapfile noundofile nobackup nowritebackup' \
  -c 'set viminfo= clipboard=' \
  -- "$GROUP_CONNECTOR"
chmod 0600 "$GROUP_CONNECTOR"
```

Add the Cloud Identity scope under `spec.scope`:

```yaml
  - https://www.googleapis.com/auth/cloud-identity.groups.readonly
```

Keep the email mapping. Add this direct mapping under `spec.claims_to_roles`:

```yaml
  - claim: groups
    value: <direct-group-email>
    roles:
      - oidc-direct-test
```

Validate and apply the edited connector:

```bash
"$WORKDIR/build/bootstrap-oidc-validator" resources \
  "$GROUP_CONNECTOR" \
  "$WORKDIR/cluster-auth-preference-oidc.yaml"

"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  create -f "$GROUP_CONNECTOR"
```

Close all prior sessions. Open the exact OIDC URL in a new private window. Sign in as `<test-email>`.

If the browser does not reach `/web`, record only the sanitized lookup class from the audit event. Do not add an Admin SDK scope, service account, or domain-wide delegation. Start rollback.

Verify the exact effective roles from the operator shell:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  get 'user/<test-email>' --format=json |
  jq -e '
    length == 1 and
    ((.[0].spec.roles // []) | sort) ==
    ["oidc-direct-test", "oidc-email-test"]'
```

This check proves the direct group mapping. It also proves that the email mapping remains active.

### 12. Add and test the nested group mapping

Use the same isolated editor settings. Do not use a normal editor as a fallback.

```bash
command -v vim >/dev/null 2>&1
HOME="$VIM_HOME" \
XDG_CONFIG_HOME="$VIM_HOME" \
XDG_DATA_HOME="$VIM_HOME" \
XDG_STATE_HOME="$VIM_HOME" \
  vim -Nu NONE -n -i NONE --noplugin \
  -c 'set nocompatible secure nomodeline noloadplugins' \
  -c 'set noswapfile noundofile nobackup nowritebackup' \
  -c 'set viminfo= clipboard=' \
  -- "$GROUP_CONNECTOR"
chmod 0600 "$GROUP_CONNECTOR"
```

Keep the direct and email mappings. Add this nested mapping under `spec.claims_to_roles`:

```yaml
  - claim: groups
    value: <nested-group-email>
    roles:
      - oidc-nested-test
```

Validate and apply the connector:

```bash
"$WORKDIR/build/bootstrap-oidc-validator" resources \
  "$GROUP_CONNECTOR" \
  "$WORKDIR/cluster-auth-preference-oidc.yaml"

"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  create -f "$GROUP_CONNECTOR"
```

Close all prior sessions. Open the exact OIDC URL in a new private window. Sign in as `<test-email>`.

If the browser does not reach `/web`, record only the sanitized lookup class from the audit event. Do not add an Admin SDK scope, service account, or domain-wide delegation. Start rollback.

Verify the exact effective roles from the operator shell:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  get 'user/<test-email>' --format=json |
  jq -e '
    length == 1 and
    ((.[0].spec.roles // []) | sort) ==
    ["oidc-direct-test", "oidc-email-test", "oidc-nested-test"]'
```

This check proves the nested group mapping. It also proves that token-provided groups did not add another role.

### 13. Test the controlled HTTP 403 fallback

Use only an approved identity with a known Cloud Identity visibility or edition restriction. The restriction must produce HTTP 403 without a permission change.

Do not weaken Google permissions to force this test. Do not add an Admin SDK scope, service account, or domain-wide delegation.

Before the login, use the isolated editor to add an email mapping for `<403-fallback-email>`:

```bash
command -v vim >/dev/null 2>&1
HOME="$VIM_HOME" \
XDG_CONFIG_HOME="$VIM_HOME" \
XDG_DATA_HOME="$VIM_HOME" \
XDG_STATE_HOME="$VIM_HOME" \
  vim -Nu NONE -n -i NONE --noplugin \
  -c 'set nocompatible secure nomodeline noloadplugins' \
  -c 'set noswapfile noundofile nobackup nowritebackup' \
  -c 'set viminfo= clipboard=' \
  -- "$GROUP_CONNECTOR"
chmod 0600 "$GROUP_CONNECTOR"
```

Map the fallback email only to `oidc-email-test`:

```yaml
  - claim: email
    value: <403-fallback-email>
    roles:
      - oidc-email-test
```

Validate and apply the connector:

```bash
"$WORKDIR/build/bootstrap-oidc-validator" resources \
  "$GROUP_CONNECTOR" \
  "$WORKDIR/cluster-auth-preference-oidc.yaml"

"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  create -f "$GROUP_CONNECTOR"
```

Close all prior sessions. Open the exact OIDC URL in a new private window. Sign in as `<403-fallback-email>`.

The browser must reach `/web`. Verify the exact fallback role set from the operator shell:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  get 'user/<403-fallback-email>' --format=json |
  jq -e '
    length == 1 and
    ((.[0].spec.roles // []) | sort) == ["oidc-email-test"]'
```

The user must not have `oidc-direct-test` or `oidc-nested-test`.

Before the denied test, confirm that `<403-denied-email>` has no email mapping. Query all users successfully. Then confirm that no matching user record exists:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  get users --format=json >"$WORKDIR/users-before-403-denial.json"
chmod 0600 "$WORKDIR/users-before-403-denial.json"
jq -e '
  all(.[]; .metadata.name != "<403-denied-email>")
' "$WORKDIR/users-before-403-denial.json" >/dev/null
```

Close all prior sessions. Open the exact OIDC URL in a new private window. Sign in as `<403-denied-email>`.

The browser must show access denied. It must not reach `/web` or create a web session.

Confirm again that no user record exists:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  get users --format=json >"$WORKDIR/users-after-403-denial.json"
chmod 0600 "$WORKDIR/users-after-403-denial.json"
jq -e '
  all(.[]; .metadata.name != "<403-denied-email>")
' "$WORKDIR/users-after-403-denial.json" >/dev/null
```

If no safe identity produces HTTP 403, stop and start rollback. Record the test as blocked. Do not permit another user's access.

### 14. Check the local JSONL audit log

The test has exactly six OIDC scenarios in this order:

1. First email login.
2. Repeat email login.
3. Direct group login.
4. Nested group login.
5. HTTP 403 email fallback.
6. HTTP 403 denial without an email mapping.

Capture the unit journal in a protected file before any log scan. Filter by the verified systemd invocation:

```bash
verify_teleport_unit
JOURNAL_FILE="$WORKDIR/teleport-journal.jsonl"
JOURNAL_TEMP=$(mktemp "$WORKDIR/teleport-journal.XXXXXX")
chmod 0600 "$JOURNAL_TEMP"
journalctl --user --quiet --no-pager --output=json \
  "_SYSTEMD_INVOCATION_ID=$TELEPORT_INVOCATION_ID" \
  >"$JOURNAL_TEMP"
mv -- "$JOURNAL_TEMP" "$JOURNAL_FILE"
chmod 0600 "$JOURNAL_FILE"
```

Copy the local JSONL audit log. Do not use `tctl events ls`, which is not available in this build.

```bash
test "$(date -u +%F)" = "$OIDC_SCENARIO_UTC_DAY"
AUDIT_SOURCE="$WORKDIR/data/log/events.log"
test -f "$AUDIT_SOURCE"
test ! -L "$AUDIT_SOURCE" || test -f "$(readlink -e -- "$AUDIT_SOURCE")"
cp --dereference -- "$AUDIT_SOURCE" "$WORKDIR/oidc-audit-all.jsonl"
chmod 0600 "$WORKDIR/oidc-audit-all.jsonl"

jq -c '
  select(.event == "user.login" and .method == "oidc")
' "$WORKDIR/oidc-audit-all.jsonl" \
  >"$WORKDIR/oidc-audit.jsonl"
chmod 0600 "$WORKDIR/oidc-audit.jsonl"
```

Require exactly six OIDC login events. Check the fixed fields for each scenario:

```bash
jq -e -s '
  length == 6 and
  all(.[ ];
    .event == "user.login" and
    .method == "oidc" and
    .connector_id == "google" and
    (.attributes.role_source | type) == "string" and
    (.attributes.google_group_lookup | type) == "string") and
  (.[0] |
    .success == true and
    .user == "<test-email>" and
    .attributes.role_source == "email" and
    .attributes.google_group_lookup == "not_required") and
  (.[1] |
    .success == true and
    .user == "<test-email>" and
    .attributes.role_source == "email" and
    .attributes.google_group_lookup == "not_required") and
  (.[2] |
    .success == true and
    .user == "<test-email>" and
    .attributes.role_source == "both" and
    .attributes.google_group_lookup == "succeeded") and
  (.[3] |
    .success == true and
    .user == "<test-email>" and
    .attributes.role_source == "both" and
    .attributes.google_group_lookup == "succeeded") and
  (.[4] |
    .success == true and
    .user == "<403-fallback-email>" and
    .attributes.role_source == "email" and
    .attributes.google_group_lookup == "failed" and
    .attributes.google_group_lookup_error == "permission_denied") and
  (.[5] |
    .success == false and
    (.user // "") == "" and
    .error == "role_mapping_failed" and
    .attributes.role_source == "none" and
    .attributes.google_group_lookup == "failed" and
    .attributes.google_group_lookup_error == "permission_denied")
' "$WORKDIR/oidc-audit.jsonl" >/dev/null
```

Scan fixed forbidden log shapes. This scan detects token fields, bearer headers, callback queries, and offline access requests:

```bash
FORBIDDEN_LOG_SHAPE_RE='"(access_token|refresh_token|id_token|client_secret)"|Authorization:[[:space:]]*Bearer|[?&](code|state)=|offline_access'
LOG_SHAPE_SCAN_FAILED=0
for SCAN_FILE in \
  "$JOURNAL_FILE" \
  "$WORKDIR/oidc-audit-all.jsonl" \
  "$WORKDIR/oidc-audit.jsonl"; do
  if grep -Eq -q "$FORBIDDEN_LOG_SHAPE_RE" "$SCAN_FILE"; then
    printf 'ERROR: Forbidden callback or token shape in %s\n' "$SCAN_FILE" >&2
    LOG_SHAPE_SCAN_FAILED=1
  else
    GREP_STATUS=$?
    if [[ "$GREP_STATUS" -ne 1 ]]; then
      printf 'ERROR: Log-shape scan failed for %s\n' "$SCAN_FILE" >&2
      LOG_SHAPE_SCAN_FAILED=1
    fi
  fi
done
test "$LOG_SHAPE_SCAN_FAILED" -eq 0
```

The fixed scan does not require an operator to capture a live token or callback value.

### 15. Scan for test secrets

The automated fake-provider tests verify planted authorization-code, state, access-token, and provider-body sentinels. The release test gate ran those tests.

Do not capture a live authorization code, OAuth state, access token, or provider response body. Do not ask an operator to copy these values.

Read the known client secret first. Then add any non-token test secrets to the protected pattern file:

```bash
PATTERN_FILE=$(mktemp "$WORKDIR/secret-patterns.XXXXXX")
chmod 0600 "$PATTERN_FILE"

printf 'Google client secret: ' >&2
IFS= read -rs SECRET_VALUE
printf '\n' >&2
test -n "$SECRET_VALUE"
printf '%s\n' "$SECRET_VALUE" >"$PATTERN_FILE"
unset SECRET_VALUE

while true; do
  printf 'Optional non-token test secret, or Enter to finish: ' >&2
  IFS= read -rs SECRET_VALUE
  printf '\n' >&2
  test -n "$SECRET_VALUE" || break
  printf '%s\n' "$SECRET_VALUE" >>"$PATTERN_FILE"
  unset SECRET_VALUE
done
```

Require the client-secret pattern. Scan quietly. Print only the name of a file that has a match.

```bash
test -s "$PATTERN_FILE"
SECRET_SCAN_FAILED=0
scan_secret_file() {
  local display_name=$1
  local file_name=$2
  local grep_status

  if grep -Fq -f "$PATTERN_FILE" -- "$file_name"; then
    printf 'ERROR: Secret match in %s\n' "$display_name" >&2
    SECRET_SCAN_FAILED=1
  else
    grep_status=$?
    if [[ "$grep_status" -ne 1 ]]; then
      printf 'ERROR: Secret scan failed for %s\n' "$display_name" >&2
      SECRET_SCAN_FAILED=1
    fi
  fi
}

for SCAN_FILE in \
  "$JOURNAL_FILE" \
  "$WORKDIR/oidc-audit-all.jsonl" \
  "$WORKDIR/oidc-audit.jsonl"; do
  scan_secret_file "$SCAN_FILE" "$SCAN_FILE"
done

SECRET_SCAN_LIST="$WORKDIR/secret-scan-files.bin"
IGNORED_SECRET_SCAN_LIST="$WORKDIR/ignored-secret-scan-files.bin"
if ! git -C "$REPO" ls-files -z --cached --others --exclude-standard \
  >"$SECRET_SCAN_LIST"; then
  printf 'ERROR: Source-file enumeration failed.\n' >&2
  false
fi
if ! git -C "$REPO" ls-files -z --others --ignored --exclude-standard \
  >"$IGNORED_SECRET_SCAN_LIST"; then
  printf 'ERROR: Ignored-file enumeration failed.\n' >&2
  false
fi
chmod 0600 "$SECRET_SCAN_LIST" "$IGNORED_SECRET_SCAN_LIST"
for SOURCE_LIST in "$SECRET_SCAN_LIST" "$IGNORED_SECRET_SCAN_LIST"; do
  while IFS= read -r -d '' SCAN_FILE; do
    if [[ -L "$REPO/$SCAN_FILE" ]]; then
      continue
    fi
    test -f "$REPO/$SCAN_FILE"
    scan_secret_file "$SCAN_FILE" "$REPO/$SCAN_FILE"
  done <"$SOURCE_LIST"
done

test "$SECRET_SCAN_FAILED" -eq 0
cleanup_sensitive_temporary_files
```

A secret match causes the installed containment trap to remove the connector and recovery identity when possible. The trap stops the complete Teleport unit before shell exit. Revoke the affected credential. Remove the leaked value from every copy before a later test.

## Verification

Before another user gets access, confirm all of these results:

- Human rewrite and verification are complete.
- The test gate passed the focused, race, package, vet, frontend, type-check, build, validator, configure, Bash, and ShellCheck commands.
- The public remote tag peels to the release commit.
- A public repository ruleset makes the release tag protected and non-movable.
- Public `master` contains the release commit.
- The tagged license, provenance, runbook, build plan, bootstrap script, and source archive need no authentication.
- The login interface has the required public `master` source and license links.
- A human reviewed the full runtime diff and all dependency changes.
- The supplemental runtime regex scan found no forbidden credential, delegation, service-account token, refresh-token, or offline-access code.
- The Tailscale identity matches the approved values.
- Tailscale access stayed operator-only until the listener checks passed.
- The certificate matches the Tailscale DNS name.
- The config and resources pass syntax and semantic validation.
- The binary hashes and versions are in the protected deployment log.
- The systemd unit control group has exactly one process.
- The process has exactly the two approved IPv4 TCP listeners.
- The process has no IPv6 TCP or UDP listener and no IPv4 UDP listener.
- Local break-glass login works.
- The three OIDC test roles have no allowed permissions.
- The first and repeat email logins have only `oidc-email-test`.
- The stable subject is equal before and after the repeat login.
- The direct login has only `oidc-email-test` and `oidc-direct-test`.
- The nested login has only the three test roles.
- HTTP 403 grants only `oidc-email-test` to the mapped fallback user.
- HTTP 403 grants no role and no session to the unmapped user.
- Exactly six OIDC audit events have the expected fixed fields.
- The audit events contain no raw provider or callback values.
- Secret scans have no matches.

If any result fails, do not permit another user's access. The installed trap contains command failures.

If the shell is still active, start rollback for a controlled stop. If containment already stopped the unit, first restore the Tailscale policy to operator-only and revoke the Google client. Do not restart the unit only to clean its disposable state. Preserve the work directory and external deployment log for a human-reviewed cleanup.

## Rollback

### 1. Restore local authentication

Create a protected local authentication preference:

```bash
LOCAL_AUTH_PREFERENCE="$WORKDIR/cluster-auth-preference-local.yaml"
cat >"$LOCAL_AUTH_PREFERENCE" <<'EOF'
kind: cluster_auth_preference
version: v2
metadata:
  name: cluster-auth-preference
spec:
  type: local
  allow_local_auth: true
  second_factors:
    - otp
EOF
chmod 0600 "$LOCAL_AUTH_PREFERENCE"
```

Apply it:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  create -f "$LOCAL_AUTH_PREFERENCE"
```

Complete a new local break-glass login. Do not continue until local recovery works.

### 2. Remove the OIDC connector idempotently

Remove the connector only if it exists. A not-found result must not prevent process shutdown.

```bash
if timeout --signal=TERM --kill-after=5s 10s \
  "$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  get oidc/google >/dev/null 2>&1; then
  if ! timeout --signal=TERM --kill-after=5s 10s \
    "$WORKDIR/build/tctl" \
    --config="$WORKDIR/teleport.yaml" \
    rm oidc/google; then
    printf 'WARNING: Connector removal failed. Process shutdown will continue.\n' >&2
  fi
fi
```

Confirm that the login page no longer offers the Google connector. Confirm that local login still works.

### 3. Remove the recovery identity and stop the unit

Remove the temporary recovery user and role while the local authentication preference is active:

```bash
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  rm user/teleport-admin
"$WORKDIR/build/tctl" \
  --config="$WORKDIR/teleport.yaml" \
  rm role/oidc-recovery
RECOVERY_USER_CREATED=0
RECOVERY_ROLE_CREATED=0
```

Verify the same unit and stop its complete control group:

```bash
verify_teleport_unit
STOPPED_TELEPORT_PID=$TELEPORT_PID
STOPPED_TELEPORT_CGROUP_DIR=$TELEPORT_CGROUP_DIR
stop_teleport_unit
! systemctl --user is-active --quiet "$TELEPORT_UNIT"
if [[ -d "$STOPPED_TELEPORT_CGROUP_DIR" ]]; then
  grep -Fxq 'populated 0' "$STOPPED_TELEPORT_CGROUP_DIR/cgroup.events"
fi
```

Confirm that the stopped process has no IPv4 or IPv6 TCP or UDP listener:

```bash
for SS_ARGS in '-ltnp4' '-ltnp6' '-lunp4' '-lunp6'; do
  SS_OUTPUT=$(sudo ss -H "$SS_ARGS")
  if awk -v pid="$STOPPED_TELEPORT_PID" \
    '$0 ~ ("pid=" pid ",") {found=1} END {exit !found}' \
    <<<"$SS_OUTPUT"; then
    printf 'ERROR: The stopped Teleport unit still has a listener.\n' >&2
    false
  fi
done
unset SS_OUTPUT
systemctl --user reset-failed "$TELEPORT_UNIT" >/dev/null 2>&1 || :
```

Disarm containment only after the unit and listener checks pass:

```bash
CONTAINMENT_ARMED=0
cleanup_sensitive_temporary_files
```

### 4. Revoke the Google client

Delete the temporary OAuth client in the Google Cloud console. If deletion is delayed, rotate its secret first.

Remove the test users from the consent screen. Disable the Cloud Identity API if no approved workload uses it.

Restore the Tailscale policy to operator-only. Remove any temporary node rule that is no longer required.

### 5. Delete the work directory

Run this deletion only on an operator-owned isolated host. Do not use this deletion procedure on a shared host.

Confirm that Teleport has stopped. Confirm that no other service uses the copied certificate files.

Verify the unchanged deletion target. Reject the root directory, home directory, source tree, and source descendants:

```bash
CANONICAL_REPO=$(realpath -e -- "$REPO")
CANONICAL_HOME=$(realpath -e -- "$HOME")
test "$CANONICAL_WORKDIR" = "$WORKDIR"
test "$CANONICAL_WORKDIR" != /
test "$CANONICAL_WORKDIR" != "$CANONICAL_HOME"
test -d "$CANONICAL_WORKDIR"
test ! -L "$CANONICAL_WORKDIR"
test "$(stat -c '%d:%i' -- "$CANONICAL_WORKDIR")" = "$WORKDIR_DEVICE_INODE"
test -f "$CANONICAL_WORKDIR/.runbook-deployment-marker"
test ! -L "$CANONICAL_WORKDIR/.runbook-deployment-marker"
test "$(cat "$CANONICAL_WORKDIR/.runbook-deployment-marker")" = "$RUNBOOK_MARKER"
case "$CANONICAL_WORKDIR" in
  "$CANONICAL_REPO"|"$CANONICAL_REPO"/*) exit 1 ;;
esac
```

Use JSON output to check decoded mount targets immediately before deletion. Reject a mount target equal to or below the canonical work directory.

```bash
MOUNT_JSON=$(mktemp "${TMPDIR:-/tmp}/teleport-mounts.XXXXXX.json")
chmod 0600 "$MOUNT_JSON"
if ! findmnt --json --output TARGET --submounts \
  --target "$CANONICAL_WORKDIR" >"$MOUNT_JSON"; then
  printf 'ERROR: Mount enumeration failed.\n' >&2
  false
fi
test -s "$MOUNT_JSON"
jq -e --arg root "$CANONICAL_WORKDIR" '
  (.filesystems | type) == "array" and
  (.filesystems | length) >= 1 and
  ([.. | objects | .target? // empty |
    select(. == $root or startswith($root + "/"))] | length) == 0
' "$MOUNT_JSON" >/dev/null
rm -f -- "$MOUNT_JSON"
```

Delete only the approved work directory:

```bash
rm -rf --one-file-system -- "$CANONICAL_WORKDIR"
test ! -e "$CANONICAL_WORKDIR"
```

Confirm that ports `3025` and `3080` have no TCP listener on the Tailscale address:

```bash
FINAL_TCP_LISTENERS=$(sudo ss -H -ltnp4)
if awk -v auth="$TAILSCALE_IP:3025" -v proxy="$TAILSCALE_IP:3080" \
  '$4 == auth || $4 == proxy {found=1} END {exit !found}' \
  <<<"$FINAL_TCP_LISTENERS"; then
  printf 'ERROR: A Tailscale deployment listener remains.\n' >&2
  false
fi
unset FINAL_TCP_LISTENERS
```
