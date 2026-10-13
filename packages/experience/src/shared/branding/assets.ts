import type { Nullable } from '@silverhand/essentials';

import logoDark from './assets/logo-intro-dark.svg?url';
import logoLight from './assets/logo-intro-light.svg?url';

export { default as appleTouchIcon } from './assets/apple-touch-icon.png';
export { default as faviconIco } from './assets/favicon.ico';
export { default as favicon } from './assets/favicon.svg?url';
export { default as logoDark } from './assets/logo-intro-dark.svg?url';
export { default as logoLight } from './assets/logo-intro-light.svg?url';

/** Replace only upstream defaults; application and organization branding remains independent. */
export const resolveBuiltInLogo = (url: Nullable<string> | undefined) => {
  if (url === 'https://logto.io/logo.svg') {
    return logoLight;
  }

  if (url === 'https://logto.io/logo-dark.svg') {
    return logoDark;
  }

  return url === '' ? undefined : url;
};
