const path = require('path')
const rollup = require('rollup')
const loadConfigFile = require('rollup/dist/loadConfigFile')
const { functions } = require('./rollup.option.js')
const { distributePackageJson } = require('./util.js')

;(async () => {
  const { options, warnings } = await loadConfigFile(
    path.resolve(__dirname, 'rollup.config.js'),
    {
      format: 'cjs'
    }
  )
  console.log(`We currently have ${warnings.count} warnings`)

  warnings.flush()

  for (const optionsObj of options) {
    const bundle = await rollup.rollup(optionsObj)
    await Promise.all(optionsObj.output.map(bundle.write))
  }

  const watcher = rollup.watch(options)

  watcher.on('event', async (event) => {
    if (event.code === 'END') {
      await distributePackageJson(functions)
    }
  })
})()
