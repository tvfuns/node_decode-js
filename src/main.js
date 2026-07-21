import fs from 'fs'
import { parseArgs } from 'node:util'
import PluginCommon from './plugin/common.js'
import PluginJjencode from './plugin/jjencode.js'
import PluginSojson from './plugin/sojson.js'
import PluginSojsonV7 from './plugin/sojsonv7.js'
import PluginObfuscator from './plugin/obfuscator.js'
import PluginAwsc from './plugin/awsc.js'

// Read arguments
const { values } = parseArgs({
  options: {
    type: { type: 'string', short: 't', default: 'common' },
    input: { type: 'string', short: 'i', default: 'input.js' },
    output: { type: 'string', short: 'o', default: 'output.js' },
  },
})
const type = values.type
const encodeFile = values.input
const decodeFile = values.output
console.log(`Type: ${type}`)
console.log(`Input: ${encodeFile}`)
console.log(`Output: ${decodeFile}`)

const plugins = {
  common: PluginCommon,
  jjencode: PluginJjencode,
  sojson: PluginSojson,
  sojsonv7: PluginSojsonV7,
  obfuscator: PluginObfuscator,
  awsc: PluginAwsc,
}

const main = () => {
  // Validate the type
  if (!Object.hasOwn(plugins, type)) {
    console.error(
      `Unknown type: ${type}. Valid values: ${Object.keys(plugins).join(', ')}`,
    )
    process.exitCode = 1
    return
  }

  // Read the source code
  let sourceCode
  try {
    sourceCode = fs.readFileSync(encodeFile, { encoding: 'utf-8' })
  } catch (e) {
    console.error(`Cannot read input file ${encodeFile}: ${e.message}`)
    process.exitCode = 1
    return
  }

  // Purify the source code
  const code = plugins[type](sourceCode)

  // Write the output
  if (!code) {
    console.error('Purification failed; no output written')
    process.exitCode = 1
    return
  }
  try {
    fs.writeFileSync(decodeFile, code)
    console.log(`Output written: ${decodeFile}`)
  } catch (e) {
    console.error(`Cannot write output file ${decodeFile}: ${e.message}`)
    process.exitCode = 1
  }
}

process.nextTick(async () => {
  main()
})
