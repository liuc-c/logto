import { useContext } from 'react';

import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

/** OSS branding is freely configurable; Custom UI CSP retains its own entitlement. */
const useBrandingEntitlements = () => {
  const { currentSubscriptionQuota, licenseQuota } = useContext(SubscriptionDataContext);

  if (isCloud) {
    const { bringYourUiEnabled } = currentSubscriptionQuota;

    return {
      /** Whether the hide branding field is part of the form and its payload. */
      isHideLogtoBrandingAvailable: true,
      /** Whether the hide branding switch can be turned on. */
      isHideLogtoBrandingEnabled: bringYourUiEnabled,
      /** Whether the Custom UI CSP form can be edited and is part of the payload. */
      isCustomUiCspEnabled: bringYourUiEnabled,
    };
  }

  const isHideLogtoBrandingEnabled = true;

  return {
    isHideLogtoBrandingAvailable: isHideLogtoBrandingEnabled,
    isHideLogtoBrandingEnabled,
    isCustomUiCspEnabled: licenseQuota.bringYourUi,
  };
};

export default useBrandingEntitlements;
