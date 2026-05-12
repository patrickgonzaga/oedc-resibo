import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hamxixpnihrleexdepyq.supabase.co';
const supabaseAnonKey = 'sb_publishable_dVc2HoNpGdhOo59xrErJwg_2hLcS1_j';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
