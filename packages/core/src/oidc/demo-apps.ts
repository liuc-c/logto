import { demoAppApplicationId, deviceDemoAppApplicationId } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';

/**
 * Gate before Client.find's caches. All provider flows (including resumed authorization and
 * device/token requests) use this resolver, so previously cached clients cannot bypass the
 * tenant's current choice. Ordinary clients never incur the extra query. No sessions are erased.
 */
export const installDemoAppsGate = (
  { Client }: Provider,
  { logtoConfigs: { getDemoAppsConfig } }: Queries
) => {
  const find = Client.find.bind(Client);
  // eslint-disable-next-line @silverhand/fp/no-mutation -- wrap the per-provider resolver, preserving its receiver and cache behavior
  Client.find = async (...args: Parameters<typeof Client.find>) => {
    const [id] = args;
    if (id === demoAppApplicationId || id === deviceDemoAppApplicationId) {
      const { enabled } = await getDemoAppsConfig();
      if (!enabled) {
        return;
      }
    }
    return find(...args);
  };
};
