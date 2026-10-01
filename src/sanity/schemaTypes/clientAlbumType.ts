import {defineField, defineType} from 'sanity'

export const clientAlbumType = defineType({
  name: 'clientAlbum',
  title: 'Área do Cliente (Álbuns)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome do Ensaio / Cliente',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Link de Acesso (URL)',
      description: 'Clique em "Generate" para criar o final do link.',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'password',
      title: 'Senha de Acesso',
      description: 'A senha que o cliente precisará digitar para acessar a galeria.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Foto de Capa (Tela de Login)',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'images',
      title: 'Fotos para Escolha',
      description: 'Arraste as fotos aqui. O sistema preserva o nome original do arquivo automaticamente (ex: DSC_001.JPG).',
      type: 'array',
      options: { layout: 'grid' },
      of: [{ type: 'image' }],
    }),
  ],
})
