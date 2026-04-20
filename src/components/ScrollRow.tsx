import React from 'react';

interface ScrollRowProps {
  title: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}

export default function ScrollRow({ title, rightSlot, children }: ScrollRowProps) {
  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-5 px-4 md:px-8">
        <h2 className="text-3xl font-extrabold text-pink-brand tracking-tight border-l-4 border-pink-brand pl-4">
          {title}
        </h2>
        {rightSlot}
      </div>
      <div className="scroll-row flex gap-4 overflow-x-auto px-4 md:px-8 pb-6">
        {children}
      </div>
    </section>
  );
}
