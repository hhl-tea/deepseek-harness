/**
 * Apply the DSH 0.2.2-rc.3 compatibility patches to an installed `pi2dsh`.
 *
 * `pi2dsh@0.28.0-next.1` declares `0.2.2-alpha.3` peers. Running it on the `0.2.2-rc.3`
 * host needs three fixes in its shipped bundle; the patch is idempotent and is applied
 * to the profile's installed copy, never to `~/.dsh` sources or the npm registry.
 *
 * Usage: node apply.mjs [profileDir]
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const profileDir = process.argv[2] ?? join(homedir(), '.dsh', 'profiles', 'web')
const distDir = join(profileDir, 'node_modules', 'pi2dsh', 'dist')

const bundle = (await readdir(distDir)).find(name => /^runtime-.*\.mjs$/.test(name))
if (!bundle) throw new Error(`no pi2dsh runtime bundle under ${distDir}`)
const path = join(distDir, bundle)
let source = await readFile(path, 'utf8')
const before = source

// 1. Cordis 4.1 removed the `ctx.root` accessor; the root context is keyed by
//    Symbol.for('cordis.root'), which every released Cordis also provides.
source = source.replaceAll('ctx.root', 'ctx[Symbol.for("cordis.root")]')

// 2. Route companions are re-swept on `llm/adapters-updated` only. The host loads
//    provider catalogs after adapters register and announces them on
//    `llm/models-updated`, so a sweep that misses that event never sees any model.
const adapterSweep = '\t\tctx.on("llm/adapters-updated", () => {\n\t\t\trunSweep();\n\t\t});'
const modelSweep = adapterSweep + '\n\t\tctx.on("llm/models-updated", () => {\n\t\t\trunSweep();\n\t\t});'
if (source.includes(adapterSweep) && !source.includes('llm/models-updated')) {
  source = source.replace(adapterSweep, modelSweep)
}

// 3. Startup publishes an empty provider directory before profiles finish mounting.
//    A sweep that treats it as authoritative disposes the companions it just
//    registered, and nothing re-registers them afterwards.
const providerList = '\t\tconst providers = llm.listProviders();'
const guardedList = providerList + '\n\t\tif (providers.length === 0) return;'
if (!source.includes(guardedList)) source = source.replace(providerList, guardedList)

if (source === before) {
  console.log(`pi2dsh: already patched (${path})`)
} else {
  await writeFile(path, source, 'utf8')
  console.log(`pi2dsh: patched ${path}`)
}
