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

package main

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/gravitational/teleport/entitlements"
	"github.com/gravitational/teleport/lib/googleoidc"
	"github.com/gravitational/teleport/lib/modules"
)

// restoreModules puts the process-wide modules value back after a test. The
// activation path installs a wrapper globally, so a test that does not restore
// it leaks the entitlement into every later test in this package.
func restoreModules(t *testing.T) {
	t.Helper()
	previous := modules.GetModules()
	t.Cleanup(func() { modules.SetModules(previous) })
}

func oidcEntitlementLive() bool {
	return modules.GetModules().Features().GetEntitlement(entitlements.OIDC).Enabled
}

// TestActivateGoogleOIDCCallsTheRealEntrypoint calls activateGoogleOIDC itself
// rather than reproducing what it does.
//
// lib/googleoidc/activation_test.go re-creates the same two steps in order, so
// it proves the library supports the wiring. It cannot prove that main.go
// still performs it: deleting modules.SetModules from activateGoogleOIDC
// leaves that test green. This test is the one that fails when the entrypoint
// stops activating the feature.
func TestActivateGoogleOIDCCallsTheRealEntrypoint(t *testing.T) {
	t.Run("enabled installs the wrapper and registers the plugin", func(t *testing.T) {
		restoreModules(t)
		t.Setenv(GoogleOIDCEnableEnvVar, "true")

		require.False(t, oidcEntitlementLive(),
			"precondition: the OIDC entitlement must be closed before activation")

		registry := activateGoogleOIDC()

		require.NotNil(t, registry, "activation must return a registry to hand to common.Run")
		require.True(t, oidcEntitlementLive(),
			"activateGoogleOIDC must install the entitlement wrapper, or the gate stays shut")
		require.True(t, registry.IsRegistered(googleoidc.PluginName),
			"activateGoogleOIDC must register the fork plugin, or no OIDC route is served")
	})

	t.Run("unset leaves the process untouched", func(t *testing.T) {
		restoreModules(t)

		require.Nil(t, activateGoogleOIDC(),
			"an unset flag must not build a registry")
		require.False(t, oidcEntitlementLive(),
			"an unset flag must leave the OIDC entitlement closed")
	})

	t.Run("explicitly false leaves the process untouched", func(t *testing.T) {
		restoreModules(t)
		t.Setenv(GoogleOIDCEnableEnvVar, "false")

		require.Nil(t, activateGoogleOIDC(),
			"a false flag must not build a registry")
		require.False(t, oidcEntitlementLive(),
			"a false flag must leave the OIDC entitlement closed")
	})
}
