/* eslint-disable no-await-in-loop -- acceptance steps deliberately change shared tenant state and browser navigation in sequence */
/* eslint-disable @silverhand/fp/no-mutation -- this isolated integration scenario records credentials and artifacts between ordered tests */
import { randomBytes } from 'node:crypto';

import { type Application, type DemoAppsConfig, type SignInExperience } from '@logto/schemas';
import ky from 'ky';
import puppeteer from 'puppeteer';

import { logtoUrl, logtoConsoleUrl } from '#src/constants.js';

const expectStatus = async (pendingResponse: Promise<Response>, status: number) => {
  const response = await pendingResponse;
  expect(response.status).toBe(status);
  return response;
};
const hasBranding = () => document.body.textContent?.includes('Powered by');

const restarting = process.env.FORK_VERIFY_RESTART === '1';
const clientId = 'fork-acceptance';
const clientSecret = 'acceptance-only';
const resource = 'https://default.logto.app/api';
const api = ky.create({ prefixUrl: `${logtoUrl}/api`, retry: 0 });
const oidc = ky.create({ prefixUrl: `${logtoUrl}/oidc`, retry: 0 });
const state = { token: '', appId: '', deviceAppId: '', deviceCode: '' };
const authorized = () => api.extend({ headers: { authorization: `Bearer ${state.token}` } });
const demoPaths = ['/demo-app', '/device-demo-app'];

const getToken = async (scope: string) => {
  const response = await oidc
    .post('token', {
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({ grant_type: 'client_credentials', resource, scope }),
    })
    .json<{ access_token: string }>();
  return response.access_token;
};

const authUrl = (id: string, redirectUri: string, base = logtoUrl) => {
  const url = new URL(`${base}/oidc/auth`);
  url.search = new URLSearchParams({
    client_id: id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid',
    code_challenge: 'a'.repeat(43),
    code_challenge_method: 'S256',
    state: randomBytes(8).toString('hex'),
  }).toString();
  return url;
};
const authorizeDemo = async () =>
  ky.get(authUrl('demo-app', `${logtoUrl}/demo-app`), {
    redirect: 'manual',
    throwHttpErrors: false,
  });
const deviceAuthorize = async (id: string) =>
  oidc.post('device/auth', {
    body: new URLSearchParams({ client_id: id, scope: 'openid' }),
    throwHttpErrors: false,
  });
const setDemos = async (enabled: boolean) =>
  authorized().patch('configs/demo-apps', { json: { enabled } }).json<DemoAppsConfig>();

beforeAll(async () => {
  state.token = await getToken('all');
});

