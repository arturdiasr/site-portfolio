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
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'workDate',
      title: 'Data do Trabalho',
      description: 'Escolha a data exata para ordenar corretamente. No site aparecerá apenas Mês e Ano.',
      type: 'date',
      options: {
        dateFormat: 'DD/MM/YYYY',
      }
    }),
    defineField({
      name: 'coverImage',
      title: 'Foto de Capa',
      description: 'Você pode subir uma foto aqui OU marcar uma das fotos da galeria abaixo como "Usar como Capa" (o site dará preferência para a foto marcada abaixo).',
      type: 'image',
      options: {
        hotspot: true,
      }
    }),
    defineField({
      name: 'images',
      title: 'Fotos da Galeria (Arraste várias de uma vez, mude a ordem arrastando)',
      type: 'array',
      options: {
        layout: 'grid',
      },
      of: [
        {
          type: 'image', 
          options: {hotspot: true},
          fields: [
            {
              name: 'isCover',
              title: 'Tornar essa foto capa do álbum',
              type: 'boolean',
              initialValue: false,
            },
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
