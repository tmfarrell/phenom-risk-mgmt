import React from 'react';

export const TitleSection = ({ title }: { title: string }) => {
  return (
    <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-12 px-6">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <div className="absolute inset-0 bg-[url('/wave-pattern.svg')] opacity-10" />
    </div>
  );
};