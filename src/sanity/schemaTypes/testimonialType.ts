import {defineField, defineType} from 'sanity'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Depoimentos de Clientes',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'rating',
      title: 'Estrelas (1 a 5)',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1).max(5),
    }),
    defineField({
      name: 'text',
      title: 'Depoimento',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: 'approved',
      title: 'Aprovado (aparece na página inicial)',
      description: 'Marque para exibir este depoimento no site. Depoimentos novos chegam desmarcados.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'text', rating: 'rating', approved: 'approved' },
    prepare({ title, subtitle, rating, approved }) {
      return {
        title: `${approved ? '✅' : '⏳'} ${title} — ${'★'.repeat(rating || 0)}`,
        subtitle,
      }
    },
  },
})
