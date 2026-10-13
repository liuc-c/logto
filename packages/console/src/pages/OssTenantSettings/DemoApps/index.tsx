import { type DemoAppsConfig } from '@logto/schemas';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useDemoApps, { demoAppsConfigEndpoint } from '@/hooks/use-demo-apps';
import { trySubmitSafe } from '@/utils/form';

function DemoApps() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { data, mutate } = useDemoApps();
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();
  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<DemoAppsConfig>({ defaultValues: { enabled: true } });

  useEffect(() => {
    if (data && !isDirty) {
      reset(data);
    }
  }, [data, isDirty, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (value) => {
      if (!canManageTenant || !data || isSubmitting) {
        return;
      }
      const saved = await api.patch(demoAppsConfigEndpoint, { json: value }).json<DemoAppsConfig>();
      await mutate(saved, false);
      reset(saved);
      toast.success(t('general.saved'));
    })
  );

  return (
    <>
      <PageMeta titleKey={['tenants.demo_apps.title', 'tenants.title']} />
      <DetailsForm
        isDirty={isDirty && canManageTenant}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onDiscard={reset}
      >
        <FormCard title="tenants.demo_apps.title" description="tenants.demo_apps.description">
          <FormField title="tenants.demo_apps.title">
            <Switch
              {...register('enabled')}
              description="tenants.demo_apps.enabled"
              aria-label={t('tenants.demo_apps.enabled')}
              disabled={!data || !canManageTenant || isSubmitting}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
}

export default DemoApps;
