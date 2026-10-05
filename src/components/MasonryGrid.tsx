'use client';

import React, { useState, useEffect } from 'react';

export default function MasonryGrid({ children, cols }: { children: React.ReactNode, cols?: any }) {
  const [currentCols, setCurrentCols] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateCols = () => {
      if (window.innerWidth < 640) setCurrentCols(1);
      else if (window.innerWidth < 1024) setCurrentCols(2);
      else setCurrentCols(3);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const renderCols = mounted ? currentCols : 3;
  const childArray = React.Children.toArray(children);
  const columns: React.ReactNode[][] = Array.from({ length: renderCols }, () => []);

  childArray.forEach((child, idx) => {
    columns[idx % renderCols].push(child);
  });

  return (
    <div className={`grid gap-6 w-full items-start transition-all ${renderCols === 1 ? 'grid-cols-1' : renderCols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-6 w-full min-w-0">
          {col}
        </div>
      ))}
    </div>
  );
}
