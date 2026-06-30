import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService, isSupabaseConfigured } from '../services/db';

interface User {
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  demoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const demoMode = !isSupabaseConfigured;

  useEffect(() => {
    if (!isSupabaseConfigured) {
      queueMicrotask(() => setLoading(false));
      return;
    }


    const supabase = dbService.getSupabaseClient();
    if (!supabase) {
      
      queueMicrotask(() => setLoading(false));
      return;
    }
    // Fetch current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ email: session.user.email || '' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email || '' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured – login unavailable');
    const supabase = dbService.getSupabaseClient();
    if (!supabase) throw new Error('Supabase client missing');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return !!data.user;
  };

  const signUp = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured – sign‑up unavailable');
    const supabase = dbService.getSupabaseClient();
    if (!supabase) throw new Error('Supabase client missing');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // Auto sign‑in after sign‑up
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    return !!data.user;
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {

      setUser(null);
      return;
    }
    const supabase = dbService.getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signUp, demoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
