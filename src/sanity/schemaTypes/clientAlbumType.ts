import {defineField, defineType} from 'sanity'
import {PasswordInput, WhatsappMessageInput} from '../components/ClientAlbumInputs'
import {ClientSelectionsViewer} from '../components/ClientSelectionsViewer'

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
      name: 'requireEmail',
      title: 'Exigir e-mail do cliente para acessar',
      description: 'Se ativado (padrão para novos ensaios), o cliente precisará informar seu e-mail junto com a senha. Desative caso deseje liberar o acesso apenas com a senha.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'liveSelections',
      title: 'Acompanhamento da Seleção de Fotos (Tempo Real)',
      description: 'Veja as fotos favoritadas e a lista para o Lightroom a qualquer momento.',
      type: 'string',
      components: { input: ClientSelectionsViewer },
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
