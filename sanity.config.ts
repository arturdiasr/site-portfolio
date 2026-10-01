import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {media} from 'sanity-plugin-media'
import {schema} from './src/sanity/schemaTypes'

export default defineConfig({
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0rdhamr8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'Portfolio Artur Dias',
  plugins: [structureTool(), media()],
  schema: {
    types: schema.types,
  },
})
