
import React from 'react';

interface TitleSectionProps {
  title: string;
}

export const TitleSection: React.FC<TitleSectionProps> = ({ title }) => {
  return (
    <div 
      className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-8 px-6"
      style={{ 
          backgroundImage: 'url(/lovable-uploads/b1f3f269-8c2a-47d4-a798-45bcf74087c9.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
    >
      <div className="max-w-[1600px] mx-auto text-left">
        <h1 className="text-3xl">
          <span className="font-bold">PhenOM</span>
          <span className="align-super text-sm">™</span>
          <span className="font-bold"> Patient Risk Panel</span>
        </h1>
        {/*<p className="text-sm mt-2 opacity-90">Medicare Advantage Plan (All)</p>*/}
      </div>
    </div>
  );
};
