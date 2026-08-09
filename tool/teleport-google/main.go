/*
 * Psiphon Access
 * Copyright (C) 2026  Psiphon Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Command teleport-google is the fork entrypoint. It is byte-for-byte the
// upstream tool/teleport/main.go, with one addition: it can turn on the fork
// Google Workspace OIDC feature before the Teleport process is built.
//
// The binary is a drop-in replacement for tool/teleport/main.go. Every
// subcommand, flag, and config file field common.Run understands is
// unchanged, because this file calls the same common.Run with the same
// Options.Args. The only new behaviour is gated by GoogleOIDCEnableEnvVar and
// runs before common.Run.
package main

import (
	"fmt"
	"os"
	"strconv"

	_ "github.com/gravitational/teleport/lib/fipscheck"
	"github.com/gravitational/teleport/lib/googleoidc"
	"github.com/gravitational/teleport/lib/modules"
	"github.com/gravitational/teleport/lib/observability/metrics"
	"github.com/gravitational/teleport/lib/plugin"
	"github.com/gravitational/teleport/session/reexec"
	"github.com/gravitational/teleport/tool/teleport/common"
)

// GoogleOIDCEnableEnvVar turns the fork Google Workspace OIDC feature on. It
// is unset, and the feature is off, by default: a fork operator who does not
// need Google OIDC runs this exact binary with no behaviour change from
// upstream teleport.
//
// The value is parsed with strconv.ParseBool ("1", "t", "true", "yes" and
// their opposites, case-insensitively for the alphabetic forms; see the
// standard library for the exact grammar). A value that is set but does not
// parse is a configuration mistake, not "feature off", so the process exits
// instead of silently running with the gate closed.
const GoogleOIDCEnableEnvVar = "TELEPORT_ENABLE_GOOGLE_OIDC"

func init() {
	metrics.RegisterPrometheusCollectors(metrics.BuildCollector())
}

func main() {
	// MaybeReexec must run before anything else in this file, including the
	// activation check below. When os.Args[1] names a reexec subcommand
	// (exec, networking, park, ...), this process is not "teleport" at all:
	// it is a short-lived helper an already-running Teleport process spawned
	// to do one privileged, security-sensitive thing (run a session command
	// as another user, set up networking namespaces, ...) and MaybeReexec
	// calls RunAndExit and never returns. That path must not build a plugin
	// registry, touch the process-wide modules value, or parse the OIDC
	// activation env var: it is unrelated work the reexec helper does not
	// need, and running it would make the security-sensitive path depend on
	// fork-only code for no reason.
	reexec.MaybeReexec()

	registry := activateGoogleOIDC()

	common.Run(common.Options{
		Args:           os.Args[1:],
		PluginRegistry: registry,
	})
}

// activateGoogleOIDC reads GoogleOIDCEnableEnvVar. When it is unset or false,
// it returns nil and common.Run gets no plugin registry, exactly as upstream
// tool/teleport/main.go behaves today. When it is true, it wires the fork
// Google OIDC feature into the process that common.Run is about to build and
// returns the registry common.Options.PluginRegistry must carry.
//
// Both halves of the activation run together, and only here:
//
//  1. modules.SetModules installs the wrapper that reports the OIDC
//     entitlement as enabled. It must run before service.NewTeleport, which
//     runs inside common.Run: the auth server copies modules.GetModules() at
//     construction time, so a call after that point has no effect.
//  2. The plugin registry, with the fork plugin added, is returned for the
//     caller to assign to common.Options.PluginRegistry, so common.Run passes
//     it into servicecfg.Config.PluginRegistry instead of the empty default
//     registry service.NewTeleport would otherwise create.
//
// The two halves are kept on the same gate on purpose.
// lib/googleoidc/plugin.go's InitAuthProcess asserts that the OIDC
// entitlement is live every time the plugin is registered, and fails the
// process loudly if it is not (see AssertOIDCEntitlement in
// lib/googleoidc/modules.go). Registering the plugin without the wrapper
// would trip that assertion on every run; installing the wrapper without the
// plugin would leave the entitlement open with no route to use it. Flipping
// one env var must not be able to produce either half-activated state, so
// there is exactly one flag, not two.
func activateGoogleOIDC() plugin.Registry {
	raw, isSet := os.LookupEnv(GoogleOIDCEnableEnvVar)
	if !isSet {
		return nil
	}

	enabled, err := strconv.ParseBool(raw)
	if err != nil {
		fmt.Fprintf(os.Stderr,
			"teleport-google: invalid %s=%q: %v (use true/false, 1/0, t/f, yes/no)\n",
			GoogleOIDCEnableEnvVar, raw, err)
		os.Exit(1)
	}
	if !enabled {
		return nil
	}

	modules.SetModules(googleoidc.WithOIDC(modules.GetModules()))

	registry := plugin.NewRegistry()
	if err := googleoidc.Install(registry); err != nil {
		fmt.Fprintf(os.Stderr, "teleport-google: failed to install the Google OIDC plugin: %v\n", err)
		os.Exit(1)
	}

	fmt.Fprintln(os.Stderr, "teleport-google: Google Workspace OIDC is enabled ("+GoogleOIDCEnableEnvVar+"=true)")
	return registry
}
