import BrandLoadingState from '@branding/BrandLoadingState';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

const suspenseDisplayTimeout = 500; // Milliseconds

/**
 * Displays a spinner after a short delay (500ms) to prevent flashing
 * @returns {JSX.Element} The spinner
 */
function DelayedSuspenseFallback() {
  const { t } = useTranslation('experience');
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowSpinner(true);
    }, suspenseDisplayTimeout);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (showSpinner) {
    return (
      <BrandLoadingState
        className={styles.loading}
        message={t('account_center.sessions.loading')}
      />
    );
  }

  return null;
}

export default DelayedSuspenseFallback;
