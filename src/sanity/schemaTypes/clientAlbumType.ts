import {defineField, defineType} from 'sanity'
import {PasswordInput, WhatsappMessageInput} from '../components/ClientAlbumInputs'

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
      description: 'Clique em "Generate". O link que você vai mandar pro cliente será: www.arturdiasfotografia.com.br/cliente/o-nome-gerado',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'password',
      title: 'Senha de Acesso',
      description: 'A senha que o cliente precisará digitar para acessar a galeria. Digite uma ou use os botões para gerar automaticamente.',
      type: 'string',
      components: { input: PasswordInput },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'Mensagem para o Cliente (WhatsApp) — privado',
      description: 'Visível só para você. Depois de preencher link, senha e fotos, copie e envie ao cliente.',
      type: 'string',
      components: { input: WhatsappMessageInput },
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
