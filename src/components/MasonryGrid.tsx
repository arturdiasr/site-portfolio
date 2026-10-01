'use client';

import Masonry from 'react-masonry-css';
import React from 'react';

// Um grid Masonry inteligente que lê os itens da esquerda para a direita
// e os distribui nas colunas para que a leitura visual fique na ordem correta,
// ao contrário do CSS columns nativo que empilha 1, 2, 3 na mesma coluna vertical.
export default function MasonryGrid({ children, cols }: { children: React.ReactNode, cols?: any }) {
  const breakpointColumnsObj = cols || {
    default: 3,
    1536: 3, // 2xl
    1024: 3, // lg
    768: 2,  // md
    640: 1,  // sm
    500: 1   // mobile
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto -ml-6"
      columnClassName="pl-6 bg-clip-padding"
    >
      {children}
    </Masonry>
  );
}
