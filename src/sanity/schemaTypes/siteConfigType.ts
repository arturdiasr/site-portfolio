import {defineField, defineType} from 'sanity'

export const siteConfigType = defineType({
  name: 'siteConfig',
  title: 'Configurações do Site & Admin',
  type: 'document',
  fields: [
    defineField({
      name: 'adminMasterPassword',
      title: 'Senha Mestre de Admin (Modo Fantasma / Área do Cliente)',
      description: 'Use esta senha em /cliente ou em qualquer álbum para visualizar como visitante sem exigir e-mail, sem registrar acesso e sem criar lista de seleção no portfólio. Padrão caso vazio: adminartur',
      type: 'string',
      initialValue: 'adminartur',
    }),
    defineField({
      name: 'lightroomApiKey',
      title: 'Chave do Plugin Lightroom (API Key)',
      description: 'Chave secreta para autorizar a exportação direta do Adobe Lightroom Classic para o portfólio. Padrão caso vazio: artur-lr-2026',
      type: 'string',
      initialValue: 'artur-lr-2026',
    }),
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
