import { createContext } from 'react';

export interface TenantContextType {
  companyId: string | null;
  loading: boolean;
  error: Error | null;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);
