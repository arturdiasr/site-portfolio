import { type SchemaTypeDefinition } from 'sanity'
import { galleryType } from './galleryType'
import { categoryType } from './categoryType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [categoryType, galleryType],
}
