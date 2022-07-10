export interface Collection {
  [key: string]: any
}

export interface Opts {
  searchRoots: string[]
  collectionFileDest: string
  extensions?: string[]
  ignore?: (imageAbsPath: string) => boolean
  createImageId?: (imageAbsPath: string) => string
}

