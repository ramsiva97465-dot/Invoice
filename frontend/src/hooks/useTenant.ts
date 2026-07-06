import { useTenant as useTenantContext } from '../context/TenantContext';

export const useTenant = () => {
  return useTenantContext();
};
