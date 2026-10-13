import classNames from 'classnames';

import BrandLoading from '../BrandLoading';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly message: string;
};

const BrandLoadingState = ({ className, message }: Props) => (
  <div className={classNames(styles.container, className)} role="status" aria-busy="true">
    <BrandLoading size={64} />
    <span className={styles.message}>{message}</span>
  </div>
);

export default BrandLoadingState;
