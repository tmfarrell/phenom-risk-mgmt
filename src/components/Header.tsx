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
          src="/lovable-uploads/b1f3f269-8c2a-47d4-a798-45bcf74087c9.png" 
          alt="Header wave pattern" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {title === "PhenOM Risk Management Dashboard" && (
            <p className="text-white mt-2">Medicare Advantage Plan (All)</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:text-white/80"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};