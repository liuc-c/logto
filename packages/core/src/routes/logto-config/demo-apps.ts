import { demoAppsConfigGuard } from '@logto/schemas';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function demoAppsRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  // The authenticated Management API resolves the business tenant, not the console's admin tenant.
  const { getDemoAppsConfig, upsertDemoAppsConfig } = tenant.queries.logtoConfigs;

  router.get(
    '/configs/demo-apps',
    koaGuard({ response: demoAppsConfigGuard, status: [200] }),
    async (ctx, next) => {
      ctx.body = await getDemoAppsConfig();
      return next();
    }
  );

  router.patch(
    '/configs/demo-apps',
    koaGuard({ body: demoAppsConfigGuard, response: demoAppsConfigGuard, status: [200] }),
    async (ctx, next) => {
      await upsertDemoAppsConfig(ctx.guard.body);
      ctx.body = ctx.guard.body;
      // No tenant/provider rebuild is needed: both request gates read the committed DB value.
      return next();
    }
  );
}
