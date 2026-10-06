import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Categoria de Trabalho',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome da Categoria (Ex: Arquitetura e Interiores)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Ordem de Exibição (Ex: 1, 2, 3...)',
      description: 'Use números para ordenar como as categorias aparecem na página inicial. Números menores aparecem primeiro.',
      type: 'number',
      initialValue: 99
    }),
    defineField({
      name: 'coverImage',
      title: 'Foto de Capa da Categoria',
      description: 'Esta é a foto que vai aparecer na página inicial principal.',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'favoriteImages',
      title: 'Fotos Favoritas / Rotativas (Opcional)',
      description: 'Selecione ou suba fotos extras para rotacionar no card desta categoria na página principal (recomenda-se até 5 fotos).',
      type: 'array',
      options: { layout: 'grid' },
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({
      name: 'images',
      title: 'Fotos Soltas da Categoria',
      description: 'Arraste fotos soltas que pertencem a esta categoria (sem precisar criar um álbum/evento específico para elas).',
      type: 'array',
      options: { layout: 'grid' },
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'isCover',
              title: 'Tornar essa foto a capa da categoria',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'isFavorite',
              title: 'Foto Favorita (aparece na rotação do card na Home)',
              description: 'Marque para incluir esta foto no rodízio do card desta categoria na página principal.',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'caption',
              title: 'Nome / Tag da Foto',
              type: 'string',
            }
          ]
        }
      ]
    }),
  ],
  orderings: [
    {
      title: 'Ordem de Exibição',
      name: 'orderAsc',
      by: [
        {field: 'order', direction: 'asc'}
      ]
    }
  ]
})
