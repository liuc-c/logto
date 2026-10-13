import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import DemoApps from '.';

const mockPatch = jest.fn();
const mockMutate = jest.fn();
const mockAccess = jest.fn(() => ({ canManageTenant: true }));
const mockConfig = jest.fn(() => ({ data: { enabled: true }, mutate: mockMutate }));

jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('@withtyped/client', () => ({ ResponseError: class extends Error {} }), {
  virtual: true,
});
jest.mock('@/hooks/use-api', () => ({ __esModule: true, default: () => ({ patch: mockPatch }) }));
jest.mock('@/hooks/use-demo-apps', () => ({
  __esModule: true,
  default: () => mockConfig(),
  demoAppsConfigEndpoint: 'api/configs/demo-apps',
}));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: mockAccess() }),
}));
jest.mock('@/hooks/use-tenant-pathname', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/FormCard', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <section>{children}</section>,
}));
jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  BetaTag: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/components/LearnMore', () => ({ __esModule: true, default: () => null }));

const renderSettings = () =>
  render(<RouterProvider router={createMemoryRouter([{ path: '/', element: <DemoApps /> }])} />);

beforeEach(() => {
  jest.clearAllMocks();
  mockAccess.mockReturnValue({ canManageTenant: true });
  mockConfig.mockReturnValue({ data: { enabled: true }, mutate: mockMutate });
  mockPatch.mockReturnValue({ json: async () => ({ enabled: false }) });
});

it('saves the switch through the business tenant API and updates shared preview state', async () => {
  renderSettings();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.save_changes' }));
  await waitFor(() => {
    expect(mockPatch).toHaveBeenCalledWith('api/configs/demo-apps', { json: { enabled: false } });
    expect(mockMutate).toHaveBeenCalledWith({ enabled: false }, false);
  });
});

it('prevents editing without tenant management permission', () => {
  mockAccess.mockReturnValue({ canManageTenant: false });
  renderSettings();
  expect(screen.getByRole<HTMLInputElement>('checkbox').disabled).toBe(true);
  expect(mockPatch).not.toHaveBeenCalled();
});
