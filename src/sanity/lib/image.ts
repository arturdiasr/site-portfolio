import createImageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const imageBuilder = createImageUrlBuilder(client)

export const urlForImage = (source: any) => {
  return imageBuilder?.image(source).auto('format').fit('max').width(1200).quality(84)
}

export const imageThumb = (source: any) =>
  urlForImage(source).width(850).quality(82).url()

export const imageCarousel = (source: any) =>
  urlForImage(source).width(640).quality(80).url()

export const imageFull = (source: any) =>
  urlForImage(source).width(2048).quality(90).url()

