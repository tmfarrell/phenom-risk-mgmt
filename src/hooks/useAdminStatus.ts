
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
          setIsAdmin(false);
          return;
        }
        
        // Check if the user ID exists in the roles table with role 'admin'
        // Use a more generic query approach to avoid TypeScript errors
        const { data, error } = await supabase
          .from('roles')
          .select('role')
          .eq('id', session.user.id)
          .eq('role', 'admin')
          .single() as unknown as { 
            data: { role: string } | null, 
            error: Error | null 
          };
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
          console.error('Error checking admin status:', error);
          setError(error instanceof Error ? error : new Error(String(error)));
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
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
