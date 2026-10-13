# Personal liuovo branding

Assets are vendored from [liuc-c/liuovo-logo](https://github.com/liuc-c/liuovo-logo)
at commit `0500146ccace0275785caa4e13f01c230fc5d410`.
They are bundled locally; no logo request depends on GitHub or logto.io.

Normal headers use the light/dark intro SVGs. Loading screens use only the loading
badge, without a second horizontal logo. `BrandLoading` preserves the original SVG
geometry and motion, scopes its CSS, and gives each mask/clipPath its own React ID.
Reduced motion disables rotation and retains the original slow opacity pulse.

Page-level loading in Experience, Console, and Account Center shares
`BrandLoadingState`: one 64px badge and a localized message with a 16px gap.
Social and SSO callbacks use the same presentation throughout the redirect flow,
without a connector logo or a toast-style background box. Compact inline loading
indicators continue to use `BrandLoading` directly.

`resolveBuiltInLogo` maps only the two legacy logto.io default URLs to the bundled
logos. Empty or missing branding uses the bundled light/dark pair. Custom branding
values retain their existing behavior, including application/organization overrides.
The company logo/favicon URL inputs are omitted from the personal Console. Existing
tenant records need no migration.

The personal build hides provider attribution footers. The existing configuration
and API fields remain accepted and stored. Apple touch icons use the dedicated
180px PNG independently of the default SVG favicon, which follows the browser's system theme.
