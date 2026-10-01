import createImageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const imageBuilder = createImageUrlBuilder(client)

export const urlForImage = (source: any) => {
  return imageBuilder?.image(source).auto('format').fit('max').width(1600).quality(80)
}
