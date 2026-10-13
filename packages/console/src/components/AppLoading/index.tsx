import BrandLoading from '@branding/BrandLoading';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

function AppLoading() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container} role="status" aria-busy="true">
      <BrandLoading size={64} />
      <span className={styles.message}>{t('general.loading')}</span>
    </div>
  );
}

export default AppLoading;
