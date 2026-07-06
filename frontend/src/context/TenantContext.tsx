import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dbService, isSupabaseConfigured } from '../services/db';

interface TenantContextType {
  companyId: string | null;
  loading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo/Fallback mode
      setCompanyId('00000000-0000-0000-0000-000000000000');
      setLoading(false);
      return;
    }

    const resolveTenant = async () => {
      if (!user) {
        setCompanyId(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const supabase = dbService.ensureSupabase();
        
        // Get the full user object to obtain user.id
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!authUser) {
          throw new Error('User session not found');
        }

        // Query the tenant_members table for this user's company
        const { data: member, error: memberError } = await supabase
          .from('tenant_members')
          .select('company_id')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (memberError) throw memberError;

        if (member?.company_id) {
          setCompanyId(member.company_id);
        } else {
          // If the user belongs to no company, fallback to default company
          setCompanyId('00000000-0000-0000-0000-000000000000');
        }
      } catch (err: unknown) {
        console.error('Error resolving tenant:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Fallback to default company on error so the app doesn't brick for existing users
        setCompanyId('00000000-0000-0000-0000-000000000000');
      } finally {
        setLoading(false);
      }
    };

    resolveTenant();
  }, [user]);

  return (
    <TenantContext.Provider value={{ companyId, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
