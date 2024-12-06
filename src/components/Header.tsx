import React from 'react';

export const Header = ({ title }: { title: string }) => {
  return (
    <div className="w-full">
      <div className="w-full h-[200px] relative mb-6">
        <img 
          src="/lovable-uploads/b1f3f269-8c2a-47d4-a798-45bcf74087c9.png" 
          alt="Header wave pattern" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
      </div>
    </div>
  );
};