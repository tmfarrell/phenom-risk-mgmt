import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://onyninrwfmomluobsvpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueW5pbnJ3Zm1vbWx1b2JzdnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NTg1NzcsImV4cCI6MjAyNTIzNDU3N30.GDW-3yMjrYYwTxkF7QBwsF0Q9Lgy_VWRVXEQJpYbvPs';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase client initialized');
  
  // Test the connection
  void supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      console.log('Connected to Supabase with session:', session.user.id);
    } else {
      console.log('Connected to Supabase (no active session)');
    }
  }).catch(error => {
    console.error('Error connecting to Supabase:', error);
  });
}