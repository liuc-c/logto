import BrandLoading from '@experience/shared/branding/BrandLoading';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

const GlobalLoading = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container} role="status" aria-busy="true">
      <BrandLoading size={64} />
      <span className={styles.message}>{t('account_center.sessions.loading')}</span>
    </div>
  );
};

export default GlobalLoading;
