import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 1. YOUR PERSONAL DATABASE (Default - For Auth, Users, and History)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// 2. LOVABLE DATABASE (Strictly for the AI Edge Function)
const LOVABLE_URL = import.meta.env.VITE_LOVABLE_URL;
const LOVABLE_PUBLISHABLE_KEY = import.meta.env.VITE_LOVABLE_PUBLISHABLE_KEY;

export const lovableClient = createClient(LOVABLE_URL, LOVABLE_PUBLISHABLE_KEY);