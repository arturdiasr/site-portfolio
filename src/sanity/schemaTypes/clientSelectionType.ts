import { defineField, defineType } from 'sanity'

export const clientSelectionType = defineType({
  name: 'clientSelection',
  title: 'Seleções dos Clientes (Favoritas)',
  type: 'document',
  fields: [
    defineField({
      name: 'albumTitle',
      title: 'Nome do Ensaio / Álbum',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'albumSlug',
      title: 'Código / Slug do Álbum',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'clientEmail',
      title: 'E-mail do Cliente',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status da Seleção',
      type: 'string',
      options: {
        list: [
          { title: '🟡 Selecionando (Em Andamento)', value: 'in_progress' },
          { title: '🟢 Enviado para Edição', value: 'submitted' },
        ],
      },
    }),
    defineField({
      name: 'photoCount',
      title: 'Total de Fotos Favoritadas',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'selectedFiles',
      title: 'Lista de Fotos (Arquivos)',
      description: 'Nomes originais dos arquivos selecionados pelo cliente.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'lastActivityAt',
      title: 'Última Interação',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'submittedAt',
      title: 'Data de Envio para Edição',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Mais recentes primeiro',
      name: 'lastActivityDesc',
      by: [{ field: 'lastActivityAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'albumTitle',
      subtitle: 'clientEmail',
      photoCount: 'photoCount',
      status: 'status',
    },
    prepare({ title, subtitle, photoCount, status }) {
      const statusLabel = status === 'submitted' ? '🟢 Enviado' : '🟡 Em andamento'
      const countLabel = `${photoCount || 0} fotos`
      return {
        title: title || 'Ensaio sem título',
        subtitle: `${subtitle || 'Sem e-mail'} • ${statusLabel} (${countLabel})`,
      }
    },
  },
})
