import { type DemoAppsConfig } from '@logto/schemas';

import demoAppsRoutes from '#src/routes/logto-config/demo-apps.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const getDemoAppsConfig = jest.fn(async (): Promise<DemoAppsConfig> => ({ enabled: true }));
const upsertDemoAppsConfig = jest.fn();
const tenantContext = new MockTenant(undefined, {
  logtoConfigs: { getDemoAppsConfig, upsertDemoAppsConfig },
});
const requester = createRequester({ authedRoutes: demoAppsRoutes, tenantContext });

afterEach(() => {
  jest.clearAllMocks();
});

describe('demo applications Management API', () => {
  it('returns the effective default', async () => {
    const response = await requester.get('/configs/demo-apps');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ enabled: true });
  });

  it.each([false, true])('persists the tenant choice (%s)', async (enabled) => {
    const response = await requester.patch('/configs/demo-apps').send({ enabled });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ enabled });
    expect(upsertDemoAppsConfig).toHaveBeenCalledWith({ enabled });
  });

  it.each([{}, { enabled: 'false' }, { enabled: null }])(
    'rejects invalid input %j',
    async (body) => {
      const response = await requester.patch('/configs/demo-apps').send(body);
      expect(response.status).toBe(400);
      expect(upsertDemoAppsConfig).not.toHaveBeenCalled();
    }
  );
});
