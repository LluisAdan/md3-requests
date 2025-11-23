import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY in your secrets.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Request = {
  id: string;
  public_id: string | null;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type RequestLog = {
  id: string;
  request_id: string;
  event: string;
  details: any;
  created_at: string;
};
