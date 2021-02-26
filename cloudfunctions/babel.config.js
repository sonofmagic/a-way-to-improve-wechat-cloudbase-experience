const presets = [
  [
    '@babel/preset-env',
    {
      useBuiltIns: 'usage',
      corejs: {
        version: '3.9',
        proposals: true
      },
      targets: {
        node: '10.15' // 微信云开发函数的 nodejs 版本
      }
    }
  ]
]
const plugins = []

module.exports = { presets, plugins }
