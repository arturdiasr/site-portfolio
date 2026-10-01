import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {media} from 'sanity-plugin-media'
import {schema} from './src/sanity/schemaTypes'

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
            S.documentTypeListItem('category').title('Categoria de Trabalho'),
            S.documentTypeListItem('gallery').title('Galeria'),
            S.documentTypeListItem('clientAlbum').title('Área do Cliente (Álbuns)'),
            S.documentTypeListItem('featuredVideo').title('Vídeos (Página Inicial)'),
          ]),
    }),
    media()
  ],
  schema: {
    types: schema.types,
  },
})
