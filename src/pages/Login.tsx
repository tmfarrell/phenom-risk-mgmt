import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';

export const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check current auth session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (session) {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        hideLogout 
        bgClassName="bg-gray-100"
        logoSrc="/lovable-uploads/ea083c57-2c98-4f52-9b12-3aab9125c621.png"
      />
      <TitleSection title="PhenOM Risk Management Dashboard" />
      <div className="container max-w-md mx-auto pt-8">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
      </div>
    </div>
  );
};