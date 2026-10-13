import { Theme } from '@logto/schemas';

import { logoDark, logoLight } from '../branding/assets';

import { getBrandingLogoUrl, getLogoUrl } from './logo';

jest.mock('../branding/assets/logo-intro-light.svg?url', () => 'built-in-light.svg');
jest.mock('../branding/assets/logo-intro-dark.svg?url', () => 'built-in-dark.svg');

describe('personal branding defaults', () => {
  const branding = {
    logoUrl: 'https://logto.io/logo.svg',
    darkLogoUrl: 'https://logto.io/logo-dark.svg',
  };

  it.each([
    [Theme.Light, logoLight],
    [Theme.Dark, logoDark],
  ])('resolves the legacy default for %s without changing stored branding', (theme, expected) => {
    expect(getBrandingLogoUrl({ theme, branding, isDarkModeEnabled: true })).toBe(expected);
    expect(branding.logoUrl).toBe('https://logto.io/logo.svg');
    expect(branding.darkLogoUrl).toBe('https://logto.io/logo-dark.svg');
  });

  it('preserves custom logos and dark-mode selection', () => {
    const customBranding = { logoUrl: 'custom.svg', darkLogoUrl: 'custom-dark.svg' };
    expect(
      getBrandingLogoUrl({ theme: Theme.Dark, branding: customBranding, isDarkModeEnabled: true })
    ).toBe('custom-dark.svg');
    expect(
      getBrandingLogoUrl({ theme: Theme.Dark, branding: customBranding, isDarkModeEnabled: false })
    ).toBe('custom.svg');
    expect(getBrandingLogoUrl({ theme: Theme.Dark, branding, isDarkModeEnabled: false })).toBe(
      logoLight
    );
  });

  it.each([{}, { logoUrl: '', darkLogoUrl: '' }])(
    'uses bundled variants for unset branding %s',
    (branding) => {
      expect(getBrandingLogoUrl({ theme: Theme.Light, branding, isDarkModeEnabled: true })).toBe(
        logoLight
      );
      expect(getBrandingLogoUrl({ theme: Theme.Dark, branding, isDarkModeEnabled: true })).toBe(
        logoDark
      );
      expect(
        getBrandingLogoUrl({
          theme: Theme.Dark,
          branding,
          isDarkModeEnabled: false,
        })
      ).toBe(logoLight);
    }
  );

  it('selects a theme variant when only one legacy default URL is present', () => {
    expect(
      getBrandingLogoUrl({
        theme: Theme.Dark,
        branding: { logoUrl: branding.logoUrl },
        isDarkModeEnabled: true,
      })
    ).toBe(logoDark);
    expect(
      getBrandingLogoUrl({
        theme: Theme.Light,
        branding: { darkLogoUrl: branding.darkLogoUrl },
        isDarkModeEnabled: true,
      })
    ).toBe(logoLight);
  });

  it('preserves a single custom logo', () => {
    expect(
      getBrandingLogoUrl({
        theme: Theme.Light,
        branding: { darkLogoUrl: 'dark-only.svg' },
        isDarkModeEnabled: true,
      })
    ).toBe('dark-only.svg');
  });

  it('leaves generic connector-logo resolution unchanged', () => {
    expect(getLogoUrl({ theme: Theme.Light, logoUrl: branding.logoUrl })).toBe(branding.logoUrl);
  });
});
