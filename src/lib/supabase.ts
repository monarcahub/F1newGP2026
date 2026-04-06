import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  subscription_status: 'ACTIVE' | 'INACTIVE' | 'TEST';
  plan: 'FREE' | 'MONTHLY' | 'ANNUAL' | 'MENSAL' | 'ANUAL';
  role: 'admin' | 'user';
  created_at: string;
};

export type Video = {
  id: string;
  title: string;
  year: number;
  description: string;
  category: string;
  embed_url: string;
  status: 'PREMIUM' | 'FREE' | 'ARCHIVED';
  thumbnail_url: string;
  created_at: string;
};
