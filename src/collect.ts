import path from 'path'
import fs from 'fs'

const fsPromises = fs.promises

export default async function collect(
  roots: string[],
  extensions: Set<string>,
  ignore?: (item: string) => boolean,
) {
  const result = new Set<string>()

  const searchDir = async (dir: string) => {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true })

    await Promise.all(
      entries
        .map(entry => {
          const fileOrDirPath = path.join(dir, entry.name)
          if (ignore?.(fileOrDirPath)) return

          if (entry.isDirectory()) {
            return searchDir(fileOrDirPath)
          }

          if (extensions.has(path.extname(fileOrDirPath).slice(1))) {
            result.add(fileOrDirPath)
          }
        })
        .filter(Boolean)
    )
  }

  await Promise.all(roots.map(root => searchDir(root)))

  return result
}
