import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {media} from 'sanity-plugin-media'
import {schema} from './src/sanity/schemaTypes'
import {MovePhotosTool} from './src/sanity/tools/MovePhotosTool'
import {QuickAlbumManagerTool} from './src/sanity/tools/QuickAlbumManagerTool'

export default defineConfig({
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0rdhamr8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'Portfolio Artur Dias',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .id('quick-album-manager')
              .title('🗑️ Excluir / Gerenciar Álbuns Rápido')
              .child(
                S.component(QuickAlbumManagerTool)
                  .id('quick-album-manager-pane')
                  .title('Exclusão Rápida de Álbuns e Entregas')
              ),
            S.divider(),
            S.documentTypeListItem('category').title('Categoria de Trabalho'),
            S.documentTypeListItem('gallery').title('Galeria'),
            S.documentTypeListItem('clientAlbum').title('Área do Cliente (Álbuns)'),
            S.documentTypeListItem('clientSelection').title('Seleções dos Clientes (Favoritas)'),
            S.documentTypeListItem('delivery').title('Entrega de Fotos Finais'),
            S.documentTypeListItem('testimonial').title('Depoimentos de Clientes'),
            S.documentTypeListItem('featuredVideo').title('Vídeos (Página Inicial)'),
            S.divider(),
            S.documentTypeListItem('siteConfig').title('⚙️ Configurações & Senha Admin'),
          ]),
    }),
    media()
  ],
  schema: {
    types: schema.types,
  },
  tools: [
    {
      name: 'move-photos',
      title: 'Organizar Fotos',
      component: MovePhotosTool,
    },
    {
      name: 'quick-delete-albums',
      title: 'Excluir Álbuns',
      component: QuickAlbumManagerTool,
    },
  ]
})
