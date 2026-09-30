import {defineField, defineType} from 'sanity'

export const siteConfigType = defineType({
  name: 'siteConfig',
  title: 'Configurações do Site (Instagram)',
  type: 'document',
  fields: [
    defineField({
      name: 'instagramUrl',
      title: 'Link do seu Instagram',
      type: 'url',
      initialValue: 'https://www.instagram.com/arturdias/'
    }),
    defineField({
      name: 'instagramPosts',
      title: 'Fotos Recentes do Instagram (Rodapé)',
      description: 'Faça upload de 4 fotos para aparecerem no rodapé do site como se fosse o seu feed do Instagram.',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'link',
              title: 'Link da postagem (Opcional)',
              type: 'url'
            }
          ]
        }
      ],
      validation: (rule) => rule.max(4).warning('O rodapé foi desenhado para mostrar 4 fotos.')
    })
  ],
})
