const path = require('path')
// const fs = require('fs')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// const form = path.join(__dirname, '../cloudfunctions')
// const to = path.join(
//   __dirname,
//   'unpackage',
//   'dist',
//   process.env.NODE_ENV === 'production' ? 'build' : 'dev',
//   process.env.UNI_PLATFORM,
//   'cloudfunctions'
// )

// fs.symlinkSync(form, to, 'dir')


module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{
        from: path.join(__dirname, '../cloudfunctions/dist'),
        // filter: async (resourcePath) => {
        //   console.log(resourcePath)
        //   return true
        // },
        // 次级目录下面,至少放2个函数，不然微信开发者工具有 bug ，不能切换环境
        ignore: ['**/node_modules/**/*','**/*.map'],
        to: path.join(
          __dirname,
          'unpackage',
          'dist',
          process.env.NODE_ENV === 'production' ? 'build' : 'dev',
          process.env.UNI_PLATFORM,
          'cloudfunctions'
        )
      }])
    ]
  },
  chainWebpack: (config) => {
    config.optimization.minimizer('terser').tap((args) => {
      const compress = args[0].terserOptions.compress
      //compress.drop_console = true
      compress.pure_funcs = ['__f__', 'console.debug', 'console.log']
      return args
    })
  }
}
