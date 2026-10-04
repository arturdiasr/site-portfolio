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
      name: 'deliveryMessage',
      title: 'Mensagem para o Cliente (WhatsApp) — privado',
      description: 'Visível só para você. Copie e envie ao cliente.',
      type: 'string',
      components: { input: DeliveryMessageInput },
    }),
  ],
})
