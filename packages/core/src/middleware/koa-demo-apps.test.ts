import Koa from 'koa';
import mount from 'koa-mount';
import request from 'supertest';

import { MockQueries } from '#src/test-utils/tenant.js';

import koaDemoApps from './koa-demo-apps.js';

const { jest } = import.meta;

describe('demo page gate', () => {
  const getDemoAppsConfig = jest.fn(async () => ({ enabled: true }));
  const app = new Koa();
  app.use(koaDemoApps(new MockQueries({ logtoConfigs: { getDemoAppsConfig } })));
  app.use(
    mount('/demo-app', (ctx) => {
      ctx.body = 'Demo app';
    })
  );
  app.use(
    mount('/device-demo-app', (ctx) => {
      ctx.body = 'Device demo app';
    })
  );
  app.use((ctx) => {
    ctx.type = 'html';
    ctx.body = '<html>Experience 404</html>';
  });
  const requester = request(app.callback());

  it.each([
    '/demo-app',
    '/demo-app/',
    '/demo-app/assets/app.js',
    '/demo-app/sign-in',
    '/device-demo-app',
    '/device-demo-app/assets/app.js',
    '/device-demo-app/sign-in',
  ])('changes %s immediately on the same running app, before fallback', async (path) => {
    getDemoAppsConfig.mockResolvedValue({ enabled: true });
    await expect(requester.get(path)).resolves.toMatchObject({ status: 200 });
    getDemoAppsConfig.mockResolvedValue({ enabled: false });
    const disabled = await requester.get(path);
    expect(disabled.status).toBe(200);
    expect(disabled.headers['content-type']).toContain('text/html');
    expect(disabled.text).toContain('Experience 404');
    expect(disabled.headers['cache-control']).toBe('no-store');
    await expect(requester.head(path)).resolves.toMatchObject({ status: 200 });
    getDemoAppsConfig.mockResolvedValue({ enabled: true });
    await expect(requester.get(path)).resolves.toMatchObject({ status: 200 });
  });

  it.each(['/account', '/console', '/oidc/auth', '/device', '/demo-app-other'])(
    'preserves unrelated route %s',
    async (path) => {
      getDemoAppsConfig.mockResolvedValue({ enabled: false });
      getDemoAppsConfig.mockClear();
      await expect(requester.get(path)).resolves.toMatchObject({ status: 200 });
      expect(getDemoAppsConfig).not.toHaveBeenCalled();
    }
  );
});
