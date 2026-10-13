import { logoDark, logoLight } from '@branding/assets';
import { Theme } from '@logto/schemas';

import useTheme from '@/hooks/use-theme';

type Props = {
  readonly className?: string;
  readonly theme?: Theme;
};

function BrandLogo({ className, theme: themeOverride }: Props) {
  const theme = useTheme();

  return (
    <img
      className={className}
      src={(themeOverride ?? theme) === Theme.Dark ? logoDark : logoLight}
      alt="liuovo"
    />
  );
}

export default BrandLogo;
