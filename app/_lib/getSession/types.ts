import { Session } from '@supabase/supabase-js';

/** セッション Response */
export type SessionResponse = {
  /** セッション */
  session?: Session | null;
};
