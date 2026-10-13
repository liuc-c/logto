import type { Branding } from '@logto/schemas';
import { Theme } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';

import { logoDark, logoLight, resolveBuiltInLogo } from '../branding/assets';

export type GetLogoUrl = {
  theme: Theme;
  logoUrl: string;
  darkLogoUrl?: Nullable<string>;
};

export const getLogoUrl = ({ theme, logoUrl, darkLogoUrl }: GetLogoUrl) => {
  if (theme === Theme.Dark) {
    return darkLogoUrl ?? logoUrl;
  }

  return logoUrl;
};

export type GetBrandingLogoUrl = {
  theme: Theme;
  branding: Branding;
  isDarkModeEnabled: boolean;
};

export const getBrandingLogoUrl = ({ theme, branding, isDarkModeEnabled }: GetBrandingLogoUrl) => {
  const { logoUrl, darkLogoUrl } = branding;
  const defaultLogo = isDarkModeEnabled && theme === Theme.Dark ? logoDark : logoLight;

  if (!isDarkModeEnabled) {
    return resolveBuiltInLogo(logoUrl) ?? defaultLogo;
  }

  if (!logoUrl && !darkLogoUrl) {
    return defaultLogo;
  }

  if (logoUrl && darkLogoUrl) {
    return resolveBuiltInLogo(getLogoUrl({ theme, logoUrl, darkLogoUrl }));
  }

  const resolvedLogo = resolveBuiltInLogo(logoUrl) ?? resolveBuiltInLogo(darkLogoUrl);

  // A single legacy default still has both bundled theme variants available.
  if (resolvedLogo === logoLight || resolvedLogo === logoDark) {
    return defaultLogo;
  }

  return resolvedLogo ?? defaultLogo;
};
