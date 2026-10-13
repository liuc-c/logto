import {
  ApplicationType,
  type SsoConnector,
  type SsoConnectorIdpInitiatedAuthConfig,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockApplication, mockSamlSsoConnector, mockSsoConnector } from '#src/__mocks__/index.js';
import { idpInitiatedSamlSsoSessionCookieName, ssoPath } from '#src/constants/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import LicenseReader from '#src/license/LicenseReader.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import authnRoutes from '#src/routes/authn.js';
import SamlConnector from '#src/sso/SamlConnector/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const ssoConnectorRoutes = await pickDefault(import('./index.js'));
const redirectUri = 'https://app.example.com/callback';
const config: SsoConnectorIdpInitiatedAuthConfig = {
  tenantId: 'default',
  connectorId: mockSamlSsoConnector.id,
  defaultApplicationId: mockApplication.id,
  autoSendAuthorizationRequest: true,
  redirectUri,
  clientIdpInitiatedAuthCallbackUri: null,
  authParameters: {},
  createdAt: Date.now(),
};
const findById = jest.fn(async (): Promise<SsoConnector> => mockSamlSsoConnector);
const insertConfig = jest.fn(async () => config);
const findConfig = jest.fn(async () => config);
const deleteConfig = jest.fn();
const insertSession = jest.fn(async () => ({
  id: 'idp-session',
  tenantId: 'default',
  connectorId: config.connectorId,
  assertionContent: { nameID: 'saml-user' },
  createdAt: Date.now(),
  expiresAt: Date.now() + 600_000,
}));
const findApplication = jest.fn(async () => ({
  ...mockApplication,
  type: ApplicationType.Traditional,
  isThirdParty: false,
  oidcClientMetadata: { ...mockApplication.oidcClientMetadata, redirectUris: [redirectUri] },
}));
const tenant = new MockTenant(undefined, {
  ssoConnectors: {
    findById,
    insertIdpInitiatedAuthConfig: insertConfig,
    getIdpInitiatedAuthConfigByConnectorId: findConfig,
    deleteIdpInitiatedAuthConfigByConnectorId: deleteConfig,
    insertIdpInitiatedSamlSsoSession: insertSession,
  },
  applications: { findApplicationById: findApplication },
});
const path = `/sso-connectors/${config.connectorId}/idp-initiated-auth-config`;
const body = {
  defaultApplicationId: config.defaultApplicationId,
  autoSendAuthorizationRequest: true,
  redirectUri: config.redirectUri,
};
const createRequest = () =>
  createRequester({
    middlewares: [koaI18next(), koaErrorHandler()],
    authedRoutes: ssoConnectorRoutes,
    anonymousRoutes: authnRoutes,
    tenantContext: tenant,
  });

describe('personal self-hosted IdP-initiated SSO routes', () => {
  const { isCloud, isDevFeaturesEnabled } = EnvSet.values;

  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isCloud', false);
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
    // eslint-disable-next-line unicorn/no-useless-undefined -- No installed license is the case under test.
    jest.spyOn(LicenseReader.shared, 'read').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isCloud', isCloud);
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', isDevFeaturesEnabled);
  });

  it('creates, reads and deletes config without a license or development mode', async () => {
    const request = createRequest();
    const saved = await request.put(path).send(body);
    expect(saved.status).toBe(200);
    expect(saved.body).toMatchObject(body);
    expect(insertConfig).toHaveBeenCalledWith({ connectorId: config.connectorId, ...body });

    const loaded = await request.get(path);
    expect(loaded.body).toMatchObject(body);
    const deleted = await request.delete(path);
    expect(deleted.status).toBe(204);
    expect(deleteConfig).toHaveBeenCalledWith(config.connectorId);
  });

  it('still rejects connectors that do not use SAML', async () => {
    findById.mockResolvedValueOnce(mockSsoConnector);
    const response = await createRequest().put(path).send(body);
    expect(response.status).toBe(400);
    expect(insertConfig).not.toHaveBeenCalled();
  });

  it('still rejects an unregistered application redirect URI', async () => {
    const response = await createRequest()
      .put(path)
      .send({ ...body, redirectUri: 'https://other.example.com/callback' });
    expect(response.status).toBe(400);
    expect(insertConfig).not.toHaveBeenCalled();
  });

  it('retains the Cloud development guard', async () => {
    Reflect.set(EnvSet.values, 'isCloud', true);
    const response = await createRequest().put(path).send(body);
    expect(response.status).toBe(404);
    expect(insertConfig).not.toHaveBeenCalled();
  });

  it('accepts a validated IdP assertion without RelayState in local production mode', async () => {
    const parse = jest
      .spyOn(SamlConnector.prototype, 'parseSamlAssertionContent')
      .mockResolvedValue({ nameID: 'saml-user' });
    const response = await createRequest()
      .post(`/authn/${ssoPath}/saml/${config.connectorId}`)
      .send({ SAMLResponse: 'signed-assertion' });
    expect(response.status).toBe(302);
    expect(parse).toHaveBeenCalledWith({ SAMLResponse: 'signed-assertion' });
    expect(insertSession).toHaveBeenCalledWith(
      expect.objectContaining({
        connectorId: config.connectorId,
        assertionContent: { nameID: 'saml-user' },
      })
    );
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${idpInitiatedSamlSsoSessionCookieName}=idp-session`),
      ])
    );
  });

  it('does not create an IdP session when assertion validation fails', async () => {
    jest
      .spyOn(SamlConnector.prototype, 'parseSamlAssertionContent')
      .mockRejectedValue(new RequestError({ code: 'guard.invalid_input', status: 400 }));
    const response = await createRequest()
      .post(`/authn/${ssoPath}/saml/${config.connectorId}`)
      .send({ SAMLResponse: 'invalid-assertion' });
    expect(response.status).toBe(400);
    expect(insertSession).not.toHaveBeenCalled();
  });
});
