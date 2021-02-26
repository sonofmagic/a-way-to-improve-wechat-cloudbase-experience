const fsp = require('fs').promises
const fs = require('fs')
const path = require('path')

const alias = require('@rollup/plugin-alias')
// const strip = require('@rollup/plugin-strip')
// const replace = require('@rollup/plugin-replace')
const { getBabelOutputPlugin } = require('@rollup/plugin-babel')
const copy = require('rollup-plugin-copy')
const json = require('@rollup/plugin-json')
const commonjs = require('@rollup/plugin-commonjs')
const pkg = require('./package.json')

// 不需要 rollup 处理的部分
const exclude = ['common', 'scripts']

// async function getFunctionsAsync (srcPath) {
//   const files = await fsp.readdir(srcPath)
//   const dirs = (
//     await Promise.all(
//       files.map(async (x) => {
//         const fullPath = path.resolve(srcPath, x)
//         const stat = await fsp.stat(fullPath)
//         return {
//           stat,
//           fullPath,
//           filename: x
//         }
//       })
//     )
//   ).filter((x) => {
//     if (exclude.includes(x.filename)) {
//       return false
//     }
//     return x.stat.isDirectory()
//   })
//   return dirs
// }

function getFunctionsSync (srcPath) {
  const files = fs.readdirSync(srcPath)
  const dirs = files
    .map((x) => {
      const fullPath = path.resolve(srcPath, x)
      const stat = fs.statSync(fullPath)
      const result = {
        stat,
        fullPath,
        filename: x
      }
      const pkgPath = path.resolve(fullPath, 'package.json')
      if (fs.existsSync(pkgPath)) {
        result.pkg = require(pkgPath)
      }
      return result
    })
    .filter((x) => {
      if (exclude.includes(x.filename)) {
        return false
      }
      return x.stat.isDirectory()
    })

  return dirs
}

function getOption (srcPath, outputDir) {
  const functions = getFunctionsSync(srcPath)
  const rollupConfig = functions.reduce((acc, cur) => {
    const exactOutputDir = path.resolve(outputDir, cur.filename)
    // dirty code start: 添加一个k/v, 然而污染了这个object引用
    cur.exactOutputDir = exactOutputDir
    // dirty code end

    acc.push({
      input: path.resolve(cur.fullPath, 'index.js'),
      output: {
        format: 'cjs',
        file: path.resolve(exactOutputDir, 'index.js'),
        sourcemap: true
      },
      plugins: [
        alias({
          entries: [
            { find: '@', replacement: cur.fullPath },
            { find: '~', replacement: path.resolve(__dirname, 'src') }
          ]
        }),
        // strip({
        //   labels: ['unittest']
        // }),
        json(),
        commonjs(),
        // babel({ babelHelpers: 'bundled' }), // 10.15
        getBabelOutputPlugin({
          configFile: path.resolve(__dirname, 'babel.config.js')
        }),
        copy({
          // config.json 处理，静态资源assets可设置自定义规则
          targets: [
            {
              src: `src/${cur.filename}/config.json`,
              dest: `dist/${cur.filename}`
            }
          ]
          // verbose: true
        })
      ],
      external: Object.keys(pkg.dependencies)
    })
    return acc
  }, [])
  return {
    functions,
    rollupOption: rollupConfig
  }
}

/**
 *
 * @param {Array} fns
 */
async function distributePackageJson (fns) {
  return await Promise.all(
    fns.map(async (x) => {
      await fsp.writeFile(
        path.resolve(x.exactOutputDir, 'package.json'),
        JSON.stringify({
          dependencies: Object.assign(
            {},
            pkg.dependencies,
            x.pkg ? x.pkg.dependencies : null
          )
        })
      )
      return {
        code: 200,
        message: 'ok'
      }
    })
  )
}

module.exports = {
  // getFunctionsAsync,
  getFunctionsSync,
  getOption,
  distributePackageJson
}
