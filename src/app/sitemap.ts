import { MetadataRoute } from 'next';
import { client } from "@/sanity/lib/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arturdiasfotografia.com.br';

  // Páginas estáticas do site
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cliente`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Buscar URLs dinâmicas do Sanity
  // Categorias
  const categories = await client.fetch(`*[_type == "category"]{ _id, _updatedAt }`);
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat: any) => ({
    url: `${baseUrl}/categoria/${cat._id}`,
    lastModified: new Date(cat._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Galerias
  const galleries = await client.fetch(`*[_type == "gallery"]{ _id, _updatedAt }`);
  const galleryPages: MetadataRoute.Sitemap = galleries.map((gal: any) => ({
    url: `${baseUrl}/galeria/${gal._id}`,
    lastModified: new Date(gal._updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Clientes
  const clientes = await client.fetch(`*[_type == "clientAlbum"]{ "slug": slug.current, _updatedAt }`);
  const clientePages: MetadataRoute.Sitemap = clientes.map((cli: any) => ({
    url: `${baseUrl}/cliente/${cli.slug}`,
    lastModified: new Date(cli._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...galleryPages, ...clientePages];
}
