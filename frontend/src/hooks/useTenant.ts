import { useContext } from 'react';
import { TenantContext } from '../context/TenantContextObject';

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
