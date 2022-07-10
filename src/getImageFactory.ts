import path from 'path'

// TODO: add more proto
const isRemote = (src: string) => /^https?:\/\//ig.test(src)

export const defaultIdCreator = (imagePath: string) => imagePath.split(path.sep).map(xs => xs.replace(/[-\.]+/ig, '_')).join('_')

export default function getImageFactory(collection: any, createImageId = defaultIdCreator) {
  return (currentMdFilePath: string, src: string) => {
    if (isRemote(src)) return src

    const imageAbsPath = path.join(path.dirname(currentMdFilePath), src)
    return collection[createImageId(imageAbsPath)]
  }
}
