import classNames from 'classnames';
import { useId } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly size?: number;
};

/** Built from liuovo's loading.svg, with instance-specific mask IDs and scoped animation styles. */
const BrandLoading = ({ className, size = 32 }: Props) => {
  const id = useId();
  const maskId = `${id}-mask`;
  const clipId = `${id}-clip`;

  return (
    <svg
      aria-hidden="true"
      className={classNames(styles.loader, className)}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="6" y="6" width="52" height="52">
          <rect x="6" y="6" width="52" height="52" fill="#fff" />
          <g className={styles.symbol}>
            <circle
              className={styles.ring}
              cx="27.04"
              cy="32"
              r="9.92"
              fill="none"
              stroke="#000"
              strokeWidth="2.48"
            />
            <circle className={styles.disc} cx="36.96" cy="32" r="11.16" fill="#000" />
            <g clipPath={`url(#${clipId})`}>
              <circle
                className={styles.ring}
                cx="27.04"
                cy="32"
                r="9.92"
                fill="none"
                stroke="#fff"
                strokeWidth="2.48"
              />
            </g>
          </g>
        </mask>
        <clipPath id={clipId}>
          <circle className={styles.disc} cx="36.96" cy="32" r="11.16" />
        </clipPath>
      </defs>
      <g className={styles.badge}>
        <circle cx="32" cy="32" r="26" fill="currentColor" mask={`url(#${maskId})`} />
      </g>
    </svg>
  );
};

export default BrandLoading;
