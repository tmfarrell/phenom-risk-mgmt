import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/ea083c57-2c98-4f52-9b12-3aab9125c621.png" 
            alt="OM1 Logo" 
            className="h-8 hover:opacity-90 transition-opacity"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition-colors duration-200"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};