if (restarting) {
  it('retains the accepted settings across a production container restart', async () => {
    expect(await authorized().get('configs/demo-apps').json()).toEqual({ enabled: false });
    expect(await authorized().get('sign-in-exp').json<SignInExperience>()).toMatchObject({
      hideLogtoBranding: true,
    });
    expect(await api.get('.well-known/sign-in-exp').json()).toMatchObject({
      hideLogtoBranding: true,
    });
    await expectStatus(authorizeDemo(), 400);
    await expectStatus(deviceAuthorize('device-demo-app'), 401);
    for (const path of demoPaths) {
      await expectStatus(ky.get(`${logtoUrl}${path}`, { throwHttpErrors: false }), 404);
    }
    await expectStatus(ky.get(`${logtoConsoleUrl}/console`), 200);
  });
} else {
  describe('OSS production container on PostgreSQL 18', () => {
    it('preserves upstream defaults and warms both demo clients', async () => {
      expect(await authorized().get('configs/demo-apps').json()).toEqual({ enabled: true });
      expect(await authorized().get('sign-in-exp').json<SignInExperience>()).toMatchObject({
        hideLogtoBranding: false,
      });
      for (const path of demoPaths) {
        await expectStatus(ky.get(`${logtoUrl}${path}`), 200);
      }
      await expectStatus(authorizeDemo(), 303);
      const deviceResponse = await deviceAuthorize('device-demo-app');
      expect(deviceResponse.status).toBe(200);
      const { device_code: deviceCode } = await deviceResponse.json<{ device_code: string }>();
      state.deviceCode = deviceCode;
    });

    it('requires a valid Management API token with the all scope', async () => {
      await expectStatus(
        api.patch('configs/demo-apps', { json: { enabled: false }, throwHttpErrors: false }),
        401
      );
      const token = await getToken('');
      await expectStatus(
        api.patch('configs/demo-apps', {
          json: { enabled: false },
          headers: { authorization: `Bearer ${token}` },
          throwHttpErrors: false,
        }),
        403
      );
      expect(await authorized().get('configs/demo-apps').json()).toEqual({ enabled: true });
    });

    it('disables warmed demos immediately, including static paths and POST authorization', async () => {
      expect(await setDemos(false)).toEqual({ enabled: false });
      for (const path of demoPaths) {
        for (const suffix of ['', '/', '/assets/app.js', '/nested/path']) {
          const response = await ky.get(`${logtoUrl}${path}${suffix}`, { throwHttpErrors: false });
          expect(response.status).toBe(404);
          expect(response.headers.get('cache-control')).toBe('no-store');
        }
      }
      await expectStatus(authorizeDemo(), 400);
      await expectStatus(deviceAuthorize('device-demo-app'), 401);
      const url = authUrl('demo-app', `${logtoUrl}/demo-app`);
      await expectStatus(
        oidc.post('auth', {
          body: url.searchParams,
          redirect: 'manual',
          throwHttpErrors: false,
        }),
        400
      );
      // Even an issued device code cannot be used to poll for fresh tokens after disabling.
      await expectStatus(
        oidc.post('token', {
          body: new URLSearchParams({
            client_id: 'device-demo-app',
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code: state.deviceCode,
          }),
          throwHttpErrors: false,
        }),
        401
      );
    });

    it('keeps normal OIDC, device flow, Account Center and admin login available', async () => {
      const app = await authorized()
        .post('applications', {
          json: {
            name: 'Ordinary acceptance app',
            type: 'SPA',
            oidcClientMetadata: {
              redirectUris: ['http://localhost:3301/callback'],
              postLogoutRedirectUris: [],
            },
          },
        })
        .json<Application>();
      const deviceApp = await authorized()
        .post('applications', {
          json: {
            name: 'Ordinary device acceptance app',
            type: 'Native',
            oidcClientMetadata: { redirectUris: [], postLogoutRedirectUris: [] },
            customClientMetadata: { isDeviceFlow: true },
          },
        })
        .json<Application>();
      state.appId = app.id;
      state.deviceAppId = deviceApp.id;
      await expectStatus(
        ky.get(authUrl(app.id, `${logtoUrl}/callback`), {
          redirect: 'manual',
          throwHttpErrors: false,
        }),
        303
      );
      await expectStatus(deviceAuthorize(deviceApp.id), 200);
      await expectStatus(ky.get(`${logtoUrl}/account`), 200);
      await expectStatus(
        ky.get(authUrl('account-center', `${logtoUrl}/account`), {
          redirect: 'manual',
          throwHttpErrors: false,
        }),
        303
      );
      await expectStatus(ky.get(`${logtoConsoleUrl}/console`), 200);
      await expectStatus(
        ky.get(authUrl('admin-console', `${logtoConsoleUrl}/console/callback`, logtoConsoleUrl), {
          redirect: 'manual',
          throwHttpErrors: false,
        }),
        303
      );
      expect(await getToken('all')).toBeTruthy();
    });

    it('re-enables both demos without restarting', async () => {
      await setDemos(true);
      for (const path of demoPaths) {
        await expectStatus(ky.get(`${logtoUrl}${path}`), 200);
      }
      await expectStatus(authorizeDemo(), 303);
      await expectStatus(deviceAuthorize('device-demo-app'), 200);
    });

    it('renders both saved OSS branding choices in a real browser without a license', async () => {
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      try {
        const page = await browser.newPage();
        for (const hideLogtoBranding of [true, false, true]) {
          expect(
            await authorized().patch('sign-in-exp', { json: { hideLogtoBranding } }).json()
          ).toMatchObject({ hideLogtoBranding });
          expect(await api.get('.well-known/sign-in-exp').json()).toMatchObject({
            hideLogtoBranding,
          });
          await page.goto(authUrl(state.appId, `${logtoUrl}/callback`).href, {
            waitUntil: 'networkidle0',
          });
          expect(await page.evaluate(hasBranding)).toBe(!hideLogtoBranding);
          await page.reload({ waitUntil: 'networkidle0' });
          expect(await page.evaluate(hasBranding)).toBe(!hideLogtoBranding);
        }
      } finally {
        await browser.close();
      }
      // Acceptance state, subsequently verified by the restart phase.
      await setDemos(false);
    });
  });
}

/* eslint-enable no-await-in-loop */
/* eslint-enable @silverhand/fp/no-mutation */
