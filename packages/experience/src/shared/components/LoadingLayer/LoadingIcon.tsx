import classNames from 'classnames';

import BrandLoading from '../../branding/BrandLoading';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

const LoadingIcon = ({ className }: Props) => (
  <BrandLoading className={classNames(styles.loadingIcon, className)} />
);

export default LoadingIcon;
