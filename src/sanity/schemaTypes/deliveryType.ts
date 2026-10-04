import {defineField, defineType} from 'sanity'
import {DeliveryMessageInput} from '../components/DeliveryInputs'

export const deliveryType = defineType({
  name: 'delivery',
  title: 'Entrega de Fotos Finais',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome do Cliente / Ensaio',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Link de Entrega (URL)',
      description: 'Clique em "Generate". O cliente acessará: seusite.com.br/entrega/o-nome-gerado',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'externalUrl',
      title: 'Link do Download (WeTransfer, Drive, etc.)',
      description: 'Cole aqui o link já gerado no serviço onde você subiu as fotos sem compressão.',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['https', 'http'] }),
    }),
    defineField({
      name: 'validityDays',
      title: 'Validade do link no site',
      description: 'Contado a partir da criação deste documento. Depois disso a página mostra "link expirado" e o link externo deixa de ser exibido.',
      type: 'number',
      options: {
        list: [
          { title: '7 dias', value: 7 },
          { title: '14 dias', value: 14 },
        ],
        layout: 'radio',
      },
      initialValue: 7,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'deliveryMessage',
      title: 'Mensagem para o Cliente (WhatsApp) — privado',
      description: 'Visível só para você. Copie e envie ao cliente.',
      type: 'string',
      components: { input: DeliveryMessageInput },
    }),
  ],
})
