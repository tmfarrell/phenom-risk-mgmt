
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found');
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        console.log('Checking admin status for user:', session.user.id);
        
        // Use the RPC function to check admin role without triggering RLS
        const { data, error } = await supabase
          .rpc('check_admin_role', { user_uuid: session.user.id });
        
        if (error) {
          console.error('Error checking admin status:', error);
          setError(new Error(error.message));
          setIsAdmin(false);
        } else {
          const adminStatus = !!data;
          console.log('Admin status result:', adminStatus, data);
          setIsAdmin(adminStatus);
        }
      } catch (err) {
        console.error('Unexpected error checking admin status:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
    
    // Set up subscription to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { isAdmin, loading, error };
};
