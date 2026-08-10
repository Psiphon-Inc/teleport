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

import { MC_THEME, type UiTheme } from '@gravitational/design-system';

import { lightTheme, type ThemeDefinition } from 'design/theme';

/**
 * PSIPHON_THEME_NAME is the value the Auth Service sends as
 * Features.CustomTheme, set by the fork modules wrapper in lib/googleoidc. The
 * proxy passes it to the browser as webConfig.customTheme, and ThemeProvider
 * selects a theme by that name.
 */
export const PSIPHON_THEME_NAME = 'psiphon';

/**
 * psiphonUiTheme is the modern, Chakra-based theme.
 *
 * It borrows MC_THEME's config rather than authoring a new Chakra SystemConfig.
 * MC_THEME is itself TELEPORT_THEME.config with the colour mode forced to light,
 * so this inherits a configuration that is known to be valid and complete, and
 * changes only the name. Authoring the Psiphon token set properly means
 * rewriting that config against the --_psix-* tokens: accent #D95F33, pure white
 * surface, pure black text and borders, and the Inter typeface. That is a design
 * exercise rather than a rename, so it is deliberately not attempted here.
 *
 * Forcing light is not a placeholder. The Psiphon visual language is a light,
 * high-contrast one, and a half-branded dark mode would look like a defect.
 * UiThemeMode.ForcedColor also makes ThemeProvider ignore the user's light or
 * dark preference, so the UI cannot be put into that state.
 */
export const psiphonUiTheme: UiTheme = {
  ...MC_THEME,
  name: PSIPHON_THEME_NAME,
};

/**
 * psiphonLegacyTheme is the styled-components theme that older components still
 * read. isCustomTheme does double duty: it marks the theme as bespoke, and
 * UserMenuNav uses it to hide the light and dark switcher, which would otherwise
 * offer a mode this theme does not have.
 */
export const psiphonLegacyTheme: ThemeDefinition = {
  ...lightTheme,
  isCustomTheme: true,
};
