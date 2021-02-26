const path = require('path')
const srcPath = path.resolve(__dirname, 'src')
const outputDir = path.resolve(__dirname, 'dist')
// 出于微信小程序云开发的特性，我们需要把 公共部分和依赖部分，打入每一个包
// 微信开发者工具中，云函数的名称是按照目录的名称，进行创建上传部署的
const { getOption } = require('./util.js')
const option = getOption(srcPath, outputDir)
module.exports = option
