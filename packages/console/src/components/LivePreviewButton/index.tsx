import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import { AppDataContext } from '@/contexts/AppDataProvider';
import type { Props as ButtonProps, ButtonType } from '@/ds-components/Button';
import Button from '@/ds-components/Button';
import FlipOnRtl from '@/ds-components/FlipOnRtl';
import { Tooltip } from '@/ds-components/Tip';
import useDemoApps from '@/hooks/use-demo-apps';

import styles from './index.module.scss';

type Props = {
  readonly size?: ButtonProps['size'];
  readonly type?: ButtonType;
  readonly isDisabled: boolean;
};

function LivePreviewButton({ size, type, isDisabled }: Props) {
  const { enabled } = useDemoApps();
  const disabled = isDisabled || !enabled;
  const { tenantEndpoint } = useContext(AppDataContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Tooltip
      content={
        enabled
          ? conditional(isDisabled && t('sign_in_exp.preview.live_preview_tip'))
          : t('tenants.demo_apps.disabled')
      }
    >
      <Button
        size={size}
        type={type}
        disabled={disabled}
        title="sign_in_exp.preview.live_preview"
        trailingIcon={
          <FlipOnRtl>
            <ExternalLinkIcon
              className={conditional(
                type !== 'violet' &&
                  classNames(styles.defaultIcon, disabled && styles.disabledDefaultIcon)
              )}
            />
          </FlipOnRtl>
        }
        onClick={() => {
          window.open(new URL('/demo-app', tenantEndpoint), '_blank');
        }}
      />
    </Tooltip>
  );
}

export default LivePreviewButton;
