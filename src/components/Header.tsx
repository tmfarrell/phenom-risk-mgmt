
import React, { useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ui/use-toast';
import { AuthContext } from '@/App';
import { useAppVersion } from '@/hooks/useAppVersion';

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useContext(AuthContext);
  const { appVersion } = useAppVersion();
  
  console.log('Is admin in Header:', isAdmin); // Keep logging for debugging

  const getVersionDisplayName = (version: string): string => {
    switch (version) {
      case 'patient':
        return 'Patient Risk Panel';
      case 'safety':
        return 'Safety Risk Panel';
      case 'cohort':
        return 'Cohort Risk Panel';
      default:
        return 'Patient Risk Panel';
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        duration: 2000
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  return (
    <div className="w-full bg-gray-100 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/ea083c57-2c98-4f52-9b12-3aab9125c621.png" 
          alt="OM1 Logo" 
          className="h-8"
        />
        <span className="ml-2 text-sm font-medium text-gray-700">
          | {getVersionDisplayName(appVersion)}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-gray-800"
            onClick={() => navigate('/settings')}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-800"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
