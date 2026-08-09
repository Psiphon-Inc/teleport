# syntax=docker/dockerfile:1
#
# UNBUILT, UNVERIFIED. No docker daemon was available while this file was
# written (see /tmp/oidc-verify/19-activation-k8s.md, section 3). It has
# never been built, and its output has never been run. Treat every stage as
# a starting point to prove out, not a working artifact.
#
# Builds the fork binary, tool/teleport-google, which is
# tool/teleport/main.go plus the Google OIDC activation gate
# (TELEPORT_ENABLE_GOOGLE_OIDC). It replaces the upstream teleport image, the
# way build.assets/charts/Dockerfile-distroless replaces a .deb-based image
# with a distroless one:
#   - same runtime base image (BASE_IMAGE, distroless/cc-debian12 by default)
#     as build.assets/charts/Dockerfile-distroless, so the fork ships the same
#     glibc/libstdc++ runtime shape as the upstream distroless image;
#   - the binary is installed as /usr/local/bin/teleport, the exact path and
#     name the upstream image uses. This is required, not cosmetic: the Helm
#     chart's container ENTRYPOINT and its preStop lifecycle hook both invoke
#     a binary named "teleport" on PATH (see the Helm/chart compatibility
#     section of the report), and neither is overridden by chart values.
#
# What this Dockerfile deliberately leaves out, compared to
# build.assets/Dockerfile's `make full` build of $(BUILDDIR)/teleport:
#   - PAM, FIPS, BPF (restricted sessions/enhanced recording), desktop_access_rdp
#     and piv build tags. Each needs a native toolchain (libpam, libbpf, a Rust
#     toolchain for the RDP client, PC/SC for PIV) that a minimal build stage
#     does not carry. None of them are needed to run the Auth and Proxy
#     services this fork's OIDC login flow depends on; they matter for SSH/PAM
#     integration, BPF-based enhanced session recording, Desktop Access, and
#     hardware-key (PIV) support respectively. A production build must decide
#     whether any of those are required and add the matching build stage and
#     tag, mirroring build.assets/Dockerfile and its buildbox.
#   - The `grpcnotrace webassets_embed` tags ARE kept, deliberately. Without
#     webassets_embed the binary has no embedded Proxy web UI, and this fork's
#     browser-only Google login (see lib/googleoidc/webhandlers.go) has
#     nothing to redirect the browser into. This is the one build tag that is
#     load-bearing for the feature this Dockerfile exists to ship, so the
#     webassets stage below is not optional the way the others are.
#
# The chart's predeploy job runs `teleport configure --test /etc/teleport/teleport.yaml`
# and the container's preStop hook runs `teleport wait duration 30s`, both by
# invoking a bare `teleport` on PATH. Both commands, along with `start`, are
# handled inside tool/teleport/common.Run, which this fork's main() calls
# unchanged, so they work exactly as they do in the upstream binary.

ARG BASE_IMAGE=gcr.io/distroless/cc-debian12
ARG GO_VERSION=1.26.5
ARG NODE_VERSION=22

## WEBASSETS ##################################################################
# Builds the Proxy web UI. This mirrors `make ensure-webassets`, which the
# upstream build runs before compiling with the webassets_embed tag. The real
# target also stages logo SVGs and can be skipped with WEBASSETS_SKIP_BUILD;
# see Makefile:1932. This stage does not do the SVG staging or the skip path,
# so treat the yarn build command as a starting point, not a proven command.
FROM node:${NODE_VERSION}-bookworm AS webassets

WORKDIR /go/src/github.com/gravitational/teleport
COPY web/ web/
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

# UNVERIFIED: the exact yarn invocation that produces webassets/ was not run.
# Cross-check against Makefile's ensure-webassets target and web/packages/teleport's
# build script before relying on this stage.
RUN corepack enable && yarn install --immutable && yarn build

## BUILDER #####################################################################
FROM golang:${GO_VERSION}-bookworm AS builder

WORKDIR /go/src/github.com/gravitational/teleport
COPY . .
COPY --from=webassets /go/src/github.com/gravitational/teleport/webassets ./webassets

ENV CGO_ENABLED=1
ENV GOFLAGS=-buildvcs=false

# grpcnotrace, webassets_embed: see the header comment above for why these two
# are kept and the others are not.
RUN go build \
    -tags "grpcnotrace webassets_embed" \
    -o /out/teleport \
    ./tool/teleport-google

## RUNTIME #####################################################################
FROM debian:12 AS staging
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates dumb-init && \
    rm -rf /var/lib/apt/lists/*

FROM ${BASE_IMAGE}
COPY --from=staging /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=staging /etc/ssl/certs /etc/ssl/certs
COPY --from=builder /out/teleport /usr/local/bin/teleport

ENV TELEPORT_TOOLS_VERSION=off

# Same signal contract as build.assets/charts/Dockerfile-distroless.
# See https://goteleport.com/docs/reference/signals/
STOPSIGNAL SIGQUIT

# Deliberately identical to build.assets/charts/Dockerfile-distroless's
# ENTRYPOINT: the chart appends flags via `args:` and never sets `command:`
# (see the Helm compatibility section of the report), so this is what
# actually runs in the auth/proxy pod once the image override in
# values.yaml:image points here.
ENTRYPOINT ["/usr/bin/dumb-init", "/usr/local/bin/teleport", "start", "-c", "/etc/teleport/teleport.yaml"]
