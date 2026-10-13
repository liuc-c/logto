import type { MiddlewareType } from 'koa';

import { UserApps } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

/** Keep the reserved prefixes even when disabled, and run before static serving / SPA fallback. */
export default function koaDemoApps({
  logtoConfigs: { getDemoAppsConfig },
}: Queries): MiddlewareType {
  return async (ctx, next) => {
    const isDemoPath = [UserApps.DemoApp, UserApps.DeviceDemoApp].some(
      (prefix) => ctx.path === `/${prefix}` || ctx.path.startsWith(`/${prefix}/`)
    );
    if (!isDemoPath) {
      return next();
    }

    // A cached page must not bypass the switch after it is disabled.
    ctx.set('Cache-Control', 'no-store');
    const { enabled } = await getDemoAppsConfig();
    if (!enabled) {
      ctx.status = 404;
      return;
    }
    return next();
  };
}
