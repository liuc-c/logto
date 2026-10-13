import BrandLoadingState from '@experience/shared/branding/BrandLoadingState';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

const GlobalLoading = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <BrandLoadingState message={t('account_center.sessions.loading')} />
    </div>
  );
};

export default GlobalLoading;
