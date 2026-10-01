import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Ajuste para o seu domínio real em produção
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arturdiasfotografia.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/'], // Evita que o painel do Sanity seja indexado
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
