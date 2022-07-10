# collect-image-plugin

A webpack Plugin collect all images files to a js/ts file. you use local images in MD/MDX file with this plugin. 
It should be evey helpful when use with next-mdx-remote.


## Installation

```
yarn add collect-image-plugin
```
or
```
npm install collect-image-plugin
```

## Usage
create a `next.config.mjs` in your project
```js
// next.config.mjs
import { withCollectImage } from 'collect-image-plugin'
import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = withCollectImage({
  collectImageOpts: {
    searchRoots: [path.resolve('./posts')],
    collectionFileDest: path.resolve('./posts/image_collection.js')
  },
  reactStrictMode: true,
})

export default nextConfig
```
with this config, all images files in searchRoots will be required/imported to collectionFileDest .

Then import collection and use getImageFactory util from `collect-image-plugin` to getImage src

```js
// pages/posts/[slug].tsx
import getImageFactory from 'collect-image-plugin/dist/getImageFactory'
// import the generated images collection
import collection from '../posts/image_collection'
import Image from "next/image";

const getImage = getImageFactory(collection)

export default function Post({ mdxContent, currentMdFilePath }) {
  return <MDXRemote {...mdxContent} components={{img: props => <Image src={getImage(currentMdFilePath, props.src)} />}} />
}

export const getStaticProps = async (context) => {
  // ...skip...

  // must return currentMdFile path, which use to get image absolute path
  return {
    props: {
      currentMdFilePath,
      mdxContent,
    }
  }
}
```

## Options
```ts
//  withCollectImage(opts: Opts)
export interface Opts {
  searchRoots: string[]
  collectionFileDest: string
  extensions?: string[]
  ignore?: (imageAbsPath: string) => boolean
  createImageId?: (imageAbsPath: string) => string
}
```
