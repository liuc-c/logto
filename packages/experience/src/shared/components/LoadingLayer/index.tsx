import { useTranslation } from 'react-i18next';

import BrandLoadingState from '../../branding/BrandLoadingState';

import LoadingMask from './LoadingMask';
import styles from './index.module.scss';

export { default as LoadingIcon } from './LoadingIcon';
export { default as LoadingMask } from './LoadingMask';

export const LoadingStatus = () => {
  const { t } = useTranslation();

  return (
    <BrandLoadingState
      className={styles.loadingStatus}
      message={t('account_center.sessions.loading')}
    />
  );
};

const LoadingLayer = () => (
  <LoadingMask>
    <LoadingStatus />
  </LoadingMask>
);

export default LoadingLayer;
