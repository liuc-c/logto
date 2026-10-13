import {
  accountCenterApplicationId,
  adminConsoleApplicationId,
  demoAppApplicationId,
  deviceDemoAppApplicationId,
} from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { MockQueries } from '#src/test-utils/tenant.js';

import { installDemoAppsGate } from './demo-apps.js';

const { jest } = import.meta;

it('checks the database even for cached clients, and restores them without rebuilding the provider', async () => {
  const getDemoAppsConfig = jest.fn(async () => ({ enabled: true }));
  const clientIds = [
    demoAppApplicationId,
    deviceDemoAppApplicationId,
    accountCenterApplicationId,
    adminConsoleApplicationId,
    'ordinary-app',
  ];
  const provider = new Provider('https://logto.test', {
    clients: clientIds.map((clientId) => ({
      client_id: clientId,
      redirect_uris: ['https://client.test/callback'],
      token_endpoint_auth_method: 'none',
    })),
  });
  installDemoAppsGate(provider, new MockQueries({ logtoConfigs: { getDemoAppsConfig } }));
  const findClient = provider.Client.find.bind(provider.Client);
  // Warm the real provider's static client cache.
  const clients = await Promise.all(clientIds.map(async (id) => findClient(id)));
  expect(clients.every(Boolean)).toBe(true);
  getDemoAppsConfig.mockResolvedValue({ enabled: false });
  expect(await findClient(demoAppApplicationId)).toBeUndefined();
  expect(await findClient(deviceDemoAppApplicationId)).toBeUndefined();
  await Promise.all(
    [accountCenterApplicationId, adminConsoleApplicationId, 'ordinary-app'].map(async (id) => {
      await expect(findClient(id)).resolves.toMatchObject({ clientId: id });
    })
  );
  getDemoAppsConfig.mockResolvedValue({ enabled: true });
  expect(await findClient(demoAppApplicationId)).toBe(clients[0]);
  expect(await findClient(deviceDemoAppApplicationId)).toBe(clients[1]);
});
