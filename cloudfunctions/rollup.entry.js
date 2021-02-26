const rollup = require('rollup')
const { functions, rollupOption } = require('./rollup.option.js')
const { distributePackageJson } = require('./util.js')
;(async () => {
  await Promise.all(
    rollupOption.map(async (x) => {
      const bundle = await rollup.rollup({
        external: x.external,
        input: x.input,
        plugins: x.plugins
      })
      await bundle.write({
        ...x.output
      })
      // 可以根据 output 的 type做分支判断
      await bundle.close()
      // fsp.writeFile()
      return {
        code: 200,
        message: 'ok'
      }
    })
  )
  await distributePackageJson(functions)
})()
