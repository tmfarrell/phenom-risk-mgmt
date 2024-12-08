import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="w-full">
      <div className="w-full h-[200px] relative mb-6">
        <img 
          src="/lovable-uploads/b7fec014-bcbf-423b-9bea-34e92acb1a28.png" 
          alt="OM1 Logo" 
          className="absolute top-4 left-4 h-8"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {title === "PhenOM Risk Management Dashboard" && (
            <p className="text-gray-600 mt-2">Medicare Advantage Plan (All)</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};