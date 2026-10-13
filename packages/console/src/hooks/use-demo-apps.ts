import { type DemoAppsConfig } from '@logto/schemas';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

export const demoAppsConfigEndpoint = 'api/configs/demo-apps';

const useDemoApps = () => {
  const { data, error, mutate } = useSWR<DemoAppsConfig, RequestError>(demoAppsConfigEndpoint);
  return { data, error, mutate, enabled: data?.enabled === true };
};

export default useDemoApps;
