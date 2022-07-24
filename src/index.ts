import type webpack from 'webpack'
import collect from './collect'
import { imageExtensions } from './constants'
import { Opts } from './types'
import fs from 'fs'
import os from 'os'
import { defaultIdCreator } from './getImageFactory'

const fsPromises = fs.promises

export class CollectImagePlugin {
  searchRoots: string[]
  collectionFileDest: string
  extensions: Set<string>
  ignore?: (imageAbsPath: string) => boolean
  createImageId: (imageAbsPath: string) => string

  constructor(opts: Opts) {
    this.searchRoots = opts.searchRoots
    this.extensions = new Set(
      [
        ...imageExtensions,
        ...opts.extensions ?? [],
      ]
        .map(xs => xs.startsWith('.') ? xs.slice(1) : xs)
        .map(xs => xs.toLowerCase())
    )
    this.collectionFileDest = opts.collectionFileDest
    this.ignore = opts.ignore
    this.createImageId = opts.createImageId ?? defaultIdCreator
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeRun.tapPromise('CollectImagePlugin', async () => {
      // compiler.hooks.environment.tap('CollectImagePlugin', () => {

      const fn = async () => {
        const files = await collect(this.searchRoots, this.extensions, this.ignore)
        const str = JSON.stringify(
          Array.from(files)
            .sort((a, z) => a > z ? 1 : -1)
            .reduce((acc, file) => ({ ...acc, [this.createImageId(file)]: `__##REQUIRE##__${file}` }), {}),
          null,
          2,
        )
        const code = str.replace(/"__##REQUIRE##__(.*)"/ig, `require('$1')`) // trim quotes

        if (this.collectionFileDest.toLowerCase().endsWith('.ts')) {
          return fsPromises.writeFile(this.collectionFileDest, `const collection=${code}${os.EOL}export default collection`, { encoding: 'utf-8' })
        }

        return fsPromises.writeFile(this.collectionFileDest, `module.exports=${code}`, { encoding: 'utf-8' })
      }

      fn()
    })
  }
}

export function withCollectImage(opts: { collectImageOpts: Opts, [key: string]: unknown }) {
  const { collectImageOpts, ...nextConfig } = opts

  return Object.assign(
    {},
    nextConfig,
    {
      webpack(config: webpack.Configuration, options: { isServer: boolean }) {
        if (options.isServer) {
          config.plugins = [
            ...config.plugins ?? [],
            new CollectImagePlugin(collectImageOpts),
          ]
        }

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      }
    }
  )
}
