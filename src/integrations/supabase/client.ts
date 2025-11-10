import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://onyninrwfmomluobsvpt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueW5pbnJ3Zm1vbWx1b2JzdnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MTU3MTgsImV4cCI6MjA0OTA5MTcxOH0.4S6y_hacaK000pfd4101pKvctYXHCdLd-iy-OGrO4dQ";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Add debug logging for auth state and API calls
supabase.auth.onAuthStateChange((event, session) => {
  //console.log('Supabase auth event:', event);
});

// Add debug logging for API calls using Promise methods
void (async () => {
  try {
    const response = await supabase.from('patient').select('*');
  } catch (error) {
    console.error('Test API call error:', error);
  }
})();