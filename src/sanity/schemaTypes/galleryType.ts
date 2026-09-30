import {defineField, defineType} from 'sanity'

export const galleryType = defineType({
  name: 'gallery',
  title: 'Galeria',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título da Galeria (Ex: Casamento X)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'reference', // Agora é uma referência dinâmica à Categoria
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Foto de Capa',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Fotos da Galeria (Arraste várias de uma vez)',
      type: 'array',
      options: {
        layout: 'grid', // Mostra as fotos como um "grid" no painel, facilitando organizar
      },
      of: [
        {
          type: 'image', 
          options: {hotspot: true},
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Nome / Tag da foto',
              description: 'Opcional. Uma legenda ou nome para esta foto específica.'
            }
          ]
        }
      ],
    }),
  ],
})
