
/// <reference types="vite/client" />

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './integrations/supabase/types';

declare global {
  interface Window {
    supabase?: SupabaseClient<Database>;
  }
}
