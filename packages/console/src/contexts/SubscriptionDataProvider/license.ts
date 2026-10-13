import { type LicenseQuota } from '@logto/schemas';

import { type Subscription, type SubscriptionQuota } from '@/cloud/types/router';
import { defaultLogtoSku, defaultSubscriptionQuota, defaultTenantResponse } from '@/consts/tenants';
import { type License } from '@/types/license';

/**
 * Derive the subscription of a self-hosted deployment from its installed license.
 *
 * Only the plan and the period come from the key. `isEnterprisePlan` stays `false` on purpose: in
 * Console it switches on the Cloud add-on billing notices, which mean nothing for a license, and the
 * license-unlocked features read the effective `licenseQuota` instead. Without a license the answer is
 * the fixed `dev` plan Console has always assumed outside Cloud, so every existing check keeps
 * passing.
 */
export const buildSelfHostedSubscription = (license?: License): Subscription => {
  const { subscription: defaultSubscription } = defaultTenantResponse;

  if (!license) {
    return defaultSubscription;
  }

  return {
    ...defaultSubscription,
    planId: license.plan,
    // A license carries no period of its own; the time the key was installed is the closest thing
    // the response has, and its expiration is the end of the period the key covers.
    currentPeriodStart: new Date(license.installedAt),
    currentPeriodEnd: new Date(license.expiresAt),
  };
};

/**
 * Derive the Cloud-shaped quota of a self-hosted deployment from its effective license quota.
 *
 * Reflect local capabilities rather than the Cloud Free-plan placeholders. Entity limits already
 * short-circuit outside Cloud in Core. External hosted services remain unavailable; these values
 * do not create a Cloud subscription or provision external infrastructure.
 */
export const buildSelfHostedSubscriptionQuota = (quota: LicenseQuota): SubscriptionQuota => ({
  ...defaultSubscriptionQuota,
  ...defaultLogtoSku.quota,
  mauLimit: null,
  tokenLimit: null,
  hostedEmailLimit: 0,
  hostedEmailDailyLimit: 0,
  tenantMembersLimit: null,
  actionsEnabled: true,
  bringYourUiEnabled: quota.bringYourUi,
  idpInitiatedSsoEnabled: quota.idpInitiatedSso,
  samlApplicationsLimit: quota.samlApplicationsLimit,
  customDomainsLimit: 0,
});
