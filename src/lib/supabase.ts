import { createClient } from "@supabase/supabase-js";

// ⚠️ Sustituye estos dos valores por los tuyos reales de Supabase
const supabaseUrl = "https://ccbwylfznrskbzjcyssj.supabase.co";
const supabaseAnonKey = "sb_publishable_XCBiJVUAy5CpOpVK8wsxbQ_x-hbBy30";

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
