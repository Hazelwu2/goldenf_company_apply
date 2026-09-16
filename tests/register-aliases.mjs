/**
 * 让 `node --test` 能解析 Vite 的 `@/` 路径别名与省略副档名的相对汇入。
 *
 * Vite 与 vue-tsc 会依 tsconfig 的 paths 解析 `@/`，但 Node 原生的 ESM
 * 解析器不会，因此汇入 Store 一类使用别名的模组会失败。此处以 resolve hook
 * 补上同样的对应，让纯逻辑测试可以直接涵盖 Store。
 *
 * 使用方式（见 package.json 的 test script）：
 *   node --import ./tests/register-aliases.mjs --test tests/*.test.ts
 */
import { registerHooks } from 'node:module'
import { existsSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const srcDir = fileURLToPath(new URL('../src/', import.meta.url))

/** 与 tsconfig.app.json 的 paths 对应：`@/*` -> `src/*`。 */
const ALIAS = '@/'

const EXTENSIONS = ['.ts', '.tsx', '.mts', '.js', '.mjs']

/** 依序尝试原路径、补上副档名、以及目录下的 index 档。 */
function resolveFile(basePath) {
  if (existsSync(basePath) && statSync(basePath).isFile()) return basePath

  for (const ext of EXTENSIONS) {
    const candidate = `${basePath}${ext}`
    if (existsSync(candidate)) return candidate
  }

  for (const ext of EXTENSIONS) {
    const candidate = path.join(basePath, `index${ext}`)
    if (existsSync(candidate)) return candidate
  }

  return null
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(ALIAS)) {
      const resolved = resolveFile(path.join(srcDir, specifier.slice(ALIAS.length)))
      if (!resolved) {
        throw new Error(`无法解析别名汇入：${specifier}（已在 ${srcDir} 下寻找）`)
      }
      return { url: pathToFileURL(resolved).href, shortCircuit: true }
    }

    // 省略副档名的相对汇入（例如 './applicationReview'）：先交给 Node，失败再补副档名。
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      try {
        return nextResolve(specifier, context)
      } catch (error) {
        const parentDir = path.dirname(fileURLToPath(context.parentURL))
        const resolved = resolveFile(path.resolve(parentDir, specifier))
        if (!resolved) throw error
        return { url: pathToFileURL(resolved).href, shortCircuit: true }
      }
    }

    return nextResolve(specifier, context)
  },
})
