import type { Theme } from '@logto/schemas';
import type { ReactNode } from 'react';

type Props = {
  readonly className?: string;
  readonly theme: Theme;
};

// This personal build omits provider attribution while retaining the existing caller contract.
const LogtoSignature: (props: Props) => ReactNode = () => null;

export default LogtoSignature;
