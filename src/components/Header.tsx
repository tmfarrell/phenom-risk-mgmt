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
    <div className="w-full bg-gray-100 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/ea083c57-2c98-4f52-9b12-3aab9125c621.png" 
          alt="OM1 Logo" 
          className="h-8"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-600 hover:text-gray-800"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};