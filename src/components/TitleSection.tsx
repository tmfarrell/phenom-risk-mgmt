import React from 'react';

interface TitleSectionProps {
  title: string;
}

export const TitleSection: React.FC<TitleSectionProps> = ({ title }) => {
  return (
    <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-12 px-6">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          backgroundImage: 'url(./lovable-uploads/b1f3f269-8c2a-47d4-a798-45bcf74087c9.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );
};