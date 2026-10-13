import type { MiddlewareType } from 'koa';

import { UserApps } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

/** Route disabled demo pages through the experience app without serving demo assets. */
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
      // Bypass the mounted demo apps and the experience proxy's reserved-prefix check. The
      // browser keeps the original URL, so its router can render the 404 page for that path.
      const originalPath = ctx.request.path;
      ctx.state.isDisabledDemoAppRequest = true;
      ctx.request.path = '/_disabled-demo-app';
      try {
        await next();
        return;
      } finally {
        ctx.request.path = originalPath;
      }
    }
    return next();
  };
}
