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
      name: 'coverImage',
      title: 'Foto de Capa da Categoria',
      description: 'Esta é a foto que vai aparecer na página inicial principal.',
      type: 'image',
      options: { hotspot: true }
    }),
  ],
})
