
import { createClient } from '@supabase/supabase-js';

export const getSupabase = (url?: string, key?: string) => {
  const supabaseUrl = url || (import.meta as any).env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = key || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// For backward compatibility if needed, but we'll use getSupabase
export const supabase = getSupabase();
