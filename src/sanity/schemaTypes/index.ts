import { type SchemaTypeDefinition } from 'sanity'
import { galleryType } from './galleryType'
import { categoryType } from './categoryType'
import { clientAlbumType } from './clientAlbumType'
import { featuredVideoType } from './featuredVideoType'
import { deliveryType } from './deliveryType'
import { testimonialType } from './testimonialType'
import { clientSelectionType } from './clientSelectionType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [categoryType, galleryType, clientAlbumType, clientSelectionType, featuredVideoType, deliveryType, testimonialType],
}
