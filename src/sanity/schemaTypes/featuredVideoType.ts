import {defineField, defineType} from 'sanity'

export const featuredVideoType = defineType({
  name: 'featuredVideo',
  title: 'Vídeos (Página Inicial)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título do Vídeo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'videoType',
      title: 'Origem do Vídeo',
      type: 'string',
      options: { list: ['Arquivo Nativo (Upload)', 'Link do YouTube'] },
      initialValue: 'Arquivo Nativo (Upload)',
    }),
    defineField({
      name: 'videoFile',
      title: 'Arquivo de Vídeo (.mp4)',
      description: 'Faça upload do vídeo. Funciona perfeitamente com o efeito de passar o mouse. (Ideal: até 30MB para não deixar o site lento)',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.videoType !== 'Arquivo Nativo (Upload)',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'Link do YouTube',
      type: 'url',
      description: 'Cole a URL do vídeo do YouTube. O efeito de passar o mouse pode demorar um pouco mais para carregar por vir do servidor deles.',
      hidden: ({ parent }) => parent?.videoType !== 'Link do YouTube',
    }),
    defineField({
      name: 'coverImage',
      title: 'Foto de Capa (Thumb)',
      description: 'A imagem que fica congelada antes de passar o mouse.',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'format',
      title: 'Formato na Grade',
      type: 'string',
      options: { list: ['Vertical (ex: Reels/Instagram)', 'Horizontal (ex: YouTube/Cinema)'] },
      initialValue: 'Vertical (ex: Reels/Instagram)',
    }),
    defineField({
      name: 'order',
      title: 'Ordem de Exibição na Página Inicial',
      description: 'Pode misturar com a numeração das categorias! Ex: Categoria 1, Vídeo 2, Categoria 3.',
      type: 'number',
      initialValue: 99,
    }),
  ],
})
