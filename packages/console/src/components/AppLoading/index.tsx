import BrandLoadingState from '@branding/BrandLoadingState';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

function AppLoading() {
  const { t } = useTranslation('experience');

  return (
    <div className={styles.container}>
      <BrandLoadingState message={t('account_center.sessions.loading')} />
    </div>
  );
}

export default AppLoading;
