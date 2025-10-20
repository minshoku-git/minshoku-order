import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL_DEV!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_DEV!;

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, { db: { schema: process.env.SUPABASE_DB_SCHEMA } });
};
