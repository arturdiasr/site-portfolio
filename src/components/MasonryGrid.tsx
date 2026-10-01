'use client';

import Masonry from 'react-masonry-css';
import React from 'react';

// Um grid Masonry inteligente que lê os itens da esquerda para a direita
// e os distribui nas colunas para que a leitura visual fique na ordem correta,
// ao contrário do CSS columns nativo que empilha 1, 2, 3 na mesma coluna vertical.
export default function MasonryGrid({ children }: { children: React.ReactNode }) {
  const breakpointColumnsObj = {
    default: 5,
    1536: 5, // 2xl
    1024: 4, // lg
    768: 3,  // md
    640: 2,  // sm
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
