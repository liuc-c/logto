import classNames from 'classnames';

import useConnectors from '@/hooks/use-connectors';
import LoadingLayer from '@/shared/components/LoadingLayer';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly connectorId: string;
  readonly isLoading?: boolean;
};

const SocialLanding = ({ className, connectorId, isLoading = false }: Props) => {
  const { findConnectorById, getConnectorLogo } = useConnectors();
  const result = findConnectorById(connectorId);

  if (isLoading) {
    return <LoadingLayer />;
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.connector}>
        {result ? <img src={getConnectorLogo(result)} alt="logo" /> : connectorId}
      </div>
    </div>
  );
};

export default SocialLanding;
