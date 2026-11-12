import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// 🔑 SUPABASE CREDENTIALS DIRECT CONFIGURATION
// I-paste diri ang imong Project URL ug anon key gikan sa Supabase Dashboard:
// (Supabase Dashboard -> Project Settings -> API)
// ==============================================================================
export const SUPABASE_URL = 'https://fltyjarureftmpuhflql.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdHlqYXJ1cmVmdG1wdWhmbHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwOTUwNTksImV4cCI6MjEwOTY3MTA1OX0.YVSIuEhcmoY7Ny4dpZDfOcj2DsA75iDcM4Jmt15f410';

/**
 * Check if actual Supabase URL & Anon Key have been supplied directly
 */
export function isSupabaseConfigured() {
  const url = SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL || '';
  const key = SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

  return (
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-key')
  );
}

/**
 * Supabase client instance
 */
const effectiveUrl = isSupabaseConfigured()
  ? (SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL)
  : 'https://placeholder-project.supabase.co';

const effectiveKey = isSupabaseConfigured()
  ? (SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)
  : 'placeholder-anon-key-dummy';

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;
